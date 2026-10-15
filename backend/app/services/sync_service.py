"""
Unified Data Synchronization & Ingestion Service

Normalizes, validates, and deduplicates real usage events from:
1. Official AI Provider APIs (Incremental sync with zero fake data)
2. Browser Extension
3. Manual Entry

Appends historical records (never overwrites) and triggers automated ML updates.
"""
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.models.data_sync import IngestedUsageEvent, SyncHistory
from app.models.credit_log import CreditUsageLog
from app.models.platform import UserPlatform
from app.models.credit import CreditEntry
from app.core.security import decrypt_api_key, encrypt_api_key
from app.services.providers.factory import ProviderFactory
from app.services.ml_service import MLPredictionEngine


class DataSyncService:
    def __init__(self, db: Session):
        self.db = db

    def generate_sync_hash(
        self,
        user_id: int,
        source_type: str,
        platform: str,
        model: str,
        usage_date: str,
        prompt_count: int,
        duration_seconds: int,
    ) -> str:
        """Generate unique SHA-256 hash for deterministic deduplication."""
        raw = f"{user_id}:{source_type.lower()}:{platform.lower()}:{model.lower()}:{usage_date}:{prompt_count}:{duration_seconds}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def sync_provider(self, user_id: int, provider_slug: str) -> Dict[str, Any]:
        """
        Synchronize a single connected AI provider via Official API.
        Executes incremental date-range sync and ingests only genuine records.
        """
        started_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        platform_record = (
            self.db.query(UserPlatform)
            .filter(
                UserPlatform.user_id == user_id,
                func.lower(UserPlatform.platform_name) == provider_slug.lower(),
            )
            .first()
        )

        # Also try matching by provider_slug stored as the full name (e.g. "OpenAI" -> "openai")
        if not platform_record:
            platform_record = (
                self.db.query(UserPlatform)
                .filter(
                    UserPlatform.user_id == user_id,
                    UserPlatform.platform_name.ilike(f"%{provider_slug}%"),
                    UserPlatform.encrypted_api_key.isnot(None),
                )
                .first()
            )

        if not platform_record or not platform_record.encrypted_api_key:
            return {
                "success": False,
                "provider_slug": provider_slug,
                "message": f"Provider {provider_slug} is not connected or missing API key.",
            }

        provider_impl = ProviderFactory.get_provider(provider_slug)
        if not provider_impl:
            return {
                "success": False,
                "provider_slug": provider_slug,
                "message": f"Provider adapter {provider_slug} is not registered.",
            }

        raw_api_key = decrypt_api_key(platform_record.encrypted_api_key)
        if not raw_api_key:
            return {
                "success": False,
                "provider_slug": provider_slug,
                "message": "Failed to decrypt API key.",
            }

        # 1. Validate credentials
        valid, val_msg = await provider_impl.validate_credentials(raw_api_key)
        if not valid:
            platform_record.last_sync_status = "failed"
            platform_record.status = "warning"
            self.db.commit()

            # Record failure in sync history
            self._record_sync_history(
                user_id=user_id,
                provider_slug=provider_slug,
                status="failed",
                records_found=0,
                records_inserted=0,
                records_skipped=0,
                started_at=started_at,
                error_message=f"Validation failed: {val_msg}",
                api_status_code=401,
            )
            self.db.commit()

            return {
                "success": False,
                "provider_slug": provider_slug,
                "message": f"Validation failed: {val_msg}",
            }

        # 2. Determine incremental date sync window
        now_dt = datetime.now(timezone.utc)
        if platform_record.last_sync_at:
            # Overlap window of 1 day to catch late-arriving provider buckets
            start_date_dt = platform_record.last_sync_at.replace(tzinfo=timezone.utc) - timedelta(days=1)
        else:
            start_date_dt = now_dt - timedelta(days=14)

        start_date_str = start_date_dt.strftime("%Y-%m-%d")
        end_date_str = now_dt.strftime("%Y-%m-%d")

        # 3. Query official provider APIs for usage, models, billing, subscription
        usage_data = await provider_impl.sync_usage(raw_api_key, start_date=start_date_str, end_date=end_date_str)
        billing_data = await provider_impl.sync_billing(raw_api_key)
        sub_data = await provider_impl.sync_subscription(raw_api_key)
        models_list = await provider_impl.sync_models(raw_api_key)

        # 4. Ingest real records (strictly zero fake records)
        real_records: List[Dict[str, Any]] = usage_data.get("records", [])
        records_found = len(real_records)
        records_inserted = 0
        records_skipped = 0

        for r in real_records:
            u_date = r.get("usage_date", end_date_str)
            p_count = int(r.get("prompt_count") or 1)
            d_seconds = int(r.get("duration_seconds") or 30)
            m_name = r.get("model") or "Default Model"
            t_usage = int(r.get("token_usage") or 0)
            c_used = float(r.get("credits_used") or 0.0)
            c_usd = float(r.get("cost_usd") or 0.0)

            sync_hash = self.generate_sync_hash(
                user_id=user_id,
                source_type="official_api",
                platform=provider_slug,
                model=m_name,
                usage_date=u_date,
                prompt_count=p_count,
                duration_seconds=d_seconds,
            )

            existing_event = (
                self.db.query(IngestedUsageEvent)
                .filter(IngestedUsageEvent.sync_hash == sync_hash)
                .first()
            )

            if existing_event:
                records_skipped += 1
                continue

            # Ingest new Usage Event
            ingested_event = IngestedUsageEvent(
                user_id=user_id,
                source_type="official_api",
                platform=provider_slug,
                model=m_name,
                duration_seconds=d_seconds,
                prompt_count=p_count,
                token_usage=t_usage,
                credits_used=c_used,
                cost_usd=c_usd,
                usage_date=u_date,
                sync_hash=sync_hash,
                raw_payload=json.dumps(r.get("raw_metadata") or {}),
            )
            self.db.add(ingested_event)

            # Ingest into CreditUsageLog for analytics compatibility
            usage_log = CreditUsageLog(
                user_id=user_id,
                platform=provider_impl.provider_name,
                model=m_name,
                project_name="Official API Sync",
                task_type="Live API Ingestion",
                credits_used=c_used,
                prompt_count=p_count,
                token_usage=t_usage,
                usage_date=u_date,
                notes=f"Synced from {provider_impl.provider_name} API ({start_date_str} to {end_date_str})",
            )
            self.db.add(usage_log)
            records_inserted += 1

        # 5. Update Platform Metadata
        platform_record.last_sync_at = datetime.now()
        platform_record.last_sync_status = "success" if usage_data.get("supported", True) else "connected_no_api_usage"
        platform_record.supported_features = json.dumps({
            "billing": "Supported" if billing_data.get("supported") else "Not Supported",
            "usage": usage_data.get("status_text", "Supported" if usage_data.get("supported") else "Not Supported"),
            "models_count": len(models_list),
            "usage_reason": usage_data.get("reason"),
        })

        # 6. Insert audit SyncHistory record
        status_str = "success" if usage_data.get("supported") or records_inserted > 0 else "info"
        self._record_sync_history(
            user_id=user_id,
            provider_slug=provider_slug,
            status=status_str,
            records_found=records_found,
            records_inserted=records_inserted,
            records_skipped=records_skipped,
            started_at=started_at,
            error_message=usage_data.get("reason"),
            api_status_code=usage_data.get("api_status_code", 200),
        )

        self.db.commit()

        # 7. Trigger automated ML pipeline update with real data
        try:
            ml_engine = MLPredictionEngine(self.db)
            ml_engine.update_predictions_for_user(user_id)
        except Exception:
            pass

        return {
            "success": True,
            "provider_slug": provider_slug,
            "records_found": records_found,
            "records_inserted": records_inserted,
            "records_skipped": records_skipped,
            "billing_status": billing_data.get("status_text", "Not Supported"),
            "usage_status": usage_data.get("status_text", "Live API Data"),
            "usage_reason": usage_data.get("reason"),
            "models": models_list,
        }

    def _record_sync_history(
        self,
        user_id: int,
        provider_slug: str,
        status: str,
        records_found: int,
        records_inserted: int,
        records_skipped: int,
        started_at: str,
        error_message: Optional[str] = None,
        api_status_code: int = 200,
    ) -> None:
        """Creates structured SyncHistory audit entry without logging sensitive API keys."""
        completed_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        details_payload = {
            "started_at": started_at,
            "completed_at": completed_at,
            "records_found": records_found,
            "records_inserted": records_inserted,
            "records_skipped": records_skipped,
            "api_status_code": api_status_code,
            "error_message": error_message,
        }

        sync_hist = SyncHistory(
            user_id=user_id,
            provider_slug=provider_slug,
            source_type="official_api",
            status=status,
            records_ingested=records_inserted,
            details=json.dumps(details_payload),
        )
        self.db.add(sync_hist)

    async def sync_all_providers(self, user_id: int) -> List[Dict[str, Any]]:
        """Trigger incremental sync across all connected providers for the user."""
        platforms = (
            self.db.query(UserPlatform)
            .filter(
                UserPlatform.user_id == user_id,
                UserPlatform.encrypted_api_key.isnot(None),
                UserPlatform.status != "disconnected",
            )
            .all()
        )

        results = []
        for p in platforms:
            # Try to match the stored platform_name to a known provider slug
            plat_lower = p.platform_name.lower().strip()
            # Map common display names to slugs
            slug_map = {
                "openai": "openai",
                "anthropic (claude)": "anthropic",
                "anthropic": "anthropic",
                "claude": "anthropic",
                "gemini": "gemini",
                "google gemini": "gemini",
                "perplexity": "perplexity",
            }
            provider_slug = slug_map.get(plat_lower, plat_lower)
            res = await self.sync_provider(user_id, provider_slug)
            results.append(res)
        return results

    def ingest_extension_event(
        self,
        user_id: int,
        platform: str,
        model: str,
        duration_seconds: int,
        prompt_count: int,
        website_url: str,
        timestamp: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process and ingest usage event sent securely from Browser Extension.
        PRIVACY GUARANTEE: Does not collect prompt text contents.
        """
        usage_date = timestamp[:10] if timestamp and len(timestamp) >= 10 else datetime.now(timezone.utc).strftime("%Y-%m-%d")
        credits_used = round(prompt_count * 0.5 + (duration_seconds / 60) * 0.1, 2)
        cost_usd = round(credits_used * 0.05, 2)

        sync_hash = self.generate_sync_hash(
            user_id=user_id,
            source_type="browser_extension",
            platform=platform,
            model=model,
            usage_date=usage_date,
            prompt_count=prompt_count,
            duration_seconds=duration_seconds,
        )

        existing = (
            self.db.query(IngestedUsageEvent)
            .filter(IngestedUsageEvent.sync_hash == sync_hash)
            .first()
            )

        if existing:
            return {
                "status": "duplicate_skipped",
                "message": "Event already ingested (deduplicated).",
                "event_id": existing.id,
            }

        # Save IngestedUsageEvent
        event = IngestedUsageEvent(
            user_id=user_id,
            source_type="browser_extension",
            platform=platform,
            model=model,
            duration_seconds=duration_seconds,
            prompt_count=prompt_count,
            token_usage=prompt_count * 1500,
            credits_used=credits_used,
            cost_usd=cost_usd,
            usage_date=usage_date,
            website_url=website_url,
            sync_hash=sync_hash,
            raw_payload=json.dumps({"website_url": website_url, "duration": duration_seconds}),
        )
        self.db.add(event)

        # Save CreditUsageLog
        log = CreditUsageLog(
            user_id=user_id,
            platform=platform.capitalize(),
            model=model,
            project_name="Browser Tracking",
            task_type="Extension Auto-Capture",
            credits_used=credits_used,
            prompt_count=prompt_count,
            token_usage=prompt_count * 1500,
            usage_date=usage_date,
            notes=f"Captured via Chrome Extension from {website_url}",
        )
        self.db.add(log)

        # Sync History
        sync_hist = SyncHistory(
            user_id=user_id,
            provider_slug=platform.lower(),
            source_type="browser_extension",
            status="success",
            records_ingested=1,
            details=json.dumps({
                "source": "browser_extension",
                "platform": platform,
                "model": model,
                "prompts": prompt_count,
                "duration": duration_seconds,
            }),
        )
        self.db.add(sync_hist)
        self.db.commit()

        return {
            "status": "success",
            "message": "Extension event ingested successfully.",
            "event_id": event.id,
        }

    def ingest_manual_entry(
        self,
        user_id: int,
        platform: str,
        model: str,
        credits_used: float,
        prompt_count: int,
        usage_date: str,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Ingests user's manual credit usage entry."""
        sync_hash = self.generate_sync_hash(
            user_id=user_id,
            source_type="manual_entry",
            platform=platform,
            model=model,
            usage_date=usage_date,
            prompt_count=prompt_count,
            duration_seconds=prompt_count * 60,
        )

        existing = (
            self.db.query(IngestedUsageEvent)
            .filter(IngestedUsageEvent.sync_hash == sync_hash)
            .first()
        )

        if existing:
            return {
                "status": "duplicate_skipped",
                "message": "Manual entry already logged on this date.",
                "event_id": existing.id,
            }

        cost_usd = round(credits_used * 0.1, 2)

        # Ingest event
        event = IngestedUsageEvent(
            user_id=user_id,
            source_type="manual_entry",
            platform=platform,
            model=model,
            duration_seconds=prompt_count * 60,
            prompt_count=prompt_count,
            token_usage=prompt_count * 1000,
            credits_used=credits_used,
            cost_usd=cost_usd,
            usage_date=usage_date,
            website_url=None,
            sync_hash=sync_hash,
            raw_payload=json.dumps({"notes": notes}),
        )
        self.db.add(event)

        # Ingest log
        log = CreditUsageLog(
            user_id=user_id,
            platform=platform.capitalize(),
            model=model,
            project_name="Manual Entry",
            task_type="Manual Record",
            credits_used=credits_used,
            prompt_count=prompt_count,
            token_usage=prompt_count * 1000,
            usage_date=usage_date,
            notes=notes or "Manually logged credit entry",
        )
        self.db.add(log)

        # Sync History
        sync_hist = SyncHistory(
            user_id=user_id,
            provider_slug=platform.lower(),
            source_type="manual_entry",
            status="success",
            records_ingested=1,
            details=json.dumps({"notes": notes, "credits": credits_used}),
        )
        self.db.add(sync_hist)
        self.db.commit()

        return {
            "status": "success",
            "message": "Manual entry ingested successfully.",
            "event_id": event.id,
        }

    def get_source_breakdown(self, user_id: int) -> Dict[str, Any]:
        """Aggregate data volume and percentages by ingestion source."""
        events = (
            self.db.query(IngestedUsageEvent)
            .filter(IngestedUsageEvent.user_id == user_id)
            .all()
        )

        api_count = sum(1 for e in events if e.source_type == "official_api")
        ext_count = sum(1 for e in events if e.source_type == "browser_extension")
        manual_count = sum(1 for e in events if e.source_type == "manual_entry")
        total = len(events) or 1

        return {
            "total_events": len(events),
            "official_api_events": api_count,
            "browser_extension_events": ext_count,
            "manual_entry_events": manual_count,
            "api_percentage": round((api_count / total) * 100, 1),
            "extension_percentage": round((ext_count / total) * 100, 1),
            "manual_percentage": round((manual_count / total) * 100, 1),
        }
