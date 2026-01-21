/**
 * Mock calendar events data for LXP360
 */

export type CalendarEventType =
  | 'deadline'
  | 'ilt'
  | 'webinar'
  | 'coaching'
  | 'assessment'
  | 'group-session'
  | 'milestone'
  | 'reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  startTime: string;
  endTime?: string;
  allDay: boolean;
  // Related entities
  courseId?: string;
  courseName?: string;
  pathId?: string;
  groupId?: string;
  instructorId?: string;
  instructorName?: string;
  // Location
  location?: string;
  meetingUrl?: string;
  // For ILT/Webinar
  capacity?: number;
  registered?: number;
  isRegistered?: boolean;
  waitlistEnabled?: boolean;
  // For deadlines
  priority?: 'low' | 'medium' | 'high' | 'critical';
  isOverdue?: boolean;
  // Recurrence
  isRecurring?: boolean;
  recurrenceRule?: string;
  // Status
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export const mockCalendarEvents: CalendarEvent[] = [
  // Compliance Deadlines
  {
    id: 'event-deadline-001',
    title: 'Harassment Prevention Training Due',
    description: 'Complete annual harassment prevention training before the deadline.',
    type: 'deadline',
    startTime: '2024-12-15T23:59:59Z',
    allDay: true,
    courseId: 'course-harassment',
    courseName: 'Harassment Prevention',
    priority: 'high',
    isOverdue: false,
    status: 'scheduled',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'event-deadline-002',
    title: 'Cybersecurity Awareness Renewal',
    description: 'Your cybersecurity certification expires. Complete the renewal training.',
    type: 'deadline',
    startTime: '2025-01-15T23:59:59Z',
    allDay: true,
    courseId: 'course-007',
    courseName: 'Cybersecurity Awareness',
    priority: 'medium',
    isOverdue: false,
    status: 'scheduled',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  // ILT Sessions
  {
    id: 'event-ilt-001',
    title: 'Leadership Workshop: Difficult Conversations',
    description:
      'Interactive workshop on handling difficult conversations with team members. Includes role-playing exercises and group discussions.',
    type: 'ilt',
    startTime: '2024-12-12T14:00:00Z',
    endTime: '2024-12-12T17:00:00Z',
    allDay: false,
    courseId: 'course-005',
    courseName: 'Leadership Excellence',
    instructorId: 'inst-001',
    instructorName: 'Marcus Johnson',
    location: 'Training Room A, Building 2',
    capacity: 20,
    registered: 18,
    isRegistered: true,
    status: 'scheduled',
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'event-ilt-002',
    title: 'OSHA Safety Hands-On Training',
    description:
      'Mandatory hands-on safety training covering equipment operation, PPE usage, and emergency procedures.',
    type: 'ilt',
    startTime: '2024-12-18T09:00:00Z',
    endTime: '2024-12-18T12:00:00Z',
    allDay: false,
    courseId: 'course-004',
    courseName: 'OSHA Workplace Safety',
    instructorId: 'inst-004',
    instructorName: 'Dr. Aisha Patel',
    location: 'Manufacturing Floor, Safety Zone B',
    capacity: 15,
    registered: 12,
    isRegistered: false,
    waitlistEnabled: true,
    status: 'scheduled',
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2024-12-05T00:00:00Z',
  },
  // Webinars
  {
    id: 'event-webinar-001',
    title: 'React Server Components Deep Dive',
    description:
      'Live webinar exploring React Server Components and their integration with Next.js 14. Q&A session included.',
    type: 'webinar',
    startTime: '2024-12-14T18:00:00Z',
    endTime: '2024-12-14T19:30:00Z',
    allDay: false,
    courseId: 'course-002',
    courseName: 'React & Next.js',
    instructorId: 'inst-004',
    instructorName: 'James Wilson',
    meetingUrl: 'https://zoom.us/j/example',
    capacity: 500,
    registered: 342,
    isRegistered: true,
    status: 'scheduled',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-08T00:00:00Z',
  },
  {
    id: 'event-webinar-002',
    title: 'HIPAA Updates for 2025',
    description:
      'Overview of upcoming HIPAA regulation changes and what they mean for your organization.',
    type: 'webinar',
    startTime: '2024-12-20T13:00:00Z',
    endTime: '2024-12-20T14:00:00Z',
    allDay: false,
    courseId: 'course-003',
    courseName: 'HIPAA Compliance',
    instructorId: 'inst-002',
    instructorName: 'Dr. Emily Rodriguez',
    meetingUrl: 'https://teams.microsoft.com/example',
    capacity: 200,
    registered: 156,
    isRegistered: false,
    status: 'scheduled',
    createdAt: '2024-12-05T00:00:00Z',
    updatedAt: '2024-12-08T00:00:00Z',
  },
  // Group Study Sessions
  {
    id: 'event-group-001',
    title: 'PMP Study Group - Risk Management',
    description: 'Weekly study session covering PMBOK Risk Management knowledge area.',
    type: 'group-session',
    startTime: '2024-12-14T10:00:00Z',
    endTime: '2024-12-14T12:00:00Z',
    allDay: false,
    groupId: 'group-pmp-study',
    meetingUrl: 'https://meet.google.com/example',
    isRecurring: true,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=SA',
    status: 'scheduled',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'event-group-002',
    title: 'React Developers Monthly Meetup',
    description:
      'Monthly virtual meetup for the React Developers Community. Share projects, discuss trends, and network.',
    type: 'group-session',
    startTime: '2024-12-15T18:00:00Z',
    endTime: '2024-12-15T19:30:00Z',
    allDay: false,
    groupId: 'group-react-devs',
    meetingUrl: 'https://zoom.us/j/example-react',
    isRecurring: true,
    recurrenceRule: 'FREQ=MONTHLY;BYDAY=3SU',
    capacity: 100,
    registered: 67,
    isRegistered: true,
    status: 'scheduled',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  // Coaching Sessions
  {
    id: 'event-coaching-001',
    title: '1:1 Coaching with Marcus Johnson',
    description: 'Bi-weekly coaching session on leadership development.',
    type: 'coaching',
    startTime: '2024-12-13T10:00:00Z',
    endTime: '2024-12-13T11:00:00Z',
    allDay: false,
    instructorId: 'inst-001',
    instructorName: 'Marcus Johnson',
    meetingUrl: 'https://calendly.com/marcusjohnson/coaching',
    isRecurring: true,
    recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=FR',
    status: 'scheduled',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  // Assessments
  {
    id: 'event-assessment-001',
    title: 'JavaScript Certification Exam',
    description:
      'Final certification exam for JavaScript Fundamentals course. 90 minutes, 80% passing score required.',
    type: 'assessment',
    startTime: '2024-12-16T09:00:00Z',
    endTime: '2024-12-16T10:30:00Z',
    allDay: false,
    courseId: 'course-001',
    courseName: 'JavaScript Fundamentals',
    status: 'scheduled',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  // Milestones
  {
    id: 'event-milestone-001',
    title: 'Learning Path Completion Target',
    description: 'Target date to complete the Full-Stack Web Developer learning path.',
    type: 'milestone',
    startTime: '2025-01-15T00:00:00Z',
    allDay: true,
    pathId: 'path-001',
    priority: 'medium',
    status: 'scheduled',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
  // Past events (completed)
  {
    id: 'event-past-001',
    title: 'Data Visualization Workshop',
    description: 'Hands-on workshop on creating effective data visualizations.',
    type: 'webinar',
    startTime: '2024-12-05T14:00:00Z',
    endTime: '2024-12-05T16:00:00Z',
    allDay: false,
    courseId: 'course-006',
    courseName: 'Data Analytics with Python',
    instructorId: 'inst-003',
    instructorName: 'Dr. Sarah Chen',
    meetingUrl: 'https://zoom.us/j/example-past',
    capacity: 100,
    registered: 89,
    isRegistered: true,
    status: 'completed',
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2024-12-05T16:00:00Z',
  },
  // Reminders
  {
    id: 'event-reminder-001',
    title: 'Continue React Course',
    description: 'Reminder to continue your React & Next.js course. You are 65% complete!',
    type: 'reminder',
    startTime: '2024-12-09T09:00:00Z',
    allDay: false,
    courseId: 'course-002',
    courseName: 'React & Next.js',
    priority: 'low',
    status: 'scheduled',
    createdAt: '2024-12-08T00:00:00Z',
    updatedAt: '2024-12-08T00:00:00Z',
  },
];

// Helper function to get events for a date range
export function getEventsInRange(startDate: string, endDate: string): CalendarEvent[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return mockCalendarEvents.filter((event) => {
    const eventStart = new Date(event.startTime).getTime();
    return eventStart >= start && eventStart <= end;
  });
}

// Get upcoming events
export function getUpcomingEvents(limit: number = 10): CalendarEvent[] {
  const now = Date.now();
  return mockCalendarEvents
    .filter((event) => {
      const eventStart = new Date(event.startTime).getTime();
      return eventStart >= now && event.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit);
}

// Get events by type
export function getEventsByType(type: CalendarEventType): CalendarEvent[] {
  return mockCalendarEvents.filter((event) => event.type === type);
}

// Get deadline events
export function getDeadlines(includeOverdue: boolean = false): CalendarEvent[] {
  const now = Date.now();
  return mockCalendarEvents
    .filter((event) => {
      if (event.type !== 'deadline') return false;
      const eventTime = new Date(event.startTime).getTime();
      if (includeOverdue) return true;
      return eventTime >= now;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// Get events for a specific course
export function getEventsForCourse(courseId: string): CalendarEvent[] {
  return mockCalendarEvents.filter((event) => event.courseId === courseId);
}

// Get events user is registered for
export function getRegisteredEvents(): CalendarEvent[] {
  return mockCalendarEvents.filter((event) => event.isRegistered);
}

// Get events by group
export function getEventsForGroup(groupId: string): CalendarEvent[] {
  return mockCalendarEvents.filter((event) => event.groupId === groupId);
}

// Format event for display
export function formatEventTime(event: CalendarEvent): string {
  const start = new Date(event.startTime);
  if (event.allDay) {
    return start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };

  if (event.endTime) {
    const end = new Date(event.endTime);
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }

  return start.toLocaleDateString('en-US', options);
}

// Get event type color
export function getEventTypeColor(type: CalendarEventType): string {
  const colors: Record<CalendarEventType, string> = {
    deadline: '#EF4444', // red
    ilt: '#8B5CF6', // purple
    webinar: '#3B82F6', // blue
    coaching: '#EC4899', // pink
    assessment: '#F59E0B', // amber
    'group-session': '#10B981', // emerald
    milestone: '#6366F1', // indigo
    reminder: '#6B7280', // gray
  };
  return colors[type] || '#6B7280';
}

// Get event type label
export function getEventTypeLabel(type: CalendarEventType): string {
  const labels: Record<CalendarEventType, string> = {
    deadline: 'Deadline',
    ilt: 'In-Person Training',
    webinar: 'Webinar',
    coaching: 'Coaching Session',
    assessment: 'Assessment',
    'group-session': 'Group Session',
    milestone: 'Milestone',
    reminder: 'Reminder',
  };
  return labels[type] || type;
}
