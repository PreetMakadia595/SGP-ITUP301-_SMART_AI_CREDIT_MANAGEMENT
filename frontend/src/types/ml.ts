export interface UserFriendlyPrediction {
  category: string;
  headline: string;
  message: string;
  action_text?: string;
  action_url?: string;
  badge: string;
  badge_variant: "success" | "warning" | "info" | "brand";
  confidence_score: number;
}

export interface MLPredictionsResponse {
  preferred_ai: UserFriendlyPrediction;
  future_monthly_spending: UserFriendlyPrediction;
  subscription_renewal_risk: UserFriendlyPrediction;
  tomorrow_ai_needed: UserFriendlyPrediction;
  personal_usage_pattern: UserFriendlyPrediction;
  budget_forecast: UserFriendlyPrediction;
  predictions_list: UserFriendlyPrediction[];
  future_spending_amount: number;
  savings_amount: number;
  recommended_tomorrow_ai: string;
  renewal_alert_days: number;
  renewal_platform: string;
  budget_status: string;
  winning_model_name?: string;
  forecast_series?: {
    date: string;
    actual_credits?: number;
    predicted_credits: number;
    is_future: boolean;
  }[];
}
