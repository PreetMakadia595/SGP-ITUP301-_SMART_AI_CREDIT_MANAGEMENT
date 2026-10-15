"""
API v1 Router — Aggregates all sub-routers under /api/v1
"""
from fastapi import APIRouter

from app.api.v1 import auth, users, credits, analytics, recommendations, platforms, credit_logs, providers, ingestion, task_advisor, budget_planner, workflow_planner, notifications, personal_assistant

api_router = APIRouter()

api_router.include_router(auth.router,            prefix="/auth",            tags=["Authentication"])
api_router.include_router(users.router,           prefix="/users",           tags=["Users"])
api_router.include_router(credits.router,         prefix="/credits",         tags=["Credits"])
api_router.include_router(credit_logs.router,      prefix="/credits/logs",    tags=["Credit Logs"])
api_router.include_router(analytics.router,       prefix="/analytics",       tags=["Analytics"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(platforms.router,       prefix="/platforms",       tags=["Platforms"])
api_router.include_router(providers.router,       prefix="/providers",       tags=["Providers"])
api_router.include_router(ingestion.router,       prefix="/ingestion",       tags=["Ingestion"])
api_router.include_router(task_advisor.router,    prefix="/task-advisor",    tags=["Task Advisor"])
api_router.include_router(budget_planner.router,  prefix="/budget-planner",  tags=["Budget Planner"])
api_router.include_router(workflow_planner.router,prefix="/workflow-planner",tags=["Workflow Planner"])
api_router.include_router(notifications.router,   prefix="/notifications",   tags=["Notifications"])
api_router.include_router(personal_assistant.router, prefix="/personal-assistant", tags=["Personal Assistant"])

