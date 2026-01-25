import { logger } from '@/lib/logger';
import type { Statement } from '@/lib/xapi/types';
import { DesignerAgent } from './designer-agent';
import { createLearnerCohort } from './learner-agent';

const log = logger.scope('DemoOrchestrator');

import type {
  CourseConsumption,
  DemoOrchestratorConfig,
  DemoResult,
  DemoScenario,
  FullCourse,
  LearnerBehaviorType,
} from './types';
import { type StatementBatch, summarizeBatch } from './xapi-generator';

// ============================================================================
// PREDEFINED DEMO SCENARIOS
// ============================================================================

/**
 * Predefined demo scenarios for investor presentations
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'healthcare-compliance',
    name: 'Healthcare Compliance Training',
    description:
      'HIPAA compliance training for healthcare professionals demonstrating AI-generated content and diverse learner behaviors.',
    courseConfig: {
      topic: 'HIPAA Compliance and Patient Privacy',
      industry: 'Healthcare',
      targetAudience: 'Healthcare Professionals',
      difficulty: 'intermediate',
      moduleCount: 2,
      lessonsPerModule: 2,
    },
    learnerProfiles: ['diligent', 'explorer', 'struggler', 'speedster'],
    simulateRealTime: false,
    generateXAPIStatements: true,
  },
  {
    id: 'aerospace-safety',
    name: 'Aerospace Safety Procedures',
    description:
      'Aviation safety training for aerospace industry demonstrating scenario-based learning with complex decision trees.',
    courseConfig: {
      topic: 'Aviation Safety and Emergency Procedures',
      industry: 'Aerospace',
      targetAudience: 'Flight Crew and Ground Personnel',
      difficulty: 'advanced',
      moduleCount: 3,
      lessonsPerModule: 2,
    },
    learnerProfiles: ['diligent', 'explorer', 'speedster'],
    simulateRealTime: false,
    generateXAPIStatements: true,
  },
  {
    id: 'financial-services',
    name: 'Financial Services Onboarding',
    description:
      'New employee onboarding for financial services covering regulations, ethics, and customer service.',
    courseConfig: {
      topic: 'Financial Services Fundamentals and Regulations',
      industry: 'Financial Services',
      targetAudience: 'New Employees',
      difficulty: 'beginner',
      moduleCount: 2,
      lessonsPerModule: 3,
    },
    learnerProfiles: ['diligent', 'explorer', 'struggler', 'dropout'],
    simulateRealTime: false,
    generateXAPIStatements: true,
  },
  {
    id: 'manufacturing-safety',
    name: 'Manufacturing Safety Training',
    description:
      'Workplace safety training for manufacturing facilities with hazard identification and emergency response.',
    courseConfig: {
      topic: 'Workplace Safety and Hazard Prevention',
      industry: 'Manufacturing',
      targetAudience: 'Factory Floor Workers',
      difficulty: 'intermediate',
      moduleCount: 2,
      lessonsPerModule: 2,
    },
    learnerProfiles: ['diligent', 'struggler', 'speedster', 'dropout'],
    simulateRealTime: false,
    generateXAPIStatements: true,
  },
  {
    id: 'quick-demo',
    name: 'Quick Demo (Minimal)',
    description: 'Minimal demo for quick testing with a single module and two learners.',
    courseConfig: {
      topic: 'Introduction to Learning Experience Platforms',
      industry: 'Technology',
      targetAudience: 'Learning Professionals',
      difficulty: 'beginner',
      moduleCount: 1,
      lessonsPerModule: 1,
    },
    learnerProfiles: ['diligent', 'dropout'],
    simulateRealTime: false,
    generateXAPIStatements: true,
  },
];

// ============================================================================
// DEMO ORCHESTRATOR CLASS
// ============================================================================

/**
 * Orchestrates complete demo scenarios
 */
export class DemoOrchestrator {
  private designerAgent: DesignerAgent;
  private config: DemoOrchestratorConfig;
  private allStatements: Statement[];

  constructor(config: DemoOrchestratorConfig = {}) {
    this.config = config;
    this.designerAgent = new DesignerAgent(config.designerConfig);
    this.allStatements = [];
  }

  /**
   * Gets all generated xAPI statements
   */
  getAllStatements(): Statement[] {
    return this.allStatements;
  }

  /**
   * Gets a statement batch with summary
   */
  getStatementBatch(): StatementBatch {
    return summarizeBatch(this.allStatements);
  }

  /**
   * Resets the orchestrator for a new demo
   */
  reset(): void {
    this.allStatements = [];
  }

  /**
   * Gets a scenario by ID
   */
  static getScenario(scenarioId: string): DemoScenario | undefined {
    return DEMO_SCENARIOS.find((s) => s.id === scenarioId);
  }

  /**
   * Gets all available scenarios
   */
  static getAllScenarios(): DemoScenario[] {
    return DEMO_SCENARIOS;
  }

  /**
   * Runs a demo scenario by ID
   */
  async runDemo(scenarioId: string): Promise<DemoResult> {
    const scenario = DemoOrchestrator.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    return this.runScenario(scenario);
  }

