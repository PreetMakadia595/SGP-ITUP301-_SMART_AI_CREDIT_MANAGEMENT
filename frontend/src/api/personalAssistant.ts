/**
 * AI Personal Assistant API Client
 */
import { apiClient } from "./client";

export interface AssistantActionCard {
  id: string;
  title: string;
  description: string;
  button_label: string;
  button_url: string;
  action_type: string;
  badge?: string;
  highlight_color?: string;
}

export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  action_cards?: AssistantActionCard[];
  suggested_follow_ups?: string[];
}

export interface AssistantChatRequest {
  message: string;
  history?: AssistantChatMessage[];
}

export interface AssistantChatResponse {
  reply: string;
  personalized_context: Record<string, any>;
  action_cards: AssistantActionCard[];
  suggested_follow_ups: string[];
}

export interface QuickSuggestion {
  id: string;
  category: string;
  question: string;
  description: string;
  icon: string;
}

export interface AssistantProfileInsights {
  user_name: string;
  monthly_budget: number;
  current_spend: number;
  most_used_ai: string;
  most_used_percentage: number;
  active_subscriptions_count: number;
  top_saving_opportunity: string;
  potential_monthly_savings: number;
}

export async function sendAssistantMessage(
  req: AssistantChatRequest
): Promise<AssistantChatResponse> {
  const { data } = await apiClient.post<AssistantChatResponse>(
    "/personal-assistant/chat",
    req
  );
  return data;
}

export async function getAssistantSuggestions(): Promise<QuickSuggestion[]> {
  const { data } = await apiClient.get<QuickSuggestion[]>(
    "/personal-assistant/suggestions"
  );
  return data;
}

export async function getAssistantInsights(): Promise<AssistantProfileInsights> {
  const { data } = await apiClient.get<AssistantProfileInsights>(
    "/personal-assistant/insights"
  );
  return data;
}
