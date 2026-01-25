/**
 * God View Analytics Types
 *
 * Data structures for manager-level organizational analytics.
 * Implements the Artemis vision for "God View" dashboards.
 */

// =============================================================================
// ORGANIZATION STRUCTURE
// =============================================================================

export interface Department {
  id: string;
  name: string;
  parentId?: string; // For hierarchical orgs
  managerId: string;
  memberCount: number;
}

export interface TeamMember {
  id: string;
  departmentId: string;
  role: string;
  hireDate: Date;
}

// =============================================================================
// SKILL METRICS
// =============================================================================

export interface SkillMetrics {
  skillId: string;
  skillName: string;

  /** Average mastery across group (0-1) */
  avgMastery: number;

  /** Standard deviation of mastery */
  masteryStdDev: number;

  /** Percentage of learners above threshold */
  competencyRate: number;

  /** Number of learners assessed */
  assessedCount: number;

  /** Number of false confidence flags */
  falseConfidenceCount: number;
}

export interface DepartmentSkillMetrics {
  departmentId: string;
  departmentName: string;
  skills: SkillMetrics[];
  overallCompetency: number;
  riskScore: number;
}

// =============================================================================
// COMPLIANCE VS COMPETENCY
// =============================================================================

export interface ComplianceScore {
  /** Course completion percentage (0-100) */
  completionRate: number;

  /** Certification status */
  certified: boolean;

  /** Days until certification expires */
  daysUntilExpiry?: number;

  /** Regulatory requirement met */
  regulatoryCompliant: boolean;
}

export interface CompetencyScore {
  /** Average quiz score (0-100) */
  avgQuizScore: number;

  /** BKT mastery estimate (0-1) */
  masteryEstimate: number;

  /** Confidence calibration (how well self-assessment matches actual) */
  confidenceCalibration: number;

  /** False confidence risk flag */
  falseConfidenceRisk: boolean;
}

export interface ComplianceCompetencyGap {
  departmentId: string;
  departmentName: string;

  compliance: ComplianceScore;
  competency: CompetencyScore;

  /** Gap: compliance rate - competency rate (positive = compliance theater) */
  gap: number;

  /** Risk level based on gap */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  /** Predicted incident probability (based on historical correlation) */
  incidentProbability: number;
}

// =============================================================================
// HEATMAP
// =============================================================================

export interface HeatmapCell {
  departmentId: string;
  skillId: string;
  value: number; // 0-1 (0 = green, 1 = red)
  metadata: {
    avgMastery: number;
    memberCount: number;
    falseConfidenceRate: number;
  };
}

export interface SkillGapHeatmap {
  departments: Department[];
  skills: { id: string; name: string }[];
  cells: HeatmapCell[];
  generatedAt: Date;
}

// =============================================================================
// ROI METRICS
// =============================================================================

export interface GodViewLearningMetrics {
  /** Total learning hours */
  totalHours: number;

  /** Hours with AI assistant (Cortex) */
  cortexHours: number;

  /** Courses completed */
  coursesCompleted: number;

  /** Average engagement score */
  avgEngagement: number;

  /** Skill improvements */
  skillImprovements: {
    skillId: string;
    beforeMastery: number;
    afterMastery: number;
    improvement: number;
  }[];
}

export interface BusinessMetrics {
  /** Safety incidents */
  safetyIncidents: number;

  /** Sales performance (% of quota) */
  salesPerformance?: number;

  /** Customer satisfaction score */
  customerSatisfaction?: number;

  /** Quality defect rate */
  defectRate?: number;

  /** Employee turnover rate */
  turnoverRate?: number;
}

export interface ROICorrelation {
  learningMetric: keyof GodViewLearningMetrics;
  businessMetric: keyof BusinessMetrics;

  /** Pearson correlation coefficient (-1 to 1) */
  correlation: number;

  /** Statistical significance (p-value) */
  pValue: number;

  /** Is the correlation statistically significant? */
  isSignificant: boolean;

  /** Human-readable insight */
  insight: string;
}

export interface ROIDashboard {
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };

  learningMetrics: GodViewLearningMetrics;
  businessMetrics: BusinessMetrics;
  correlations: ROICorrelation[];

  /** Key insights for executives */
  executiveSummary: string[];
}

// =============================================================================
// RISK SCORING
// =============================================================================

export interface RiskFactor {
  name: string;
  weight: number;
  score: number; // 0-100
  description: string;
}

export interface DepartmentRiskScore {
  departmentId: string;
  departmentName: string;

  /** Overall risk score (0-100, higher = more risk) */
  overallScore: number;

  /** Risk category */
  category: 'low' | 'medium' | 'high' | 'critical';

  /** Contributing factors */
  factors: RiskFactor[];

  /** Recommended actions */
  recommendations: string[];

  /** Trend compared to last period */
  trend: 'improving' | 'stable' | 'declining';
}
