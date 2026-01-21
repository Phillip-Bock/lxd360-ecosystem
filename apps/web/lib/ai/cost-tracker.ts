import { estimateCost } from './token-counter';
import type { AICostEntry, AICostSummary, AIProvider, AIUsage } from './types';

// ============================================================================
// In-Memory Storage (Replace with database in production)
// ============================================================================

const costEntries: AICostEntry[] = [];

// ============================================================================
// Cost Tracking Functions
// ============================================================================

/**
 * Record an AI usage event
 */
export function recordUsage(
  provider: AIProvider,
  model: string,
  operation: 'completion' | 'embedding' | 'image',
  usage: AIUsage,
  userId?: string,
  metadata?: Record<string, unknown>,
): AICostEntry {
  const cost = usage.cost ?? estimateCost(model, usage.promptTokens, usage.completionTokens);

  const entry: AICostEntry = {
    timestamp: new Date(),
    provider,
    model,
    operation,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    cost,
    userId,
    metadata,
  };

  costEntries.push(entry);

  // Keep only last 10000 entries in memory
  if (costEntries.length > 10000) {
    costEntries.shift();
  }

  return entry;
}

/**
 * Get cost summary for a time period
 */
export function getCostSummary(
  startDate: Date,
  endDate: Date = new Date(),
  userId?: string,
): AICostSummary {
  const filtered = costEntries.filter((entry) => {
    const inRange = entry.timestamp >= startDate && entry.timestamp <= endDate;
    const matchesUser = userId ? entry.userId === userId : true;
    return inRange && matchesUser;
  });

  const byProvider: AICostSummary['byProvider'] = {} as AICostSummary['byProvider'];
  const byModel: AICostSummary['byModel'] = {};

  let totalCost = 0;
  let totalTokens = 0;

  for (const entry of filtered) {
    totalCost += entry.cost;
    totalTokens += entry.promptTokens + entry.completionTokens;

    // Aggregate by provider
    if (!byProvider[entry.provider]) {
      byProvider[entry.provider] = { cost: 0, tokens: 0, requests: 0 };
    }
    byProvider[entry.provider].cost += entry.cost;
    byProvider[entry.provider].tokens += entry.promptTokens + entry.completionTokens;
    byProvider[entry.provider].requests++;

    // Aggregate by model
    if (!byModel[entry.model]) {
      byModel[entry.model] = { cost: 0, tokens: 0, requests: 0 };
    }
    byModel[entry.model].cost += entry.cost;
    byModel[entry.model].tokens += entry.promptTokens + entry.completionTokens;
    byModel[entry.model].requests++;
  }

  return {
    totalCost,
    totalTokens,
    byProvider,
    byModel,
    period: {
      start: startDate,
      end: endDate,
    },
  };
}

/**
 * Get usage for a specific user
 */
export function getUserUsage(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  entries: AICostEntry[];
} {
  const start = startDate || new Date(0);
  const end = endDate || new Date();

  const userEntries = costEntries.filter(
    (entry) => entry.userId === userId && entry.timestamp >= start && entry.timestamp <= end,
  );

  return {
    totalCost: userEntries.reduce((sum, e) => sum + e.cost, 0),
    totalTokens: userEntries.reduce((sum, e) => sum + e.promptTokens + e.completionTokens, 0),
    requestCount: userEntries.length,
    entries: userEntries,
  };
}

/**
 * Get daily costs for charting
 */
export function getDailyCosts(
  days: number = 30,
  userId?: string,
): { date: string; cost: number; tokens: number }[] {
  const result: Record<string, { cost: number; tokens: number }> = {};
  const now = new Date();

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = { cost: 0, tokens: 0 };
  }

  // Aggregate costs
  for (const entry of costEntries) {
    if (userId && entry.userId !== userId) continue;

    const dateStr = entry.timestamp.toISOString().split('T')[0];
    if (result[dateStr]) {
      result[dateStr].cost += entry.cost;
      result[dateStr].tokens += entry.promptTokens + entry.completionTokens;
    }
  }

  return Object.entries(result)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// Budget & Limits
// ============================================================================

interface BudgetConfig {
  dailyLimit?: number;
  monthlyLimit?: number;
  perRequestLimit?: number;
}

const userBudgets: Map<string, BudgetConfig> = new Map();

/**
 * Set budget limits for a user
 */
export function setUserBudget(userId: string, config: BudgetConfig): void {
  userBudgets.set(userId, config);
}

/**
 * Check if a user is within budget
 */
export function checkUserBudget(userId: string): {
  withinBudget: boolean;
  dailyUsed: number;
  dailyLimit?: number;
  monthlyUsed: number;
  monthlyLimit?: number;
} {
  const budget = userBudgets.get(userId);
  if (!budget) {
    return { withinBudget: true, dailyUsed: 0, monthlyUsed: 0 };
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { totalCost: dailyUsed } = getUserUsage(userId, startOfDay);
  const { totalCost: monthlyUsed } = getUserUsage(userId, startOfMonth);

  const withinDailyLimit = !budget.dailyLimit || dailyUsed < budget.dailyLimit;
  const withinMonthlyLimit = !budget.monthlyLimit || monthlyUsed < budget.monthlyLimit;

  return {
    withinBudget: withinDailyLimit && withinMonthlyLimit,
    dailyUsed,
    dailyLimit: budget.dailyLimit,
    monthlyUsed,
    monthlyLimit: budget.monthlyLimit,
  };
}

/**
 * Estimate if a request would exceed budget
 */
export function wouldExceedBudget(userId: string, estimatedCost: number): boolean {
  const { withinBudget, dailyUsed, dailyLimit, monthlyUsed, monthlyLimit } =
    checkUserBudget(userId);

  if (!withinBudget) return true;

  if (dailyLimit && dailyUsed + estimatedCost > dailyLimit) return true;
  if (monthlyLimit && monthlyUsed + estimatedCost > monthlyLimit) return true;

  return false;
}
