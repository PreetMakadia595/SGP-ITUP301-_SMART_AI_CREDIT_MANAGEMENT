"""
Abstract Base Provider Interface for AI Platform Integrations
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple


class BaseAIProvider(ABC):
    """
    Interface definition for Official AI Provider APIs.
    Follows SOLID Open/Closed principle allowing future providers to be added seamlessly.
    """
    provider_slug: str
    provider_name: str
    supports_billing_api: bool = False
    supports_usage_api: bool = False

    @abstractmethod
    async def validate_credentials(self, api_key: str) -> Tuple[bool, str]:
        """Validate if the provided API key is valid."""
        pass

    @abstractmethod
    async def sync_models(self, api_key: str) -> List[str]:
        """Fetch list of available models for the provider."""
        pass

    @abstractmethod
    async def sync_usage(self, api_key: str) -> Dict[str, Any]:
        """Fetch usage information from official API if supported."""
        pass

    @abstractmethod
    async def sync_billing(self, api_key: str) -> Dict[str, Any]:
        """
        Fetch billing or credit information.
        If billing API is NOT supported, returns: {"supported": False, "status_text": "Not Supported"}
        """
        pass

    @abstractmethod
    async def sync_subscription(self, api_key: str) -> Dict[str, Any]:
        """Fetch subscription details."""
        pass
