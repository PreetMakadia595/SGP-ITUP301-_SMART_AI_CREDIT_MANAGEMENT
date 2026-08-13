"""
Provider Factory & Registry
"""
from typing import Dict, Type, Optional, List, Any
from app.services.providers.base import BaseAIProvider
from app.services.providers.openai_provider import OpenAIProvider
from app.services.providers.anthropic_provider import AnthropicProvider
from app.services.providers.gemini_provider import GeminiProvider
from app.services.providers.perplexity_provider import PerplexityProvider


class ProviderFactory:
    """
    Registry for Official AI Providers.
    Allows easy extension for future AI providers.
    """
    _providers: Dict[str, Type[BaseAIProvider]] = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "gemini": GeminiProvider,
        "perplexity": PerplexityProvider,
    }

    @classmethod
    def register_provider(cls, slug: str, provider_cls: Type[BaseAIProvider]) -> None:
        """Register a new AI provider class for future extension."""
        cls._providers[slug.lower()] = provider_cls

    @classmethod
    def get_provider(cls, slug: str) -> Optional[BaseAIProvider]:
        """Instantiate a provider by slug."""
        provider_cls = cls._providers.get(slug.lower())
        if provider_cls:
            return provider_cls()
        return None

    @classmethod
    def list_supported_providers(cls) -> List[Dict[str, Any]]:
        """Return list of supported official AI provider metadata."""
        result = []
        for slug, provider_cls in cls._providers.items():
            instance = provider_cls()
            result.append({
                "slug": instance.provider_slug,
                "name": instance.provider_name,
                "supports_billing_api": instance.supports_billing_api,
                "supports_usage_api": instance.supports_usage_api,
            })
        return result
