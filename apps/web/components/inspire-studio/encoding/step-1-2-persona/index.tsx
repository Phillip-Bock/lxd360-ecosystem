'use client';

import { AlertTriangle, Info, Plus, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LearnerPersona } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { PersonaCard } from './persona-card';
import { PersonaEditor } from './persona-editor';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step1_2_PersonaProps {
  className?: string;
}

/**
 * Step1_2_Persona - Learner Persona Builder
 *
 * This step captures:
 * - Target learner archetypes
 * - Knowledge levels and digital fluency
 * - Motivation profiles
 * - Context and constraints
 *
 * Output to store:
 * - manifest.encoding.personas
 */
export function Step1_2_Persona({ className }: Step1_2_PersonaProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateEncodingData = useMissionStore((state) => state.updateEncodingData);

  // Local state
  const [personas, setPersonas] = useState<LearnerPersona[]>(manifest?.encoding?.personas ?? []);
  const [editingPersona, setEditingPersona] = useState<LearnerPersona | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Validation
  const isValid = useMemo(() => personas.length > 0, [personas]);

  // Sync to store
  useEffect(() => {
    if (isValid) {
      updateEncodingData({ personas });
    }
  }, [isValid, personas, updateEncodingData]);

  // Add new persona
  const handleAddPersona = useCallback(() => {
    setEditingPersona(null);
    setIsEditorOpen(true);
  }, []);

  // Edit existing persona
  const handleEditPersona = useCallback((persona: LearnerPersona) => {
    setEditingPersona(persona);
    setIsEditorOpen(true);
  }, []);

  // Delete persona
  const handleDeletePersona = useCallback((personaId: string) => {
    setPersonas((prev) => prev.filter((p) => p.id !== personaId));
  }, []);

  // Save persona (add or update)
  const handleSavePersona = useCallback((persona: LearnerPersona) => {
    setPersonas((prev) => {
      const exists = prev.some((p) => p.id === persona.id);
      if (exists) {
        return prev.map((p) => (p.id === persona.id ? persona : p));
      }
      return [...prev, persona];
    });
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-lxd-purple" />
          Learner Persona Builder
        </h2>
        <p className="text-muted-foreground mt-1">
          Define your target learners to personalize the learning experience
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Create at least one learner persona to proceed. This helps INSPIRE personalize content
            delivery.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Persona Button */}
      <div className="flex justify-end">
        <Button type="button" onClick={handleAddPersona}>
          <Plus className="h-4 w-4 mr-2" />
          Add Persona
        </Button>
      </div>

      {/* Persona Grid */}
      {personas.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-lxd-dark-border rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No Personas Defined</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create learner personas to help INSPIRE tailor content complexity, engagement
            strategies, and accessibility features.
          </p>
          <Button type="button" className="mt-4" onClick={handleAddPersona}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Persona
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onEdit={() => handleEditPersona(persona)}
              onDelete={() => handleDeletePersona(persona.id)}
            />
          ))}
        </div>
      )}

      {/* Persona Summary */}
      {personas.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Persona Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Personas</p>
              <p className="text-2xl font-bold text-lxd-purple">{personas.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg. Experience</p>
              <p className="text-2xl font-bold text-lxd-cyan">
                {Math.round(
                  personas.reduce((sum, p) => sum + (p.yearsExperience ?? 0), 0) / personas.length,
                )}{' '}
                yrs
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Accessibility Needs</p>
              <p className="text-2xl font-bold text-green-500">
                {personas.filter((p) => p.accessibilityNeeds.length > 0).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Unique Archetypes</p>
              <p className="text-2xl font-bold text-orange-500">
                {new Set(personas.map((p) => p.archetype)).size}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Persona Editor Dialog */}
      <PersonaEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        persona={editingPersona}
        onSave={handleSavePersona}
      />
    </div>
  );
}

export default Step1_2_Persona;
