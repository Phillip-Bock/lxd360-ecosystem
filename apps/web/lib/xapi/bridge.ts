/**
 * xAPI Bridge - SCORM/xAPI Communication Layer
 *
 * Listens for postMessage events from SCORM/xAPI content in iframes
 * and translates them to LXD360 xAPI statements.
 *
 * Supports:
 * - SCORM 1.2 (LMSInitialize, LMSCommit, LMSFinish)
 * - SCORM 2004 (Initialize, Commit, Terminate)
 * - xAPI (native statements)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { Statement, Verb } from './types';
import { VERBS } from './vocabulary';

// ============================================================================
// TYPES
// ============================================================================

export interface BridgeConfig {
  /** Course activity ID (IRI) */
  courseId: string;
  /** Course title for display */
  courseTitle: string;
  /** Learner email (for actor) */
  learnerEmail: string;
  /** Learner name */
  learnerName: string;
  /** Tenant ID */
  tenantId: string;
  /** Callback when statement is generated */
  onStatement?: (statement: Statement) => void;
  /** Callback for SCORM data model updates */
  onDataModelUpdate?: (key: string, value: unknown) => void;
  /** Callback for completion */
  onComplete?: (passed: boolean, score?: number) => void;
  /** Callback for errors */
  onError?: (error: string) => void;
}

export interface BridgeState {
  initialized: boolean;
  suspended: boolean;
  completed: boolean;
  passed: boolean | null;
  score: number | null;
  progress: number;
  sessionStart: Date;
  lastInteraction: Date;
}

export type SCORMCommand =
  | 'LMSInitialize'
  | 'LMSGetValue'
  | 'LMSSetValue'
  | 'LMSCommit'
  | 'LMSFinish'
  | 'LMSGetLastError'
  | 'LMSGetErrorString'
  | 'LMSGetDiagnostic'
  // SCORM 2004
  | 'Initialize'
  | 'GetValue'
  | 'SetValue'
  | 'Commit'
  | 'Terminate'
  | 'GetLastError'
  | 'GetErrorString'
  | 'GetDiagnostic';

export interface SCORMMessage {
  type: 'scorm';
  command: SCORMCommand;
  parameter?: string;
  value?: unknown;
  requestId?: string;
}

export interface XAPIMessage {
  type: 'xapi';
  statement: Statement;
}

export type BridgeMessage = SCORMMessage | XAPIMessage;

// ============================================================================
// SCORM DATA MODEL (Simplified)
// ============================================================================

const defaultDataModel: Record<string, unknown> = {
  // SCORM 1.2
  'cmi.core.student_id': '',
  'cmi.core.student_name': '',
  'cmi.core.lesson_status': 'not attempted',
  'cmi.core.lesson_location': '',
  'cmi.core.score.raw': '',
  'cmi.core.score.min': '0',
  'cmi.core.score.max': '100',
  'cmi.core.session_time': '0000:00:00',
  'cmi.core.total_time': '0000:00:00',
  'cmi.suspend_data': '',
  'cmi.launch_data': '',
  // SCORM 2004
  'cmi.completion_status': 'unknown',
  'cmi.success_status': 'unknown',
  'cmi.score.scaled': '',
  'cmi.progress_measure': '',
  'cmi.session_time': 'PT0S',
  'cmi.total_time': 'PT0S',
  'cmi.exit': '',
};

// ============================================================================
// BRIDGE CLASS
// ============================================================================

export class XAPIBridge {
  private config: BridgeConfig;
  private state: BridgeState;
  private dataModel: Record<string, unknown>;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private registration: string;

  constructor(config: BridgeConfig) {
    this.config = config;
    this.registration = uuidv4();
    this.state = {
      initialized: false,
      suspended: false,
      completed: false,
      passed: null,
      score: null,
      progress: 0,
      sessionStart: new Date(),
      lastInteraction: new Date(),
    };
    this.dataModel = {
      ...defaultDataModel,
      'cmi.core.student_id': config.learnerEmail,
      'cmi.core.student_name': config.learnerName,
      'cmi.learner_id': config.learnerEmail,
      'cmi.learner_name': config.learnerName,
    };
  }

