"""
Google Gemini Official Provider Integration
Validates Google AI Studio credentials, discovers models, and reports factual capabilities.
"""
from typing import Dict, Any, List, Tuple, Optional
import httpx

from app.services.providers.base import BaseAIProvider


class GeminiProvider(BaseAIProvider):
    provider_slug = "gemini"
    provider_name = "Google Gemini"
    supports_billing_api = False
    supports_usage_api = False

    async def validate_credentials(self, api_key: str) -> Tuple[bool, str]:
        """Validate Google Gemini API key against generativelanguage.googleapis.com/v1beta/models."""
        if not api_key or len(api_key) < 15:
            return False, "Invalid Google Gemini API key format (key too short)"

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                )
                if res.status_code == 200:
                    return True, "Google Gemini API Key successfully validated."
                elif res.status_code == 400:
                    return False, "Invalid Google Gemini API key (400 Bad Request)."
                elif res.status_code == 403:
                    return False, "Google Gemini API key lacks Generative Language API access (403 Forbidden)."
                elif res.status_code == 429:
                    return False, "Google Gemini rate limit reached (429)."
                return False, f"Gemini validation returned status {res.status_code}: {res.text[:100]}"
            except Exception as e:
                return False, f"Network connection error to Google Gemini: {str(e)}"

    async def sync_models(self, api_key: str) -> List[str]:
        """Fetch available models from official Google Generative Language endpoint."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                )
                if res.status_code == 200:
                    data = res.json()
                    models = [
                        m["name"].replace("models/", "")
                        for m in data.get("models", [])
                        if "gemini" in m["name"]
                    ]
                    return sorted(models) if models else ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"]
            except Exception:
                pass
        return ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-2.0-flash-exp"]

    async def sync_usage(
        self,
        api_key: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Google Gemini AI Studio Developer API does not expose historical token consumption logs via API keys.
        Usage is tracked live via the Browser Extension or per-request token telemetry.
        """
        return {
            "supported": False,
            "status_text": "Live via Extension Only",
            "reason": (
                "Google Gemini Developer API does not expose historical token consumption logs. "
                "Usage is tracked live via the Browser Extension."
            ),
            "records": [],
            "records_count": 0,
            "api_status_code": 200,
        }

    async def sync_billing(self, api_key: str) -> Dict[str, Any]:
        """Google AI Studio billing is managed in Google Cloud Console, not developer API."""
        return {
            "supported": False,
            "status_text": "Not Supported",
            "reason": "Google Gemini Developer API does not expose billing balances or credit grants.",
            "value": None,
        }

    async def sync_subscription(self, api_key: str) -> Dict[str, Any]:
        """Verify key status."""
        valid, msg = await self.validate_credentials(api_key)
        if valid:
            return {
                "supported": True,
                "plan_name": "Google AI Studio Key (Active)",
                "monthly_cost": 0.0,
                "status": "active",
            }
        return {
            "supported": False,
            "status_text": "Disconnected",
            "reason": msg,
            "status": "disconnected",
        }
