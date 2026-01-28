'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Eye, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CharacterDisplay } from '@/components/ai-character/character-display';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AI_PERSONAS, type AIPersonaId, getAllPersonaIds } from '@/lib/ai-personas/persona-config';
import {
  type CharacterInfo,
  useCharacterManagement,
} from '@/lib/ai-personas/use-character-management';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

export function CharacterManager() {
  const { user } = useSafeAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [characters, setCharacters] = useState<CharacterInfo[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<AIPersonaId | null>(null);
  const [previewPersona, setPreviewPersona] = useState<AIPersonaId | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AIPersonaId | null>(null);

  const {
    listCharacters,
    uploadCharacter,
    deleteCharacter,
    isLoading,
    error,
    uploadProgress,
    clearError,
  } = useCharacterManagement({
    getAuthToken: async () => {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Not authenticated');
      return token;
    },
  });

  // Load characters on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only load on user change
  useEffect(() => {
    if (user) {
      loadCharacters();
    }
  }, [user]);

  const loadCharacters = async () => {
    try {
      const data = await listCharacters();
      setCharacters(data);
    } catch {
      toast.error('Failed to load characters');
    }
  };

  const handleFileSelect = (personaId: AIPersonaId) => {
    setSelectedPersona(personaId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPersona) return;

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.glb')) {
      toast.error('Only .glb files are allowed');
      return;
    }

    try {
      await uploadCharacter(selectedPersona, file);
      toast.success(`${AI_PERSONAS[selectedPersona].name} character uploaded!`);
      await loadCharacters();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSelectedPersona(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCharacter(deleteTarget);
      toast.success(`${AI_PERSONAS[deleteTarget].name} character removed`);
      await loadCharacters();
    } catch {
      toast.error('Failed to delete character');
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Character Customization</CardTitle>
              <CardDescription>
                Upload custom 3D characters for each AI persona. Supports .glb files up to 20MB.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadCharacters}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Upload progress */}
          <AnimatePresence>
            {isLoading && selectedPersona && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    Uploading {AI_PERSONAS[selectedPersona].name} character...
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Character grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAllPersonaIds().map((personaId) => {
              const persona = AI_PERSONAS[personaId];
              const charInfo = characters.find((c) => c.personaId === personaId);
              const Icon = persona.fallbackIcon;

              return (
                <Card
                  key={personaId}
                  className="relative overflow-hidden"
                  style={{ borderColor: `${persona.primaryColor}33` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Character preview */}
                      <div
                        className="w-20 h-20 rounded-lg flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: `${persona.primaryColor}15` }}
                      >
                        {charInfo?.hasCustom ? (
                          <div className="w-full h-full">
                            <CharacterDisplay
                              personaId={personaId}
                              state="idle"
                              className="w-full h-full scale-150"
                            />
                          </div>
                        ) : (
                          <Icon className="w-10 h-10" style={{ color: persona.primaryColor }} />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{persona.name}</h3>
                          {charInfo?.hasCustom ? (
                            <Badge
                              variant="default"
                              className="text-xs"
                              style={{ backgroundColor: persona.primaryColor }}
                            >
                              Custom
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{persona.tagline}</p>

                        {charInfo?.hasCustom && (
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>Size: {formatFileSize(charInfo.size)}</p>
                            <p>Updated: {formatDate(charInfo.updated)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleFileSelect(personaId)}
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {charInfo?.hasCustom ? 'Replace' : 'Upload'}
                      </Button>

                      {charInfo?.hasCustom && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewPersona(personaId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(personaId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>

                  {/* Custom indicator */}
                  {charInfo?.hasCustom && (
                    <div
                      className="absolute top-0 right-0 w-0 h-0"
                      style={{
                        borderTop: `24px solid ${persona.primaryColor}`,
                        borderLeft: '24px solid transparent',
                      }}
                    >
                      <Check className="absolute -top-5 right-0.5 h-3 w-3 text-white" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Help text */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Character Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>File format: GLB (GLTF Binary)</li>
              <li>Maximum size: 20MB</li>
              <li>Recommended poly count: Under 50,000 triangles</li>
              <li>Required animations: Idle, Thinking, Talking, Listening, Victory, Defeated</li>
              <li>Optional: Morph targets for lip sync (mouthOpen, jawOpen)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Character?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the custom character for{' '}
              <strong>{deleteTarget && AI_PERSONAS[deleteTarget].name}</strong>. The default
              platform character will be used instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview dialog */}
      <AnimatePresence>
        {previewPersona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewPersona(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card rounded-lg shadow-lg w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Preview: {AI_PERSONAS[previewPersona].name}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewPersona(null)}
                >
                  Close
                </Button>
              </div>
              <div className="h-80">
                <CharacterDisplay
                  personaId={previewPersona}
                  state="idle"
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  {AI_PERSONAS[previewPersona].description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
