"""
Anthropic (Claude) Official Provider Integration
Validates credentials, captures rate-limit telemetry headers, and reports factual capabilities.
"""
from typing import Dict, Any, List, Tuple, Optional
import httpx

from app.services.providers.base import BaseAIProvider


class AnthropicProvider(BaseAIProvider):
    provider_slug = "anthropic"
    provider_name = "Anthropic (Claude)"
    supports_billing_api = False
    supports_usage_api = False

    async def validate_credentials(self, api_key: str) -> Tuple[bool, str]:
        """Validate Anthropic API key against api.anthropic.com/v1/models."""
        if not api_key or not api_key.startswith("sk-ant-"):
            return False, "Invalid Anthropic API key format (must start with 'sk-ant-')"

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    "https://api.anthropic.com/v1/models",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                    },
                )
                if res.status_code == 200:
                    return True, "Anthropic API Key successfully validated."
                elif res.status_code == 401:
                    return False, "Authentication failed (401 Unauthorized). Invalid Anthropic API key."
                elif res.status_code == 403:
                    return False, "Anthropic API key is restricted or lacks permissions (403 Forbidden)."
                elif res.status_code == 429:
                    return False, "Anthropic rate limit reached (429). Please retry shortly."
                return False, f"Anthropic validation returned status {res.status_code}: {res.text[:100]}"
            except Exception as e:
                return False, f"Network connection error to Anthropic: {str(e)}"

    async def sync_models(self, api_key: str) -> List[str]:
        """Fetch available models from official Anthropic models endpoint."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    "https://api.anthropic.com/v1/models",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    models = [m["id"] for m in data.get("data", [])]
                    return sorted(models) if models else [
                        "claude-3-5-sonnet-20241022",
                        "claude-3-5-haiku-20241022",
                        "claude-3-opus-20240229",
                    ]
            except Exception:
                pass
        return [
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            "claude-3-opus-20240229",
            "claude-3-haiku-20240307",
        ]

    async def sync_usage(
        self,
        api_key: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Anthropic Developer API does not expose historical organization token logs on standard API keys.
        Captures live rate-limit telemetry headers from validation check.
        """
        rate_limits: Dict[str, Any] = {}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    "https://api.anthropic.com/v1/models",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                    },
                )
                if res.status_code == 200:
                    for h, val in res.headers.items():
                        if "ratelimit" in h.lower():
                            rate_limits[h] = val
            except Exception:
                pass

        return {
            "supported": False,
            "status_text": "Live via Extension Only",
            "reason": (
                "Anthropic Developer API does not expose historical organization token consumption logs on standard API keys. "
                "Usage is tracked live via the Browser Extension."
            ),
            "records": [],
            "records_count": 0,
            "raw_rate_limits": rate_limits,
            "api_status_code": 200 if rate_limits else 0,
        }

    async def sync_billing(self, api_key: str) -> Dict[str, Any]:
        """Anthropic does not expose billing balances via developer API keys."""
        return {
            "supported": False,
            "status_text": "Not Supported",
            "reason": "Anthropic does not provide credit balance endpoints via standard developer API keys.",
            "value": None,
        }

    async def sync_subscription(self, api_key: str) -> Dict[str, Any]:
        """Verify key status."""
        valid, msg = await self.validate_credentials(api_key)
        if valid:
            return {
                "supported": True,
                "plan_name": "Anthropic Claude API (Active)",
                "monthly_cost": 20.0,
                "status": "active",
            }
        return {
            "supported": False,
            "status_text": "Disconnected",
            "reason": msg,
            "status": "disconnected",
        }
