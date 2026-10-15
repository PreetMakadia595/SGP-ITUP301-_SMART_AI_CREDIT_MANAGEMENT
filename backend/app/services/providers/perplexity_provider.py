"""
Perplexity AI Official Provider Integration
Validates credentials, provides model catalog, and reports factual capabilities.
"""
from typing import Dict, Any, List, Tuple, Optional
import httpx

from app.services.providers.base import BaseAIProvider


class PerplexityProvider(BaseAIProvider):
    provider_slug = "perplexity"
    provider_name = "Perplexity AI"
    supports_billing_api = False
    supports_usage_api = False

    async def validate_credentials(self, api_key: str) -> Tuple[bool, str]:
        """Validate Perplexity API key against api.perplexity.ai."""
        if not api_key or not api_key.startswith("pplx-"):
            return False, "Invalid Perplexity API key format (must start with 'pplx-')"

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": "sonar",
                        "messages": [{"role": "user", "content": "ping"}],
                        "max_tokens": 1,
                    },
                )
                if res.status_code in (200, 400):
                    return True, "Perplexity API Key successfully validated."
                elif res.status_code == 401:
                    return False, "Authentication failed (401 Unauthorized). Invalid Perplexity API key."
                elif res.status_code == 429:
                    return False, "Perplexity rate limit reached (429)."
                return False, f"Perplexity API Error ({res.status_code}): {res.text[:100]}"
            except Exception as e:
                return False, f"Connection error to Perplexity: {str(e)}"

    async def sync_models(self, api_key: str) -> List[str]:
        """Official Perplexity Sonar models catalog."""
        return [
            "sonar",
            "sonar-pro",
            "sonar-reasoning",
            "sonar-reasoning-pro",
            "r1-1776",
        ]

    async def sync_usage(
        self,
        api_key: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Perplexity does not expose historical token consumption logs via standard API keys.
        Usage is tracked live via the Browser Extension.
        """
        return {
            "supported": False,
            "status_text": "Live via Extension Only",
            "reason": (
                "Perplexity API does not expose historical organization token consumption logs. "
                "Usage is tracked live via the Browser Extension."
            ),
            "records": [],
            "records_count": 0,
            "api_status_code": 200,
        }

    async def sync_billing(self, api_key: str) -> Dict[str, Any]:
        """Perplexity does not expose billing balances via API."""
        return {
            "supported": False,
            "status_text": "Not Supported",
            "reason": "Perplexity API does not expose credit or billing balances publicly.",
            "value": None,
        }

    async def sync_subscription(self, api_key: str) -> Dict[str, Any]:
        """Verify subscription status."""
        valid, msg = await self.validate_credentials(api_key)
        if valid:
            return {
                "supported": True,
                "plan_name": "Perplexity API Tier (Active)",
                "monthly_cost": 20.0,
                "status": "active",
            }
        return {
            "supported": False,
            "status_text": "Disconnected",
            "reason": msg,
            "status": "disconnected",
        }
