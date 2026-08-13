/**
 * Task Advisor API client
 *
 * Wraps the /task-advisor endpoints with typed Axios calls.
 */
import { apiClient } from "./client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TaskAdvisorRecommendation {
  id: number;
  task_input: string;
  engine?: string;
  best_platform: string;
  alternative_platform: string;
  reason: string;
  estimated_time: string;
  estimated_cost: string;
  difficulty_level: string;
  confidence: number;
  reasoning_steps?: string[];
  optimized_prompt?: string;
  model_arena_scores?: Record<
    string,
    { reasoning: number; speed: number; cost: number; accuracy: number }
  >;
  starter_artifact?: {
    title: string;
    type: string;
    language: string;
    content: string;
  };
  external_url?: string;
  direct_response?: string;
  feedback: string | null;
  created_at: string;
}

export interface TaskExecuteResult {
  task_input: string;
  engine: string;
  optimized_prompt: string;
  direct_response: string;
}

// ── API Calls ────────────────────────────────────────────────────────────────

/** Submit a task and receive a recommendation */
export async function postTaskQuery(
  task_input: string,
  engine: string = "auto",
  constraints: string[] = []
) {
  const res = await apiClient.post<TaskAdvisorRecommendation>("/task-advisor/", {
    task_input,
    engine,
    constraints,
  });
  return res.data;
}

/** Execute a task live using selected AI engine persona */
export async function executeTaskQuery(
  task_input: string,
  engine: string = "auto",
  system_prompt?: string
) {
  const res = await apiClient.post<TaskExecuteResult>("/task-advisor/execute", {
    task_input,
    engine,
    system_prompt,
  });
  return res.data;
}

/** Submit feedback on a recommendation */
export async function patchFeedback(
  id: number,
  feedback: "helpful" | "not_helpful"
) {
  const res = await apiClient.patch<TaskAdvisorRecommendation>(
    `/task-advisor/${id}/feedback`,
    { feedback }
  );
  return res.data;
}

/** Get history of past recommendations */
export async function getTaskAdvisorHistory(limit = 50, offset = 0) {
  const res = await apiClient.get<TaskAdvisorRecommendation[]>(
    "/task-advisor/history",
    { params: { limit, offset } }
  );
  return res.data;
}

