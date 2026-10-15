/**
 * AI Workflow Planner API Client
 */
import { apiClient } from "./client";

export interface WorkflowStep {
  step_number: number;
  step_title: string;
  step_category: "research" | "writing" | "design" | "coding" | "presentation" | "review" | "marketing" | "data" | string;
  best_ai: string;
  best_ai_icon: string;
  reason: string;
  estimated_time: string;
  estimated_cost: string;
  alternative_ai: string;
  alternative_reason: string;
  recommended_prompt_template: string;
  output_deliverable: string;
}

export interface WorkflowPlanResponse {
  goal: string;
  category: string;
  summary: string;
  total_estimated_time: string;
  total_estimated_cost: string;
  total_steps_count: number;
  steps: WorkflowStep[];
  workflow_tips: string[];
}

export interface WorkflowRequest {
  goal: string;
  custom_context?: string;
}

export interface WorkflowPreset {
  id: string;
  title: string;
  icon: string;
  description: string;
  category: string;
  default_prompt: string;
}

export async function getWorkflowPresets(): Promise<WorkflowPreset[]> {
  const { data } = await apiClient.get<WorkflowPreset[]>("/workflow-planner/presets");
  return data;
}

export async function generateWorkflowPlan(request: WorkflowRequest): Promise<WorkflowPlanResponse> {
  const { data } = await apiClient.post<WorkflowPlanResponse>("/workflow-planner/generate", request);
  return data;
}
