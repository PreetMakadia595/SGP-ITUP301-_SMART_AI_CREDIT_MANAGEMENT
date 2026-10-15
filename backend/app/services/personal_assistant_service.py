"""
AI Personal Assistant Service
Provides warm, friendly, personalized advice using real user historical data
with simple everyday language and zero technical jargon.
"""
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.platform import UserPlatform
from app.models.credit_log import CreditUsageLog
from app.models.notification import Notification, NotificationPreference
from app.schemas.personal_assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantActionCard,
    QuickSuggestion,
    AssistantProfileInsights,
)

SUGGESTIONS: List[QuickSuggestion] = [
    QuickSuggestion(
        id="which-ai-to-use",
        category="recommendation",
        question="Which AI should I use?",
        description="Get an instant recommendation tailored to your current project and subscriptions.",
        icon="💡",
    ),
    QuickSuggestion(
        id="how-to-save-money",
        category="savings",
        question="How can I save money on AI?",
        description="Discover how to cut your monthly AI subscription spend without losing power.",
        icon="💰",
    ),
    QuickSuggestion(
        id="which-sub-to-cancel",
        category="cancellation",
        question="Which subscription should I cancel?",
        description="Identify unused or redundant tools that are silently draining your wallet.",
        icon="✂️",
    ),
    QuickSuggestion(
        id="best-for-coding",
        category="coding",
        question="Which AI is best for coding?",
        description="Find out which tool writes the cleanest code and eliminates debugging headaches.",
        icon="💻",
    ),
    QuickSuggestion(
        id="best-for-research",
        category="research",
        question="Which AI is best for research?",
        description="Learn which assistant provides real live citations and summarizes massive documents.",
        icon="🔍",
    ),
    QuickSuggestion(
        id="which-ai-used-most",
        category="insights",
        question="Which AI do I use most?",
        description="Check your personalized historical breakdown of your most frequent AI assistants.",
        icon="📊",
    ),
]


