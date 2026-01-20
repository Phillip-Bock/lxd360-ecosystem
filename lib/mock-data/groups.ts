/**
 * Mock learning groups data for LXP360
 */

import type { ExpertProfile, LearningGroup, MentorshipRequest } from '@/types/lms';

export const mockLearningGroups: LearningGroup[] = [
  {
    id: 'group-react-devs',
    name: 'React Developers Community',
    slug: 'react-developers',
    description:
      'A community for React developers of all levels. Share knowledge, ask questions, and collaborate on projects. We discuss best practices, new features, and help each other grow as developers.',
    shortDescription: 'Community for React developers',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1600',
    type: 'community',
    category: 'Technology',
    privacy: 'public',
    joinApproval: 'open',
    memberCount: 1245,
    members: [
      {
        userId: 'learner-001',
        userName: 'John Smith',
        userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150',
        role: 'member',
        joinedAt: '2024-06-15T10:00:00Z',
        contributionScore: 450,
      },
      {
        userId: 'inst-004',
        userName: 'James Wilson',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'admin',
        joinedAt: '2024-01-15T10:00:00Z',
        contributionScore: 2350,
      },
    ],
    pendingRequests: 0,
    ownerId: 'inst-004',
    admins: ['inst-004'],
    moderators: ['learner-010', 'learner-012'],
    courses: ['course-001', 'course-002'],
    discussions: [],
    resources: [
      {
        id: 'res-001',
        groupId: 'group-react-devs',
        title: 'React Best Practices Guide',
        description: 'Comprehensive guide to React best practices',
        type: 'document',
        url: '/resources/react-best-practices.pdf',
        uploadedBy: 'inst-004',
        uploadedAt: '2024-03-15T10:00:00Z',
        downloads: 567,
      },
    ],
    events: [
      {
        id: 'event-001',
        groupId: 'group-react-devs',
        title: 'Monthly React Meetup',
        description: 'Monthly virtual meetup to discuss React topics',
        type: 'meeting',
        startTime: '2024-12-15T18:00:00Z',
        endTime: '2024-12-15T19:30:00Z',
        timezone: 'America/New_York',
        meetingUrl: 'https://zoom.us/j/example',
        attendees: ['learner-001', 'learner-005'],
        attendeeCount: 45,
        createdBy: 'inst-004',
        createdAt: '2024-12-01T10:00:00Z',
      },
    ],
    activityScore: 95,
    lastActivityAt: '2024-12-08T15:30:00Z',
    allowPosts: true,
    allowEvents: true,
    allowResources: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-08T15:30:00Z',
  },
  {
    id: 'group-pmp-study',
    name: 'PMP Certification Study Group',
    slug: 'pmp-certification-study',
    description:
      'Study group for professionals preparing for the PMP certification exam. Weekly study sessions, practice questions, and exam tips from those who have passed.',
    shortDescription: 'PMP exam preparation study group',
    thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400',
    coverImage: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1600',
    type: 'study-group',
    category: 'Certification',
    privacy: 'public',
    joinApproval: 'request',
    memberCount: 234,
    maxMembers: 300,
    members: [],
    pendingRequests: 12,
    ownerId: 'learner-008',
    admins: ['learner-008'],
    moderators: ['learner-015'],
    courses: ['course-009'],
    discussions: [],
    resources: [],
    events: [
      {
        id: 'event-002',
        groupId: 'group-pmp-study',
        title: 'Weekly Study Session',
        description: 'Weekly group study session covering PMBOK topics',
        type: 'study-session',
        startTime: '2024-12-14T10:00:00Z',
        endTime: '2024-12-14T12:00:00Z',
        timezone: 'America/Chicago',
        meetingUrl: 'https://meet.google.com/example',
        attendees: [],
        attendeeCount: 28,
        createdBy: 'learner-008',
        createdAt: '2024-12-01T10:00:00Z',
      },
    ],
    activityScore: 82,
    lastActivityAt: '2024-12-08T11:30:00Z',
    allowPosts: true,
    allowEvents: true,
    allowResources: true,
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-12-08T11:30:00Z',
  },
  {
    id: 'group-leadership-cohort',
    name: 'Leadership Development Cohort 2024',
    slug: 'leadership-cohort-2024',
    description:
      'Exclusive cohort for participants in the 2024 Leadership Development Program. Connect with peers, share experiences, and support each other through the program.',
    shortDescription: '2024 Leadership Program participants',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600',
    type: 'cohort',
    category: 'Leadership',
    privacy: 'private',
    joinApproval: 'invite-only',
    memberCount: 48,
    maxMembers: 50,
    members: [],
    pendingRequests: 0,
    ownerId: 'inst-001',
    admins: ['inst-001'],
    moderators: [],
    courses: ['course-005', 'course-008'],
    discussions: [],
    resources: [],
    events: [],
    activityScore: 78,
    lastActivityAt: '2024-12-07T16:00:00Z',
    allowPosts: true,
    allowEvents: true,
    allowResources: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-07T16:00:00Z',
  },
  {
    id: 'group-data-science',
    name: 'Data Science Enthusiasts',
    slug: 'data-science-enthusiasts',
    description:
      'Community for anyone interested in data science, machine learning, and analytics. Share projects, discuss techniques, and learn together.',
    shortDescription: 'Data science and ML community',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600',
    type: 'community',
    category: 'Technology',
    privacy: 'public',
    joinApproval: 'open',
    memberCount: 892,
    members: [],
    pendingRequests: 0,
    ownerId: 'inst-003',
    admins: ['inst-003'],
    moderators: ['learner-012'],
    courses: ['course-006'],
    discussions: [],
    resources: [],
    events: [],
    activityScore: 88,
    lastActivityAt: '2024-12-08T14:00:00Z',
    allowPosts: true,
    allowEvents: true,
    allowResources: true,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-12-08T14:00:00Z',
  },
  {
    id: 'group-healthcare-compliance',
    name: 'Healthcare Compliance Network',
    slug: 'healthcare-compliance',
    description:
      'Professional network for healthcare compliance officers and professionals. Discuss regulatory changes, share best practices, and stay current on compliance requirements.',
    shortDescription: 'Healthcare compliance professionals',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600',
    type: 'community',
    category: 'Compliance',
    privacy: 'public',
    joinApproval: 'request',
    memberCount: 456,
    members: [],
    pendingRequests: 5,
    ownerId: 'inst-002',
    admins: ['inst-002'],
    moderators: [],
    courses: ['course-003'],
    discussions: [],
    resources: [],
    events: [],
    activityScore: 72,
    lastActivityAt: '2024-12-06T15:00:00Z',
    allowPosts: true,
    allowEvents: true,
    allowResources: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-06T15:00:00Z',
  },
];