  /**
   * Start listening for messages from the iframe
   */
  start(): void {
    if (this.messageHandler) return;

    this.messageHandler = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Stop listening for messages
   */
  stop(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }

  /**
   * Get current bridge state
   */
  getState(): BridgeState {
    return { ...this.state };
  }

  /**
   * Handle incoming postMessage
   */
  private handleMessage(event: MessageEvent): void {
    // Parse message
    let message: BridgeMessage;

    try {
      if (typeof event.data === 'string') {
        message = JSON.parse(event.data);
      } else if (typeof event.data === 'object') {
        message = event.data;
      } else {
        return;
      }
    } catch {
      return;
    }

    // Route to handler
    if (message.type === 'scorm') {
      this.handleSCORMCommand(message, event.source as Window);
    } else if (message.type === 'xapi') {
      this.handleXAPIStatement(message.statement);
    }
  }

  /**
   * Handle SCORM command
   */
  private handleSCORMCommand(message: SCORMMessage, source: Window | null): void {
    const { command, parameter, value, requestId } = message;
    let result: string | boolean = true;
    let errorCode = '0';

    this.state.lastInteraction = new Date();

    switch (command) {
      case 'LMSInitialize':
      case 'Initialize':
        if (!this.state.initialized) {
          this.state.initialized = true;
          this.emitStatement(this.createLaunchedStatement());
        }
        result = 'true';
        break;

      case 'LMSGetValue':
      case 'GetValue':
        if (parameter) {
          const val = this.dataModel[parameter];
          result = val !== undefined ? String(val) : '';
          if (val === undefined) {
            errorCode = '403'; // Undefined Data Model Element
          }
        }
        break;

      case 'LMSSetValue':
      case 'SetValue':
        if (parameter && value !== undefined) {
          this.dataModel[parameter] = value;
          this.config.onDataModelUpdate?.(parameter, value);
          this.processDataModelUpdate(parameter, value);
          result = 'true';
        }
        break;

      case 'LMSCommit':
      case 'Commit':
        // Commit current state
        this.emitProgressStatement();
        result = 'true';
        break;

      case 'LMSFinish':
      case 'Terminate':
        if (this.state.initialized) {
          this.finishSession();
          this.state.initialized = false;
        }
        result = 'true';
        break;

      case 'LMSGetLastError':
      case 'GetLastError':
        result = errorCode;
        break;

      case 'LMSGetErrorString':
      case 'GetErrorString':
        result = this.getErrorString(parameter || '0');
        break;

      case 'LMSGetDiagnostic':
      case 'GetDiagnostic':
        result = '';
        break;
    }

    // Send response back to iframe
    if (source && requestId) {
      source.postMessage(
        {
          type: 'scorm-response',
          requestId,
          result,
          errorCode,
        },
        '*',
      );
    }
  }

  /**
   * Process data model updates and map to xAPI
   */
  private processDataModelUpdate(key: string, value: unknown): void {
    // Track score
    if (key === 'cmi.core.score.raw' || key === 'cmi.score.raw') {
      this.state.score = Number(value);
    }
    if (key === 'cmi.score.scaled') {
      this.state.score = Number(value) * 100;
    }

    // Track completion status
    if (key === 'cmi.core.lesson_status' || key === 'cmi.completion_status') {
      const status = String(value).toLowerCase();
      if (status === 'completed' || status === 'passed') {
        this.state.completed = true;
        this.state.passed = status === 'passed';
      }
    }

    // SCORM 2004 success status
    if (key === 'cmi.success_status') {
      const status = String(value).toLowerCase();
      if (status === 'passed') {
        this.state.passed = true;
      } else if (status === 'failed') {
        this.state.passed = false;
      }
    }

    // Track progress
    if (key === 'cmi.progress_measure') {
      this.state.progress = Number(value);
    }

    // Track suspend
    if (key === 'cmi.exit' && value === 'suspend') {
      this.state.suspended = true;
    }
  }

  /**
   * Handle native xAPI statement
   */
  private handleXAPIStatement(statement: Statement): void {
    // Enrich with our context
    const enrichedStatement: Statement = {
      ...statement,
      context: {
        ...statement.context,
        registration: this.registration,
        extensions: {
          ...statement.context?.extensions,
          'https://lxd360.com/xapi/extensions/tenantId': this.config.tenantId,
        },
      },
    };

    this.emitStatement(enrichedStatement);
  }

  /**
   * Emit statement via callback
   */
  private emitStatement(statement: Statement): void {
    this.config.onStatement?.(statement);
  }

  /**
   * Create launched statement
   */
  private createLaunchedStatement(): Statement {
    return {
      id: uuidv4(),
      actor: this.createActor(),
      verb: VERBS.launched,
      object: this.createActivity(),
      context: this.createContext(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Emit progress statement
   */
  private emitProgressStatement(): void {
    if (this.state.progress > 0) {
      const statement: Statement = {
        id: uuidv4(),
        actor: this.createActor(),
        verb: VERBS.progressed,
        object: this.createActivity(),
        result: {
          extensions: {
            'https://w3id.org/xapi/cmi5/result/extensions/progress': this.state.progress,
          },
        },
        context: this.createContext(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
      this.emitStatement(statement);
    }
  }

  /**
   * Finish session and emit completion
   */
  private finishSession(): void {
    // Calculate duration
    const duration = Math.floor((Date.now() - this.state.sessionStart.getTime()) / 1000);

    // Determine verb based on state
    let verb: Verb = VERBS.completed;
    if (this.state.passed === true) {
      verb = VERBS.passed;
    } else if (this.state.passed === false) {
      verb = VERBS.failed;
    } else if (this.state.suspended) {
      verb = VERBS.suspended;
    }

    const statement: Statement = {
      id: uuidv4(),
      actor: this.createActor(),
      verb,
      object: this.createActivity(),
      result: {
        completion: this.state.completed,
        success: this.state.passed ?? undefined,
        score:
          this.state.score !== null
            ? {
                scaled: this.state.score / 100,
                raw: this.state.score,
                min: 0,
                max: 100,
              }
            : undefined,
        duration: this.formatDuration(duration),
      },
      context: this.createContext(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    this.emitStatement(statement);
    this.config.onComplete?.(
      this.state.passed ?? this.state.completed,
      this.state.score ?? undefined,
    );
  }

  /**
   * Create actor (learner)
   */
  private createActor(): Statement['actor'] {
    return {
      objectType: 'Agent',
      name: this.config.learnerName,
      mbox: `mailto:${this.config.learnerEmail}`,
    };
  }

  /**
   * Create activity (course)
   */
  private createActivity(): Statement['object'] {
    return {
      objectType: 'Activity',
      id: `https://lxd360.com/courses/${this.config.courseId}`,
      definition: {
        type: 'http://adlnet.gov/expapi/activities/course',
        name: { 'en-US': this.config.courseTitle },
      },
    };
  }

  /**
   * Create context
   */
  private createContext(): Statement['context'] {
    return {
      registration: this.registration,
      platform: 'LXD360 INSPIRE Ignite',
      extensions: {
        'https://lxd360.com/xapi/extensions/tenantId': this.config.tenantId,
        'https://lxd360.com/xapi/extensions/sessionStart': this.state.sessionStart.toISOString(),
      },
    };
  }

  /**
   * Format duration as ISO 8601
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = 'PT';
    if (hours > 0) result += `${hours}H`;
    if (minutes > 0) result += `${minutes}M`;
    if (secs > 0 || result === 'PT') result += `${secs}S`;

    return result;
  }

  /**
   * Get SCORM error string
   */
  private getErrorString(code: string): string {
    const errors: Record<string, string> = {
      '0': 'No Error',
      '101': 'General Exception',
      '201': 'Invalid Argument Error',
      '202': 'Element Cannot Have Children',
      '203': 'Element Not An Array',
      '301': 'Not Initialized',
      '401': 'Not Implemented Error',
      '402': 'Invalid Set Value',
      '403': 'Element Is Read Only',
      '404': 'Element Is Write Only',
      '405': 'Incorrect Data Type',
    };
    return errors[code] || 'Unknown Error';
  }
}

// ============================================================================
// HOOK
// ============================================================================

export interface UseXAPIBridgeOptions extends Omit<BridgeConfig, 'onStatement'> {
  /** Whether to auto-start the bridge */
  autoStart?: boolean;
}

export interface UseXAPIBridgeReturn {
  /** Bridge state */
  state: BridgeState;
  /** Start the bridge */
  start: () => void;
  /** Stop the bridge */
  stop: () => void;
  /** Whether bridge is active */
  isActive: boolean;
  /** Statements emitted */
  statements: Statement[];
}

/**
 * Hook for using xAPI bridge in CoursePlayer
 */
export function useXAPIBridge(options: UseXAPIBridgeOptions): UseXAPIBridgeReturn {
  const bridgeRef = useRef<XAPIBridge | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [state, setState] = useState<BridgeState>({
    initialized: false,
    suspended: false,
    completed: false,
    passed: null,
    score: null,
    progress: 0,
    sessionStart: new Date(),
    lastInteraction: new Date(),
  });
  const [statements, setStatements] = useState<Statement[]>([]);

  // Extract primitive values for dependencies
  const {
    courseId,
    courseTitle,
    learnerEmail,
    learnerName,
    tenantId,
    autoStart,
    onComplete,
    onDataModelUpdate,
    onError,
  } = options;

  // Create bridge on mount
  useEffect(() => {
    bridgeRef.current = new XAPIBridge({
      courseId,
      courseTitle,
      learnerEmail,
      learnerName,
      tenantId,
      onStatement: (statement) => {
        setStatements((prev) => [...prev, statement]);
        // Update state
        if (bridgeRef.current) {
          setState(bridgeRef.current.getState());
        }
      },
      onComplete,
      onDataModelUpdate,
      onError,
    });

    if (autoStart !== false) {
      bridgeRef.current.start();
      setIsActive(true);
    }

    return () => {
      bridgeRef.current?.stop();
    };
  }, [
    courseId,
    courseTitle,
    learnerEmail,
    learnerName,
    tenantId,
    autoStart,
    onComplete,
    onDataModelUpdate,
    onError,
  ]);

  const start = useCallback(() => {
    bridgeRef.current?.start();
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    bridgeRef.current?.stop();
    setIsActive(false);
  }, []);

  return {
    state,
    start,
    stop,
    isActive,
    statements,
  };
}