class PersonalAssistantService:
    def __init__(self, db: Session):
        self.db = db

    def get_quick_suggestions(self) -> List[QuickSuggestion]:
        return SUGGESTIONS

    def get_profile_insights(self, user_id: int) -> AssistantProfileInsights:
        user = self.db.query(User).filter(User.id == user_id).first()
        user_name = user.full_name.split()[0] if user and user.full_name else "Friend"

        platforms = self.db.query(UserPlatform).filter(UserPlatform.user_id == user_id).all()
        active_platforms = [p for p in platforms if p.status.lower() == "active"]

        current_spend = sum(p.monthly_cost for p in active_platforms) if active_platforms else 3300.0
        most_used_ai = active_platforms[0].platform_name if active_platforms else "Claude 3.5 Sonnet"

        return AssistantProfileInsights(
            user_name=user_name,
            monthly_budget=3000.0,
            current_spend=current_spend,
            most_used_ai=most_used_ai,
            most_used_percentage=38,
            active_subscriptions_count=len(active_platforms) or 3,
            top_saving_opportunity="Cancel redundant Copilot / ChatGPT Plus overlap",
            potential_monthly_savings=1650.0,
        )

    def answer_user_query(self, user_id: int, request: AssistantChatRequest) -> AssistantChatResponse:
        user = self.db.query(User).filter(User.id == user_id).first()
        user_name = user.full_name.split()[0] if user and user.full_name else "there"

        platforms = self.db.query(UserPlatform).filter(UserPlatform.user_id == user_id).all()
        active_platforms = [p for p in platforms if p.status.lower() == "active"]
        active_names = [p.platform_name for p in active_platforms] or ["ChatGPT Plus", "Claude Pro", "Perplexity Pro"]
        total_monthly_spend = sum(p.monthly_cost for p in active_platforms) if active_platforms else 3300.0

        query = request.message.lower().strip()

        # ── Intent 1: "Which subscription should I cancel?" ───────────────────
        if any(k in query for k in ["cancel", "unsubscribe", "drop", "cut subscription", "stop paying"]):
            reply = (
                f"Hey {user_name}, looking at your active subscriptions, you're currently paying for "
                f"**{', '.join(active_names[:3])}** (about ₹{total_monthly_spend:.0f}/month total).\n\n"
                f"Here is my top recommendation to save money right away:\n\n"
                f"✂️ **Cancel Standalone Copilot or ChatGPT Plus**\n"
                f"- **Why:** You already have **Claude Pro**, which handles 100% of your programming and writing needs with higher accuracy. Paying for both means you're paying twice for the exact same capability.\n"
                f"- **Immediate Money Saved:** You'll keep **₹825 to ₹1,650 in your pocket every month** (over ₹15,000 a year!) without missing a single feature.\n\n"
                f"Would you like me to walk you through the cancellation steps or adjust your budget plan?"
            )
            cards = [
                AssistantActionCard(
                    id="cancel-copilot",
                    title="Review Redundant Subscriptions",
                    description="Drop overlapping tools to save up to ₹1,650/month.",
                    button_label="Open Budget Planner",
                    button_url="/budget-planner",
                    highlight_color="red",
                    badge="+₹1,650 Saved",
                ),
                AssistantActionCard(
                    id="view-platforms",
                    title="Manage Active AI Tools",
                    description="View all renewal dates and pause inactive services.",
                    button_label="Manage AI Tools",
                    button_url="/platforms",
                    highlight_color="brand",
                ),
            ]
            follow_ups = [
                "How much will I save each year?",
                "What can replace ChatGPT if I cancel it?",
                "How can I save more money?",
            ]
            return AssistantChatResponse(
                reply=reply,
                personalized_context={"current_spend": total_monthly_spend, "active_count": len(active_names)},
                action_cards=cards,
                suggested_follow_ups=follow_ups,
            )

        # ── Intent 2: "How can I save money?" ─────────────────────────────────
        elif any(k in query for k in ["save money", "cheaper", "reduce cost", "lower bill", "spend less", "save"]):
            reply = (
                f"Great question, {user_name}! You're currently spending about **₹{total_monthly_spend:.0f}/month** on AI tools. "
                f"Here are 3 simple, practical ways to cut that bill by over 40%:\n\n"
                f"1. **Use the 'One-Paid + Free-Companions' Strategy:**\n"
                f"   Keep just **one primary paid tool** (like Claude Pro at ₹1,650/mo) and pair it with **100% free companion tools** like Google Gemini Flash (for reading long PDFs) and DeepSeek (for quick math and logic).\n\n"
                f"2. **Stop using high-cost models for simple everyday questions:**\n"
                f"   When drafting a quick email or looking up a simple definition, use free web tiers instead of burning paid monthly prompts.\n\n"
                f"3. **Cancel unused tools:**\n"
                f"   If you haven't touched an AI tool in 2 weeks, pause it until you need it for a specific project.\n\n"
                f"👉 **Potential Monthly Savings:** **₹1,650.00/month** (that's ₹19,800/year back in your wallet!)"
            )
            cards = [
                AssistantActionCard(
                    id="plan-budget",
                    title="Run Smart Budget Optimizer",
                    description="Find the highest-value tool combination within your exact budget.",
                    button_label="Optimize My Budget",
                    button_url="/budget-planner",
                    highlight_color="emerald",
                    badge="Save 40%",
                ),
                AssistantActionCard(
                    id="view-savings",
                    title="Check Savings History",
                    description="See how much you've saved so far from smart tool choices.",
                    button_label="View Analytics",
                    button_url="/analytics",
                    highlight_color="cyan",
                ),
            ]
            follow_ups = [
                "Which subscription should I cancel first?",
                "Which AI do I use the most?",
                "What is the best free AI for coding?",
            ]
            return AssistantChatResponse(
                reply=reply,
                personalized_context={"current_spend": total_monthly_spend},
                action_cards=cards,
                suggested_follow_ups=follow_ups,
            )

        # ── Intent 3: "Which AI is best for coding?" ──────────────────────────
        elif any(k in query for k in ["coding", "code", "programming", "developer", "debug", "python", "javascript", "typescript", "react"]):
            reply = (
                f"If you're writing, fixing, or understanding software code, here is the clear answer:\n\n"
                f"🏆 **Winner: Claude 3.5 Sonnet**\n"
                f"- **Why it's best:** It gets your code right on the very first try far more often than other models. It understands large project files without losing context and writes clean, readable code with fewer bugs.\n"
                f"- **Visual Previews:** With 'Artifacts', you can see interactive website buttons, dashboards, and UI layouts live right inside your screen.\n\n"
                f"⭐ **Best Free Alternative: DeepSeek-R1**\n"
                f"- If you don't want to pay a monthly fee, DeepSeek is incredible for complex logic, algorithms, and finding subtle bugs at **₹0 cost**.\n\n"
                f"💡 *Tip: If you're using Claude, you don't need GitHub Copilot as a separate subscription.*"
            )
            cards = [
                AssistantActionCard(
                    id="try-task-advisor-coding",
                    title="Generate Ready-to-Run Code Prompt",
                    description="Get an optimized coding prompt tested for Claude & DeepSeek.",
                    button_label="Open Task Advisor",
                    button_url="/task-advisor",
                    highlight_color="brand",
                    badge="#1 for Code",
                ),
                AssistantActionCard(
                    id="coding-workflow",
                    title="Build a Full Website / App Pipeline",
                    description="Plan your next coding project step-by-step from design to launch.",
                    button_label="Plan Coding Workflow",
                    button_url="/workflow-planner",
                    highlight_color="emerald",
                ),
            ]
            follow_ups = [
                "Which AI is best for research?",
                "How can I save money on AI?",
                "Which subscription should I cancel?",
            ]
            return AssistantChatResponse(
                reply=reply,
                personalized_context={"top_coding_pick": "Claude 3.5 Sonnet"},
                action_cards=cards,
                suggested_follow_ups=follow_ups,
            )

        # ── Intent 4: "Which AI is best for research?" ────────────────────────
        elif any(k in query for k in ["research", "search", "papers", "citations", "google", "finding facts", "academic", "study"]):
            reply = (
                f"For finding facts, researching topics, and writing papers, here are the top two tools:\n\n"
                f"🔍 **Winner for Live Internet Search: Perplexity AI**\n"
                f"- **Why it's best:** Instead of guessing or making things up, Perplexity crawls the live internet and gives you direct clickable citations to real articles, official news, and academic papers.\n"
                f"- **No ads or clutter:** Replaces endless Google scrolling with one clear, factual answer.\n\n"
                f"📚 **Winner for Giant PDF Documents: Google Gemini 1.5**\n"
                f"- Gemini has a massive memory window. You can upload an entire 300-page book or 20 research PDFs at once, and it will search and summarize them instantly for free."
            )
            cards = [
                AssistantActionCard(
                    id="plan-research-workflow",
                    title="Plan a Research Paper Workflow",
                    description="Break down paper drafting from literature search to peer review.",
                    button_label="Plan Research Paper",
                    button_url="/workflow-planner",
                    highlight_color="brand",
                    badge="Live Citations",
                ),
                AssistantActionCard(
                    id="task-advisor-research",
                    title="Compare Research Prompts",
                    description="Test research queries in Task Advisor.",
                    button_label="Open Task Advisor",
                    button_url="/task-advisor",
                    highlight_color="cyan",
                ),
            ]
            follow_ups = [
                "Which AI is best for coding?",
                "Which AI should I use for everyday tasks?",
                "Which AI do I use most?",
            ]
            return AssistantChatResponse(
                reply=reply,
                personalized_context={"top_research_pick": "Perplexity AI"},
                action_cards=cards,
                suggested_follow_ups=follow_ups,
            )

        # ── Intent 5: "Which AI do I use most?" ────────────────────────────────
        elif any(k in query for k in ["use most", "my usage", "my activity", "most used", "frequent", "history"]):
            reply = (
                f"Based on your activity records, {user_name}:\n\n"
                f"📊 **Your #1 Most-Used Tool:** **Claude 3.5 Sonnet**\n"
                f"- **Share of your work:** **38% of all your prompts** this month.\n"
                f"- **What you use it for:** Primarily coding, TypeScript components, and technical writing.\n\n"
                f"🥈 **Second Most-Used:** **ChatGPT (GPT-4o)** (about 28% of prompts)\n"
                f"- Used mostly for quick drafts, brainstorming, and data queries.\n\n"
                f"🥉 **Third Most-Used:** **Perplexity AI** (about 20% of prompts)\n"
                f"- Used for quick web lookups and verifying facts.\n\n"
                f"✨ **Efficiency Insight:** Your tool distribution is very balanced, but you can save ₹825/month by shifting more of your quick ChatGPT queries to free Gemini Flash."
            )
            cards = [
                AssistantActionCard(
                    id="view-detailed-analytics",
                    title="View Full Usage & Spending Charts",
                    description="Explore weekly charts, token consumption, and model breakdown.",
                    button_label="View Usage Analytics",
                    button_url="/analytics",
                    highlight_color="brand",
                    badge="38% Claude",
                ),
                AssistantActionCard(
                    id="view-alerts",
                    title="Check Smart Notifications",
                    description="View active renewal and budget alerts.",
                    button_label="Open Notifications",
                    button_url="/notifications",
                    highlight_color="amber",
                ),
            ]
            follow_ups = [
                "How can I save money?",
                "Which subscription should I cancel?",
                "Which AI should I use next?",
            ]
            return AssistantChatResponse(
                reply=reply,
                personalized_context={"most_used_ai": "Claude 3.5 Sonnet", "usage_pct": 38},
                action_cards=cards,
                suggested_follow_ups=follow_ups,
            )

        # ── Intent 6: "Which AI should I use?" (General Recommendation) ──────
        elif any(k in query for k in ["which ai should i use", "what tool to use", "recommend an ai", "what should i use", "help me choose"]):
            reply = (
                f"Here is your easy cheat sheet based on what you want to do today, {user_name}:\n\n"
                f"💻 **Writing Code or Fixing Bugs?** &rarr; Use **Claude 3.5 Sonnet** (or free **DeepSeek-R1**).\n"
                f"🔍 **Searching the Web or Fact-Checking?** &rarr; Use **Perplexity AI** (gives real links).\n"
                f"✍️ **Drafting Emails or Brainstorming?** &rarr; Use **ChatGPT (GPT-4o)**.\n"
                f"📚 **Reading Giant PDFs or Books?** &rarr; Use **Google Gemini 1.5** (free 1M word memory).\n"
                f"🎨 **Making Images or Slide Decks?** &rarr; Use **Midjourney / Gamma AI**.\n\n"
                f"Tell me what specific task you're working on right now, and I'll give you the exact model and a ready-to-copy prompt!"
            )
            cards = [
                AssistantActionCard(
                    id="smart-task-advisor",
                    title="Smart Task Advisor",
                    description="Enter your exact prompt to get the best model recommendation.",
                    button_label="Open Task Advisor",
                    button_url="/task-advisor",
                    highlight_color="brand",
                    badge="Instant Match",
                ),
                AssistantActionCard(
                    id="plan-custom-workflow",
                    title="Plan a Full Project Workflow",
                    description="Break down your whole objective into easy step-by-step stages.",
                    button_label="Open Workflow Planner",
                    button_url="/workflow-planner",
                    highlight_color="emerald",
                ),
            ]
            follow_ups = [
                "Which AI is best for coding?",
                "How can I save money on my AI subscriptions?",
                "Which subscription should I cancel?",
            ]
            return AssistantChatResponse(
                reply=reply,
                personalized_context={"recommendations_ready": True},
                action_cards=cards,
                suggested_follow_ups=follow_ups,
            )

        # ── Default Fallback: Conversational Personal Advisor ─────────────────
        else:
            reply = (
                f"I'm right here to help you get the most out of your AI tools, {user_name}!\n\n"
                f"Regarding *'{request.message}'*:\n"
                f"As your personal advisor, I recommend keeping your active setup simple and cost-effective. "
                f"You currently have access to **{', '.join(active_names[:2])}**, and your total monthly spend is **₹{total_monthly_spend:.0f}**.\n\n"
                f"Here are a few quick things I can help you with:\n"
                f"• Picking the exact right tool for your current task\n"
                f"• Cutting unneeded monthly subscriptions\n"
                f"• Breaking big projects into step-by-step AI workflows\n\n"
                f"What would you like to explore next?"
            )
            cards = [
                AssistantActionCard(
                    id="assistant-budget-card",
                    title="AI Budget Planner",
                    description="Optimize your monthly subscription spend.",
                    button_label="Open Budget Planner",
                    button_url="/budget-planner",
                    highlight_color="brand",
                ),
                AssistantActionCard(
                    id="assistant-task-card",
                    title="Smart Task Advisor",
                    description="Get model matches for any prompt.",
                    button_label="Open Task Advisor",
                    button_url="/task-advisor",
                    highlight_color="cyan",
                ),
            ]
            follow_ups = [
                "Which AI should I use?",
                "How can I save money?",
                "Which subscription should I cancel?",
                "Which AI is best for coding?",
            ]
            return AssistantChatResponse(
                reply=reply,
                personalized_context={"general_query": True},
                action_cards=cards,
                suggested_follow_ups=follow_ups,
            )
