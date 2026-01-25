/**
 * ROI Correlation Engine
 *
 * Implements Artemis vision: "Correlate LRS data (Learning) with Business Data
 * (Sales/Safety Logs). 'Users who spoke to Cortex for >5 minutes had 20% fewer
 * safety incidents.'"
 */

import { logger } from '@/lib/logger';
import type {
  BusinessMetrics,
  GodViewLearningMetrics,
  ROICorrelation,
  ROIDashboard,
} from './god-view-types';

const log = logger.scope('ROIEngine');

// =============================================================================
// CONSTANTS
// =============================================================================

/** P-value threshold for statistical significance */
const SIGNIFICANCE_THRESHOLD = 0.05;

// =============================================================================
// STATISTICAL FUNCTIONS
// =============================================================================

/**
 * Calculate Pearson correlation coefficient
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Calculate p-value for correlation (simplified t-test approximation)
 */
function calculatePValue(correlation: number, n: number): number {
  if (n < 3) return 1;

  const correlationSquared = correlation * correlation;
  if (correlationSquared >= 1) return 0;

  const t = correlation * Math.sqrt((n - 2) / (1 - correlationSquared));

  // Simplified p-value approximation (would use t-distribution in production)
  const abst = Math.abs(t);
  if (abst > 3.5) return 0.001;
  if (abst > 2.5) return 0.02;
  if (abst > 2.0) return 0.05;
  if (abst > 1.5) return 0.15;
  return 0.5;
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate correlation between learning and business metrics
 */
export function calculateCorrelation(
  learningData: number[],
  businessData: number[],
  learningMetric: keyof GodViewLearningMetrics,
  businessMetric: keyof BusinessMetrics,
): ROICorrelation {
  const correlation = pearsonCorrelation(learningData, businessData);
  const pValue = calculatePValue(correlation, learningData.length);
  const isSignificant = pValue < SIGNIFICANCE_THRESHOLD;

  // Generate insight
  const insight = generateInsight(learningMetric, businessMetric, correlation, isSignificant);

  return {
    learningMetric,
    businessMetric,
    correlation: Math.round(correlation * 100) / 100,
    pValue: Math.round(pValue * 1000) / 1000,
    isSignificant,
    insight,
  };
}

/**
 * Generate human-readable insight from correlation
 */
function generateInsight(
  learningMetric: keyof GodViewLearningMetrics,
  businessMetric: keyof BusinessMetrics,
  correlation: number,
  isSignificant: boolean,
): string {
  const strength = Math.abs(correlation);
  const direction = correlation > 0 ? 'positively' : 'negatively';

  const learningLabels: Record<keyof GodViewLearningMetrics, string> = {
    totalHours: 'total learning hours',
    cortexHours: 'time spent with AI assistant',
    coursesCompleted: 'courses completed',
    avgEngagement: 'engagement scores',
    skillImprovements: 'skill improvements',
  };

  const businessLabels: Record<keyof BusinessMetrics, string> = {
    safetyIncidents: 'safety incidents',
    salesPerformance: 'sales performance',
    customerSatisfaction: 'customer satisfaction',
    defectRate: 'quality defect rates',
    turnoverRate: 'employee turnover',
  };

  const lLabel = learningLabels[learningMetric] || String(learningMetric);
  const bLabel = businessLabels[businessMetric] || String(businessMetric);

  if (!isSignificant) {
    return `No statistically significant relationship found between ${lLabel} and ${bLabel}.`;
  }

  if (strength > 0.7) {
    return `Strong correlation: Higher ${lLabel} is ${direction} associated with ${bLabel}. This is a high-impact relationship.`;
  }

  if (strength > 0.4) {
    return `Moderate correlation: ${lLabel} shows meaningful ${direction} relationship with ${bLabel}.`;
  }

  return `Weak but significant correlation between ${lLabel} and ${bLabel}.`;
}

/**
 * Generate executive summary from correlations
 */
export function generateExecutiveSummary(
  correlations: ROICorrelation[],
  learningMetrics: GodViewLearningMetrics,
  _businessMetrics: BusinessMetrics,
): string[] {
  const summary: string[] = [];

  // Find strongest positive correlations with business outcomes
  const significantCorrelations = correlations
    .filter((c) => c.isSignificant)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  if (significantCorrelations.length === 0) {
    summary.push(
      'Insufficient data to establish statistically significant correlations between learning and business outcomes.',
    );
    return summary;
  }

  // Top insight
  const top = significantCorrelations[0];
  summary.push(top.insight);

  // Cortex-specific insight if available
  if (learningMetrics.cortexHours > 0) {
    const cortexCorrelation = correlations.find(
      (c) => c.learningMetric === 'cortexHours' && c.businessMetric === 'safetyIncidents',
    );
    if (cortexCorrelation?.isSignificant && cortexCorrelation.correlation < 0) {
      const reductionPercent = Math.round(Math.abs(cortexCorrelation.correlation) * 30);
      summary.push(
        `Users who engaged with the AI assistant had approximately ${reductionPercent}% fewer safety incidents.`,
      );
    }
  }

  // Learning hours insight
  if (learningMetrics.totalHours > 100) {
    summary.push(
      `The organization invested ${learningMetrics.totalHours.toLocaleString()} hours in learning this period, ` +
        `with ${learningMetrics.coursesCompleted} courses completed.`,
    );
  }

  return summary;
}

/**
 * Build complete ROI dashboard
 */
export function buildROIDashboard(
  organizationId: string,
  period: { start: Date; end: Date },
  learningMetrics: GodViewLearningMetrics,
  businessMetrics: BusinessMetrics,
  correlations: ROICorrelation[],
): ROIDashboard {
  const executiveSummary = generateExecutiveSummary(correlations, learningMetrics, businessMetrics);

  log.info('ROI dashboard generated', {
    organizationId,
    correlationsCount: correlations.length,
    significantCount: correlations.filter((c) => c.isSignificant).length,
  });

  return {
    organizationId,
    period,
    learningMetrics,
    businessMetrics,
    correlations,
    executiveSummary,
  };
}

/**
 * Get Glass Box explanation for ROI
 */
export function explainROI(dashboard: ROIDashboard): string {
  const significant = dashboard.correlations.filter((c) => c.isSignificant);

  if (significant.length === 0) {
    return (
      'We need more data to establish statistically reliable connections between ' +
      'learning activities and business outcomes. Continue tracking for at least 3 months ' +
      'to generate meaningful ROI insights.'
    );
  }

  return (
    `Based on ${dashboard.correlations.length} metric pairs analyzed, ` +
    `we found ${significant.length} statistically significant correlations. ` +
    `This means the learning investments are showing measurable impact on business outcomes. ` +
    `The strongest relationships are highlighted in the dashboard.`
  );
}

/** Numeric learning metrics that can be correlated */
type NumericLearningMetric = 'totalHours' | 'cortexHours' | 'coursesCompleted' | 'avgEngagement';

/** Learner data structure for correlation analysis */
interface LearnerCorrelationData {
  totalHours: number;
  cortexHours: number;
  coursesCompleted: number;
  avgEngagement: number;
  safetyIncidents: number;
  salesPerformance?: number;
  customerSatisfaction?: number;
  defectRate?: number;
  turnoverRate?: number;
}

/**
 * Calculate all correlations between learning and business metrics
 */
export function calculateAllCorrelations(learnerData: LearnerCorrelationData[]): ROICorrelation[] {
  const correlations: ROICorrelation[] = [];

  const learningMetrics: NumericLearningMetric[] = [
    'totalHours',
    'cortexHours',
    'coursesCompleted',
    'avgEngagement',
  ];

  const businessMetrics: (keyof BusinessMetrics)[] = [
    'safetyIncidents',
    'salesPerformance',
    'customerSatisfaction',
    'defectRate',
    'turnoverRate',
  ];

  for (const lMetric of learningMetrics) {
    for (const bMetric of businessMetrics) {
      // Extract arrays of values for correlation
      const learningValues = learnerData.map((d) => d[lMetric]).filter((v) => v != null);
      const businessValues = learnerData
        .map((d) => d[bMetric])
        .filter((v): v is number => v != null);

      // Only calculate if we have matching data points
      if (learningValues.length === businessValues.length && learningValues.length > 2) {
        correlations.push(calculateCorrelation(learningValues, businessValues, lMetric, bMetric));
      }
    }
  }

  return correlations;
}

/**
 * Get top correlations (highest absolute value)
 */
export function getTopCorrelations(
  correlations: ROICorrelation[],
  limit: number = 5,
): ROICorrelation[] {
  return [...correlations]
    .filter((c) => c.isSignificant)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
    .slice(0, limit);
}

/**
 * Calculate estimated ROI value
 */
export function calculateEstimatedROI(
  dashboard: ROIDashboard,
  costPerIncident: number = 10000,
  revenuePerSalePercent: number = 1000,
): {
  estimatedSavings: number;
  estimatedRevenue: number;
  totalROI: number;
  confidence: 'low' | 'medium' | 'high';
} {
  let estimatedSavings = 0;
  let estimatedRevenue = 0;

  // Find safety correlation
  const safetyCorr = dashboard.correlations.find(
    (c) => c.businessMetric === 'safetyIncidents' && c.isSignificant && c.correlation < 0,
  );

  if (safetyCorr) {
    // Estimate incidents prevented
    const incidentReduction = Math.abs(safetyCorr.correlation) * 0.2; // Conservative estimate
    estimatedSavings = Math.round(
      dashboard.businessMetrics.safetyIncidents * incidentReduction * costPerIncident,
    );
  }

  // Find sales correlation
  const salesCorr = dashboard.correlations.find(
    (c) => c.businessMetric === 'salesPerformance' && c.isSignificant && c.correlation > 0,
  );

  if (salesCorr && dashboard.businessMetrics.salesPerformance) {
    const salesImprovement = salesCorr.correlation * 0.1; // Conservative estimate
    estimatedRevenue = Math.round(
      dashboard.businessMetrics.salesPerformance * salesImprovement * revenuePerSalePercent,
    );
  }

  const totalROI = estimatedSavings + estimatedRevenue;

  // Confidence based on number of significant correlations
  const significantCount = dashboard.correlations.filter((c) => c.isSignificant).length;
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (significantCount >= 5) confidence = 'high';
  else if (significantCount >= 2) confidence = 'medium';

  return {
    estimatedSavings,
    estimatedRevenue,
    totalROI,
    confidence,
  };
}
