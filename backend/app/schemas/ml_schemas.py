"""
Pydantic Schemas for Machine Learning Module
Provides user-friendly prediction models, data quality indicators, and background comparison structures.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class UserFriendlyPrediction(BaseModel):
    category: str = Field(..., description="Prediction category key e.g. spending, tomorrow_ai, renewal_risk")
    headline: str = Field(..., description="Human-friendly headline message e.g. 'You may save ₹250 this month.'")
    message: str = Field(..., description="Actionable non-technical description of prediction")
    action_text: Optional[str] = Field(None, description="Button action label e.g. 'Review Plan'")
    action_url: Optional[str] = Field(None, description="Navigation URL for the action")
    badge: str = Field(..., description="Badge label e.g. 'Smart Savings', 'Renewal Soon'")
    badge_variant: str = Field(default="info", description="Badge color styling: success, warning, info, brand")
    confidence_score: float = Field(default=0.92, description="Confidence percentage")


class ModelEvaluationMetric(BaseModel):
    algorithm_name: str = Field(..., description="Algorithm name e.g. Random Forest, XGBoost, Gradient Boosting")
    mae: float = Field(..., description="Mean Absolute Error")
    rmse: float = Field(..., description="Root Mean Squared Error")
    r2_score: float = Field(..., description="R² Coefficient of Determination")
    is_best: bool = Field(default=False, description="Whether this is the top performing model")


class ForecastPoint(BaseModel):
    date: str
    actual_credits: Optional[float] = None
    predicted_credits: float
    is_future: bool = False


class FeatureImportancePoint(BaseModel):
    feature: str
    importance: float


class MLPredictionsResponse(BaseModel):
    status: str = Field(default="trained", description="trained or calibrating")
    calibration_message: Optional[str] = None
    data_source: str = Field(default="real_data", description="real_data or insufficient_real_data")
    records_count: int = 0
    source_breakdown: Optional[Dict[str, int]] = None
    preferred_ai: UserFriendlyPrediction
    future_monthly_spending: UserFriendlyPrediction
    subscription_renewal_risk: UserFriendlyPrediction
    tomorrow_ai_needed: UserFriendlyPrediction
    personal_usage_pattern: UserFriendlyPrediction
    budget_forecast: UserFriendlyPrediction
    predictions_list: List[UserFriendlyPrediction]
    future_spending_amount: float
    savings_amount: float
    recommended_tomorrow_ai: str
    renewal_alert_days: int
    renewal_platform: str
    budget_status: str
    winning_model_name: Optional[str] = None
    forecast_series: Optional[List[ForecastPoint]] = None


class MLAnalyticsResponse(BaseModel):
    status: str = Field(default="trained", description="trained or calibrating")
    calibration_message: Optional[str] = None
    data_source: str = Field(default="real_data", description="real_data or insufficient_real_data")
    records_count: int = 0
    tomorrow_usage: float
    weekly_usage: float
    monthly_cost: float
    credit_exhaustion_date: str
    days_until_exhaustion: Optional[int] = None
    best_model_name: str
    models_evaluation: List[ModelEvaluationMetric]
    forecast_series: List[ForecastPoint]
    feature_importances: List[FeatureImportancePoint]
    predictions: Optional[MLPredictionsResponse] = None
