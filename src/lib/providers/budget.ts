import { BudgetLimits } from "./types";

export const DEFAULT_BUDGET_LIMITS: BudgetLimits = {
  perRequestMaxCostCents: 50, // 50 cents max per single query/research
  dailyProviderBudgetCents: 500, // $5.00 daily ceiling across external APIs
  maxSearchQueriesPerRequest: 5,
  maxPagesFetchedPerRequest: 10,
  maxLlmCallsPerRequest: 4,
  maxResearchDurationSeconds: 45,
};

interface UsageCounter {
  dailyCostCents: number;
  requestCountToday: number;
  lastResetDay: string;
  providerBreakdown: Record<string, { costCents: number; callCount: number }>;
}

export interface FailoverEvent {
  id: string;
  timestamp: string;
  fromProvider: string;
  toProvider: string;
  reason: string;
}

const currentUsage: UsageCounter = {
  dailyCostCents: 0,
  requestCountToday: 0,
  lastResetDay: new Date().toISOString().split("T")[0],
  providerBreakdown: {
    gemini: { costCents: 0, callCount: 0 },
    openai: { costCents: 0, callCount: 0 },
    youcom: { costCents: 0, callCount: 0 },
  },
};

const failoverLog: FailoverEvent[] = [];

function ensureCurrentDay() {
  const today = new Date().toISOString().split("T")[0];
  if (currentUsage.lastResetDay !== today) {
    currentUsage.dailyCostCents = 0;
    currentUsage.requestCountToday = 0;
    currentUsage.lastResetDay = today;
    currentUsage.providerBreakdown = {
      gemini: { costCents: 0, callCount: 0 },
      openai: { costCents: 0, callCount: 0 },
      youcom: { costCents: 0, callCount: 0 },
    };
  }
}

export function checkBudgetGuard(estimatedCostCents = 5): { allowed: boolean; reason?: string } {
  ensureCurrentDay();

  if (currentUsage.dailyCostCents + estimatedCostCents > DEFAULT_BUDGET_LIMITS.dailyProviderBudgetCents) {
    return {
      allowed: false,
      reason: `Daily external API budget limit reached ($${(DEFAULT_BUDGET_LIMITS.dailyProviderBudgetCents / 100).toFixed(2)}). Core commerce continues unaffected.`,
    };
  }

  return { allowed: true };
}

export function recordUsageCost(costCents: number, providerId = "gemini"): void {
  ensureCurrentDay();
  currentUsage.dailyCostCents += costCents;
  currentUsage.requestCountToday += 1;

  if (!currentUsage.providerBreakdown[providerId]) {
    currentUsage.providerBreakdown[providerId] = { costCents: 0, callCount: 0 };
  }
  currentUsage.providerBreakdown[providerId].costCents += costCents;
  currentUsage.providerBreakdown[providerId].callCount += 1;
}

export function recordFailoverEvent(fromProvider: string, toProvider: string, reason: string): void {
  failoverLog.unshift({
    id: `fo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    fromProvider,
    toProvider,
    reason,
  });

  if (failoverLog.length > 30) {
    failoverLog.pop();
  }
}

export function getFailoverEvents(): FailoverEvent[] {
  return [...failoverLog];
}

export function getDailyUsageStats(): {
  dailyCostCents: number;
  requestCountToday: number;
  dailyBudgetCents: number;
  budgetRemainingCents: number;
  providerBreakdown: Record<string, { costCents: number; callCount: number }>;
} {
  ensureCurrentDay();
  return {
    dailyCostCents: currentUsage.dailyCostCents,
    requestCountToday: currentUsage.requestCountToday,
    dailyBudgetCents: DEFAULT_BUDGET_LIMITS.dailyProviderBudgetCents,
    budgetRemainingCents: Math.max(0, DEFAULT_BUDGET_LIMITS.dailyProviderBudgetCents - currentUsage.dailyCostCents),
    providerBreakdown: { ...currentUsage.providerBreakdown },
  };
}
