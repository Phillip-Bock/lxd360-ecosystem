import { logger } from '@/lib/logger';

const log = logger.child({ module: 'gcp-metrics' });

// =====================================================
// TYPES
// =====================================================

export interface GCPMetrics {
  budget: BudgetMetrics;
  apiUsage: APIUsageMetrics;
  alerts: GCPAlert[];
  costs: CostBreakdown;
  vertexAI: VertexAIMetrics;
}

export interface BudgetMetrics {
  budgetAmount: number;
  currentSpend: number;
  percentageUsed: number;
  forecastedSpend: number;
  forecastedOverage: number;
  daysRemaining: number;
  burnRate: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface APIUsageMetrics {
  vertexAI: ServiceUsage;
  bigQuery: ServiceUsage;
  cloudStorage: ServiceUsage;
  cloudFunctions: ServiceUsage;
  totalRequests: number;
  totalCost: number;
}

export interface ServiceUsage {
  requests: number;
  cost: number;
  quota: number;
  quotaUsed: number;
  trend: 'up' | 'down' | 'stable';
}

export interface GCPAlert {
  id: string;
  type: 'budget' | 'quota' | 'error' | 'performance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface CostBreakdown {
  byService: ServiceCost[];
  byProject: ProjectCost[];
  trend: CostTrend[];
}

export interface ServiceCost {
  service: string;
  cost: number;
  percentage: number;
  change: number;
}

export interface ProjectCost {
  project: string;
  cost: number;
  percentage: number;
}

export interface CostTrend {
  date: string;
  cost: number;
}

export interface VertexAIMetrics {
  predictions: number;
  trainingJobs: number;
  modelDeployments: number;
  tokensUsed: number;
  cost: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
}

// =====================================================
// API HELPERS
// =====================================================

interface GCPCredentials {
  projectId: string;
  serviceAccountEmail?: string;
}

function getGCPCredentials(): GCPCredentials | null {
  const projectId = process.env.GCP_PROJECT_ID;

  if (!projectId) {
    log.warn('GCP_PROJECT_ID not configured');
    return null;
  }

  return {
    projectId,
    serviceAccountEmail: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
  };
}

/**
 * Make authenticated request to GCP API
 * Note: In production, this would use google-auth-library for proper auth
 */
async function gcpFetch<T>(_endpoint: string, _options?: RequestInit): Promise<T | null> {
  const credentials = getGCPCredentials();

  if (!credentials) {
    return null;
  }

  // In production, implement proper GCP API authentication
  // For now, return null to trigger mock data
  void _endpoint;
  void _options;
  return null;
}

// =====================================================
// METRICS FUNCTIONS
// =====================================================

/**
 * Get budget status metrics
 */
export async function getBudgetStatus(): Promise<BudgetMetrics> {
  void (await gcpFetch('/v1/billing/budgets'));

  // For now, return mock data
  // In production, this would parse the billing API response
  return getMockBudgetMetrics();
}

/**
 * Get API usage metrics
 */
export async function getAPIUsage(): Promise<APIUsageMetrics> {
  void (await gcpFetch('/v1/services/usage'));

  return getMockAPIUsageMetrics();
}

/**
 * Get active alerts
 */
export async function getAlerts(): Promise<GCPAlert[]> {
  void (await gcpFetch('/v1/monitoring/alerts'));

  return getMockAlerts();
}

/**
 * Get cost breakdown
 */
export async function getCostBreakdown(): Promise<CostBreakdown> {
  void (await gcpFetch('/v1/billing/costs'));

  return getMockCostBreakdown();
}

/**
 * Get Vertex AI metrics
 */
export async function getVertexAIMetrics(): Promise<VertexAIMetrics> {
  void (await gcpFetch('/v1/aiplatform/metrics'));

  return getMockVertexAIMetrics();
}

/**
 * Get all GCP metrics
 */
export async function getAllGCPMetrics(): Promise<GCPMetrics> {
  const [budget, apiUsage, alerts, costs, vertexAI] = await Promise.all([
    getBudgetStatus(),
    getAPIUsage(),
    getAlerts(),
    getCostBreakdown(),
    getVertexAIMetrics(),
  ]);

  return {
    budget,
    apiUsage,
    alerts,
    costs,
    vertexAI,
  };
}

// =====================================================
// MOCK DATA FUNCTIONS
// =====================================================

function getMockBudgetMetrics(): BudgetMetrics {
  const budgetAmount = 5000;
  const currentSpend = 3247;
  const daysInMonth = 30;
  const dayOfMonth = new Date().getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const burnRate = currentSpend / dayOfMonth;
  const forecastedSpend = burnRate * daysInMonth;
  const forecastedOverage = Math.max(0, forecastedSpend - budgetAmount);

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  const percentageUsed = (currentSpend / budgetAmount) * 100;

  if (percentageUsed > 90 || forecastedOverage > 0) {
    status = 'critical';
  } else if (percentageUsed > 75) {
    status = 'warning';
  }

  return {
    budgetAmount,
    currentSpend,
    percentageUsed: Math.round(percentageUsed * 10) / 10,
    forecastedSpend: Math.round(forecastedSpend),
    forecastedOverage: Math.round(forecastedOverage),
    daysRemaining,
    burnRate: Math.round(burnRate * 100) / 100,
    status,
  };
}

function getMockAPIUsageMetrics(): APIUsageMetrics {
  return {
    vertexAI: {
      requests: 45280,
      cost: 1250,
      quota: 100000,
      quotaUsed: 45,
      trend: 'up',
    },
    bigQuery: {
      requests: 12450,
      cost: 450,
      quota: 50000,
      quotaUsed: 25,
      trend: 'stable',
    },
    cloudStorage: {
      requests: 89200,
      cost: 120,
      quota: 500000,
      quotaUsed: 18,
      trend: 'stable',
    },
    cloudFunctions: {
      requests: 156000,
      cost: 85,
      quota: 1000000,
      quotaUsed: 16,
      trend: 'up',
    },
    totalRequests: 302930,
    totalCost: 1905,
  };
}

function getMockAlerts(): GCPAlert[] {
  return [
    {
      id: 'alert_1',
      type: 'budget',
      severity: 'warning',
      title: 'Budget threshold reached',
      message: 'Spending has reached 65% of monthly budget',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    },
    {
      id: 'alert_2',
      type: 'quota',
      severity: 'info',
      title: 'Vertex AI quota at 45%',
      message: 'Consider increasing quota if usage continues to grow',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: true,
    },
  ];
}

function getMockCostBreakdown(): CostBreakdown {
  return {
    byService: [
      { service: 'Vertex AI', cost: 1250, percentage: 38.5, change: 12 },
      { service: 'BigQuery', cost: 450, percentage: 13.9, change: -5 },
      { service: 'Cloud Storage', cost: 380, percentage: 11.7, change: 2 },
      { service: 'Cloud Run', cost: 320, percentage: 9.9, change: 8 },
      { service: 'Cloud Functions', cost: 285, percentage: 8.8, change: 15 },
      { service: 'Other', cost: 562, percentage: 17.2, change: 3 },
    ],
    byProject: [
      { project: 'lxp360-production', cost: 2450, percentage: 75 },
      { project: 'lxp360-staging', cost: 520, percentage: 16 },
      { project: 'lxp360-dev', cost: 277, percentage: 9 },
    ],
    trend: [
      { date: '2024-12-01', cost: 95 },
      { date: '2024-12-05', cost: 520 },
      { date: '2024-12-10', cost: 1150 },
      { date: '2024-12-15', cost: 1890 },
      { date: '2024-12-20', cost: 3247 },
    ],
  };
}

function getMockVertexAIMetrics(): VertexAIMetrics {
  return {
    predictions: 45280,
    trainingJobs: 3,
    modelDeployments: 5,
    tokensUsed: 2500000,
    cost: 1250,
    latency: {
      p50: 120,
      p95: 350,
      p99: 580,
    },
  };
}