export const mockExpertProfiles: ExpertProfile[] = [
  {
    id: 'expert-001',
    userId: 'inst-004',
    user: {
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      title: 'Senior Technical Trainer',
      department: 'Learning & Development',
    },
    skills: ['JavaScript', 'React', 'Next.js', 'Node.js', 'TypeScript'],
    topics: [
      'Web Development',
      'Frontend Architecture',
      'State Management',
      'Performance Optimization',
    ],
    certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
    bio: 'Full-stack developer with 15+ years of experience. I love helping others learn to code and build amazing web applications. Ask me anything about React, Next.js, or modern web development!',
    isAvailable: true,
    availability: {
      hoursPerWeek: 5,
      preferredTimes: ['Monday 10am-12pm', 'Wednesday 2pm-4pm', 'Friday 10am-12pm'],
      timezone: 'America/New_York',
    },
    acceptingMentees: true,
    maxMentees: 5,
    currentMentees: 3,
    mentorshipAreas: [
      'Career transition to web development',
      'React/Next.js architecture',
      'Technical interview preparation',
    ],
    mentorshipStyle:
      'I believe in hands-on learning. We will work through real projects together and I will guide you through the problem-solving process.',
    rating: 4.9,
    reviewCount: 47,
    sessionsCompleted: 156,
    questionsAnswered: 234,
    helpfulVotes: 892,
    allowDirectMessage: true,
    calendlyUrl: 'https://calendly.com/jameswilson',
    linkedIn: 'https://linkedin.com/in/jameswilsondev',
    createdAt: '2023-06-01T10:00:00Z',
    lastActiveAt: '2024-12-08T15:30:00Z',
  },
  {
    id: 'expert-002',
    userId: 'inst-001',
    user: {
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      title: 'Leadership Development Expert',
      department: 'Learning & Development',
    },
    skills: ['Leadership', 'Executive Coaching', 'Team Building', 'Change Management'],
    topics: [
      'Leadership Development',
      'Emotional Intelligence',
      'Difficult Conversations',
      'Building High-Performing Teams',
    ],
    certifications: [
      'ICF Professional Certified Coach',
      'DISC Certified Trainer',
      'Six Sigma Black Belt',
    ],
    bio: 'Certified executive coach with 20 years of experience developing leaders at Fortune 500 companies. I am passionate about helping emerging leaders find their authentic leadership style.',
    isAvailable: true,
    availability: {
      hoursPerWeek: 8,
      preferredTimes: ['Tuesday 9am-12pm', 'Thursday 1pm-5pm'],
      timezone: 'America/Chicago',
    },
    acceptingMentees: true,
    maxMentees: 8,
    currentMentees: 6,
    mentorshipAreas: [
      'First-time managers',
      'Executive presence',
      'Leadership transitions',
      'Team leadership',
    ],
    mentorshipStyle:
      'I use a coaching approach focused on self-discovery. Through powerful questions and reflection, I help you uncover your own leadership potential.',
    rating: 4.9,
    reviewCount: 89,
    sessionsCompleted: 312,
    questionsAnswered: 178,
    helpfulVotes: 567,
    allowDirectMessage: true,
    calendlyUrl: 'https://calendly.com/marcusjohnson',
    linkedIn: 'https://linkedin.com/in/marcusjohnson',
    createdAt: '2023-01-15T10:00:00Z',
    lastActiveAt: '2024-12-08T11:45:00Z',
  },
  {
    id: 'expert-003',
    userId: 'inst-002',
    user: {
      name: 'Dr. Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      title: 'Healthcare Compliance Director',
      department: 'Compliance',
    },
    skills: ['HIPAA Compliance', 'Healthcare Regulations', 'Risk Management', 'Audit Preparation'],
    topics: [
      'HIPAA Privacy Rule',
      'Security Rule',
      'Breach Response',
      'Compliance Program Development',
    ],
    certifications: [
      'CHC - Certified in Healthcare Compliance',
      'CHPC - Certified in Healthcare Privacy Compliance',
    ],
    bio: 'Healthcare compliance expert with 18 years of experience. Former Chief Compliance Officer at a major health system. I help organizations build robust compliance programs.',
    isAvailable: true,
    availability: {
      hoursPerWeek: 4,
      preferredTimes: ['Monday 2pm-4pm', 'Wednesday 10am-12pm'],
      timezone: 'America/Los_Angeles',
    },
    acceptingMentees: true,
    maxMentees: 3,
    currentMentees: 2,
    mentorshipAreas: [
      'Healthcare compliance careers',
      'Building compliance programs',
      'HIPAA implementation',
    ],
    mentorshipStyle:
      'Practical, real-world guidance based on extensive industry experience. I focus on actionable advice you can implement immediately.',
    rating: 4.8,
    reviewCount: 34,
    sessionsCompleted: 89,
    questionsAnswered: 145,
    helpfulVotes: 423,
    allowDirectMessage: true,
    calendlyUrl: 'https://calendly.com/drrodriguez',
    linkedIn: 'https://linkedin.com/in/emilyrodriguez',
    createdAt: '2023-03-01T10:00:00Z',
    lastActiveAt: '2024-12-07T14:30:00Z',
  },
];

