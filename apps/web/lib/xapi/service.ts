import type {
  ActivityProfile,
  AgentProfile,
  StateDocument,
  Statement,
  StatementQuery,
  StatementResult,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for storing a statement
 */
export interface StoreStatementOptions {
  organizationId?: string;
  sessionId?: string;
  syncToBigQuery?: boolean;
}

/**
 * Result of storing a statement
 */
export interface StoreStatementResult {
  success: boolean;
  statementId?: string;
  error?: string;
}

/**
 * Learner progress data
 */
export interface LearnerProgress {
  userId: string;
  courseId?: string;
  completedActivities: number;
  totalActivities: number;
  completionPercentage: number;
  lastActivityAt?: Date;
  totalDuration?: number;
  averageScore?: number;
}

// ============================================================================
// STATEMENT OPERATIONS
// ============================================================================

/**
 * Store a single xAPI statement
 */
export async function storeStatement(
  statement: Statement,
  options?: StoreStatementOptions,
): Promise<StoreStatementResult> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

    const statementsRef = collection(db, 'xapi_statements');

    const docRef = await addDoc(statementsRef, {
      statement,
      id: statement.id,
      actor_id: extractActorId(statement),
      verb_id: statement.verb.id,
      object_id: extractObjectId(statement),
      timestamp: statement.timestamp || new Date().toISOString(),
      organization_id: options?.organizationId,
      session_id: options?.sessionId,
      created_at: serverTimestamp(),
    });

    return {
      success: true,
      statementId: docRef.id,
    };
  } catch (error) {
    console.error('Failed to store xAPI statement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Store multiple xAPI statements
 */
export async function storeStatements(
  statements: Statement[],
  options?: StoreStatementOptions,
): Promise<StoreStatementResult[]> {
  const results: StoreStatementResult[] = [];

  for (const statement of statements) {
    const result = await storeStatement(statement, options);
    results.push(result);
  }

  return results;
}

/**
 * Get a single statement by ID
 */
export async function getStatement(statementId: string): Promise<Statement | null> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { collection, query, where, getDocs, limit } = await import('firebase/firestore');

    const statementsRef = collection(db, 'xapi_statements');
    const q = query(statementsRef, where('id', '==', statementId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return data.statement as Statement;
  } catch (error) {
    console.error('Failed to get xAPI statement:', error);
    return null;
  }
}

/**
 * Get statements matching a query
 */
export async function getStatements(queryParams: StatementQuery): Promise<StatementResult> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const firestore = await import('firebase/firestore');
    const { collection, query, where, getDocs, orderBy } = firestore;
    const firestoreLimit = firestore.limit;

    const statementsRef = collection(db, 'xapi_statements');
    const constraints = [];

    if (queryParams.agent) {
      constraints.push(where('actor_id', '==', queryParams.agent));
    }

    if (queryParams.verb) {
      constraints.push(where('verb_id', '==', queryParams.verb));
    }

    if (queryParams.activity) {
      constraints.push(where('object_id', '==', queryParams.activity));
    }

    constraints.push(orderBy('timestamp', queryParams.ascending ? 'asc' : 'desc'));

    if (queryParams.limit) {
      constraints.push(firestoreLimit(queryParams.limit));
    }

    const q = query(statementsRef, ...constraints);
    const snapshot = await getDocs(q);

    const statements: Statement[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return data.statement as Statement;
    });

    return {
      statements,
      more: '', // Pagination not implemented - empty string indicates no more results
    };
  } catch (error) {
    console.error('Failed to get xAPI statements:', error);
    return {
      statements: [],
      more: '',
    };
  }
}

/**
 * Void a statement
 */
export async function voidStatement(
  statementId: string,
  actor: Statement['actor'],
): Promise<StoreStatementResult> {
  const voidingStatement: Statement = {
    actor,
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/voided',
      display: { 'en-US': 'voided' },
    },
    object: {
      objectType: 'StatementRef',
      id: statementId,
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  return storeStatement(voidingStatement);
}

// ============================================================================
// STATE OPERATIONS
// ============================================================================

/**
 * Get activity state
 */
export async function getState(
  activityId: string,
  agent: string,
  stateId: string,
  _registration?: string,
): Promise<StateDocument | null> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { doc, getDoc } = await import('firebase/firestore');

    const stateDocId = `${activityId}:${agent}:${stateId}`;
    const stateRef = doc(db, 'xapi_state', stateDocId);
    const snapshot = await getDoc(stateRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return data as StateDocument;
  } catch (error) {
    console.error('Failed to get activity state:', error);
    return null;
  }
}

/**
 * Set activity state
 */
export async function setState(
  activityId: string,
  agent: string,
  stateId: string,
  state: Record<string, unknown>,
  _registration?: string,
): Promise<boolean> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const stateDocId = `${activityId}:${agent}:${stateId}`;
    const stateRef = doc(db, 'xapi_state', stateDocId);

    await setDoc(stateRef, {
      activityId,
      agent,
      stateId,
      state,
      updated_at: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Failed to set activity state:', error);
    return false;
  }
}

