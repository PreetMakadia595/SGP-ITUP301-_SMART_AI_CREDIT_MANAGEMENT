// ── Credit ────────────────────────────────────────────────────────────────────
export interface CreditEntry {
  id: number;
  user_id: number;
  service_slug: string;
  service_name: string;
  credits_used: number;
  credits_remaining: number;
  credits_total: number;
  cost_usd: number | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
}

export interface CreditSummary {
  service_slug: string;
  service_name: string;
  total_used: number;
  total_remaining: number;
  total_cost: number;
}

export interface AnalyticsOverview {
  total_credits_used: number;
  total_cost_usd: number;
  services_tracked: number;
  most_used_service: string | null;
  breakdown: CreditSummary[];
}

export interface TrendPoint {
  date: string;
  credits_used: number;
  cost_usd: number;
}

export interface Recommendation {
  service: string;
  type: "warning" | "info" | "success";
  message: string;
  priority: "high" | "medium" | "low";
}

// ── Supported AI Services ─────────────────────────────────────────────────────
export const AI_SERVICES = [
  { slug: "chatgpt",       name: "ChatGPT",        color: "#10A37F" },
  { slug: "claude",        name: "Claude",          color: "#D4A96A" },
  { slug: "gemini",        name: "Gemini",          color: "#4285F4" },
  { slug: "cursor",        name: "Cursor",          color: "#7C3AED" },
  { slug: "github-copilot",name: "GitHub Copilot",  color: "#24292E" },
  { slug: "perplexity",    name: "Perplexity",      color: "#20B2AA" },
  { slug: "bolt",          name: "Bolt",            color: "#F59E0B" },
  { slug: "lovable",       name: "Lovable",         color: "#EC4899" },
] as const;

// ── Credit Usage Log ────────────────────────────────────────────────────────
export interface CreditUsageLog {
  id: number;
  user_id: number;
  platform: string;
  model: string;
  project_name: string;
  task_type: string;
  credits_used: number;
  prompt_count: number;
  token_usage: number;
  usage_date: string; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditUsageLogCreate {
  platform: string;
  model: string;
  project_name: string;
  task_type: string;
  credits_used: number;
  prompt_count: number;
  token_usage: number;
  usage_date: string;
  notes?: string | null;
}

export interface CreditUsageLogUpdate {
  platform?: string;
  model?: string;
  project_name?: string;
  task_type?: string;
  credits_used?: number;
  prompt_count?: number;
  token_usage?: number;
  usage_date?: string;
  notes?: string | null;
}

export interface CreditLogFilters {
  search?: string;
  platform?: string;
  task_type?: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface CreditLogListResponse {
  items: CreditUsageLog[];
  total: number;
  skip: number;
  limit: number;
}

export interface ChartDataPoint {
  label: string;
  credits_used: number;
  prompt_count: number;
  token_usage: number;
}

export interface DistributionPoint {
  name: string;
  credits_used: number;
  percentage: number;
}

export interface CreditChartsResponse {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
  platform_breakdown: DistributionPoint[];
  task_breakdown: DistributionPoint[];
  total_credits: number;
  total_prompts: number;
  total_tokens: number;
  total_logs: number;
}

export const PRESET_PLATFORMS = [
  "OpenAI",
  "Anthropic",
  "Google Gemini",
  "Cursor",
  "GitHub Copilot",
  "Perplexity",
  "Midjourney",
  "Replicate",
  "Mistral AI",
  "Cohere",
  "Groq",
  "DeepSeek",
  "Other",
];

export const PRESET_TASK_TYPES = [
  "Code Generation",
  "Debugging & Refactoring",
  "Content Writing",
  "Data Analysis",
  "Chat / Q&A",
  "Image Generation",
  "Translation",
  "Research",
  "Automation",
  "Other",
];

export const PRESET_MODELS_BY_PLATFORM: Record<string, string[]> = {
  OpenAI: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o1-mini", "gpt-4-turbo", "gpt-3.5-turbo", "dall-e-3"],
  Anthropic: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku", "claude-3-5-haiku"],
  "Google Gemini": ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-ultra"],
  Cursor: ["cursor-fast", "cursor-small", "claude-3.5-sonnet (Cursor)", "gpt-4o (Cursor)"],
  "GitHub Copilot": ["copilot-chat", "copilot-workspace", "gpt-4o (Copilot)"],
  Perplexity: ["sonar-reasoning-pro", "sonar-pro", "sonar", "llama-3.1-sonar"],
  DeepSeek: ["deepseek-r1", "deepseek-v3", "deepseek-coder"],
  Mistral: ["mistral-large", "mistral-medium", "codestral"],
};

