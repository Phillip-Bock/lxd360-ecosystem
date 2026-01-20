import { nanoid } from 'nanoid';

// =============================================================================
// TYPES
// =============================================================================

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  created_at: string;
  updated_at: string;
  settings?: Record<string, unknown>;
}

export interface TestCourse {
  id: string;
  title: string;
  description: string;
  slug: string;
  author_id: string;
  organization_id?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'organization';
  thumbnail_url?: string;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface TestModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface TestLesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'quiz' | 'interactive';
  order: number;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface TestEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  enrolled_at: string;
  completed_at?: string;
}

export interface TestProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent_seconds: number;
  completed_at?: string;
}

// =============================================================================
// ID GENERATORS
// =============================================================================

let userCounter = 0;
let courseCounter = 0;
let moduleCounter = 0;
let lessonCounter = 0;

export function resetCounters(): void {
  userCounter = 0;
  courseCounter = 0;
  moduleCounter = 0;
  lessonCounter = 0;
}

// =============================================================================
// USER FACTORIES
// =============================================================================

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  userCounter++;
  const now = new Date().toISOString();

  return {
    id: overrides.id || `user-${nanoid(10)}`,
    email: overrides.email || `testuser${userCounter}@example.com`,
    name: overrides.name || `Test User ${userCounter}`,
    role: overrides.role || 'learner',
    avatar_url: overrides.avatar_url,
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
    metadata: overrides.metadata || {},
  };
}

export function createTestAdmin(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    role: 'admin',
    email: `admin${++userCounter}@lxd360.com`,
    name: `Admin User ${userCounter}`,
    ...overrides,
  });
}

export function createTestInstructor(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    role: 'instructor',
    email: `instructor${++userCounter}@example.com`,
    name: `Instructor ${userCounter}`,
    ...overrides,
  });
}

export function createTestLearner(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    role: 'learner',
    email: `learner${++userCounter}@example.com`,
    name: `Learner ${userCounter}`,
    ...overrides,
  });
}

export function createTestSuperAdmin(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    role: 'super_admin',
    email: `superadmin${++userCounter}@lxd360.com`,
    name: `Super Admin ${userCounter}`,
    ...overrides,
  });
}

// =============================================================================
// ORGANIZATION FACTORIES
// =============================================================================

export function createTestOrganization(
  overrides: Partial<TestOrganization> = {},
): TestOrganization {
  const now = new Date().toISOString();
  const name = overrides.name || `Test Organization ${nanoid(4)}`;

  return {
    id: overrides.id || `org-${nanoid(10)}`,
    name,
    slug: overrides.slug || name.toLowerCase().replace(/\s+/g, '-'),
    owner_id: overrides.owner_id || `user-${nanoid(10)}`,
    plan: overrides.plan || 'starter',
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
    settings: overrides.settings || {},
  };
}

// =============================================================================
// COURSE FACTORIES
// =============================================================================

export function createTestCourse(overrides: Partial<TestCourse> = {}): TestCourse {
  courseCounter++;
  const now = new Date().toISOString();
  const title = overrides.title || `Test Course ${courseCounter}`;

  return {
    id: overrides.id || `course-${nanoid(10)}`,
    title,
    description: overrides.description || `This is a test course description for ${title}`,
    slug: overrides.slug || title.toLowerCase().replace(/\s+/g, '-'),
    author_id: overrides.author_id || `user-${nanoid(10)}`,
    organization_id: overrides.organization_id,
    status: overrides.status || 'draft',
    visibility: overrides.visibility || 'private',
    thumbnail_url: overrides.thumbnail_url,
    duration_minutes: overrides.duration_minutes || 60,
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
    published_at: overrides.published_at,
  };
}

export function createPublishedCourse(overrides: Partial<TestCourse> = {}): TestCourse {
  const now = new Date().toISOString();
  return createTestCourse({
    status: 'published',
    visibility: 'public',
    published_at: now,
    ...overrides,
  });
}

// =============================================================================
// MODULE FACTORIES
// =============================================================================

