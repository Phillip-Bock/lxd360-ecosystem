'use client';

/**
 * NodeProperties - Phase 14/17
 * Properties panel for editing scenario nodes
 */

import {
  Clock,
  Grip,
  Image as ImageIcon,
  Music,
  Plus,
  Trash2,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import NextImage from 'next/image';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  AssessmentNodeData,
  BranchNodeData,
  Character,
  DecisionNodeData,
  DialogueNodeData,
  EndNodeData,
  FeedbackNodeData,
  InventoryItem,
  Meter,
  ScenarioNode,
  ScenarioNodeData,
  SceneNodeData,
  Variable,
} from '@/types/studio/scenario';
import { NODE_CONFIGS } from './scenario-canvas';

// =============================================================================
// TYPES
// =============================================================================

interface NodePropertiesProps {
  node: ScenarioNode | null;
  characters: Character[];
  variables: Variable[];
  meters: Meter[];
  inventoryItems: InventoryItem[];
  allNodes: ScenarioNode[];
  onChange: (node: ScenarioNode) => void;
  onClose: () => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function NodeProperties({
  node,
  characters,
  variables,
  meters: _meters,
  inventoryItems: _inventoryItems,
  allNodes,
  onChange,
  onClose,
}: NodePropertiesProps) {
  const updateData = useCallback(
    <T extends ScenarioNodeData>(updates: Partial<T>) => {
      if (!node) return;
      onChange({
        ...node,
        data: { ...node.data, ...updates } as ScenarioNodeData,
      });
    },
    [node, onChange],
  );

  if (!node) {
    return (
      <div className="w-80 border-l bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a node to edit</p>
      </div>
    );
  }

  const config = NODE_CONFIGS[node.type];

  return (
    <div className="w-96 border-l bg-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <config.icon className={cn('h-5 w-5', config.color)} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{node.data.title || config.label}</h3>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="general" className="p-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={node.data.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder={config.label}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={node.position.x}
                  onChange={(e) =>
                    onChange({
                      ...node,
                      position: { ...node.position, x: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={node.position.y}
                  onChange={(e) =>
                    onChange({
                      ...node,
                      position: { ...node.position, y: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Node ID: <code className="bg-muted px-1 rounded">{node.id}</code>
              </p>
            </div>
          </TabsContent>

          {/* Content Tab - Node Type Specific */}
          <TabsContent value="content" className="mt-4">
            {node.data.nodeType === 'scene' && (
              <SceneProperties data={node.data} characters={characters} onChange={updateData} />
            )}
            {node.data.nodeType === 'decision' && (
              <DecisionProperties
                data={node.data}
                allNodes={allNodes}
                variables={variables}
                onChange={updateData}
              />
            )}
            {node.data.nodeType === 'dialogue' && (
              <DialogueProperties data={node.data} characters={characters} onChange={updateData} />
            )}
            {node.data.nodeType === 'feedback' && (
              <FeedbackProperties data={node.data} allNodes={allNodes} onChange={updateData} />
            )}
            {node.data.nodeType === 'assessment' && (
              <AssessmentProperties data={node.data} allNodes={allNodes} onChange={updateData} />
            )}
            {node.data.nodeType === 'branch' && (
              <BranchProperties
                data={node.data}
                allNodes={allNodes}
                variables={variables}
                onChange={updateData}
              />
            )}
            {node.data.nodeType === 'end' && (
              <EndProperties data={node.data} onChange={updateData} />
            )}
            {/* Add more node type specific editors as needed */}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <NodeSettingsTab node={node} onChange={onChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// =============================================================================
// SCENE PROPERTIES
// =============================================================================

function SceneProperties({
  data,
  characters,
  onChange,
}: {
  data: SceneNodeData;
  characters: Character[];
  onChange: (updates: Partial<SceneNodeData>) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Background */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4" />
          Background
        </div>

        <div className="space-y-3 pl-6">
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              className="w-full p-2 rounded-md border bg-background text-sm"
              value={data.background.type}
              onChange={(e) =>
                onChange({
                  background: {
                    ...data.background,
                    type: e.target.value as SceneNodeData['background']['type'],
                  },
                })
              }
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="360-image">360° Image</option>
              <option value="360-video">360° Video</option>
              <option value="3d-scene">3D Scene</option>
              <option value="color">Solid Color</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          {(data.background.type === 'image' || data.background.type === '360-image') && (
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={data.background.src || ''}
                onChange={(e) =>
                  onChange({
                    background: { ...data.background, src: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>
          )}

          {(data.background.type === 'video' || data.background.type === '360-video') && (
            <>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={data.background.src || ''}
                  onChange={(e) =>
                    onChange({
                      background: { ...data.background, src: e.target.value },
                    })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={data.background.videoSettings?.autoplay ?? true}
                    onChange={(e) =>
                      onChange({
                        background: {
                          ...data.background,
                          videoSettings: {
                            ...data.background.videoSettings,
                            autoplay: e.target.checked,
                            loop: data.background.videoSettings?.loop ?? false,
                            muted: data.background.videoSettings?.muted ?? false,
                          },
                        },
                      })
                    }
                  />
                  Autoplay
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={data.background.videoSettings?.loop ?? false}
                    onChange={(e) =>
                      onChange({
                        background: {
                          ...data.background,
                          videoSettings: {
                            ...data.background.videoSettings,
                            autoplay: data.background.videoSettings?.autoplay ?? true,
                            loop: e.target.checked,
                            muted: data.background.videoSettings?.muted ?? false,
                          },
                        },
                      })
                    }
                  />
                  Loop
                </label>
              </div>
            </>
          )}

          {data.background.type === 'color' && (
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.background.color || '#000000'}
                  onChange={(e) =>
                    onChange({
                      background: { ...data.background, color: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={data.background.color || ''}
                  onChange={(e) =>
                    onChange({
                      background: { ...data.background, color: e.target.value },
                    })
                  }
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Characters */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Characters ({data.characters.length})
          </div>
          <Button variant="ghost" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2 pl-6">
          {data.characters.map((char, index) => {
            const character = characters.find((c) => c.id === char.characterId);
            return (
              <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Grip className="h-3 w-3 text-muted-foreground cursor-grab" />
                {character?.avatarUrl && (
                  <NextImage
                    src={character.avatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{character?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {typeof char.position === 'string' ? char.position : 'Custom'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          {data.characters.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No characters on this scene
            </p>
          )}
        </div>
      </section>

      {/* Audio */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Volume2 className="h-4 w-4" />
          Audio
        </div>

        <div className="space-y-3 pl-6">
          {data.audio ? (
            <div className="p-2 rounded-md bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm capitalize">{data.audio.type}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onChange({ audio: undefined })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={data.audio.src}
                onChange={(e) =>
                  onChange({
                    audio: {
                      ...(data.audio ?? {
                        type: 'music' as const,
                        src: '',
                        volume: 1,
                        loop: false,
                      }),
                      src: e.target.value,
                    },
                  })
                }
                placeholder="Audio URL"
                className="text-xs"
              />
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full">
              <Music className="h-3 w-3 mr-1" />
              Add Audio
            </Button>
          )}
        </div>
      </section>

      {/* Timing */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          Timing
        </div>

        <div className="space-y-3 pl-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.autoAdvance}
              onChange={(e) => onChange({ autoAdvance: e.target.checked })}
            />
            Auto-advance to next scene
          </label>

          {data.autoAdvance && (
            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input
                type="number"
                min={0}
                value={data.duration || 0}
                onChange={(e) => onChange({ duration: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// DECISION PROPERTIES
// =============================================================================

function DecisionProperties({
  data,
  allNodes,
  variables: _variables,
  onChange,
}: {
  data: DecisionNodeData;
  allNodes: ScenarioNode[];
  variables: Variable[];
  onChange: (updates: Partial<DecisionNodeData>) => void;
}) {
  const addChoice = () => {
    onChange({
      choices: [
        ...data.choices,
        {
          id: `choice_${Date.now()}`,
          label: `Choice ${data.choices.length + 1}`,
          targetNodeId: '',
        },
      ],
    });
  };

  const updateChoice = (index: number, updates: Partial<(typeof data.choices)[0]>) => {
    const newChoices = [...data.choices];
    newChoices[index] = { ...newChoices[index], ...updates };
    onChange({ choices: newChoices });
  };

  const removeChoice = (index: number) => {
    onChange({ choices: data.choices.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <section className="space-y-3">
        <Label>Prompt / Question</Label>
        <Textarea
          value={data.prompt || ''}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="What will you do?"
          rows={3}
        />
      </section>

      {/* Choices */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Choices ({data.choices.length})</Label>
          <Button variant="ghost" size="sm" onClick={addChoice}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {data.choices.map((choice, index) => (
            <div key={choice.id} className="p-3 rounded-lg border bg-muted/30 space-y-3">
              <div className="flex items-start gap-2">
                <Grip className="h-4 w-4 text-muted-foreground mt-2 cursor-grab" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={choice.label}
                    onChange={(e) => updateChoice(index, { label: e.target.value })}
                    placeholder="Choice text"
                  />
                  <Textarea
                    value={choice.description || ''}
                    onChange={(e) => updateChoice(index, { description: e.target.value })}
                    placeholder="Description (optional)"
                    rows={2}
                    className="text-xs"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeChoice(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="pl-6 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Navigate to</Label>
                  <select
                    className="w-full p-2 rounded-md border bg-background text-sm"
                    value={choice.targetNodeId}
                    onChange={(e) => updateChoice(index, { targetNodeId: e.target.value })}
                  >
                    <option value="">Select target...</option>
                    {allNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.data.title || NODE_CONFIGS[n.type].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Points</Label>
                    <Input
                      type="number"
                      value={choice.points || 0}
                      onChange={(e) =>
                        updateChoice(index, { points: parseInt(e.target.value, 10) || 0 })
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs pt-5">
                    <input
                      type="checkbox"
                      checked={choice.isCorrect || false}
                      onChange={(e) => updateChoice(index, { isCorrect: e.target.checked })}
                    />
                    Correct
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Time Limit */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <Label>Time Limit</Label>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={0}
            value={data.timeLimit || ''}
            onChange={(e) =>
              onChange({ timeLimit: e.target.value ? parseInt(e.target.value, 10) : undefined })
            }
            placeholder="No limit"
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">seconds</span>
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// DIALOGUE PROPERTIES
// =============================================================================

function DialogueProperties({
  data,
  characters,
  onChange,
}: {
  data: DialogueNodeData;
  characters: Character[];
  onChange: (updates: Partial<DialogueNodeData>) => void;
}) {
  const addLine = () => {
    onChange({
      lines: [...data.lines, { id: `line_${Date.now()}`, text: '' }],
    });
  };

  const updateLine = (index: number, updates: Partial<(typeof data.lines)[0]>) => {
    const newLines = [...data.lines];
    newLines[index] = { ...newLines[index], ...updates };
    onChange({ lines: newLines });
  };

  const removeLine = (index: number) => {
    onChange({ lines: data.lines.filter((_, i) => i !== index) });
  };

  const character = characters.find((c) => c.id === data.characterId);

  return (
    <div className="space-y-6">
      {/* Speaker */}
      <section className="space-y-3">
        <Label>Speaker</Label>
        <select
          className="w-full p-2 rounded-md border bg-background text-sm"
          value={data.characterId}
          onChange={(e) => onChange({ characterId: e.target.value })}
        >
          <option value="">Select character...</option>
          {characters.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name}
            </option>
          ))}
        </select>

        {character && (
          <div className="space-y-2">
            <Label>Expression</Label>
            <div className="flex gap-2 flex-wrap">
              {character.expressions.map((expr) => (
                <button
                  key={expr.id}
                  type="button"
                  className={cn(
                    'w-12 h-12 rounded-lg border-2 overflow-hidden',
                    data.expression === expr.id
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground/50',
                  )}
                  onClick={() => onChange({ expression: expr.id })}
                >
                  <NextImage src={expr.imageUrl} alt={expr.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Lines */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Dialogue Lines ({data.lines.length})</Label>
          <Button variant="ghost" size="sm" onClick={addLine}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {data.lines.map((line, index) => (
            <div key={line.id} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground w-4 pt-2">{index + 1}</span>
              <Textarea
                value={line.text}
                onChange={(e) => updateLine(index, { text: e.target.value })}
                placeholder="Dialogue text..."
                rows={2}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mt-1"
                onClick={() => removeLine(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Display Style */}
      <section className="space-y-3">
        <Label>Text Box Style</Label>
        <select
          className="w-full p-2 rounded-md border bg-background text-sm"
          value={data.textboxStyle}
          onChange={(e) =>
            onChange({ textboxStyle: e.target.value as DialogueNodeData['textboxStyle'] })
          }
        >
          <option value="bottom">Bottom Bar</option>
          <option value="floating">Floating</option>
          <option value="speech-bubble">Speech Bubble</option>
          <option value="side">Side Panel</option>
          <option value="fullscreen">Fullscreen</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.typewriterEffect}
            onChange={(e) => onChange({ typewriterEffect: e.target.checked })}
          />
          Typewriter effect
        </label>
      </section>
    </div>
  );
}

// =============================================================================
// FEEDBACK PROPERTIES
// =============================================================================

function FeedbackProperties({
  data,
  allNodes,
  onChange,
}: {
  data: FeedbackNodeData;
  allNodes: ScenarioNode[];
  onChange: (updates: Partial<FeedbackNodeData>) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Label>Variant</Label>
        <div className="flex gap-2 flex-wrap">
          {(['success', 'error', 'info', 'tip', 'neutral'] as const).map((variant) => (
            <Button
              key={variant}
              variant={data.variant === variant ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ variant })}
              className="capitalize"
            >
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Label>Heading</Label>
        <Input
          value={data.heading || ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Feedback heading"
        />
      </section>

      <section className="space-y-3">
        <Label>Message</Label>
        <Textarea
          value={data.message}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Feedback message..."
          rows={4}
        />
      </section>

      <section className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.showExplanation || false}
            onChange={(e) => onChange({ showExplanation: e.target.checked })}
          />
          Show explanation
        </label>

        {data.showExplanation && (
          <Textarea
            value={data.explanationText || ''}
            onChange={(e) => onChange({ explanationText: e.target.value })}
            placeholder="Explanation text..."
            rows={3}
          />
        )}
      </section>

      <section className="space-y-3">
        <Label>Continue To</Label>
        <select
          className="w-full p-2 rounded-md border bg-background text-sm"
          value={data.targetNodeId || ''}
          onChange={(e) => onChange({ targetNodeId: e.target.value })}
        >
          <option value="">Select target...</option>
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.data.title || NODE_CONFIGS[n.type].label}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}

// =============================================================================
// ASSESSMENT PROPERTIES
// =============================================================================

function AssessmentProperties({
  data,
  allNodes,
  onChange,
}: {
  data: AssessmentNodeData;
  allNodes: ScenarioNode[];
  onChange: (updates: Partial<AssessmentNodeData>) => void;
}) {
  const addOption = () => {
    onChange({
      options: [...(data.options || []), { id: `opt_${Date.now()}`, text: '', isCorrect: false }],
    });
  };

  const updateOption = (index: number, updates: Partial<NonNullable<typeof data.options>[0]>) => {
    const newOptions = [...(data.options || [])];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    onChange({ options: (data.options || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Label>Question Type</Label>
        <select
          className="w-full p-2 rounded-md border bg-background text-sm"
          value={data.questionType}
          onChange={(e) =>
            onChange({ questionType: e.target.value as AssessmentNodeData['questionType'] })
          }
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="multiple-select">Multiple Select</option>
          <option value="true-false">True/False</option>
          <option value="fill-blank">Fill in the Blank</option>
          <option value="matching">Matching</option>
          <option value="ordering">Ordering</option>
          <option value="hotspot">Hotspot</option>
        </select>
      </section>

      <section className="space-y-3">
        <Label>Question</Label>
        <Textarea
          value={data.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Enter your question..."
          rows={3}
        />
      </section>

      {(data.questionType === 'multiple-choice' ||
        data.questionType === 'multiple-select' ||
        data.questionType === 'true-false') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button variant="ghost" size="sm" onClick={addOption}>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {(data.options || []).map((opt, index) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={opt.isCorrect}
                  onChange={(e) => updateOption(index, { isCorrect: e.target.checked })}
                  title="Mark as correct"
                />
                <Input
                  value={opt.text}
                  onChange={(e) => updateOption(index, { text: e.target.value })}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="space-y-2 flex-1">
            <Label>Points</Label>
            <Input
              type="number"
              min={0}
              value={data.points}
              onChange={(e) => onChange({ points: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label>Max Attempts</Label>
            <Input
              type="number"
              min={1}
              value={data.maxAttempts}
              onChange={(e) => onChange({ maxAttempts: parseInt(e.target.value, 10) || 1 })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Label>Routing</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">If Correct</Label>
            <select
              className="w-full p-2 rounded-md border bg-background text-sm"
              value={data.correctTargetId}
              onChange={(e) => onChange({ correctTargetId: e.target.value })}
            >
              <option value="">Select...</option>
              {allNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.data.title || NODE_CONFIGS[n.type].label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">If Incorrect</Label>
            <select
              className="w-full p-2 rounded-md border bg-background text-sm"
              value={data.incorrectTargetId}
              onChange={(e) => onChange({ incorrectTargetId: e.target.value })}
            >
              <option value="">Select...</option>
              {allNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.data.title || NODE_CONFIGS[n.type].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// BRANCH PROPERTIES
// =============================================================================

function BranchProperties({
  data,
  allNodes,
  variables,
  onChange,
}: {
  data: BranchNodeData;
  allNodes: ScenarioNode[];
  variables: Variable[];
  onChange: (updates: Partial<BranchNodeData>) => void;
}) {
  const addCondition = () => {
    onChange({
      conditions: [
        ...data.conditions,
        {
          id: `cond_${Date.now()}`,
          label: `Condition ${data.conditions.length + 1}`,
          expression: { type: 'simple' },
          targetNodeId: '',
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Conditions</Label>
          <Button variant="ghost" size="sm" onClick={addCondition}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {data.conditions.map((cond, index) => (
            <div key={cond.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <Input
                value={cond.label}
                onChange={(e) => {
                  const newConds = [...data.conditions];
                  newConds[index] = { ...cond, label: e.target.value };
                  onChange({ conditions: newConds });
                }}
                placeholder="Condition label"
              />

              <div className="flex gap-2">
                <select
                  className="flex-1 p-2 rounded-md border bg-background text-sm"
                  value={cond.expression.variableId || ''}
                  onChange={(e) => {
                    const newConds = [...data.conditions];
                    newConds[index] = {
                      ...cond,
                      expression: { ...cond.expression, variableId: e.target.value },
                    };
                    onChange({ conditions: newConds });
                  }}
                >
                  <option value="">Variable...</option>
                  {variables.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-20 p-2 rounded-md border bg-background text-sm"
                  value={cond.expression.operator || 'eq'}
                  onChange={(e) => {
                    const newConds = [...data.conditions];
                    newConds[index] = {
                      ...cond,
                      expression: {
                        ...cond.expression,
                        operator: e.target.value as 'eq' | 'neq' | 'gt',
                      },
                    };
                    onChange({ conditions: newConds });
                  }}
                >
                  <option value="eq">=</option>
                  <option value="neq">≠</option>
                  <option value="gt">&gt;</option>
                  <option value="gte">≥</option>
                  <option value="lt">&lt;</option>
                  <option value="lte">≤</option>
                </select>
                <Input
                  className="w-24"
                  placeholder="Value"
                  value={String(cond.expression.value || '')}
                  onChange={(e) => {
                    const newConds = [...data.conditions];
                    newConds[index] = {
                      ...cond,
                      expression: { ...cond.expression, value: e.target.value },
                    };
                    onChange({ conditions: newConds });
                  }}
                />
              </div>

              <select
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={cond.targetNodeId}
                onChange={(e) => {
                  const newConds = [...data.conditions];
                  newConds[index] = { ...cond, targetNodeId: e.target.value };
                  onChange({ conditions: newConds });
                }}
              >
                <option value="">Navigate to...</option>
                {allNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.title || NODE_CONFIGS[n.type].label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Label>Default (else)</Label>
        <select
          className="w-full p-2 rounded-md border bg-background text-sm"
          value={data.defaultTargetId}
          onChange={(e) => onChange({ defaultTargetId: e.target.value })}
        >
          <option value="">Select...</option>
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.data.title || NODE_CONFIGS[n.type].label}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}

// =============================================================================
// END PROPERTIES
// =============================================================================

function EndProperties({
  data,
  onChange,
}: {
  data: EndNodeData;
  onChange: (updates: Partial<EndNodeData>) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Label>End Type</Label>
        <div className="flex gap-2 flex-wrap">
          {(['success', 'failure', 'neutral', 'custom'] as const).map((type) => (
            <Button
              key={type}
              variant={data.endType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ endType: type })}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Label>Heading</Label>
        <Input
          value={data.heading || ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Congratulations!"
        />
      </section>

      <section className="space-y-3">
        <Label>Message</Label>
        <Textarea
          value={data.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Final message to the learner..."
          rows={4}
        />
      </section>

      <section className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.showSummary}
            onChange={(e) => onChange({ showSummary: e.target.checked })}
          />
          Show results summary
        </label>

        {data.showSummary && (
          <div className="pl-6 space-y-2">
            {(['showScore', 'showTime', 'showChoices', 'showPath'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.summaryConfig?.[key] ?? true}
                  onChange={(e) =>
                    onChange({
                      summaryConfig: {
                        ...data.summaryConfig,
                        showScore: data.summaryConfig?.showScore ?? true,
                        showTime: data.summaryConfig?.showTime ?? true,
                        showChoices: data.summaryConfig?.showChoices ?? true,
                        showPath: data.summaryConfig?.showPath ?? true,
                        showMeters: data.summaryConfig?.showMeters ?? false,
                        showAchievements: data.summaryConfig?.showAchievements ?? false,
                        [key]: e.target.checked,
                      },
                    })
                  }
                />
                {key.replace('show', 'Show ')}
              </label>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// =============================================================================
// NODE SETTINGS TAB
// =============================================================================

function NodeSettingsTab({
  node: _node,
  onChange: _onChange,
}: {
  node: ScenarioNode;
  onChange: (node: ScenarioNode) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Advanced settings for this node.</p>

      {/* Add node-specific settings here */}
      <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 text-center text-sm text-muted-foreground">
        Settings panel coming soon
      </div>
    </div>
  );
}

export default NodeProperties;
