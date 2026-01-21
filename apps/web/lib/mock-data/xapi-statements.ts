/**
 * Mock xAPI/LRS statements data for LXP360
 */

import type {
  AdaptiveRecommendation,
  CognitiveLoadMetrics,
  LRSDashboard,
  xAPIStatement,
} from '@/types/lms';
import { XAPI_ACTIVITY_TYPES, XAPI_VERBS } from '@/types/lms/lrs';

export const mockXAPIStatements: xAPIStatement[] = [
  {
    id: 'stmt-001',
    actor: {
      objectType: 'Agent',
      name: 'John Smith',
      account: {
        homePage: 'https://lxp360.com',
        name: 'learner-001',
      },
    },
    verb: {
      id: XAPI_VERBS.completed,
      display: { 'en-US': 'completed' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://lxp360.com/courses/course-001',
      definition: {
        name: { 'en-US': 'JavaScript Fundamentals' },
        description: { 'en-US': 'Complete JavaScript course for beginners' },
        type: XAPI_ACTIVITY_TYPES.course,
      },
    },
    result: {
      completion: true,
      success: true,
      score: {
        scaled: 0.92,
        raw: 92,
        min: 0,
        max: 100,
      },
      duration: 'PT8H30M',
    },
    context: {
      registration: 'reg-001-001',
      platform: 'LXP360',
      language: 'en-US',
      extensions: {
        'https://lxd360.com/xapi/extensions/session-id': 'session-12345',
        'https://lxd360.com/xapi/extensions/device': 'desktop',
      },
    },
    timestamp: '2024-09-15T16:45:00Z',
    stored: '2024-09-15T16:45:01Z',
    authority: {
      objectType: 'Agent',
      name: 'LXP360 LRS',
      account: {
        homePage: 'https://lxp360.com',
        name: 'lrs-authority',
      },
    },
  },
  {
    id: 'stmt-002',
    actor: {
      objectType: 'Agent',
      name: 'John Smith',
      account: {
        homePage: 'https://lxp360.com',
        name: 'learner-001',
      },
    },
    verb: {
      id: XAPI_VERBS.passed,
      display: { 'en-US': 'passed' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://lxp360.com/courses/course-001/quizzes/quiz-final',
      definition: {
        name: { 'en-US': 'JavaScript Fundamentals Final Quiz' },
        type: XAPI_ACTIVITY_TYPES.assessment,
        interactionType: 'choice',
      },
    },
    result: {
      completion: true,
      success: true,
      score: {
        scaled: 0.95,
        raw: 95,
        min: 0,
        max: 100,
      },
      duration: 'PT25M',
    },
    context: {
      registration: 'reg-001-001',
      platform: 'LXP360',
      contextActivities: {
        parent: [
          {
            objectType: 'Activity',
            id: 'https://lxp360.com/courses/course-001',
            definition: {
              name: { 'en-US': 'JavaScript Fundamentals' },
              type: XAPI_ACTIVITY_TYPES.course,
            },
          },
        ],
      },
      extensions: {
        'https://lxd360.com/xapi/extensions/attempt-count': 1,
        'https://lxd360.com/xapi/extensions/confidence-level': 4,
      },
    },
    timestamp: '2024-09-15T16:40:00Z',
    stored: '2024-09-15T16:40:01Z',
    authority: {
      objectType: 'Agent',
      name: 'LXP360 LRS',
      account: {
        homePage: 'https://lxp360.com',
        name: 'lrs-authority',
      },
    },
  },
  {
    id: 'stmt-003',
    actor: {
      objectType: 'Agent',
      name: 'John Smith',
      account: {
        homePage: 'https://lxp360.com',
        name: 'learner-001',
      },
    },
    verb: {
      id: XAPI_VERBS.progressed,
      display: { 'en-US': 'progressed' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://lxp360.com/courses/course-002/lessons/lesson-15',
      definition: {
        name: { 'en-US': 'React Hooks Deep Dive' },
        type: XAPI_ACTIVITY_TYPES.lesson,
      },
    },
    result: {
      extensions: {
        'https://lxd360.com/xapi/extensions/progress': 0.65,
      },
    },
    context: {
      registration: 'reg-001-002',
      platform: 'LXP360',
      contextActivities: {
        parent: [
          {
            objectType: 'Activity',
            id: 'https://lxp360.com/courses/course-002',
            definition: {
              name: { 'en-US': 'React & Next.js' },
              type: XAPI_ACTIVITY_TYPES.course,
            },
          },
        ],
        category: [
          {
            objectType: 'Activity',
            id: 'https://lxd360.com/inspire/stages/practice',
            definition: {
              name: { 'en-US': 'INSPIRE: Practice' },
              type: 'https://lxd360.com/xapi/activities/inspire-stage',
            },
          },
        ],
      },
      extensions: {
        'https://lxd360.com/xapi/extensions/inspire-stage': 'practice',
        'https://lxd360.com/xapi/extensions/cognitive-load': 0.65,
      },
    },
    timestamp: '2024-12-08T14:30:00Z',
    stored: '2024-12-08T14:30:01Z',
    authority: {
      objectType: 'Agent',
      name: 'LXP360 LRS',
      account: {
        homePage: 'https://lxp360.com',
        name: 'lrs-authority',
      },
    },
  },
  {
    id: 'stmt-004',
    actor: {
      objectType: 'Agent',
      name: 'John Smith',
      account: {
        homePage: 'https://lxp360.com',
        name: 'learner-001',
      },
    },
    verb: {
      id: XAPI_VERBS.earned,
      display: { 'en-US': 'earned' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://lxp360.com/badges/badge-js-fundamentals',
      definition: {
        name: { 'en-US': 'JavaScript Fundamentalist' },
        description: { 'en-US': 'Completed JavaScript Fundamentals course with 80%+ score' },
        type: XAPI_ACTIVITY_TYPES.badge,
      },
    },
    context: {
      platform: 'LXP360',
      contextActivities: {
        other: [
          {
            objectType: 'Activity',
            id: 'https://lxp360.com/courses/course-001',
            definition: {
              name: { 'en-US': 'JavaScript Fundamentals' },
              type: XAPI_ACTIVITY_TYPES.course,
            },
          },
        ],
      },
    },
    timestamp: '2024-09-15T16:45:30Z',
    stored: '2024-09-15T16:45:31Z',
    authority: {
      objectType: 'Agent',
      name: 'LXP360 LRS',
      account: {
        homePage: 'https://lxp360.com',
        name: 'lrs-authority',
      },
    },
  },
  {
    id: 'stmt-005',
    actor: {
      objectType: 'Agent',
      name: 'John Smith',
      account: {
        homePage: 'https://lxp360.com',
        name: 'learner-001',
      },
    },
    verb: {
      id: 'https://lxd360.com/xapi/verbs/struggled',
      display: { 'en-US': 'struggled with' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://lxp360.com/courses/course-002/lessons/lesson-12',
      definition: {
        name: { 'en-US': 'Advanced State Management with Redux' },
        type: XAPI_ACTIVITY_TYPES.lesson,
      },
    },
    result: {
      extensions: {
        'https://lxd360.com/xapi/extensions/cognitive-load': 0.85,
        'https://lxd360.com/xapi/extensions/time-on-task': 2400,
      },
    },
    context: {
      registration: 'reg-001-002',
      platform: 'LXP360',
      contextActivities: {
        parent: [
          {
            objectType: 'Activity',
            id: 'https://lxp360.com/courses/course-002',
            definition: {
              name: { 'en-US': 'React & Next.js' },
              type: XAPI_ACTIVITY_TYPES.course,
            },
          },
        ],
      },
      extensions: {
        'https://lxd360.com/xapi/extensions/intervention-triggered': true,
        'https://lxd360.com/xapi/extensions/rewind-count': 5,
        'https://lxd360.com/xapi/extensions/pause-count': 8,
      },
    },
    timestamp: '2024-11-20T15:30:00Z',
    stored: '2024-11-20T15:30:01Z',
    authority: {
      objectType: 'Agent',
      name: 'LXP360 LRS',
      account: {
        homePage: 'https://lxp360.com',
        name: 'lrs-authority',
      },
    },
  },
];

export const mockLRSDashboard: LRSDashboard = {
  overview: {
    totalStatements: 1245678,
    statementsToday: 8456,
    statementsThisWeek: 52340,
    activeAgents: 48500,
    activeActivities: 1250,
    verbsUsed: 28,
  },
  trends: [
    { date: '2024-12-01', count: 7234 },
    { date: '2024-12-02', count: 8012 },
    { date: '2024-12-03', count: 7856 },
    { date: '2024-12-04', count: 8234 },
    { date: '2024-12-05', count: 8567 },
    { date: '2024-12-06', count: 7890 },
    { date: '2024-12-07', count: 6234 },
    { date: '2024-12-08', count: 8456 },
  ],
  verbDistribution: [
    { verbId: XAPI_VERBS.experienced, verbName: 'experienced', count: 456789, percentage: 36.7 },
    { verbId: XAPI_VERBS.progressed, verbName: 'progressed', count: 234567, percentage: 18.8 },
    { verbId: XAPI_VERBS.completed, verbName: 'completed', count: 189456, percentage: 15.2 },
    { verbId: XAPI_VERBS.answered, verbName: 'answered', count: 145678, percentage: 11.7 },
    { verbId: XAPI_VERBS.launched, verbName: 'launched', count: 98765, percentage: 7.9 },
    { verbId: XAPI_VERBS.passed, verbName: 'passed', count: 45678, percentage: 3.7 },
    { verbId: XAPI_VERBS.failed, verbName: 'failed', count: 23456, percentage: 1.9 },
    { verbId: XAPI_VERBS.earned, verbName: 'earned', count: 18567, percentage: 1.5 },
    {
      verbId: 'https://lxd360.com/xapi/verbs/struggled',
      verbName: 'struggled',
      count: 15678,
      percentage: 1.3,
    },
    { verbId: 'other', verbName: 'other', count: 17044, percentage: 1.4 },
  ],
  topActivities: [
    {
      activityId: 'course-007',
      activityName: 'Cybersecurity Awareness',
      statementCount: 156789,
      uniqueActors: 48500,
    },
    {
      activityId: 'course-003',
      activityName: 'HIPAA Compliance',
      statementCount: 134567,
      uniqueActors: 26800,
    },
    {
      activityId: 'course-004',
      activityName: 'OSHA Workplace Safety',
      statementCount: 123456,
      uniqueActors: 43200,
    },
    {
      activityId: 'course-010',
      activityName: 'New Employee Onboarding',
      statementCount: 98765,
      uniqueActors: 11500,
    },
    {
      activityId: 'course-001',
      activityName: 'JavaScript Fundamentals',
      statementCount: 87654,
      uniqueActors: 14800,
    },
  ],
  topAgents: [
    {
      agentId: 'learner-010',
      agentName: 'Alex Thompson',
      statementCount: 4567,
      lastActive: '2024-12-08T15:30:00Z',
    },
    {
      agentId: 'learner-005',
      agentName: 'Jordan Chen',
      statementCount: 4234,
      lastActive: '2024-12-08T14:45:00Z',
    },
    {
      agentId: 'learner-012',
      agentName: 'Taylor Martinez',
      statementCount: 3987,
      lastActive: '2024-12-08T16:00:00Z',
    },
    {
      agentId: 'learner-001',
      agentName: 'John Smith',
      statementCount: 3756,
      lastActive: '2024-12-08T14:30:00Z',
    },
    {
      agentId: 'learner-008',
      agentName: 'Morgan Davis',
      statementCount: 3567,
      lastActive: '2024-12-08T12:15:00Z',
    },
  ],
};

export const mockCognitiveLoadMetrics: CognitiveLoadMetrics[] = [
  {
    learnerId: 'learner-001',
    sessionId: 'session-12345',
    timestamp: '2024-12-08T14:30:00Z',
    currentLoad: 65,
    intrinsicLoad: 45,
    extraneousLoad: 10,
    germaneLoad: 10,
    pauseFrequency: 3,
    rewindFrequency: 2,
    notesTaken: 5,
    timeOnContent: 1800,
    expectedTime: 1500,
    loadLevel: 'optimal',
    recommendBreak: false,
    interventionSuggested: false,
  },
  {
    learnerId: 'learner-001',
    sessionId: 'session-12346',
    timestamp: '2024-11-20T15:30:00Z',
    currentLoad: 85,
    intrinsicLoad: 55,
    extraneousLoad: 20,
    germaneLoad: 10,
    pauseFrequency: 8,
    rewindFrequency: 5,
    notesTaken: 2,
    timeOnContent: 2400,
    expectedTime: 1200,
    loadLevel: 'overload',
    recommendBreak: true,
    interventionSuggested: true,
  },
];

export const mockAdaptiveRecommendations: AdaptiveRecommendation[] = [
  {
    id: 'rec-001',
    learnerId: 'learner-001',
    type: 'content',
    priority: 'high',
    recommendation:
      'Based on your progress, we recommend reviewing the Redux fundamentals lesson before continuing.',
    reason:
      'You showed signs of cognitive overload during the Advanced State Management lesson. Revisiting the basics may help.',
    suggestedContent: {
      type: 'lesson',
      id: 'course-002-lesson-10',
      title: 'Redux Fundamentals Review',
    },
    status: 'pending',
    createdAt: '2024-12-08T14:35:00Z',
  },
  {
    id: 'rec-002',
    learnerId: 'learner-001',
    type: 'break',
    priority: 'medium',
    recommendation:
      'You have been learning for 45 minutes. Consider taking a short break to maintain focus.',
    reason:
      'Research shows that breaks every 45-50 minutes improve retention and reduce cognitive fatigue.',
    status: 'shown',
    createdAt: '2024-12-08T14:30:00Z',
    respondedAt: '2024-12-08T14:32:00Z',
  },
  {
    id: 'rec-003',
    learnerId: 'learner-001',
    type: 'pace',
    priority: 'low',
    recommendation:
      'You are progressing faster than average. Consider enabling advanced mode for additional challenges.',
    reason:
      'Your quiz scores and completion times indicate you may benefit from more challenging content.',
    status: 'accepted',
    createdAt: '2024-12-05T10:00:00Z',
    respondedAt: '2024-12-05T10:05:00Z',
  },
];

// Generate more xAPI statements
export function generateXAPIStatements(learnerId: string, count: number): xAPIStatement[] {
  const verbs = [
    { id: XAPI_VERBS.launched, display: 'launched' },
    { id: XAPI_VERBS.experienced, display: 'experienced' },
    { id: XAPI_VERBS.progressed, display: 'progressed' },
    { id: XAPI_VERBS.completed, display: 'completed' },
    { id: XAPI_VERBS.answered, display: 'answered' },
  ];

  const activities = [
    { id: 'course-001', name: 'JavaScript Fundamentals', type: XAPI_ACTIVITY_TYPES.course },
    { id: 'course-002', name: 'React & Next.js', type: XAPI_ACTIVITY_TYPES.course },
    { id: 'lesson-001', name: 'Introduction to Variables', type: XAPI_ACTIVITY_TYPES.lesson },
    { id: 'lesson-002', name: 'Functions and Scope', type: XAPI_ACTIVITY_TYPES.lesson },
    { id: 'quiz-001', name: 'JavaScript Basics Quiz', type: XAPI_ACTIVITY_TYPES.assessment },
  ];

  return Array.from({ length: count }, (_, i) => {
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `stmt-gen-${learnerId}-${i}`,
      actor: {
        objectType: 'Agent' as const,
        account: {
          homePage: 'https://lxp360.com',
          name: learnerId,
        },
      },
      verb: {
        id: verb.id,
        display: { 'en-US': verb.display },
      },
      object: {
        objectType: 'Activity' as const,
        id: `https://lxp360.com/${activity.type === XAPI_ACTIVITY_TYPES.course ? 'courses' : 'activities'}/${activity.id}`,
        definition: {
          name: { 'en-US': activity.name },
          type: activity.type,
        },
      },
      timestamp,
      stored: new Date(new Date(timestamp).getTime() + 1000).toISOString(),
      authority: {
        objectType: 'Agent' as const,
        name: 'LXP360 LRS',
        account: {
          homePage: 'https://lxp360.com',
          name: 'lrs-authority',
        },
      },
    };
  });
}

// Helper functions
export function getStatementsForLearner(learnerId: string): xAPIStatement[] {
  return mockXAPIStatements.filter((s) => s.actor.account?.name === learnerId);
}

export function getStatementsByVerb(verbId: string): xAPIStatement[] {
  return mockXAPIStatements.filter((s) => s.verb.id === verbId);
}

export function getRecentStatements(limit: number = 10): xAPIStatement[] {
  return [...mockXAPIStatements]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
