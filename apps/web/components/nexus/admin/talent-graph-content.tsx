'use client';

/**
 * Talent Graph Content
 * ====================
 * HR dashboard for visualizing organizational talent, skills distribution,
 * mentorship connections, and identifying high-potential employees.
 */

import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  BarChart3,
  Brain,
  Download,
  GraduationCap,
  Lightbulb,
  Network,
  Search,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TalentGraphVisualization } from './talent-graph-visualization';

// Mock data for organizational talent
const DEPARTMENTS = [
  { id: 'eng', name: 'Engineering', count: 156 },
  { id: 'product', name: 'Product', count: 42 },
  { id: 'design', name: 'Design', count: 28 },
  { id: 'marketing', name: 'Marketing', count: 35 },
  { id: 'sales', name: 'Sales', count: 67 },
  { id: 'hr', name: 'Human Resources', count: 15 },
];

const SKILL_DISTRIBUTION = [
  { skill: 'React', count: 89, growth: 12 },
  { skill: 'TypeScript', count: 76, growth: 23 },
  { skill: 'Python', count: 54, growth: 8 },
  { skill: 'System Design', count: 45, growth: 15 },
  { skill: 'Leadership', count: 38, growth: 5 },
  { skill: 'Product Management', count: 32, growth: 18 },
  { skill: 'Data Analysis', count: 28, growth: 25 },
  { skill: 'Machine Learning', count: 24, growth: 32 },
];

const HIGH_POTENTIAL_EMPLOYEES = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    role: 'Senior Engineer',
    department: 'Engineering',
    potentialScore: 95,
    skills: ['React', 'TypeScript', 'System Design'],
    growthAreas: ['Leadership', 'Public Speaking'],
    mentoringActivity: { sessions: 24, mentees: 5 },
    learningProgress: 87,
    trend: 'up',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    role: 'Tech Lead',
    department: 'Engineering',
    potentialScore: 92,
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    growthAreas: ['Product Strategy'],
    mentoringActivity: { sessions: 18, mentees: 3 },
    learningProgress: 92,
    trend: 'up',
  },
  {
    id: '3',
    name: 'Emily Zhang',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    role: 'Product Designer',
    department: 'Design',
    potentialScore: 88,
    skills: ['UX Design', 'User Research', 'Prototyping'],
    growthAreas: ['Technical Skills', 'Data Analysis'],
    mentoringActivity: { sessions: 12, mentees: 2 },
    learningProgress: 78,
    trend: 'stable',
  },
  {
    id: '4',
    name: 'Alex Rivera',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    role: 'Engineering Manager',
    department: 'Engineering',
    potentialScore: 91,
    skills: ['Team Leadership', 'System Design', 'React'],
    growthAreas: ['Strategic Planning'],
    mentoringActivity: { sessions: 32, mentees: 8 },
    learningProgress: 65,
    trend: 'up',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    role: 'Senior PM',
    department: 'Product',
    potentialScore: 86,
    skills: ['Product Strategy', 'Data Analysis', 'Leadership'],
    growthAreas: ['Technical Architecture'],
    mentoringActivity: { sessions: 15, mentees: 4 },
    learningProgress: 81,
    trend: 'up',
  },
];

const MENTORING_INSIGHTS = [
  {
    type: 'opportunity',
    title: 'Skill Gap Identified',
    description:
      'Engineering team lacks ML expertise. 3 high-potential employees interested in learning.',
    action: 'Create ML Learning Path',
    priority: 'high',
  },
  {
    type: 'success',
    title: 'Mentoring Program Success',
    description: '15 mentees promoted in Q4 after completing structured mentoring programs.',
    action: 'View Details',
    priority: 'medium',
  },
  {
    type: 'warning',
    title: 'At-Risk Talent',
    description: '3 high performers show declining engagement. Consider retention interventions.',
    action: 'Review Profiles',
    priority: 'high',
  },
  {
    type: 'opportunity',
    title: 'Cross-Department Collaboration',
    description: 'Design and Engineering teams could benefit from shared learning sessions.',
    action: 'Schedule Sessions',
    priority: 'medium',
  },
];

const ENGAGEMENT_METRICS = {
  activeMentors: 45,
  activeMentees: 128,
  sessionCompletionRate: 87,
  avgSessionRating: 4.7,
  knowledgeShared: 234,
  skillsImproved: 567,
};

