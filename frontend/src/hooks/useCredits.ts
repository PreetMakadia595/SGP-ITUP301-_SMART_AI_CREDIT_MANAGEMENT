/**
 * useCredits Hook — Fetch credit summaries, analytics overview, trends
 */
import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import type { CreditSummary, AnalyticsOverview, TrendPoint, Recommendation } from "@/types/credit";

export function useCredits() {
  const [summary, setSummary] = useState<CreditSummary[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, ovRes, trRes, recRes] = await Promise.all([
        apiClient.get<CreditSummary[]>("/credits/summary"),
        apiClient.get<AnalyticsOverview>("/analytics/overview"),
        apiClient.get<TrendPoint[]>("/analytics/trends"),
        apiClient.get<{ recommendations: Recommendation[] }>("/recommendations/"),
      ]);
      setSummary(sumRes.data);
      setOverview(ovRes.data);
      setTrends(trRes.data);
      setRecommendations(recRes.data.recommendations);
    } catch (err: unknown) {
      setError("Failed to fetch credit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return { summary, overview, trends, recommendations, loading, error, refetch: fetchAll };
}
