import { delay, HttpResponse, http } from 'msw';
import {
  createPaginatedResponse,
  createTestCourse,
  createTestEnrollment,
  createTestUser,
} from '../utils/factories';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// =============================================================================
// HEALTH CHECK HANDLERS
// =============================================================================

export const healthHandlers = [
  http.get(`${API_BASE}/api/health`, async () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        cache: 'connected',
        storage: 'connected',
      },
    });
  }),

  http.get(`${API_BASE}/api/admin/health`, async () => {
    return HttpResponse.json({
      status: 'healthy',
      uptime: 86400,
      version: '1.0.0',
      environment: 'test',
    });
  }),
];

// =============================================================================
// AUTH HANDLERS
// =============================================================================

export const authHandlers = [
  // Sign up
  http.post(`${API_BASE}/api/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name?: string };
    await delay(100);

    if (!body.email || !body.password) {
      return HttpResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Simulate existing user
    if (body.email === 'existing@example.com') {
      return HttpResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = createTestUser({
      email: body.email,
      name: body.name || 'New User',
    });

    return HttpResponse.json({
      user,
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      },
    });
  }),

  // Sign in
  http.post(`${API_BASE}/api/auth/signin`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    await delay(100);

    if (body.email === 'invalid@example.com' || body.password === 'wrongpassword') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = createTestUser({ email: body.email });

    return HttpResponse.json({
      user,
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      },
    });
  }),

  // Sign out
  http.post(`${API_BASE}/api/auth/signout`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),

  // Password reset request
  http.post(`${API_BASE}/api/auth/reset-password`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    await delay(100);

    if (!body.email) {
      return HttpResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    return HttpResponse.json({
      message: 'Password reset email sent',
    });
  }),

  // Get current session
  http.get(`${API_BASE}/api/auth/session`, async () => {
    return HttpResponse.json({
      user: createTestUser(),
      session: {
        access_token: 'mock-access-token',
        expires_at: Date.now() + 3600000,
      },
    });
  }),
];

// =============================================================================
// USER HANDLERS
// =============================================================================

export const userHandlers = [
  // Get current user profile
  http.get(`${API_BASE}/api/users/me`, async () => {
    return HttpResponse.json(createTestUser());
  }),

  // Update user profile
  http.patch(`${API_BASE}/api/users/me`, async ({ request }) => {
    const body = (await request.json()) as Partial<{ name: string; avatar_url: string }>;
    const user = createTestUser(body);
    return HttpResponse.json(user);
  }),

  // Get all users (admin)
  http.get(`${API_BASE}/api/admin/users`, async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const users = Array.from({ length: limit }, () => createTestUser());

    return HttpResponse.json(createPaginatedResponse(users, { page, limit, total: 100 }));
  }),

  // Get single user (admin)
  http.get(`${API_BASE}/api/admin/users/:id`, async ({ params }) => {
    const user = createTestUser({ id: params.id as string });
    return HttpResponse.json(user);
  }),

  // Create user (admin)
  http.post(`${API_BASE}/api/admin/users`, async ({ request }) => {
    const body = (await request.json()) as Partial<{ email: string; name: string; role: string }>;
    const user = createTestUser(body);
    return HttpResponse.json(user, { status: 201 });
  }),

  // Update user (admin)
  http.patch(`${API_BASE}/api/admin/users/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<{ name: string; role: string }>;
    const user = createTestUser({ id: params.id as string, ...body });
    return HttpResponse.json(user);
  }),

  // Delete user (admin)
  http.delete(`${API_BASE}/api/admin/users/:id`, async () => {
    return HttpResponse.json({ success: true });
  }),
];

// =============================================================================
// COURSE HANDLERS
// =============================================================================

