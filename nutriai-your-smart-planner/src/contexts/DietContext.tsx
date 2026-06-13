import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { dietApi, type Analytics, type Plan } from "@/utils/api";

interface DietCtx {
  currentPlan: Plan | null;
  analytics: Analytics | null;
  isGenerating: boolean;
  generatePlan: (params: Record<string, unknown>) => Promise<Plan>;
  fetchPlan: (userId: string) => Promise<void>;
  fetchAnalytics: (userId: string) => Promise<void>;
}

const Ctx = createContext<DietCtx | null>(null);

export function DietProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = useCallback(async (params: Record<string, unknown>) => {
    setIsGenerating(true);
    try {
      // simulate AI processing time
      await new Promise((r) => setTimeout(r, 2800));
      const plan = await dietApi.generate(params);
      setCurrentPlan(plan);
      return plan;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const fetchPlan = useCallback(async (userId: string) => {
    const p = await dietApi.get(userId);
    setCurrentPlan(p);
  }, []);

  const fetchAnalytics = useCallback(async (userId: string) => {
    const a = await dietApi.analytics(userId);
    setAnalytics(a);
  }, []);

  return (
    <Ctx.Provider
      value={{ currentPlan, analytics, isGenerating, generatePlan, fetchPlan, fetchAnalytics }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDiet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDiet must be used within DietProvider");
  return ctx;
}