/**
 * Delete activity state
 */
export async function deleteState(
  activityId: string,
  agent: string,
  stateId: string,
  _registration?: string,
): Promise<boolean> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { doc, deleteDoc } = await import('firebase/firestore');

    const stateDocId = `${activityId}:${agent}:${stateId}`;
    const stateRef = doc(db, 'xapi_state', stateDocId);

    await deleteDoc(stateRef);
    return true;
  } catch (error) {
    console.error('Failed to delete activity state:', error);
    return false;
  }
}

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

/**
 * Get activity profile
 */
export async function getActivityProfile(
  activityId: string,
  profileId: string,
): Promise<ActivityProfile | null> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { doc, getDoc } = await import('firebase/firestore');

    const profileDocId = `${activityId}:${profileId}`;
    const profileRef = doc(db, 'xapi_activity_profiles', profileDocId);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return data as ActivityProfile;
  } catch (error) {
    console.error('Failed to get activity profile:', error);
    return null;
  }
}

/**
 * Set activity profile
 */
export async function setActivityProfile(
  activityId: string,
  profileId: string,
  profile: Record<string, unknown>,
): Promise<boolean> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const profileDocId = `${activityId}:${profileId}`;
    const profileRef = doc(db, 'xapi_activity_profiles', profileDocId);

    await setDoc(profileRef, {
      activityId,
      profileId,
      profile,
      updated_at: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Failed to set activity profile:', error);
    return false;
  }
}

/**
 * Get agent profile
 */
export async function getAgentProfile(
  agent: string,
  profileId: string,
): Promise<AgentProfile | null> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { doc, getDoc } = await import('firebase/firestore');

    const profileDocId = `${agent}:${profileId}`;
    const profileRef = doc(db, 'xapi_agent_profiles', profileDocId);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return data as AgentProfile;
  } catch (error) {
    console.error('Failed to get agent profile:', error);
    return null;
  }
}

/**
 * Set agent profile
 */
export async function setAgentProfile(
  agent: string,
  profileId: string,
  profile: Record<string, unknown>,
): Promise<boolean> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const profileDocId = `${agent}:${profileId}`;
    const profileRef = doc(db, 'xapi_agent_profiles', profileDocId);

    await setDoc(profileRef, {
      agent,
      profileId,
      profile,
      updated_at: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Failed to set agent profile:', error);
    return false;
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get learner progress for a course or all courses
 */
export async function getLearnerProgress(
  userId: string,
  courseId?: string,
): Promise<LearnerProgress> {
  try {
    const { db } = await import('@/lib/firebase/client');
    const { collection, query, where, getDocs } = await import('firebase/firestore');

    const statementsRef = collection(db, 'xapi_statements');
    const constraints = [where('actor_id', '==', userId)];

    if (courseId) {
      constraints.push(where('object_id', '==', courseId));
    }

    const q = query(statementsRef, ...constraints);
    const snapshot = await getDocs(q);

    const statements = snapshot.docs.map((doc) => doc.data().statement as Statement);

    // Calculate progress metrics
    const completedActivities = statements.filter(
      (s) => s.verb.id === 'http://adlnet.gov/expapi/verbs/completed',
    ).length;

    const lastStatement = statements.sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime(),
    )[0];

    // Calculate average score from statements with results
    const statementsWithScores = statements.filter((s) => s.result?.score?.scaled !== undefined);
    const averageScore =
      statementsWithScores.length > 0
        ? statementsWithScores.reduce((sum, s) => sum + (s.result?.score?.scaled || 0), 0) /
          statementsWithScores.length
        : undefined;

    return {
      userId,
      courseId,
      completedActivities,
      totalActivities: statements.length,
      completionPercentage:
        statements.length > 0 ? (completedActivities / statements.length) * 100 : 0,
      lastActivityAt: lastStatement?.timestamp ? new Date(lastStatement.timestamp) : undefined,
      averageScore,
    };
  } catch (error) {
    console.error('Failed to get learner progress:', error);
    return {
      userId,
      courseId,
      completedActivities: 0,
      totalActivities: 0,
      completionPercentage: 0,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract actor ID from statement
 */
function extractActorId(statement: Statement): string | null {
  const actor = statement.actor;
  if ('mbox' in actor && actor.mbox) {
    return actor.mbox;
  }
  if ('account' in actor && actor.account) {
    return `${actor.account.homePage}::${actor.account.name}`;
  }
  return null;
}

/**
 * Extract object ID from statement
 */
function extractObjectId(statement: Statement): string | null {
  const object = statement.object;
  if ('id' in object) {
    return object.id;
  }
  return null;
}
