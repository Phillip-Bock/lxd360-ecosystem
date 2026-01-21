'use client';

/**
 * Community Content
 * =================
 * Forums, discussions, and community engagement.
 */

import { motion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  Clock,
  Code,
  Eye,
  Hand,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Palette,
  Pin,
  Plus,
  Search,
  ThumbsUp,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock forum data
const FORUMS = [
  {
    id: '1',
    name: 'General Discussion',
    description: 'Open discussions about anything learning-related',
    icon: MessageSquare,
    color: 'bg-gray-500 dark:bg-gray-600',
    postCount: 234,
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Engineering Corner',
    description: 'Technical discussions for software engineers',
    icon: Code,
    color: 'bg-brand-primary',
    postCount: 567,
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Design Studio',
    description: 'UX/UI design discussions and critiques',
    icon: Palette,
    color: 'bg-pink-500',
    postCount: 189,
    lastActive: '15 min ago',
  },
  {
    id: '4',
    name: 'Leadership & Management',
    description: 'Discussions on leadership and team management',
    icon: Users,
    color: 'bg-brand-warning',
    postCount: 156,
    lastActive: '30 min ago',
  },
  {
    id: '5',
    name: 'Career Growth',
    description: 'Career advice and professional development',
    icon: Briefcase,
    color: 'bg-brand-success',
    postCount: 423,
    lastActive: '1 hour ago',
  },
  {
    id: '6',
    name: 'Announcements',
    description: 'Official announcements and updates',
    icon: Megaphone,
    color: 'bg-brand-error',
    postCount: 45,
    lastActive: '2 days ago',
  },
  {
    id: '7',
    name: 'Introductions',
    description: 'Introduce yourself to the community',
    icon: Hand,
    color: 'bg-brand-secondary',
    postCount: 892,
    lastActive: '10 min ago',
  },
  {
    id: '8',
    name: 'Resources & Tools',
    description: 'Share useful resources and tools',
    icon: BookOpen,
    color: 'bg-brand-accent',
    postCount: 312,
    lastActive: '45 min ago',
  },
];

const POSTS = [
  {
    id: '1',
    title: 'How I landed my first Staff Engineer role - a retrospective',
    content:
      'After 7 years in the industry, I finally made the jump to Staff Engineer. Here are the key lessons I learned along the way...',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      title: 'Staff Engineer at Google',
    },
    forum: 'Career Growth',
    isPinned: true,
    views: 1234,
    likes: 89,
    comments: 34,
    createdAt: '2 hours ago',
    tags: ['career', 'growth', 'engineering'],
  },
  {
    id: '2',
    title: 'Best practices for React performance optimization?',
    content:
      "I'm working on a large React application and starting to see some performance issues. What are your go-to strategies for optimization?",
    author: {
      name: 'Alex Rivera',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      title: 'Senior Engineer at Stripe',
    },
    forum: 'Engineering Corner',
    isPinned: false,
    views: 567,
    likes: 45,
    comments: 23,
    createdAt: '4 hours ago',
    tags: ['react', 'performance', 'frontend'],
  },
  {
    id: '3',
    title: 'New here! Looking for a mentor in Product Management',
    content:
      "Hi everyone! I'm a software engineer looking to transition into Product Management. Would love to connect with PMs here.",
    author: {
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?u=priya',
      title: 'Software Engineer',
    },
    forum: 'Introductions',
    isPinned: false,
    views: 234,
    likes: 28,
    comments: 15,
    createdAt: '6 hours ago',
    tags: ['introduction', 'product-management'],
  },
  {
    id: '4',
    title: '[Resource] The Ultimate System Design Interview Cheatsheet',
    content:
      "I've compiled a comprehensive cheatsheet for system design interviews based on my experience interviewing at FAANG companies...",
    author: {
      name: 'Marcus Johnson',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      title: 'Tech Lead at Netflix',
    },
    forum: 'Resources & Tools',
    isPinned: true,
    views: 2345,
    likes: 156,
    comments: 67,
    createdAt: '1 day ago',
    tags: ['system-design', 'interview', 'resource'],
  },
  {
    id: '5',
    title: 'Weekly Challenge: Build a Real-time Notification System',
    content:
      "This week's challenge: Design and implement a real-time notification system. Share your approaches and let's learn from each other!",
    author: {
      name: 'LXD Team',
      avatar: 'https://i.pravatar.cc/150?u=lxd',
      title: 'LXD Nexus',
    },
    forum: 'Engineering Corner',
    isPinned: true,
    views: 789,
    likes: 67,
    comments: 45,
    createdAt: '2 days ago',
    tags: ['challenge', 'system-design', 'real-time'],
  },
];

interface CommunityContentProps {
  userId: string;
}

export function CommunityContent(_props: CommunityContentProps): React.JSX.Element {
  const [selectedForum, setSelectedForum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = selectedForum
    ? POSTS.filter((p) => p.forum === FORUMS.find((f) => f.id === selectedForum)?.name)
    : POSTS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
            Community
          </h1>
          <p className="text-brand-muted dark:text-brand-muted">
            Connect, share, and learn with fellow members
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-brand-blue dark:text-brand-cyan" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">2,847</p>
              <p className="text-xs text-brand-muted">Total Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-brand-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">1,234</p>
              <p className="text-xs text-brand-muted">Active Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600 dark:text-brand-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">8,923</p>
              <p className="text-xs text-brand-muted">Comments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-brand-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary">156</p>
              <p className="text-xs text-brand-muted">Posts Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Forums Sidebar */}
        <div className="lg:w-72 shrink-0 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Forums</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedForum(null)}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                  !selectedForum
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-blue dark:text-brand-cyan'
                    : 'hover:bg-brand-surface dark:hover:bg-brand-surface',
                )}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="flex-1 text-sm font-medium">All Discussions</span>
              </button>
              {FORUMS.map((forum) => (
                <button
                  type="button"
                  key={forum.id}
                  onClick={() => setSelectedForum(forum.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                    selectedForum === forum.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-blue dark:text-brand-cyan'
                      : 'hover:bg-brand-surface dark:hover:bg-brand-surface',
                  )}
                >
                  <div
                    className={cn('w-5 h-5 rounded flex items-center justify-center', forum.color)}
                  >
                    <forum.icon className="w-3 h-3 text-brand-primary" />
                  </div>
                  <span className="flex-1 text-sm truncate">{forum.name}</span>
                  <span className="text-xs text-brand-muted">{forum.postCount}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarah', posts: 89 },
                { name: 'Marcus Johnson', avatar: 'https://i.pravatar.cc/150?u=marcus', posts: 67 },
                { name: 'Emily Zhang', avatar: 'https://i.pravatar.cc/150?u=emily', posts: 45 },
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand-muted w-4">{i + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-brand-muted">{user.posts} posts</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Posts Feed */}
        <div className="flex-1 space-y-4">
          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs defaultValue="hot">
              <TabsList>
                <TabsTrigger value="hot" className="gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Hot
                </TabsTrigger>
                <TabsTrigger value="new" className="gap-1">
                  <Clock className="w-4 h-4" />
                  New
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-bold text-brand-primary dark:text-brand-primary">
                          {post.likes}
                        </span>
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                          <Badge variant="outline" className="text-xs">
                            {post.forum}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-brand-primary dark:text-brand-primary hover:text-brand-blue transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-brand-muted mt-1 line-clamp-2">{post.content}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs font-normal">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-brand-muted">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-brand-secondary dark:text-brand-secondary">
                              {post.author.name}
                            </span>
                          </div>
                          <span>{post.createdAt}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
