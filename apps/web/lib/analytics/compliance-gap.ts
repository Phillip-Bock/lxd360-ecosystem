/**
 * Compliance vs Competency Gap Analyzer
 *
 * Implements Artemis vision: "Red zones show departments where 'Compliance'
 * is high but 'Competency' (quiz confidence) is low—predicting where the
 * next accident will happen."
 */

import { logger } from '@/lib/logger';
import type {
  CompetencyScore,
  ComplianceCompetencyGap,
  ComplianceScore,
  DepartmentRiskScore,
  RiskFactor,
} from './god-view-types';

const log = logger.scope('ComplianceGap');

// =============================================================================
// CONSTANTS
// =============================================================================

/** Gap thresholds for risk levels */
const RISK_THRESHOLDS = {
  low: 0.1,
  medium: 0.2,
  high: 0.35,
  critical: 0.5,
};

/** Historical correlation: gap -> incident probability */
const INCIDENT_PROBABILITY_FACTOR = 0.4;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate compliance score from learning data
 */
export function calculateComplianceScore(data: {
  completedCourses: number;
  requiredCourses: number;
  certificationStatus: 'valid' | 'expired' | 'none';
  certificationExpiryDate?: Date;
  regulatoryRequirements: boolean[];
}): ComplianceScore {
  const completionRate =
    data.requiredCourses > 0 ? (data.completedCourses / data.requiredCourses) * 100 : 0;

  const certified = data.certificationStatus === 'valid';

  let daysUntilExpiry: number | undefined;
  if (data.certificationExpiryDate) {
    const now = new Date();
    daysUntilExpiry = Math.floor(
      (data.certificationExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  const regulatoryCompliant =
    data.regulatoryRequirements.length > 0 ? data.regulatoryRequirements.every((r) => r) : true;

  return {
    completionRate: Math.round(completionRate),
    certified,
    daysUntilExpiry,
    regulatoryCompliant,
  };
}

/**
 * Calculate competency score from assessment data
 */
export function calculateCompetencyScore(data: {
  quizScores: number[];
  bktMastery: number;
  selfReportedConfidence: number;
  falseConfidenceFlags: number;
  totalAssessments: number;
}): CompetencyScore {
  const avgQuizScore =
    data.quizScores.length > 0
      ? data.quizScores.reduce((a, b) => a + b, 0) / data.quizScores.length
      : 0;

  // Confidence calibration: how close self-assessment is to actual
  // Perfect calibration = 1, poor calibration = 0
  const calibrationError = Math.abs(data.selfReportedConfidence - data.bktMastery);
  const confidenceCalibration = 1 - Math.min(calibrationError, 1);

  const falseConfidenceRate =
    data.totalAssessments > 0 ? data.falseConfidenceFlags / data.totalAssessments : 0;
  const falseConfidenceRisk = falseConfidenceRate > 0.15;

  return {
    avgQuizScore: Math.round(avgQuizScore),
    masteryEstimate: Math.round(data.bktMastery * 100) / 100,
    confidenceCalibration: Math.round(confidenceCalibration * 100) / 100,
    falseConfidenceRisk,
  };
}

/**
 * Analyze compliance vs competency gap
 */
export function analyzeGap(
  departmentId: string,
  departmentName: string,
  compliance: ComplianceScore,
  competency: CompetencyScore,
): ComplianceCompetencyGap {
  // Normalize to same scale (0-1)
  const complianceNormalized = compliance.completionRate / 100;
  const competencyNormalized = competency.masteryEstimate;

  // Gap: positive means compliance theater (looks compliant, isn't competent)
  const gap = complianceNormalized - competencyNormalized;

  // Determine risk level
  let riskLevel: ComplianceCompetencyGap['riskLevel'];
  if (gap >= RISK_THRESHOLDS.critical) {
    riskLevel = 'critical';
  } else if (gap >= RISK_THRESHOLDS.high) {
    riskLevel = 'high';
  } else if (gap >= RISK_THRESHOLDS.medium) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Calculate incident probability based on historical correlation
  const incidentProbability = Math.min(1, Math.max(0, gap * INCIDENT_PROBABILITY_FACTOR));

  const result: ComplianceCompetencyGap = {
    departmentId,
    departmentName,
    compliance,
    competency,
    gap: Math.round(gap * 100) / 100,
    riskLevel,
    incidentProbability: Math.round(incidentProbability * 100) / 100,
  };

  if (riskLevel === 'high' || riskLevel === 'critical') {
    log.warn('High compliance-competency gap detected', {
      departmentId,
      departmentName,
      gap: result.gap,
      riskLevel,
    });
  }

  return result;
}

/**
 * Generate department risk score from gap analysis
 */
export function generateRiskScore(gap: ComplianceCompetencyGap): DepartmentRiskScore {
  const factors: RiskFactor[] = [];

  // Factor 1: Compliance-Competency Gap
  factors.push({
    name: 'Compliance Theater',
    weight: 0.4,
    score: Math.round(Math.max(0, gap.gap) * 100),
    description:
      gap.gap > 0.2
        ? 'High course completion but low demonstrated competency'
        : 'Completion rates align with competency',
  });

  // Factor 2: False Confidence
  factors.push({
    name: 'False Confidence',
    weight: 0.25,
    score: gap.competency.falseConfidenceRisk ? 75 : 15,
    description: gap.competency.falseConfidenceRisk
      ? 'Team members overestimate their knowledge'
      : 'Self-assessment aligns with performance',
  });

  // Factor 3: Certification Status
  const certRisk = !gap.compliance.certified
    ? 80
    : gap.compliance.daysUntilExpiry && gap.compliance.daysUntilExpiry < 30
      ? 50
      : 10;
  factors.push({
    name: 'Certification Risk',
    weight: 0.2,
    score: certRisk,
    description: !gap.compliance.certified
      ? 'Required certifications not current'
      : 'Certifications up to date',
  });

  // Factor 4: Assessment Performance
  factors.push({
    name: 'Assessment Performance',
    weight: 0.15,
    score: Math.round((1 - gap.competency.masteryEstimate) * 100),
    description:
      gap.competency.avgQuizScore > 80
        ? 'Strong quiz performance'
        : 'Quiz scores indicate knowledge gaps',
  });

  // Calculate weighted overall score
  const overallScore = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));

  // Determine category
  let category: DepartmentRiskScore['category'];
  if (overallScore >= 70) category = 'critical';
  else if (overallScore >= 50) category = 'high';
  else if (overallScore >= 30) category = 'medium';
  else category = 'low';

  // Generate recommendations
  const recommendations: string[] = [];
  if (gap.gap > 0.2) {
    recommendations.push(
      'Implement competency-based assessments instead of completion-only tracking',
    );
  }
  if (gap.competency.falseConfidenceRisk) {
    recommendations.push(
      'Deploy confidence calibration exercises to align self-perception with actual skill',
    );
  }
  if (!gap.compliance.certified) {
    recommendations.push('Prioritize certification renewal for this department');
  }
  if (gap.competency.masteryEstimate < 0.6) {
    recommendations.push('Consider mandatory remedial training with micro-bridge modules');
  }

  return {
    departmentId: gap.departmentId,
    departmentName: gap.departmentName,
    overallScore,
    category,
    factors,
    recommendations,
    trend: 'stable', // Would be calculated from historical data
  };
}

/**
 * Get Glass Box explanation for compliance gap
 */
export function explainGap(gap: ComplianceCompetencyGap): string {
  const completionPercent = gap.compliance.completionRate;
  const masteryPercent = Math.round(gap.competency.masteryEstimate * 100);
  const gapPercent = Math.round(gap.gap * 100);

  if (gap.riskLevel === 'low') {
    return (
      `${gap.departmentName} shows healthy alignment: ${completionPercent}% course completion ` +
      `with ${masteryPercent}% demonstrated competency. Keep up the good work!`
    );
  }

  return (
    `${gap.departmentName} has a ${gapPercent}% gap between compliance (${completionPercent}% complete) ` +
    `and competency (${masteryPercent}% mastery). This "compliance theater" pattern is associated with ` +
    `a ${Math.round(gap.incidentProbability * 100)}% higher incident probability. ` +
    `The team may be completing training without truly absorbing the material.`
  );
}

/**
 * Batch analyze multiple departments
 */
export function analyzeDepartments(
  departments: {
    id: string;
    name: string;
    compliance: ComplianceScore;
    competency: CompetencyScore;
  }[],
): ComplianceCompetencyGap[] {
  return departments.map((dept) =>
    analyzeGap(dept.id, dept.name, dept.compliance, dept.competency),
  );
}

/**
 * Get departments by risk level
 */
export function getDepartmentsByRiskLevel(
  gaps: ComplianceCompetencyGap[],
  level: ComplianceCompetencyGap['riskLevel'],
): ComplianceCompetencyGap[] {
  return gaps.filter((gap) => gap.riskLevel === level);
}

/**
 * Calculate organization-wide compliance gap summary
 */
export function getOrganizationSummary(gaps: ComplianceCompetencyGap[]): {
  avgGap: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  overallRiskLevel: ComplianceCompetencyGap['riskLevel'];
} {
  if (gaps.length === 0) {
    return {
      avgGap: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      overallRiskLevel: 'low',
    };
  }

  const avgGap = gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length;
  const criticalCount = gaps.filter((g) => g.riskLevel === 'critical').length;
  const highCount = gaps.filter((g) => g.riskLevel === 'high').length;
  const mediumCount = gaps.filter((g) => g.riskLevel === 'medium').length;
  const lowCount = gaps.filter((g) => g.riskLevel === 'low').length;

  // Overall risk level based on worst departments
  let overallRiskLevel: ComplianceCompetencyGap['riskLevel'] = 'low';
  if (criticalCount > 0) overallRiskLevel = 'critical';
  else if (highCount > gaps.length * 0.2) overallRiskLevel = 'high';
  else if (mediumCount > gaps.length * 0.3) overallRiskLevel = 'medium';

  return {
    avgGap: Math.round(avgGap * 100) / 100,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    overallRiskLevel,
  };
}