export const courseHandlers = [
  // Get all courses
  http.get(`${API_BASE}/api/courses`, async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const courses = Array.from({ length: limit }, () => createTestCourse());

    return HttpResponse.json(createPaginatedResponse(courses, { page, limit, total: 50 }));
  }),

  // Get single course
  http.get(`${API_BASE}/api/courses/:id`, async ({ params }) => {
    const course = createTestCourse({ id: params.id as string });
    return HttpResponse.json(course);
  }),

  // Create course
  http.post(`${API_BASE}/api/courses`, async ({ request }) => {
    const body = (await request.json()) as Partial<{ title: string; description: string }>;
    const course = createTestCourse(body);
    return HttpResponse.json(course, { status: 201 });
  }),

  // Update course
  http.patch(`${API_BASE}/api/courses/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<{
      title: string;
      status: 'draft' | 'published';
    }>;
    const course = createTestCourse({ id: params.id as string, ...body });
    return HttpResponse.json(course);
  }),

  // Delete course
  http.delete(`${API_BASE}/api/courses/:id`, async () => {
    return HttpResponse.json({ success: true });
  }),

  // Publish course
  http.post(`${API_BASE}/api/courses/:id/publish`, async ({ params }) => {
    const course = createTestCourse({
      id: params.id as string,
      status: 'published',
      published_at: new Date().toISOString(),
    });
    return HttpResponse.json(course);
  }),

  // Enroll in course
  http.post(`${API_BASE}/api/courses/enroll`, async ({ request }) => {
    const body = (await request.json()) as { course_id: string };
    const enrollment = createTestEnrollment({ course_id: body.course_id });
    return HttpResponse.json(enrollment, { status: 201 });
  }),

  // Get course progress
  http.get(`${API_BASE}/api/courses/progress`, async ({ request }) => {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('course_id');

    return HttpResponse.json({
      course_id: courseId,
      progress: 45,
      completed_lessons: 5,
      total_lessons: 12,
      last_accessed: new Date().toISOString(),
    });
  }),
];

// =============================================================================
// ADMIN HANDLERS
// =============================================================================

export const adminHandlers = [
  // Get admin stats
  http.get(`${API_BASE}/api/admin/stats`, async () => {
    return HttpResponse.json({
      total_users: 1250,
      active_users: 890,
      total_courses: 45,
      total_enrollments: 3500,
      completion_rate: 0.68,
      revenue_mtd: 45000,
    });
  }),

  // Get audit logs
  http.get(`${API_BASE}/api/admin/audit-logs`, async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const logs = Array.from({ length: limit }, (_, i) => ({
      id: `log-${i}`,
      action: ['CREATE', 'UPDATE', 'DELETE'][i % 3],
      resource: ['user', 'course', 'enrollment'][i % 3],
      user_id: `user-${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      details: { key: 'value' },
    }));

    return HttpResponse.json(createPaginatedResponse(logs, { page, limit, total: 500 }));
  }),

  // Get system metrics
  http.get(`${API_BASE}/api/admin/metrics`, async () => {
    return HttpResponse.json({
      cpu_usage: 45.2,
      memory_usage: 62.8,
      disk_usage: 34.5,
      request_count_24h: 125000,
      error_rate: 0.002,
      avg_response_time_ms: 120,
    });
  }),

  // Get feature flags
  http.get(`${API_BASE}/api/admin/feature-flags`, async () => {
    return HttpResponse.json([
      { id: 'flag-1', name: 'new_dashboard', enabled: true },
      { id: 'flag-2', name: 'ai_assistant', enabled: false },
      { id: 'flag-3', name: 'dark_mode', enabled: true },
    ]);
  }),

  // Toggle feature flag
  http.patch(`${API_BASE}/api/admin/feature-flags/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { enabled: boolean };
    return HttpResponse.json({
      id: params.id,
      enabled: body.enabled,
    });
  }),
];

// =============================================================================
// NOTIFICATION HANDLERS
// =============================================================================

export const notificationHandlers = [
  http.get(`${API_BASE}/api/notifications`, async () => {
    return HttpResponse.json([
      {
        id: 'notif-1',
        type: 'course_enrollment',
        title: 'New Enrollment',
        message: 'You have been enrolled in a new course',
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        type: 'achievement',
        title: 'Achievement Unlocked',
        message: 'You completed your first course!',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  }),

  http.patch(`${API_BASE}/api/notifications/:id`, async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      read: true,
    });
  }),
];

// =============================================================================
// ERROR HANDLERS (for testing error scenarios)
// =============================================================================

export const errorHandlers = [
  // 500 error
  http.get(`${API_BASE}/api/test/error-500`, async () => {
    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
  }),

  // 404 error
  http.get(`${API_BASE}/api/test/error-404`, async () => {
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  // 403 error
  http.get(`${API_BASE}/api/test/error-403`, async () => {
    return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
  }),

  // 401 error
  http.get(`${API_BASE}/api/test/error-401`, async () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  // Rate limited
  http.get(`${API_BASE}/api/test/rate-limited`, async () => {
    return HttpResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      },
    );
  }),
];

// =============================================================================
// COMBINED HANDLERS
// =============================================================================

export const handlers = [
  ...healthHandlers,
  ...authHandlers,
  ...userHandlers,
  ...courseHandlers,
  ...adminHandlers,
  ...notificationHandlers,
  ...errorHandlers,
];
