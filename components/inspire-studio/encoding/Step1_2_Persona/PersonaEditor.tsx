'use client';

import { Plus, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { LearnerPersona } from '@/schemas/inspire';
import { ArchetypeSelector } from './ArchetypeSelector';
import { MotivationSliders } from './MotivationSliders';
import {
  ACCESSIBILITY_NEEDS_OPTIONS,
  type ArchetypeOption,
  COMMON_LANGUAGES,
  DIGITAL_FLUENCY_OPTIONS,
  fromSchemaPersona,
  getDefaultPersonaFormData,
  LEARNING_TIME_OPTIONS,
  type PersonaFormData,
  PRIOR_KNOWLEDGE_OPTIONS,
  toSchemaPersona,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface PersonaEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona?: LearnerPersona | null;
  onSave: (persona: LearnerPersona) => void;
  className?: string;
}

/**
 * PersonaEditor - Full persona creation/editing dialog
 */
export function PersonaEditor({
  open,
  onOpenChange,
  persona,
  onSave,
  className,
}: PersonaEditorProps) {
  const [formData, setFormData] = useState<PersonaFormData>(getDefaultPersonaFormData());
  const [goalsText, setGoalsText] = useState('');
  const [painPointsText, setPainPointsText] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (persona) {
        const data = fromSchemaPersona(persona);
        setFormData(data);
        setGoalsText(data.learningGoals.join('\n'));
        setPainPointsText(data.painPoints.join('\n'));
      } else {
        setFormData(getDefaultPersonaFormData());
        setGoalsText('');
        setPainPointsText('');
      }
    }
  }, [open, persona]);

  // Handle archetype selection with default traits
  const handleArchetypeSelect = useCallback((option: ArchetypeOption) => {
    setFormData((prev) => ({
      ...prev,
      archetype: option.id,
      ...option.defaultTraits,
    }));
  }, []);

  // Update field helper
  const updateField = <K extends keyof PersonaFormData>(field: K, value: PersonaFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle array item
  const toggleArrayItem = (
    field: 'accessibilityNeeds' | 'preferredLearningTimes',
    item: string,
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  // Handle save
  const handleSave = () => {
    const updatedData: PersonaFormData = {
      ...formData,
      learningGoals: goalsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      painPoints: painPointsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const schemaPersona = toSchemaPersona(updatedData, persona?.id);
    onSave(schemaPersona);
    onOpenChange(false);
  };

  const isValid = formData.name.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-lxd-dark-surface border-lxd-dark-border',
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{persona ? 'Edit Persona' : 'Create Learner Persona'}</DialogTitle>
          <DialogDescription>
            Define the characteristics of your target learner to personalize the learning experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="motivation">Motivation</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Archetype Selection */}
            <ArchetypeSelector
              value={formData.archetype}
              onChange={(archetype) => updateField('archetype', archetype)}
              onArchetypeSelect={handleArchetypeSelect}
            />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="persona-name">Persona Name *</Label>
              <Input
                id="persona-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., New Hire Nurse, Senior Developer"
                className="bg-lxd-dark-bg border-lxd-dark-border"
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={formData.jobTitle}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                placeholder="e.g., Registered Nurse, Software Engineer"
                className="bg-lxd-dark-bg border-lxd-dark-border"
              />
            </div>

            {/* Years Experience */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Years of Experience</Label>
                <span className="text-sm font-medium text-lxd-cyan">
                  {formData.yearsExperience} years
                </span>
              </div>
              <Slider
                value={[formData.yearsExperience]}
                onValueChange={([v]) => updateField('yearsExperience', v ?? 0)}
                min={0}
                max={40}
                step={1}
              />
            </div>
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="knowledge" className="space-y-4 mt-4">
            {/* Prior Knowledge */}
            <div className="space-y-2">
              <Label>Prior Knowledge Level</Label>
              <Select
                value={formData.priorKnowledge}
                onValueChange={(v) =>
                  updateField('priorKnowledge', v as typeof formData.priorKnowledge)
                }
              >
                <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                  {PRIOR_KNOWLEDGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground text-xs ml-2">
                          — {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Digital Fluency */}
            <div className="space-y-2">
              <Label>Digital Fluency</Label>
              <Select
                value={formData.digitalFluency}
                onValueChange={(v) =>
                  updateField('digitalFluency', v as typeof formData.digitalFluency)
                }
              >
                <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                  {DIGITAL_FLUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground text-xs ml-2">
                          — {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Learning Goals */}
            <div className="space-y-2">
              <Label>Learning Goals (one per line)</Label>
              <Textarea
                value={goalsText}
                onChange={(e) => setGoalsText(e.target.value)}
                placeholder="Master safety protocols&#10;Achieve certification&#10;Improve efficiency"
                rows={4}
                className="bg-lxd-dark-bg border-lxd-dark-border"
              />
            </div>

            {/* Pain Points */}
            <div className="space-y-2">
              <Label>Pain Points / Challenges (one per line)</Label>
              <Textarea
                value={painPointsText}
                onChange={(e) => setPainPointsText(e.target.value)}
                placeholder="Limited time for training&#10;Complex procedures&#10;Information overload"
                rows={4}
                className="bg-lxd-dark-bg border-lxd-dark-border"
              />
            </div>
          </TabsContent>

          {/* Motivation Tab */}
          <TabsContent value="motivation" className="space-y-4 mt-4">
            <MotivationSliders
              internalMotivation={formData.internalMotivation}
              externalMotivation={formData.externalMotivation}
              onInternalChange={(v) => updateField('internalMotivation', v)}
              onExternalChange={(v) => updateField('externalMotivation', v)}
            />
          </TabsContent>

          {/* Context Tab */}
          <TabsContent value="context" className="space-y-4 mt-4">
            {/* Available Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Available Learning Time</Label>
                <span className="text-sm font-medium text-lxd-cyan">
                  {formData.availableTimePerWeek} hours/week
                </span>
              </div>
              <Slider
                value={[formData.availableTimePerWeek]}
                onValueChange={([v]) => updateField('availableTimePerWeek', v ?? 4)}
                min={1}
                max={40}
                step={1}
              />
            </div>

            {/* Preferred Learning Times */}
            <div className="space-y-2">
              <Label>Preferred Learning Times</Label>
              <div className="flex flex-wrap gap-2">
                {LEARNING_TIME_OPTIONS.map((time) => (
                  <Badge
                    key={time}
                    variant={formData.preferredLearningTimes.includes(time) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('preferredLearningTimes', time)}
                  >
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location / Region</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g., North America, Remote, EMEA"
                className="bg-lxd-dark-bg border-lxd-dark-border"
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label>Primary Language</Label>
              <Select
                value={formData.primaryLanguage}
                onValueChange={(v) => updateField('primaryLanguage', v)}
              >
                <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                  {COMMON_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Accessibility Needs */}
            <div className="space-y-2">
              <Label>Accessibility Requirements</Label>
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_NEEDS_OPTIONS.map((need) => (
                  <Badge
                    key={need}
                    variant={formData.accessibilityNeeds.includes(need) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('accessibilityNeeds', need)}
                  >
                    {need}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isValid}>
            {persona ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Persona
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
