// Step 1.1 Research & Industry Analysis - Type definitions

import type { PerformanceGap as SchemaPerformanceGap } from '@/schemas/inspire';

// Industry type (string enum for UI purposes)
export type IndustryId =
  | 'healthcare'
  | 'aerospace'
  | 'manufacturing'
  | 'financial'
  | 'technology'
  | 'retail'
  | 'government'
  | 'education'
  | 'other';

// ============================================================================
// INDUSTRY DATA
// ============================================================================

export interface IndustryOption {
  id: IndustryId;
  name: string;
  description: string;
  icon: string;
  defaultGaps: LocalPerformanceGap[];
}

// ============================================================================
// PERFORMANCE GAPS (Local UI type - maps to schema PerformanceGap)
// ============================================================================

/**
 * Local UI representation of performance gap.
 * Maps to schema PerformanceGap with transformations:
 * - priority -> businessImpact
 * - rootCauses[] -> rootCause (joined with |)
 */
export interface LocalPerformanceGap {
  id: string;
  title: string;
  description: string;
  rootCauses: string[];
  successMetrics: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: 'manual' | 'ai' | 'csv';
}

export interface PerformanceGapFormData {
  title: string;
  description: string;
  rootCauses: string[];
  successMetrics: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// CSV UPLOAD
// ============================================================================

export interface CSVUploadResult {
  success: boolean;
  gaps: LocalPerformanceGap[];
  errors: string[];
  warnings: string[];
}

export interface CSVRow {
  title: string;
  description: string;
  root_causes: string;
  success_metrics: string;
  priority: string;
}

// ============================================================================
// AI RESEARCH
// ============================================================================

export interface AIResearchSuggestion {
  performanceGaps: LocalPerformanceGap[];
  industrySummary: string;
  keyTrends: string[];
  recommendedFocus: string;
  confidence: number;
}

// ============================================================================
// STEP STATE
// ============================================================================

export interface Step1_1State {
  industry: IndustryId | null;
  topic: string;
  performanceGaps: LocalPerformanceGap[];
  aiSuggestions: AIResearchSuggestion | null;
  isAILoading: boolean;
  isValid: boolean;
}

// ============================================================================
// INDUSTRY CATALOG
// ============================================================================

export const INDUSTRY_CATALOG: IndustryOption[] = [
  {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    description: 'Medical, pharmaceutical, and patient care training',
    icon: 'heart-pulse',
    defaultGaps: [
      {
        id: 'hc-1',
        title: 'Patient Safety Protocol Compliance',
        description:
          'Staff inconsistently follow safety protocols leading to preventable incidents',
        rootCauses: ['Inadequate training', 'Complex procedures', 'Time pressure'],
        successMetrics: ['Protocol adherence rate', 'Incident reduction', 'Audit scores'],
        priority: 'critical',
        source: 'ai',
      },
      {
        id: 'hc-2',
        title: 'Electronic Health Record Proficiency',
        description: 'Staff struggle with EHR systems causing documentation delays',
        rootCauses: ['System complexity', 'Insufficient practice', 'Workflow misalignment'],
        successMetrics: ['Documentation time', 'Error rate', 'User satisfaction'],
        priority: 'high',
        source: 'ai',
      },
    ],
  },
  {
    id: 'aerospace',
    name: 'Aerospace & Aviation',
    description: 'Aircraft maintenance, flight operations, and safety systems',
    icon: 'plane',
    defaultGaps: [
      {
        id: 'av-1',
        title: 'Maintenance Procedure Accuracy',
        description: 'Technicians make errors in complex maintenance procedures',
        rootCauses: ['Procedure complexity', 'Fatigue', 'Inadequate documentation'],
        successMetrics: ['Error rate', 'Rework percentage', 'Safety incidents'],
        priority: 'critical',
        source: 'ai',
      },
      {
        id: 'av-2',
        title: 'Regulatory Compliance Knowledge',
        description: 'Staff lack current knowledge of FAA/EASA regulations',
        rootCauses: ['Frequent updates', 'Training gaps', 'Information overload'],
        successMetrics: ['Audit results', 'Compliance scores', 'Violation reduction'],
        priority: 'high',
        source: 'ai',
      },
    ],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial',
    description: 'Production processes, quality control, and safety procedures',
    icon: 'factory',
    defaultGaps: [
      {
        id: 'mf-1',
        title: 'Quality Control Consistency',
        description: 'Inconsistent quality inspection leading to defects',
        rootCauses: ['Subjective standards', 'Training variance', 'Equipment calibration'],
        successMetrics: ['Defect rate', 'First-pass yield', 'Customer complaints'],
        priority: 'high',
        source: 'ai',
      },
      {
        id: 'mf-2',
        title: 'Safety Equipment Usage',
        description: 'Workers fail to properly use PPE and safety equipment',
        rootCauses: ['Comfort issues', 'Time pressure', 'Habit formation'],
        successMetrics: ['PPE compliance', 'Injury rate', 'Near-miss reports'],
        priority: 'critical',
        source: 'ai',
      },
    ],
  },
  {
    id: 'financial',
    name: 'Financial Services',
    description: 'Banking, insurance, investment, and compliance training',
    icon: 'landmark',
    defaultGaps: [
      {
        id: 'fs-1',
        title: 'Regulatory Compliance Accuracy',
        description: 'Staff make compliance errors in client interactions',
        rootCauses: ['Complex regulations', 'Frequent changes', 'Interpretation variance'],
        successMetrics: ['Compliance rate', 'Audit findings', 'Customer complaints'],
        priority: 'critical',
        source: 'ai',
      },
      {
        id: 'fs-2',
        title: 'Fraud Detection Skills',
        description: 'Inability to identify suspicious transactions or behavior',
        rootCauses: ['Pattern complexity', 'Volume overload', 'Training gaps'],
        successMetrics: ['Detection rate', 'False positives', 'Response time'],
        priority: 'high',
        source: 'ai',
      },
    ],
  },
  {
    id: 'technology',
    name: 'Technology & Software',
    description: 'Software development, IT operations, and technical skills',
    icon: 'cpu',
    defaultGaps: [
      {
        id: 'tc-1',
        title: 'Security Best Practices',
        description: 'Developers introduce security vulnerabilities in code',
        rootCauses: ['Knowledge gaps', 'Time pressure', 'Tooling limitations'],
        successMetrics: ['Vulnerability count', 'Security audit results', 'Incident rate'],
        priority: 'critical',
        source: 'ai',
      },
      {
        id: 'tc-2',
        title: 'Cloud Infrastructure Management',
        description: 'Teams struggle with cloud resource optimization',
        rootCauses: ['Rapid technology change', 'Complexity', 'Cost visibility'],
        successMetrics: ['Cost efficiency', 'Uptime', 'Performance metrics'],
        priority: 'high',
        source: 'ai',
      },
    ],
  },
  {
    id: 'retail',
    name: 'Retail & Hospitality',
    description: 'Customer service, sales, and operations training',
    icon: 'store',
    defaultGaps: [
      {
        id: 'rt-1',
        title: 'Customer Service Consistency',
        description: 'Inconsistent customer experience across staff and locations',
        rootCauses: ['Staff turnover', 'Training variance', 'Brand alignment'],
        successMetrics: ['NPS scores', 'Customer satisfaction', 'Repeat visits'],
        priority: 'high',
        source: 'ai',
      },
      {
        id: 'rt-2',
        title: 'Product Knowledge Depth',
        description: 'Staff lack detailed knowledge of products and services',
        rootCauses: ['Product variety', 'Rapid changes', 'Limited study time'],
        successMetrics: ['Conversion rate', 'Upsell success', 'Customer queries'],
        priority: 'medium',
        source: 'ai',
      },
    ],
  },
  {
    id: 'government',
    name: 'Government & Defense',
    description: 'Public sector, military, and federal agency training',
    icon: 'shield',
    defaultGaps: [
      {
        id: 'gv-1',
        title: 'Security Clearance Procedures',
        description: 'Staff fail to follow classified information handling procedures',
        rootCauses: ['Procedure complexity', 'Complacency', 'System changes'],
        successMetrics: ['Security incidents', 'Audit compliance', 'Violation rate'],
        priority: 'critical',
        source: 'ai',
      },
      {
        id: 'gv-2',
        title: 'Policy Implementation Accuracy',
        description: 'Inconsistent application of policies and procedures',
        rootCauses: ['Policy complexity', 'Interpretation variance', 'Communication gaps'],
        successMetrics: ['Consistency scores', 'Appeal rates', 'Processing time'],
        priority: 'high',
        source: 'ai',
      },
    ],
  },
  {
    id: 'education',
    name: 'Education & Training',
    description: 'Academic institutions and corporate learning departments',
    icon: 'graduation-cap',
    defaultGaps: [
      {
        id: 'ed-1',
        title: 'Instructional Design Quality',
        description: 'Learning content fails to engage or achieve objectives',
        rootCauses: ['Design skill gaps', 'Time constraints', 'Learner analysis'],
        successMetrics: ['Completion rates', 'Assessment scores', 'Learner feedback'],
        priority: 'high',
        source: 'ai',
      },
      {
        id: 'ed-2',
        title: 'Technology Integration',
        description: 'Educators struggle to effectively use learning technology',
        rootCauses: ['Rapid change', 'Training gaps', 'Support limitations'],
        successMetrics: ['Tech adoption', 'Feature usage', 'Student outcomes'],
        priority: 'medium',
        source: 'ai',
      },
    ],
  },
  {
    id: 'other',
    name: 'Other Industry',
    description: 'Custom industry not listed above',
    icon: 'building',
    defaultGaps: [],
  },
];

// ============================================================================
// CSV TEMPLATE
// ============================================================================

export const CSV_TEMPLATE_HEADER = 'title,description,root_causes,success_metrics,priority';
export const CSV_TEMPLATE_EXAMPLE = `"Safety Protocol Compliance","Staff inconsistently follow safety protocols","Inadequate training|Complex procedures|Time pressure","Protocol adherence rate|Incident reduction|Audit scores","critical"
"System Proficiency","Users struggle with new software systems","System complexity|Insufficient practice|Workflow issues","Task completion time|Error rate|User satisfaction","high"`;

export function getCSVTemplate(): string {
  return `${CSV_TEMPLATE_HEADER}\n${CSV_TEMPLATE_EXAMPLE}`;
}

// ============================================================================
// SCHEMA MAPPING HELPERS
// ============================================================================

/**
 * Convert local UI gap to schema format
 */
export function toSchemaPerformanceGap(gap: LocalPerformanceGap): SchemaPerformanceGap {
  return {
    id: gap.id,
    description: `${gap.title}: ${gap.description}`,
    rootCause: gap.rootCauses.join(' | '),
    businessImpact: gap.priority,
    successMetrics: gap.successMetrics,
    source: gap.source === 'ai' ? 'ai_suggested' : gap.source === 'csv' ? 'csv_upload' : 'manual',
  };
}

/**
 * Convert schema gap to local UI format
 */
export function fromSchemaPerformanceGap(
  gap: SchemaPerformanceGap,
  index: number,
): LocalPerformanceGap {
  const [title, ...descParts] = gap.description.split(': ');
  return {
    id: gap.id || `gap-${index}`,
    title: title ?? gap.description,
    description: descParts.join(': ') || gap.description,
    rootCauses: gap.rootCause?.split(' | ').filter(Boolean) ?? [],
    successMetrics: gap.successMetrics,
    priority: gap.businessImpact,
    source: gap.source === 'ai_suggested' ? 'ai' : gap.source === 'csv_upload' ? 'csv' : 'manual',
  };
}
