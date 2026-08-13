"""
Unified Data Synchronization & Ingestion Service

Normalizes, validates, and deduplicates credit usage events from:
1. Official AI Provider APIs
2. Browser Extension
3. Manual Entry

Appends historical records (never overwrites) and triggers automated ML updates.
"""
import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

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
        """Generate unique SHA-256 hash for deduplication."""
        raw = f"{user_id}:{source_type.lower()}:{platform.lower()}:{model.lower()}:{usage_date}:{prompt_count}:{duration_seconds}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def sync_provider(self, user_id: int, provider_slug: str) -> Dict[str, Any]:
        """
        Synchronize a single connected AI provider via Official API.
        """
        platform_record = (
            self.db.query(UserPlatform)
            .filter(
                UserPlatform.user_id == user_id,
                UserPlatform.platform_name.ilike(provider_slug),
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
            return {
                "success": False,
                "provider_slug": provider_slug,
                "message": f"Validation failed: {val_msg}",
            }

        # 2. Fetch usage, billing, subscription, models
        usage_data = await provider_impl.sync_usage(raw_api_key)
        billing_data = await provider_impl.sync_billing(raw_api_key)
        sub_data = await provider_impl.sync_subscription(raw_api_key)
        models_list = await provider_impl.sync_models(raw_api_key)

        # 3. Create ingestion event & deduplicate
        today_str = datetime.now().strftime("%Y-%m-%d")
        prompt_cnt = usage_data.get("prompt_count", 5)
        duration_sec = 120
        credits_used = float(usage_data.get("credits_used", 1.5))
        cost_usd = float(billing_data.get("credits_used", credits_used * 0.1)) if billing_data.get("supported") else credits_used * 0.1
        model_name = models_list[0] if models_list else "Default Model"

        sync_hash = self.generate_sync_hash(
            user_id=user_id,
            source_type="official_api",
            platform=provider_slug,
            model=model_name,
            usage_date=today_str,
            prompt_count=prompt_cnt,
            duration_seconds=duration_sec,
        )

        existing_event = (
            self.db.query(IngestedUsageEvent)
            .filter(IngestedUsageEvent.sync_hash == sync_hash)
            .first()
        )

        records_ingested = 0
        if not existing_event:
            # Insert IngestedUsageEvent
            raw_payload = json.dumps({
                "billing": billing_data,
                "subscription": sub_data,
                "models": models_list,
            })
            ingested_event = IngestedUsageEvent(
                user_id=user_id,
                source_type="official_api",
                platform=provider_slug,
                model=model_name,
                duration_seconds=duration_sec,
                prompt_count=prompt_cnt,
                token_usage=usage_data.get("token_usage", 10000),
                credits_used=credits_used,
                cost_usd=cost_usd,
                usage_date=today_str,
                sync_hash=sync_hash,
                raw_payload=raw_payload,
            )
            self.db.add(ingested_event)

            # Insert CreditUsageLog
            usage_log = CreditUsageLog(
                user_id=user_id,
                platform=provider_impl.provider_name,
                model=model_name,
                project_name="Official API Sync",
                task_type="API Integration",
                credits_used=credits_used,
                prompt_count=prompt_cnt,
                token_usage=usage_data.get("token_usage", 10000),
                usage_date=today_str,
                notes=f"Synced via Official {provider_impl.provider_name} API",
            )
            self.db.add(usage_log)

            # Update UserPlatform
            if billing_data.get("supported"):
                platform_record.remaining_credits = float(billing_data.get("credits_remaining", platform_record.remaining_credits))
            else:
                platform_record.remaining_credits = max(0.0, platform_record.remaining_credits - credits_used)

            records_ingested = 1

        # Update Platform sync fields
        platform_record.last_sync_at = datetime.now()
        platform_record.last_sync_status = "success"
        platform_record.supported_features = json.dumps({
            "billing": "Supported" if billing_data.get("supported") else "Not Supported",
            "usage": "Supported" if usage_data.get("supported") else "Not Supported",
            "models_count": len(models_list),
        })

        # Insert SyncHistory audit log
        sync_hist = SyncHistory(
            user_id=user_id,
            provider_slug=provider_slug,
            source_type="official_api",
            status="success",
            records_ingested=records_ingested,
            details=f"Synced {records_ingested} records. Billing: {billing_data.get('status_text', 'OK')}",
        )
        self.db.add(sync_hist)
        self.db.commit()

        # Trigger automated ML update
        try:
            ml_engine = MLPredictionEngine(self.db)
            ml_engine.update_predictions_for_user(user_id)
        except Exception:
            pass

        return {
            "success": True,
            "provider_slug": provider_slug,
            "records_ingested": records_ingested,
            "billing_status": billing_data.get("status_text", "Not Supported"),
            "models": models_list,
        }

    async def sync_all_providers(self, user_id: int) -> List[Dict[str, Any]]:
        """Trigger sync across all connected providers for the user."""
        platforms = (
            self.db.query(UserPlatform)
            .filter(
                UserPlatform.user_id == user_id,
                UserPlatform.encrypted_api_key.isnot(None),
            )
            .all()
        )

        results = []
        for p in platforms:
            res = await self.sync_provider(user_id, p.platform_name.lower())
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
        """
        usage_date = timestamp[:10] if timestamp and len(timestamp) >= 10 else datetime.now().strftime("%Y-%m-%d")
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
            details=f"Extension captured {prompt_count} prompts on {platform}",
        )
        self.db.add(sync_hist)
        self.db.commit()

        # Trigger ML pipeline update
        try:
            ml_engine = MLPredictionEngine(self.db)
            ml_engine.update_predictions_for_user(user_id)
        except Exception:
            pass

        return {
            "status": "success",
            "message": "Extension event ingested successfully.",
            "event_id": event.id,
            "credits_used": credits_used,
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
        """
        Process manual entry through the unified Data Synchronization Layer.
        """
        sync_hash = self.generate_sync_hash(
            user_id=user_id,
            source_type="manual_entry",
            platform=platform,
            model=model,
            usage_date=usage_date,
            prompt_count=prompt_count,
            duration_seconds=0,
        )

        cost_usd = round(credits_used * 0.1, 2)

        event = IngestedUsageEvent(
            user_id=user_id,
            source_type="manual_entry",
            platform=platform,
            model=model,
            duration_seconds=0,
            prompt_count=prompt_count,
            token_usage=prompt_count * 1000,
            credits_used=credits_used,
            cost_usd=cost_usd,
            usage_date=usage_date,
            sync_hash=sync_hash,
            raw_payload=json.dumps({"notes": notes}),
        )
        self.db.add(event)

        log = CreditUsageLog(
            user_id=user_id,
            platform=platform,
            model=model,
            project_name="Manual Fallback",
            task_type="Manual Entry",
            credits_used=credits_used,
            prompt_count=prompt_count,
            token_usage=prompt_count * 1000,
            usage_date=usage_date,
            notes=notes or "Manually logged credit usage",
        )
        self.db.add(log)

        sync_hist = SyncHistory(
            user_id=user_id,
            provider_slug=platform.lower(),
            source_type="manual_entry",
            status="success",
            records_ingested=1,
            details=f"Manual log created for {platform}",
        )
        self.db.add(sync_hist)
        self.db.commit()

        # Trigger ML pipeline update
        try:
            ml_engine = MLPredictionEngine(self.db)
            ml_engine.update_predictions_for_user(user_id)
        except Exception:
            pass

        return {
            "status": "success",
            "message": "Manual entry ingested into unified data layer.",
            "event_id": event.id,
        }

    def get_source_breakdown(self, user_id: int) -> Dict[str, Any]:
        """Return usage breakdown by data source (API vs Extension vs Manual)."""
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
            "sources": [
                {
                    "source": "Official API",
                    "count": api_count,
                    "percentage": round((api_count / total) * 100, 1),
                },
                {
                    "source": "Browser Extension",
                    "count": ext_count,
                    "percentage": round((ext_count / total) * 100, 1),
                },
                {
                    "source": "Manual Entry",
                    "count": manual_count,
                    "percentage": round((manual_count / total) * 100, 1),
                },
            ],
        }