export function createTestModule(overrides: Partial<TestModule> = {}): TestModule {
  moduleCounter++;
  const now = new Date().toISOString();

  return {
    id: overrides.id || `module-${nanoid(10)}`,
    course_id: overrides.course_id || `course-${nanoid(10)}`,
    title: overrides.title || `Module ${moduleCounter}`,
    description: overrides.description || `Description for module ${moduleCounter}`,
    order: overrides.order ?? moduleCounter,
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
  };
}

// =============================================================================
// LESSON FACTORIES
// =============================================================================

export function createTestLesson(overrides: Partial<TestLesson> = {}): TestLesson {
  lessonCounter++;
  const now = new Date().toISOString();

  return {
    id: overrides.id || `lesson-${nanoid(10)}`,
    module_id: overrides.module_id || `module-${nanoid(10)}`,
    title: overrides.title || `Lesson ${lessonCounter}`,
    content: overrides.content || `<p>This is the content for lesson ${lessonCounter}</p>`,
    type: overrides.type || 'text',
    order: overrides.order ?? lessonCounter,
    duration_minutes: overrides.duration_minutes || 10,
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
  };
}

// =============================================================================
// ENROLLMENT FACTORIES
// =============================================================================

export function createTestEnrollment(overrides: Partial<TestEnrollment> = {}): TestEnrollment {
  const now = new Date().toISOString();

  return {
    id: overrides.id || `enrollment-${nanoid(10)}`,
    user_id: overrides.user_id || `user-${nanoid(10)}`,
    course_id: overrides.course_id || `course-${nanoid(10)}`,
    status: overrides.status || 'active',
    progress: overrides.progress ?? 0,
    enrolled_at: overrides.enrolled_at || now,
    completed_at: overrides.completed_at,
  };
}

// =============================================================================
// PROGRESS FACTORIES
// =============================================================================

export function createTestProgress(overrides: Partial<TestProgress> = {}): TestProgress {
  return {
    id: overrides.id || `progress-${nanoid(10)}`,
    user_id: overrides.user_id || `user-${nanoid(10)}`,
    lesson_id: overrides.lesson_id || `lesson-${nanoid(10)}`,
    status: overrides.status || 'not_started',
    progress_percentage: overrides.progress_percentage ?? 0,
    time_spent_seconds: overrides.time_spent_seconds ?? 0,
    completed_at: overrides.completed_at,
  };
}

// =============================================================================
// BATCH FACTORIES
// =============================================================================

export function createTestUsers(count: number, role?: string): TestUser[] {
  return Array.from({ length: count }, () => createTestUser({ role }));
}

export function createTestCourses(count: number, authorId?: string): TestCourse[] {
  return Array.from({ length: count }, () => createTestCourse({ author_id: authorId }));
}

export function createCourseWithModulesAndLessons(
  moduleCount: number = 3,
  lessonsPerModule: number = 5,
): {
  course: TestCourse;
  modules: TestModule[];
  lessons: TestLesson[];
} {
  const course = createTestCourse();
  const modules: TestModule[] = [];
  const lessons: TestLesson[] = [];

  for (let i = 0; i < moduleCount; i++) {
    const testModule = createTestModule({
      course_id: course.id,
      order: i + 1,
      title: `Module ${i + 1}: Introduction`,
    });
    modules.push(testModule);

    for (let j = 0; j < lessonsPerModule; j++) {
      const lesson = createTestLesson({
        module_id: testModule.id,
        order: j + 1,
        title: `Lesson ${i + 1}.${j + 1}: Topic`,
      });
      lessons.push(lesson);
    }
  }

  return { course, modules, lessons };
}

// =============================================================================
// API RESPONSE FACTORIES
// =============================================================================

export function createApiResponse<T>(
  data: T,
  options: { status?: number; message?: string } = {},
): { data: T; status: number; message?: string } {
  return {
    data,
    status: options.status || 200,
    message: options.message,
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  options: { page?: number; limit?: number; total?: number } = {},
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const total = options.total || items.length;

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function createErrorResponse(
  message: string,
  status: number = 400,
): { error: string; status: number } {
  return {
    error: message,
    status,
  };
}