  /**
   * Runs a complete demo scenario
   */
  async runScenario(scenario: DemoScenario): Promise<DemoResult> {
    const startTime = new Date();
    this.reset();

    // Phase 1: Designer Agent creates the course
    let course: FullCourse;

    try {
      // Try AI-generated course first
      course = await this.designerAgent.createFullCourse({
        topic: scenario.courseConfig.topic,
        industry: scenario.courseConfig.industry,
        targetAudience: scenario.courseConfig.targetAudience,
        difficulty: scenario.courseConfig.difficulty,
        moduleCount: scenario.courseConfig.moduleCount,
        lessonsPerModule: scenario.courseConfig.lessonsPerModule,
      });
    } catch (error) {
      // Fall back to demo course if AI fails
      log.warn('AI course generation failed, using demo course', {
        error: error instanceof Error ? error.message : String(error),
      });
      course = DesignerAgent.createDemoCourse({
        topic: scenario.courseConfig.topic,
        industry: scenario.courseConfig.industry,
        targetAudience: scenario.courseConfig.targetAudience,
        moduleCount: scenario.courseConfig.moduleCount,
        lessonsPerModule: scenario.courseConfig.lessonsPerModule,
      });
    }

    // Phase 2: Create Learner Agents based on profiles
    const learnerAgents = createLearnerCohort(
      scenario.learnerProfiles as LearnerBehaviorType[],
      this.config.learnerConfig,
    );

    // Phase 3: Each learner consumes the course
    const learnerResults: CourseConsumption[] = [];

    for (const agent of learnerAgents) {
      const consumption = await agent.consumeCourse(course);
      learnerResults.push(consumption);

      // Collect xAPI statements
      if (scenario.generateXAPIStatements) {
        this.allStatements.push(...agent.getStatements());
      }
    }

    const endTime = new Date();

    // Calculate summary statistics
    const completedLearners = learnerResults.filter((r) => r.completed).length;
    const averageProgress =
      learnerResults.reduce((sum, r) => sum + r.progress, 0) / learnerResults.length;

    const scoresWithValues = learnerResults
      .filter((r) => r.assessmentResults && r.assessmentResults.length > 0)
      .flatMap((r) => r.assessmentResults?.map((a: { score: number }) => a.score) ?? []);

    const averageScore =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, s) => sum + s, 0) / scoresWithValues.length
        : undefined;

    const result: DemoResult = {
      scenarioId: scenario.id,
      startedAt: startTime.toISOString(),
      completedAt: endTime.toISOString(),
      course,
      learnerResults,
      xapiStatementCount: this.allStatements.length,
      summary: {
        totalLearners: learnerResults.length,
        completedLearners,
        averageProgress: Math.round(averageProgress * 10) / 10,
        averageScore: averageScore !== undefined ? Math.round(averageScore * 10) / 10 : undefined,
        totalXAPIStatements: this.allStatements.length,
      },
    };

    return result;
  }

  /**
   * Runs a quick demo without AI (for testing)
   */
  async runQuickDemo(): Promise<DemoResult> {
    return this.runDemo('quick-demo');
  }

  /**
   * Runs multiple scenarios in sequence
   */
  async runMultipleScenarios(scenarioIds: string[]): Promise<DemoResult[]> {
    const results: DemoResult[] = [];

    for (const id of scenarioIds) {
      const result = await this.runDemo(id);
      results.push(result);
    }

    return results;
  }

  /**
   * Creates a custom scenario and runs it
   */
  async runCustomScenario(customScenario: Omit<DemoScenario, 'id'>): Promise<DemoResult> {
    const scenario: DemoScenario = {
      ...customScenario,
      id: `custom-${Date.now()}`,
    };

    return this.runScenario(scenario);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates and runs a demo with default configuration
 */
export async function runDefaultDemo(): Promise<DemoResult> {
  const orchestrator = new DemoOrchestrator();
  return orchestrator.runDemo('healthcare-compliance');
}

/**
 * Creates a summary report from demo results
 */
export function createDemoReport(results: DemoResult[]): string {
  const lines: string[] = [
    '# Agentic AI Demo Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Total Scenarios Run: ${results.length}`,
    `- Total Learners: ${results.reduce((sum, r) => sum + r.summary.totalLearners, 0)}`,
    `- Total xAPI Statements: ${results.reduce((sum, r) => sum + r.summary.totalXAPIStatements, 0)}`,
    '',
    '## Scenario Details',
    '',
  ];

  for (const result of results) {
    lines.push(`### ${result.scenarioId}`);
    lines.push('');
    lines.push(`- Course: ${result.course.title}`);
    lines.push(`- Learners: ${result.summary.totalLearners}`);
    lines.push(`- Completed: ${result.summary.completedLearners}`);
    lines.push(`- Avg Progress: ${result.summary.averageProgress}%`);
    if (result.summary.averageScore !== undefined) {
      lines.push(`- Avg Score: ${result.summary.averageScore}%`);
    }
    lines.push(`- xAPI Statements: ${result.summary.totalXAPIStatements}`);
    lines.push('');
  }

  return lines.join('\n');
}
