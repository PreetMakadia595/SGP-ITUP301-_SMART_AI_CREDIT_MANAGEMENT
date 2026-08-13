"""
AI Service Enum & ORM Model

Represents the supported AI platforms whose credits are tracked.
"""
from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AIService(Base):
    __tablename__ = "ai_services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str] = mapped_column(String(512), nullable=True)
    color: Mapped[str] = mapped_column(String(20), nullable=True)   # hex color for UI

    def __repr__(self) -> str:
        return f"<AIService slug={self.slug}>"


# ── Canonical service list (used in seed data) ────────────────────────────────
AI_SERVICES = [
    {"name": "ChatGPT",         "slug": "chatgpt",        "color": "#10A37F"},
    {"name": "Claude",          "slug": "claude",          "color": "#D4A96A"},
    {"name": "Gemini",          "slug": "gemini",          "color": "#4285F4"},
    {"name": "Cursor",          "slug": "cursor",          "color": "#7C3AED"},
    {"name": "GitHub Copilot",  "slug": "github-copilot",  "color": "#24292E"},
    {"name": "Perplexity",      "slug": "perplexity",      "color": "#20B2AA"},
    {"name": "Bolt",            "slug": "bolt",            "color": "#F59E0B"},
    {"name": "Lovable",         "slug": "lovable",         "color": "#EC4899"},
]
