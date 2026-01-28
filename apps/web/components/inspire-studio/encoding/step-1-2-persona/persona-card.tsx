'use client';

import {
  Accessibility,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Crown,
  Globe,
  Heart,
  Microscope,
  Pencil,
  Sparkles,
  Target,
  Trash2,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LearnerPersona } from '@/schemas/inspire';
import { getMotivationLabel, PRIOR_KNOWLEDGE_OPTIONS } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ARCHETYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'entry-level': UserPlus,
  'individual-contributor': User,
  manager: Users,
  director: Building2,
  executive: Crown,
  specialist: Microscope,
  contractor: Briefcase,
  other: Sparkles,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface PersonaCardProps {
  persona: LearnerPersona;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  className?: string;
}

/**
 * PersonaCard - Display card for a learner persona
 */
export function PersonaCard({
  persona,
  onEdit,
  onDelete,
  isSelected,
  className,
}: PersonaCardProps) {
  const ArchetypeIcon = ARCHETYPE_ICONS[persona.archetype] ?? User;
  const knowledgeLabel =
    PRIOR_KNOWLEDGE_OPTIONS.find((o) => o.value === persona.priorKnowledge)?.label ??
    persona.priorKnowledge;

  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border transition-all',
        isSelected && 'ring-2 ring-lxd-purple border-lxd-purple',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn('p-2 rounded-lg', isSelected ? 'bg-lxd-purple/20' : 'bg-lxd-dark-bg')}
            >
              <ArchetypeIcon
                className={cn('h-6 w-6', isSelected ? 'text-lxd-purple' : 'text-lxd-cyan')}
              />
            </div>
            <div>
              <CardTitle className="text-base">{persona.name}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {persona.archetype.replace('-', ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-400"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {persona.jobTitle && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="truncate">{persona.jobTitle}</span>
            </div>
          )}
          {persona.yearsExperience !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{persona.yearsExperience} years exp.</span>
            </div>
          )}
          {persona.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="truncate">{persona.location}</span>
            </div>
          )}
          {persona.availableTimePerWeek !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{persona.availableTimePerWeek} hrs/week</span>
            </div>
          )}
        </div>

        {/* Knowledge & Fluency */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {knowledgeLabel} Knowledge
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {persona.digitalFluency} Digital Fluency
          </Badge>
        </div>

        {/* Motivation */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-muted-foreground">Internal:</span>
            <span className="font-medium">{getMotivationLabel(persona.internalMotivation)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">External:</span>
            <span className="font-medium">{getMotivationLabel(persona.externalMotivation)}</span>
          </div>
        </div>

        {/* Goals */}
        {persona.learningGoals.length > 0 && (
          <div>
            <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">
              Learning Goals
            </h5>
            <ul className="text-sm space-y-1">
              {persona.learningGoals.slice(0, 3).map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-lxd-cyan">•</span>
                  <span className="line-clamp-1">{goal}</span>
                </li>
              ))}
              {persona.learningGoals.length > 3 && (
                <li className="text-muted-foreground text-xs">
                  +{persona.learningGoals.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Accessibility */}
        {persona.accessibilityNeeds.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Accessibility className="h-4 w-4 text-green-500" />
            <span>{persona.accessibilityNeeds.length} accessibility need(s)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
