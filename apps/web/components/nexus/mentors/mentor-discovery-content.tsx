'use client';

/**
 * Mentor Discovery Content
 * ========================
 * Main content for finding and matching with mentors.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Grid3X3,
  List,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock mentor data
const MOCK_MENTORS = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    title: 'Staff Engineer',
    company: 'Google',
    bio: 'Passionate about helping engineers grow. Specialized in system design and distributed systems.',
    skills: ['React', 'System Design', 'TypeScript', 'Node.js', 'Kubernetes'],
    languages: ['English', 'Mandarin'],
    timezone: 'America/Los_Angeles',
    rating: 4.9,
    reviewCount: 47,
    sessionCount: 120,
    responseTime: 2,
    isVerified: true,
    matchScore: 95,
    hourlyRate: 150,
    availability: 'High',
    yearsExperience: 12,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    title: 'Tech Lead',
    company: 'Netflix',
    bio: 'Former startup founder turned tech lead. Love mentoring on career growth and leadership.',
    skills: ['Leadership', 'System Design', 'Go', 'Python', 'AWS'],
    languages: ['English'],
    timezone: 'America/New_York',
    rating: 4.8,
    reviewCount: 35,
    sessionCount: 89,
    responseTime: 4,
    isVerified: true,
    matchScore: 88,
    hourlyRate: 120,
    availability: 'Medium',
    yearsExperience: 10,
  },
  {
    id: '3',
    name: 'Emily Zhang',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    title: 'Senior Product Manager',
    company: 'Meta',
    bio: 'Helping engineers transition to PM and vice versa. Product strategy and user research expert.',
    skills: ['Product Management', 'UX Research', 'Data Analysis', 'Roadmapping'],
    languages: ['English', 'Mandarin'],
    timezone: 'America/Los_Angeles',
    rating: 4.7,
    reviewCount: 28,
    sessionCount: 65,
    responseTime: 6,
    isVerified: true,
    matchScore: 82,
    hourlyRate: 100,
    availability: 'Low',
    yearsExperience: 8,
  },
  {
    id: '4',
    name: 'Alex Rivera',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    bio: 'React and TypeScript enthusiast. Building beautiful and accessible UIs.',
    skills: ['React', 'TypeScript', 'CSS', 'Accessibility', 'Design Systems'],
    languages: ['English', 'Spanish'],
    timezone: 'America/Chicago',
    rating: 4.9,
    reviewCount: 52,
    sessionCount: 145,
    responseTime: 1,
    isVerified: true,
    matchScore: 92,
    hourlyRate: 130,
    availability: 'High',
    yearsExperience: 7,
  },
  {
    id: '5',
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    title: 'Engineering Manager',
    company: 'Airbnb',
    bio: 'Helping ICs become great managers. Focus on team building and technical leadership.',
    skills: ['Leadership', 'Team Management', 'System Design', 'Java', 'Mentoring'],
    languages: ['English', 'Hindi'],
    timezone: 'America/Los_Angeles',
    rating: 4.8,
    reviewCount: 41,
    sessionCount: 98,
    responseTime: 3,
    isVerified: true,
    matchScore: 78,
    hourlyRate: 140,
    availability: 'Medium',
    yearsExperience: 11,
  },
  {
    id: '6',
    name: 'David Kim',
    avatar: 'https://i.pravatar.cc/150?u=david',
    title: 'Principal Engineer',
    company: 'Microsoft',
    bio: 'Cloud architecture and DevOps expert. Helping teams scale their infrastructure.',
    skills: ['DevOps', 'Azure', 'Kubernetes', 'Terraform', 'CI/CD'],
    languages: ['English', 'Korean'],
    timezone: 'America/Seattle',
    rating: 4.6,
    reviewCount: 23,
    sessionCount: 54,
    responseTime: 8,
    isVerified: false,
    matchScore: 75,
    hourlyRate: 160,
    availability: 'Low',
    yearsExperience: 15,
  },
];

const SKILL_OPTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Go',
  'Java',
  'System Design',
  'Leadership',
  'Product Management',
  'DevOps',
  'AWS',
  'Kubernetes',
  'Data Science',
  'Machine Learning',
];

interface MentorDiscoveryContentProps {
  userId: string;
}

export function MentorDiscoveryContent(_props: MentorDiscoveryContentProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState(200);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'sessions'>('match');
  const [selectedMentor, setSelectedMentor] = useState<(typeof MOCK_MENTORS)[0] | null>(null);

  // Filter and sort mentors
  const filteredMentors = useMemo(() => {
    let result = [...MOCK_MENTORS];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.title.toLowerCase().includes(query) ||
          m.company.toLowerCase().includes(query) ||
          m.skills.some((s) => s.toLowerCase().includes(query)),
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      result = result.filter((m) => selectedSkills.some((skill) => m.skills.includes(skill)));
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter((m) => m.rating >= minRating);
    }

    // Rate filter
    result = result.filter((m) => m.hourlyRate <= maxRate);

    // Verified filter
    if (verifiedOnly) {
      result = result.filter((m) => m.isVerified);
    }

    // Sort
    switch (sortBy) {
      case 'match':
        result.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'sessions':
        result.sort((a, b) => b.sessionCount - a.sessionCount);
        break;
    }

    return result;
  }, [searchQuery, selectedSkills, minRating, maxRate, verifiedOnly, sortBy]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setMinRating(0);
    setMaxRate(200);
    setVerifiedOnly(false);
  };

  const hasActiveFilters =
    selectedSkills.length > 0 || minRating > 0 || maxRate < 200 || verifiedOnly;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
            Find Your Mentor
          </h1>
          <p className="text-brand-muted dark:text-brand-muted">
            Connect with experts who match your goals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Match Card */}
          <Card className="bg-linear-to-r from-violet-500/10 to-indigo-500/10 border-violet-200 dark:border-violet-800">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-primary dark:text-brand-primary">
                  AI Matching
                </p>
                <p className="text-xs text-brand-muted">Based on your goals</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <Input
            placeholder="Search by name, skill, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Button (Mobile) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {selectedSkills.length +
                    (minRating > 0 ? 1 : 0) +
                    (maxRate < 200 ? 1 : 0) +
                    (verifiedOnly ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your mentor search</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <FilterContent
                selectedSkills={selectedSkills}
                toggleSkill={toggleSkill}
                minRating={minRating}
                setMinRating={setMinRating}
                maxRate={maxRate}
                setMaxRate={setMaxRate}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                clearFilters={clearFilters}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-muted hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'match' | 'rating' | 'sessions')}
            className="h-10 px-3 rounded-md border border-brand-default dark:border-brand-default bg-brand-surface dark:bg-brand-surface text-sm"
          >
            <option value="match">Best Match</option>
            <option value="rating">Highest Rated</option>
            <option value="sessions">Most Sessions</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex border border-brand-default dark:border-brand-default rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-brand-muted">Active filters:</span>
          {selectedSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1">
              {skill}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSkill(skill)} />
            </Badge>
          ))}
          {minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {minRating}+ rating
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
            </Badge>
          )}
          {maxRate < 200 && (
            <Badge variant="secondary" className="gap-1">
              Max ${maxRate}/hr
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxRate(200)} />
            </Badge>
          )}
          {verifiedOnly && (
            <Badge variant="secondary" className="gap-1">
              Verified only
              <X className="w-3 h-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden lg:block w-64 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterContent
                selectedSkills={selectedSkills}
                toggleSkill={toggleSkill}
                minRating={minRating}
                setMinRating={setMinRating}
                maxRate={maxRate}
                setMaxRate={setMaxRate}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                clearFilters={clearFilters}
              />
            </CardContent>
          </Card>
        </div>

        {/* Mentor Grid/List */}
        <div className="flex-1">
          {filteredMentors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-brand-surface dark:bg-brand-surface rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-brand-muted" />
              </div>
              <h3 className="text-lg font-medium text-brand-primary dark:text-brand-primary mb-2">
                No mentors found
              </h3>
              <p className="text-brand-muted mb-4">Try adjusting your filters or search query</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-4',
              )}
            >
              <AnimatePresence>
                {filteredMentors.map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MentorCard
                      mentor={mentor}
                      viewMode={viewMode}
                      onSelect={() => setSelectedMentor(mentor)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Mentor Detail Dialog */}
      <MentorDetailDialog
        mentor={selectedMentor}
        open={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
      />
    </div>
  );
}

// Filter Content Component
function FilterContent({
  selectedSkills,
  toggleSkill,
  minRating,
  setMinRating,
  maxRate,
  setMaxRate,
  verifiedOnly,
  setVerifiedOnly,
  clearFilters,
}: {
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  maxRate: number;
  setMaxRate: (value: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Skills */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Skills</Label>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.slice(0, 10).map((skill) => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Minimum Rating: {minRating > 0 ? minRating : 'Any'}
        </Label>
        <Slider
          value={[minRating]}
          onValueChange={([value]) => setMinRating(value)}
          max={5}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Max Hourly Rate */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Max Rate: ${maxRate}/hr</Label>
        <Slider
          value={[maxRate]}
          onValueChange={([value]) => setMaxRate(value)}
          max={200}
          step={10}
          className="w-full"
        />
      </div>

      {/* Verified Only */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={(checked) => setVerifiedOnly(!!checked)}
        />
        <Label htmlFor="verified" className="text-sm cursor-pointer">
          Verified mentors only
        </Label>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear all filters
      </Button>
    </div>
  );
}

// Mentor Card Component
function MentorCard({
  mentor,
  viewMode,
  onSelect,
}: {
  mentor: (typeof MOCK_MENTORS)[0];
  viewMode: 'grid' | 'list';
  onSelect: () => void;
}) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={mentor.avatar} />
            <AvatarFallback>{mentor.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-brand-primary dark:text-brand-primary">
                {mentor.name}
              </h3>
              {mentor.isVerified && <CheckCircle className="w-4 h-4 text-brand-blue" />}
              <Badge
                variant="secondary"
                className="bg-linear-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 dark:text-violet-300 border-0"
              >
                {mentor.matchScore}% Match
              </Badge>
            </div>
            <p className="text-sm text-brand-muted">
              {mentor.title} at {mentor.company}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {mentor.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="font-medium">{mentor.rating}</span>
              <span className="text-brand-muted text-sm">({mentor.reviewCount})</span>
            </div>
            <p className="text-sm text-brand-muted mt-1">${mentor.hourlyRate}/hr</p>
            <Button size="sm" className="mt-2">
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor.avatar} />
            <AvatarFallback>{mentor.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-brand-primary dark:text-brand-primary truncate">
                {mentor.name}
              </h3>
              {mentor.isVerified && <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />}
            </div>
            <p className="text-sm text-brand-muted truncate">
              {mentor.title} at {mentor.company}
            </p>
          </div>
        </div>

        {/* Match Score */}
        <div className="mb-3">
          <Badge className="bg-linear-to-r from-violet-500 to-indigo-500 text-brand-primary border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            {mentor.matchScore}% Match
          </Badge>
        </div>

        {/* Bio */}
        <p className="text-sm text-brand-secondary dark:text-brand-muted line-clamp-2 mb-3">
          {mentor.bio}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-4">
          {mentor.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {mentor.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{mentor.skills.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-brand-muted mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium text-brand-primary dark:text-brand-primary">
              {mentor.rating}
            </span>
            <span>({mentor.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{mentor.responseTime}h</span>
          </div>
          <div className="font-medium text-brand-primary dark:text-brand-primary">
            ${mentor.hourlyRate}/hr
          </div>
        </div>

        <Button className="w-full">Request Mentorship</Button>
      </CardContent>
    </Card>
  );
}

// Mentor Detail Dialog
function MentorDetailDialog({
  mentor,
  open,
  onClose,
}: {
  mentor: (typeof MOCK_MENTORS)[0] | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!mentor) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mentor.avatar} />
              <AvatarFallback>{mentor.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {mentor.name}
                {mentor.isVerified && <CheckCircle className="w-5 h-5 text-brand-blue" />}
              </DialogTitle>
              <DialogDescription className="text-base">
                {mentor.title} at {mentor.company}
              </DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-medium">{mentor.rating}</span>
                  <span className="text-brand-muted">({mentor.reviewCount} reviews)</span>
                </div>
                <Badge className="bg-linear-to-r from-violet-500 to-indigo-500 text-brand-primary border-0">
                  {mentor.matchScore}% Match
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="about" className="mt-4">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Bio</h4>
              <p className="text-brand-secondary dark:text-brand-muted">{mentor.bio}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Languages</h4>
                <p className="text-brand-secondary dark:text-brand-muted">
                  {mentor.languages.join(', ')}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Experience</h4>
                <p className="text-brand-secondary dark:text-brand-muted">
                  {mentor.yearsExperience} years
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Response Time</h4>
                <p className="text-brand-secondary dark:text-brand-muted">
                  Usually within {mentor.responseTime} hours
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Sessions</h4>
                <p className="text-brand-secondary dark:text-brand-muted">
                  {mentor.sessionCount} completed
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <p className="text-center py-8 text-brand-muted">Reviews coming soon...</p>
          </TabsContent>

          <TabsContent value="availability">
            <p className="text-center py-8 text-brand-muted">Calendar view coming soon...</p>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Request Mentorship
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
