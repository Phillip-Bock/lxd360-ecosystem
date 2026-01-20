export const mockMetrics = {
  activeLearnersNow: 2847,
  activeLearnersChange: 12.5,
  monthlyRevenue: 127500,
  revenueChange: 8.2,
  completionsThisMonth: 1842,
  completionsChange: 15.7,
  complianceRate: 94.7,
  complianceChange: 2.1,

  // Detailed metrics
  totalLearners: 15420,
  totalCourses: 127,
  totalClients: 23,
  averageCompletionTime: 42, // minutes
  averageScore: 87.3,
  nps: 72,

  // System
  uptime: 99.97,
  avgLatency: 42,
  requestsPerMinute: 1247,
  errorRate: 0.02,
};

export const mockAlerts = [
  {
    id: 1,
    type: 'warning' as const,
    title: 'Certifications Expiring',
    message: '3 users have certifications expiring in 7 days',
    time: '2m ago',
  },
  {
    id: 2,
    type: 'info' as const,
    title: 'New Course Published',
    message: 'HIPAA Advanced Training is now live',
    time: '15m ago',
  },
  {
    id: 3,
    type: 'success' as const,
    title: 'Milestone Reached',
    message: 'Healthcare cohort reached 90% completion',
    time: '1h ago',
  },
  {
    id: 4,
    type: 'error' as const,
    title: 'AI Service Degraded',
    message: 'Text generation latency increased by 40%',
    time: '2h ago',
  },
];

export const mockTickerAlerts = [
  { type: 'info' as const, message: 'New learner cohort started: Healthcare Q4 2024' },
  { type: 'success' as const, message: 'Compliance audit passed: SOC 2 Type II' },
  { type: 'warning' as const, message: '3 certifications expiring in 7 days' },
  { type: 'info' as const, message: 'System maintenance scheduled: Sunday 2AM EST' },
  { type: 'success' as const, message: '1,000 course completions this week!' },
];

export const mockTopCourses = [
  { id: 1, title: 'HIPAA Fundamentals', completions: 847, rating: 4.8, trend: 12 },
  { id: 2, title: 'Cybersecurity Essentials', completions: 623, rating: 4.7, trend: 8 },
  { id: 3, title: 'Leadership Development', completions: 512, rating: 4.9, trend: 15 },
  { id: 4, title: 'Compliance 101', completions: 489, rating: 4.6, trend: -3 },
  { id: 5, title: 'Safety Protocols', completions: 445, rating: 4.8, trend: 22 },
];

export const mockAIInsights = [
  {
    id: 1,
    type: 'recommendation' as const,
    title: 'Optimize Module 3',
    description: 'High drop-off detected. Consider splitting into 2 shorter modules.',
    impact: 'high' as const,
  },
  {
    id: 2,
    type: 'prediction' as const,
    title: 'Completion Risk',
    description: '12 learners predicted to miss deadline without intervention.',
    impact: 'medium' as const,
  },
  {
    id: 3,
    type: 'opportunity' as const,
    title: 'Content Gap',
    description: 'Learners searching for "advanced HIPAA" - consider creating course.',
    impact: 'high' as const,
  },
  {
    id: 4,
    type: 'anomaly' as const,
    title: 'Unusual Pattern',
    description: 'Quiz retake rate 40% higher than baseline in Sales cohort.',
    impact: 'medium' as const,
  },
];

export const mockGlobalDistribution = [
  { region: 'North America', learners: 8420, growth: 12 },
  { region: 'Europe', learners: 3210, growth: 18 },
  { region: 'Asia Pacific', learners: 2180, growth: 25 },
  { region: 'Latin America', learners: 890, growth: 32 },
  { region: 'Middle East', learners: 520, growth: 15 },
  { region: 'Africa', learners: 200, growth: 45 },
];

export const mockComplianceStatus = [
  { standard: 'HIPAA', score: 98, status: 'compliant' as const },
  { standard: 'SOC 2', score: 95, status: 'compliant' as const },
  { standard: 'GDPR', score: 92, status: 'compliant' as const },
  { standard: 'ISO 27001', score: 88, status: 'in_progress' as const },
  { standard: 'PCI DSS', score: 100, status: 'compliant' as const },
];

export const mockSystemServices = [
  { name: 'API Gateway', status: 99.9, latency: 42 },
  { name: 'Database', status: 99.8, latency: 12 },
  { name: 'AI Services', status: 98.5, latency: 156 },
  { name: 'Storage', status: 99.9, latency: 8 },
  { name: 'CDN', status: 99.99, latency: 23 },
];

export const mockClients = [
  { id: 1, name: 'Healthcare Corp', learners: 2450, mrr: 24500, health: 92 },
  { id: 2, name: 'Tech Solutions Inc', learners: 1820, mrr: 18200, health: 88 },
  { id: 3, name: 'Financial Services Ltd', learners: 1540, mrr: 15400, health: 95 },
  { id: 4, name: 'Retail Global', learners: 980, mrr: 9800, health: 78 },
  { id: 5, name: 'Manufacturing Co', learners: 750, mrr: 7500, health: 85 },
];