export const mockMentorshipRequests: MentorshipRequest[] = [
  {
    id: 'mentor-req-001',
    menteeId: 'learner-001',
    mentorId: 'expert-001',
    goals:
      'I want to transition from backend to full-stack development and learn React/Next.js best practices.',
    topics: ['React', 'Next.js', 'Frontend Architecture'],
    preferredFrequency: 'bi-weekly',
    estimatedDuration: 3,
    status: 'accepted',
    message:
      'Hi James, I have been following your courses and would love to get personalized guidance on my journey to becoming a full-stack developer.',
    response:
      'Hi John! I would be happy to help you on your journey. Let us start with understanding your current skill level and goals.',
    requestedAt: '2024-10-15T10:00:00Z',
    respondedAt: '2024-10-16T14:30:00Z',
    startedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: 'mentor-req-002',
    menteeId: 'learner-002',
    mentorId: 'expert-002',
    goals:
      'I recently became a team lead and want to develop my leadership skills, especially around difficult conversations and team motivation.',
    topics: ['Leadership', 'Team Management', 'Communication'],
    preferredFrequency: 'weekly',
    estimatedDuration: 6,
    status: 'accepted',
    message:
      'Hi Marcus, I just got promoted to team lead and would appreciate guidance on how to become an effective leader.',
    response:
      'Congratulations on your promotion, Maria! I would be honored to support you. Leadership is a journey, and I am here to guide you.',
    requestedAt: '2024-09-01T14:00:00Z',
    respondedAt: '2024-09-02T09:00:00Z',
    startedAt: '2024-09-10T10:00:00Z',
  },
  {
    id: 'mentor-req-003',
    menteeId: 'learner-020',
    mentorId: 'expert-003',
    goals:
      'I am interested in pursuing a career in healthcare compliance and would like guidance on certifications and career path.',
    topics: ['HIPAA', 'Healthcare Compliance', 'Career Development'],
    preferredFrequency: 'monthly',
    estimatedDuration: 6,
    status: 'pending',
    message:
      'Hi Dr. Rodriguez, I am looking to transition into healthcare compliance from a clinical background. Would you be able to mentor me?',
    requestedAt: '2024-12-05T11:00:00Z',
  },
];

// Helper functions
export function getGroupById(id: string): LearningGroup | undefined {
  return mockLearningGroups.find((g) => g.id === id);
}

export function getPublicGroups(): LearningGroup[] {
  return mockLearningGroups.filter((g) => g.privacy === 'public');
}

export function getGroupsForUser(userId: string): LearningGroup[] {
  return mockLearningGroups.filter(
    (g) =>
      g.members.some((m) => m.userId === userId) ||
      g.admins.includes(userId) ||
      g.moderators.includes(userId) ||
      g.ownerId === userId,
  );
}

export function getExpertById(id: string): ExpertProfile | undefined {
  return mockExpertProfiles.find((e) => e.id === id);
}

export function getAvailableExperts(): ExpertProfile[] {
  return mockExpertProfiles.filter((e) => e.isAvailable && e.acceptingMentees);
}

export function getExpertsBySkill(skill: string): ExpertProfile[] {
  return mockExpertProfiles.filter((e) =>
    e.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
  );
}
