"""
Pydantic Schemas for Machine Learning Module
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ModelEvaluationMetric(BaseModel):
    algorithm_name: str = Field(..., description="Algorithm name e.g. Linear Regression, Random Forest, XGBoost")
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


class MLAnalyticsResponse(BaseModel):
    tomorrow_usage: float
    weekly_usage: float
    monthly_cost: float
    credit_exhaustion_date: str
    days_until_exhaustion: Optional[int] = None
    best_model_name: str
    models_evaluation: List[ModelEvaluationMetric]
    forecast_series: List[ForecastPoint]
    feature_importances: List[FeatureImportancePoint]
