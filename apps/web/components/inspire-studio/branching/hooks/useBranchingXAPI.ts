'use client';

import { useCallback, useRef } from 'react';
import type {
  Condition,
  OutcomeType,
  VariableValue,
} from '@/components/inspire-studio/branching/types';
import { BRANCHING_EXTENSIONS, BRANCHING_VERBS } from '@/components/inspire-studio/branching/types';
import { logger } from '@/lib/logger';

const log = logger.scope('BranchingXAPI');

// =============================================================================
// xAPI Statement Types for Branching
// =============================================================================

interface BranchingStatementBase {
  actor: {
    objectType: 'Agent';
    mbox: string;
    name: string;
  };
  verb: {
    id: string;
    display: { 'en-US': string };
  };
  object: {
    objectType: 'Activity';
    id: string;
    definition: {
      name: { 'en-US': string };
      type: string;
    };
  };
  timestamp: string;
  context?: {
    extensions?: Record<string, unknown>;
  };
  result?: {
    success?: boolean;
    completion?: boolean;
    score?: {
      scaled?: number;
      raw?: number;
      min?: number;
      max?: number;
    };
    extensions?: Record<string, unknown>;
  };
}

// =============================================================================
// useBranchingXAPI Hook
// =============================================================================

interface UseBranchingXAPIOptions {
  actorEmail?: string;
  actorName?: string;
  baseActivityId?: string;
}

export function useBranchingXAPI(scenarioId: string, options: UseBranchingXAPIOptions = {}) {
  const {
    actorEmail = 'mailto:learner@example.com',
    actorName = 'Learner',
    baseActivityId = 'https://inspire.lxd360.com/scenarios',
  } = options;

  const statementsQueue = useRef<BranchingStatementBase[]>([]);

  // Helper to create base statement
  const createStatement = useCallback(
    (
      verbId: string,
      verbDisplay: string,
      activityName: string,
      extensions?: Record<string, unknown>,
    ): BranchingStatementBase => ({
      actor: {
        objectType: 'Agent',
        mbox: actorEmail,
        name: actorName,
      },
      verb: {
        id: verbId,
        display: { 'en-US': verbDisplay },
      },
      object: {
        objectType: 'Activity',
        id: `${baseActivityId}/${scenarioId}`,
        definition: {
          name: { 'en-US': activityName },
          type: 'http://adlnet.gov/expapi/activities/simulation',
        },
      },
      timestamp: new Date().toISOString(),
      context: extensions ? { extensions } : undefined,
    }),
    [actorEmail, actorName, baseActivityId, scenarioId],
  );

  // Track scenario start
  const trackScenarioStart = useCallback(() => {
    const statement = createStatement(
      BRANCHING_VERBS.initialized,
      'initialized',
      `Scenario: ${scenarioId}`,
    );

    statementsQueue.current.push(statement);
    sendStatement(statement);
  }, [createStatement, scenarioId]);

  // Track choice selection
  const trackChoice = useCallback(
    (
      nodeId: string,
      choiceId: string,
      choiceLabel: string,
      variablesMutated: Array<{
        variableKey: string;
        operation: string;
        value: VariableValue;
      }>,
    ) => {
      const statement = createStatement(BRANCHING_VERBS.chose, 'chose', `Choice: ${choiceLabel}`, {
        [BRANCHING_EXTENSIONS.nodeId]: nodeId,
        [BRANCHING_EXTENSIONS.choiceId]: choiceId,
        [BRANCHING_EXTENSIONS.choiceLabel]: choiceLabel,
        [BRANCHING_EXTENSIONS.variablesMutated]: variablesMutated,
      });

      statementsQueue.current.push(statement);
      sendStatement(statement);
    },
    [createStatement],
  );

  // Track logic gate evaluation
  const trackLogicEvaluation = useCallback(
    (nodeId: string, condition: Condition, result: boolean, pathTaken: string) => {
      const statement = createStatement(
        BRANCHING_VERBS.evaluated,
        'evaluated',
        `Logic Gate Evaluation`,
        {
          [BRANCHING_EXTENSIONS.nodeId]: nodeId,
          [BRANCHING_EXTENSIONS.condition]: condition,
          [BRANCHING_EXTENSIONS.conditionResult]: result,
          [BRANCHING_EXTENSIONS.pathTaken]: pathTaken,
        },
      );

      statementsQueue.current.push(statement);
      sendStatement(statement);
    },
    [createStatement],
  );

  // Track scenario completion
  const trackScenarioComplete = useCallback(
    (
      outcome: OutcomeType,
      pathTaken: string[],
      finalVariableState: Record<string, VariableValue>,
      duration: number,
    ) => {
      const statement: BranchingStatementBase = {
        ...createStatement(BRANCHING_VERBS.completed, 'completed', `Scenario: ${scenarioId}`, {
          [BRANCHING_EXTENSIONS.outcome]: outcome,
          [BRANCHING_EXTENSIONS.pathTaken]: pathTaken,
          [BRANCHING_EXTENSIONS.finalVariableState]: finalVariableState,
        }),
        result: {
          success: outcome === 'success',
          completion: true,
          extensions: {
            'https://inspire.lxd360.com/xapi/extensions/duration': duration,
            'https://inspire.lxd360.com/xapi/extensions/totalSteps': pathTaken.length,
          },
        },
      };

      statementsQueue.current.push(statement);
      sendStatement(statement);
    },
    [createStatement, scenarioId],
  );

  // Track progress (optional - for mid-scenario checkpoints)
  const trackProgress = useCallback(
    (nodeId: string, progress: number) => {
      const statement: BranchingStatementBase = {
        ...createStatement(BRANCHING_VERBS.progressed, 'progressed', `Scenario Progress`, {
          [BRANCHING_EXTENSIONS.nodeId]: nodeId,
        }),
        result: {
          score: {
            scaled: progress / 100,
            raw: progress,
            min: 0,
            max: 100,
          },
        },
      };

      statementsQueue.current.push(statement);
      sendStatement(statement);
    },
    [createStatement],
  );

  // Get all statements in queue (for debugging)
  const getStatements = useCallback(() => {
    return [...statementsQueue.current];
  }, []);

  // Clear statement queue
  const clearStatements = useCallback(() => {
    statementsQueue.current = [];
  }, []);

  return {
    trackScenarioStart,
    trackChoice,
    trackLogicEvaluation,
    trackScenarioComplete,
    trackProgress,
    getStatements,
    clearStatements,
  };
}

// =============================================================================
// Statement Sender (placeholder for actual LRS integration)
// =============================================================================

async function sendStatement(statement: BranchingStatementBase): Promise<void> {
  // In development, skip LRS calls
  if (process.env.NODE_ENV === 'development') {
    void statement;
    return;
  }

  // In production, send to LRS
  try {
    const response = await fetch('/api/xapi/statements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statement),
    });

    if (!response.ok) {
      log.error('Failed to send xAPI statement', new Error(response.statusText));
    }
  } catch (error) {
    log.error(
      'Error sending xAPI statement',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export default useBranchingXAPI;
