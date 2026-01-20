'use client';

/**
 * Learning Content
 * ================
 * Learning paths catalog with progress tracking.
 */

import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock learning paths data
const LEARNING_PATHS = [
  {
    id: '1',
    title: 'React Mastery',
    description:
      'Master React from fundamentals to advanced patterns including hooks, context, and performance optimization.',
    category: 'Frontend Development',
    difficulty: 'intermediate' as const,
    estimatedHours: 40,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    skills: ['React', 'JavaScript', 'TypeScript'],
    outcomes: [
      'Build production-ready React applications',
      'Implement advanced state management',
      'Optimize React performance',
    ],
    isFeatured: true,
    enrollmentCount: 1234,
    rating: 4.9,
    progress: 65,
    modules: [
      { title: 'React Fundamentals', duration: 120, completed: true },
      { title: 'Component Patterns', duration: 180, completed: true },
      { title: 'Hooks Deep Dive', duration: 240, completed: true },
      { title: 'State Management', duration: 200, completed: false },
      { title: 'Performance Optimization', duration: 160, completed: false },
      { title: 'Testing Strategies', duration: 180, completed: false },
      { title: 'Capstone Project', duration: 300, completed: false },
    ],
  },
  {
    id: '2',
    title: 'System Design Fundamentals',
    description: 'Learn to design scalable, reliable systems used by millions of users.',
    category: 'Architecture',
    difficulty: 'advanced' as const,
    estimatedHours: 30,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop',
    skills: ['System Design', 'Distributed Systems', 'Databases'],
    outcomes: [
      'Design scalable distributed systems',
      'Make informed trade-offs',
      'Pass system design interviews',
    ],
    isFeatured: true,
    enrollmentCount: 892,
    rating: 4.8,
    progress: 0,
    modules: [
      { title: 'System Design Basics', duration: 90, completed: false },
      { title: 'Database Design', duration: 120, completed: false },
      { title: 'Caching Strategies', duration: 90, completed: false },
      { title: 'Load Balancing', duration: 80, completed: false },
      { title: 'Microservices', duration: 150, completed: false },
    ],
  },
  {
    id: '3',
    title: 'Leadership Foundations',
    description: 'Develop essential leadership skills for managing teams effectively.',
    category: 'Leadership',
    difficulty: 'beginner' as const,
    estimatedHours: 20,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
    skills: ['Leadership', 'Communication', 'Team Management'],
    outcomes: [
      'Lead team meetings effectively',
      'Provide constructive feedback',
      'Build high-performing teams',
    ],
    isFeatured: true,
    enrollmentCount: 756,
    rating: 4.7,
    progress: 30,
    modules: [
      { title: 'Leadership Mindset', duration: 60, completed: true },
      { title: 'Communication Skills', duration: 90, completed: true },
      { title: 'Delegation & Feedback', duration: 80, completed: false },
      { title: 'Team Dynamics', duration: 90, completed: false },
    ],
  },
  {
    id: '4',
    title: 'TypeScript Deep Dive',
    description: 'Go beyond the basics to become a TypeScript expert.',
    category: 'Languages',
    difficulty: 'intermediate' as const,
    estimatedHours: 25,
    thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=225&fit=crop',
    skills: ['TypeScript', 'JavaScript'],
    outcomes: [
      'Write type-safe code',
      'Use advanced TypeScript features',
      'Build custom type utilities',
    ],
    isFeatured: false,
    enrollmentCount: 543,
    rating: 4.6,
    progress: 0,
    modules: [],
  },
];

const CATEGORIES = [
  'All',
  'Frontend Development',
  'Backend Development',
  'Architecture',
  'Leadership',
  'Languages',
  'DevOps',
];

interface LearningContentProps {
  userId: string;
}