export function TalentGraphContent(): React.JSX.Element {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-primary flex items-center gap-2">
            <Network className="w-7 h-7 text-brand-purple" />
            Talent Graph
          </h1>
          <p className="text-brand-muted dark:text-brand-muted">
            Visualize organizational talent, skills, and growth opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-brand-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {ENGAGEMENT_METRICS.activeMentors}
                </p>
                <p className="text-xs text-brand-muted">Active Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-brand-blue dark:text-brand-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {ENGAGEMENT_METRICS.activeMentees}
                </p>
                <p className="text-xs text-brand-muted">Active Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-brand-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {ENGAGEMENT_METRICS.sessionCompletionRate}%
                </p>
                <p className="text-xs text-brand-muted">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600 dark:text-brand-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {ENGAGEMENT_METRICS.avgSessionRating}
                </p>
                <p className="text-xs text-brand-muted">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-600 dark:text-brand-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {ENGAGEMENT_METRICS.knowledgeShared}
                </p>
                <p className="text-xs text-brand-muted">Resources Shared</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
                  {ENGAGEMENT_METRICS.skillsImproved}
                </p>
                <p className="text-xs text-brand-muted">Skills Improved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Talent Graph Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Talent Network</CardTitle>
                  <CardDescription>
                    Interactive visualization of skills, mentoring relationships, and growth
                    trajectories
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'graph' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('graph')}
                  >
                    <Network className="w-4 h-4 mr-1" />
                    Graph
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'graph' ? (
                <TalentGraphVisualization department={selectedDepartment} />
              ) : (
                <div className="space-y-6">
                  {/* Skills Distribution */}
                  <div>
                    <h4 className="text-sm font-medium text-brand-primary dark:text-brand-primary mb-4">
                      Top Skills Distribution
                    </h4>
                    <div className="space-y-3">
                      {SKILL_DISTRIBUTION.map((skill) => (
                        <div key={skill.skill} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{skill.skill}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-brand-muted">{skill.count} employees</span>
                              <span
                                className={cn(
                                  'flex items-center text-xs',
                                  skill.growth > 15 ? 'text-green-600' : 'text-brand-muted',
                                )}
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                {skill.growth}%
                              </span>
                            </div>
                          </div>
                          <Progress value={(skill.count / 100) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Department Breakdown */}
                  <div>
                    <h4 className="text-sm font-medium text-brand-primary dark:text-brand-primary mb-4">
                      Mentoring by Department
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {DEPARTMENTS.map((dept) => (
                        <div
                          key={dept.id}
                          className="p-3 rounded-lg border border-brand-default dark:border-brand-default hover:bg-brand-page dark:hover:bg-brand-surface/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{dept.name}</span>
                            <Badge variant="secondary">{dept.count}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-brand-muted">
                            <span>{Math.floor(dept.count * 0.3)} mentors</span>
                            <span>•</span>
                            <span>{Math.floor(dept.count * 0.7)} mentees</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* High Potential Employees */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    High Potential Employees
                  </CardTitle>
                  <CardDescription>
                    Top performers based on learning, mentoring activity, and growth trajectory
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {HIGH_POTENTIAL_EMPLOYEES.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-brand-default dark:border-brand-default hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                          index === 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-brand-warning'
                            : index === 1
                              ? 'bg-brand-surface text-brand-secondary dark:bg-brand-surface dark:text-brand-secondary'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-brand-page text-brand-muted dark:bg-brand-surface/50',
                        )}
                      >
                        {index + 1}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.name[0]}</AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-brand-primary dark:text-brand-primary">
                            {employee.name}
                          </h4>
                          {employee.trend === 'up' && (
                            <ArrowUpRight className="w-4 h-4 text-brand-success" />
                          )}
                        </div>
                        <p className="text-sm text-brand-muted">
                          {employee.role} • {employee.department}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {employee.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-2xl font-bold text-purple-600 dark:text-brand-purple">
                            {employee.potentialScore}
                          </span>
                          <span className="text-xs text-brand-muted">score</span>
                        </div>
                        <div className="text-xs text-brand-muted">
                          {employee.mentoringActivity.sessions} sessions
                        </div>
                        <div className="text-xs text-brand-muted">
                          {employee.mentoringActivity.mentees} mentees
                        </div>
                      </div>
                    </div>

                    {/* Growth Areas & Learning Progress */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-brand-subtle flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-brand-muted">Growth areas:</span>
                        {employee.growthAreas.map((area) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-muted">Learning:</span>
                        <Progress value={employee.learningProgress} className="w-20 h-2" />
                        <span className="text-xs font-medium">{employee.learningProgress}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>Actionable recommendations for talent development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MENTORING_INSIGHTS.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    'p-3 rounded-lg border',
                    insight.type === 'opportunity' &&
                      'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
                    insight.type === 'success' &&
                      'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
                    insight.type === 'warning' &&
                      'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-brand-primary dark:text-brand-primary">
                          {insight.title}
                        </h4>
                        {insight.priority === 'high' && (
                          <Badge variant="destructive" className="text-[10px] h-4">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-brand-secondary dark:text-brand-muted mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs">
                    {insight.action} →
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Program Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Mentor Capacity</span>
                  <span className="font-medium">73%</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Mentee Satisfaction</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Goal Completion Rate</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Skill Gap Coverage</span>
                  <span className="font-medium">54%</span>
                </div>
                <Progress value={54} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Trending Skills */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-success" />
                Trending Skills
              </CardTitle>
              <CardDescription>Most sought-after skills this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { skill: 'AI/Machine Learning', demand: 156, growth: 45 },
                  { skill: 'System Design', demand: 98, growth: 23 },
                  { skill: 'Leadership', demand: 87, growth: 12 },
                  { skill: 'Cloud Architecture', demand: 76, growth: 34 },
                  { skill: 'Data Engineering', demand: 65, growth: 28 },
                ].map((item, i) => (
                  <div
                    key={item.skill}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-brand-subtle last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-brand-muted">{i + 1}.</span>
                      <span className="text-sm font-medium">{item.skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-muted">{item.demand} seeking</span>
                      <span className="flex items-center text-xs text-green-600">
                        <ArrowUpRight className="w-3 h-3" />
                        {item.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