export function LearningContent(_props: LearningContentProps): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPath, setSelectedPath] = useState<(typeof LEARNING_PATHS)[0] | null>(null);

  const inProgressPaths = LEARNING_PATHS.filter((p) => p.progress > 0 && p.progress < 100);
  const completedPaths = LEARNING_PATHS.filter((p) => p.progress === 100);
  const filteredPaths =
    selectedCategory === 'All'
      ? LEARNING_PATHS
      : LEARNING_PATHS.filter((p) => p.category === selectedCategory);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-brand-success';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-brand-warning';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-brand-error';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
            Learning Paths
          </h1>
          <p className="text-brand-muted dark:text-brand-muted">
            Structured curricula to accelerate your growth
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <BookOpen className="w-4 h-4" />
            <span>{inProgressPaths.length} in progress</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{completedPaths.length} completed</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-brand-blue dark:text-brand-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">48</p>
                <p className="text-xs text-brand-muted">Hours Learned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-brand-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">12</p>
                <p className="text-xs text-brand-muted">Modules Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-brand-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">5</p>
                <p className="text-xs text-brand-muted">Skills Gained</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600 dark:text-brand-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">12</p>
                <p className="text-xs text-brand-muted">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgressPaths.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-primary mb-4">
            Continue Learning
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inProgressPaths.map((path) => (
              <Card
                key={path.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedPath(path)}
              >
                <div className="flex">
                  <div className="relative w-32 h-24 hidden sm:block">
                    <Image
                      src={path.thumbnail}
                      alt={path.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-brand-primary dark:text-brand-primary">
                          {path.title}
                        </h3>
                        <p className="text-sm text-brand-muted">{path.category}</p>
                      </div>
                      <Badge variant="outline">{path.progress}%</Badge>
                    </div>
                    <Progress value={path.progress} className="h-2 mb-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-muted">
                        {path.modules.filter((m) => m.completed).length}/{path.modules.length}{' '}
                        modules
                      </span>
                      <Button size="sm">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Browse All Paths */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-primary">
            Explore Paths
          </h2>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow h-full"
                  onClick={() => setSelectedPath(path)}
                >
                  <div className="relative h-40">
                    <Image
                      src={path.thumbnail}
                      alt={path.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {path.isFeatured && (
                      <Badge className="absolute top-2 left-2 bg-brand-warning">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge
                      className={cn(
                        'absolute top-2 right-2 capitalize',
                        getDifficultyColor(path.difficulty),
                      )}
                    >
                      {path.difficulty}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-brand-primary dark:text-brand-primary mb-1">
                      {path.title}
                    </h3>
                    <p className="text-sm text-brand-muted line-clamp-2 mb-3">{path.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {path.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-brand-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{path.estimatedHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{path.enrollmentCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{path.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEARNING_PATHS.filter((p) => p.isFeatured).map((path) => (
              <Card
                key={path.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedPath(path)}
              >
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <p className="text-center py-12 text-brand-muted">New paths coming soon...</p>
        </TabsContent>
      </Tabs>

      {/* Path Detail Dialog */}
      <Dialog open={!!selectedPath} onOpenChange={() => setSelectedPath(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPath && (
            <>
              <DialogHeader>
                <div className="relative w-full h-48 -mx-6 -mt-6 mb-4">
                  <Image
                    src={selectedPath.thumbnail}
                    alt={selectedPath.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <Badge className={cn('mb-2', getDifficultyColor(selectedPath.difficulty))}>
                      {selectedPath.difficulty}
                    </Badge>
                    <DialogTitle className="text-brand-primary text-xl">
                      {selectedPath.title}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-base">
                  {selectedPath.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-brand-page dark:bg-brand-surface rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-brand-muted" />
                    <p className="font-bold text-brand-primary dark:text-brand-primary">
                      {selectedPath.estimatedHours}h
                    </p>
                    <p className="text-xs text-brand-muted">Duration</p>
                  </div>
                  <div className="text-center p-3 bg-brand-page dark:bg-brand-surface rounded-lg">
                    <Users className="w-5 h-5 mx-auto mb-1 text-brand-muted" />
                    <p className="font-bold text-brand-primary dark:text-brand-primary">
                      {selectedPath.enrollmentCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-brand-muted">Enrolled</p>
                  </div>
                  <div className="text-center p-3 bg-brand-page dark:bg-brand-surface rounded-lg">
                    <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <p className="font-bold text-brand-primary dark:text-brand-primary">
                      {selectedPath.rating}
                    </p>
                    <p className="text-xs text-brand-muted">Rating</p>
                  </div>
                </div>

                {/* Progress */}
                {selectedPath.progress > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Your Progress</span>
                      <span className="text-sm text-brand-muted">{selectedPath.progress}%</span>
                    </div>
                    <Progress value={selectedPath.progress} className="h-2" />
                  </div>
                )}

                {/* Outcomes */}
                <div>
                  <h4 className="font-medium mb-2">What you&apos;ll learn</h4>
                  <ul className="space-y-2">
                    {selectedPath.outcomes.map((outcome, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-brand-secondary dark:text-brand-muted"
                      >
                        <CheckCircle className="w-4 h-4 text-brand-success" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modules */}
                {selectedPath.modules.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Modules</h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {selectedPath.modules.map((module, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg border',
                              module.completed
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-brand-page dark:bg-brand-surface border-brand-default dark:border-brand-default',
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {module.completed ? (
                                <CheckCircle className="w-5 h-5 text-brand-success" />
                              ) : (
                                <PlayCircle className="w-5 h-5 text-brand-muted" />
                              )}
                              <span
                                className={cn(
                                  'text-sm',
                                  module.completed && 'text-brand-muted line-through',
                                )}
                              >
                                {module.title}
                              </span>
                            </div>
                            <span className="text-xs text-brand-muted">{module.duration} min</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <Button className="w-full">
                  {selectedPath.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
