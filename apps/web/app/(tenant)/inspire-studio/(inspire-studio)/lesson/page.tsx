'use client';

export const dynamic = 'force-dynamic';

import { DndContext, type DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import {
  Brain,
  Compass,
  Eye,
  Flame,
  Layers,
  type LucideIcon,
  PanelLeft,
  PanelLeftClose,
  Play,
  Puzzle,
  Redo,
  Rocket,
  Save,
  Target,
  Undo,
  Upload,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  CognitiveLoadMeter,
  calculateCognitiveLoad,
} from '@/components/inspire-studio/ai/cognitive-load-meter';
import { BlockPalette, type CanvasBlock, LessonCanvas } from '@/components/inspire-studio/blocks';
// INSPIRE Components
import { EditorRibbon } from '@/components/inspire-studio/ribbon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContentBlockDefinition } from '@/lib/features/inspire-studio/config/authoringBlocks';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface InspirePhaseInfo {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const INSPIRE_PHASES: InspirePhaseInfo[] = [
  {
    id: 'ignite',
    name: 'Ignite',
    icon: Flame,
    color: '#f97316',
    description: 'Capture attention and spark curiosity',
  },
  {
    id: 'navigate',
    name: 'Navigate',
    icon: Compass,
    color: '#3b82f6',
    description: 'Provide roadmap and learning objectives',
  },
  {
    id: 'scaffold',
    name: 'Scaffold',
    icon: Layers,
    color: '#a855f7',
    description: 'Build foundation with core concepts',
  },
  {
    id: 'practice',
    name: 'Practice',
    icon: Target,
    color: '#22c55e',
    description: 'Active learning and skill development',
  },
  {
    id: 'integrate',
    name: 'Integrate',
    icon: Puzzle,
    color: '#06b6d4',
    description: 'Connect concepts and apply knowledge',
  },
  {
    id: 'reflect',
    name: 'Reflect',
    icon: Eye,
    color: '#ec4899',
    description: 'Metacognition and self-assessment',
  },
  {
    id: 'extend',
    name: 'Extend',
    icon: Rocket,
    color: '#f59e0b',
    description: 'Transfer learning to new contexts',
  },
];

// =============================================================================
// INSPIRE LESSON BUILDER PAGE
// =============================================================================

export default function INSPIRELessonBuilderPage(): React.JSX.Element {
  // State
  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('scaffold');
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate cognitive load
  const cognitiveLoad = useMemo(() => {
    if (blocks.length === 0) return 0;

    const wordCount = blocks.length * 100; // Placeholder
    const imageCount = blocks.filter((b) => b.type.includes('image')).length;
    const videoCount = blocks.filter((b) => b.type.includes('video')).length;
    const interactionCount = blocks.filter((b) =>
      ['drag-drop', 'flip-cards', 'quiz', 'matching'].some((t) => b.type.includes(t)),
    ).length;
    const conceptCount = blocks.length;
    const technicality: 'low' | 'medium' | 'high' = 'medium';

    return calculateCognitiveLoad({
      wordCount,
      imageCount,
      videoCount,
      interactionCount,
      conceptCount,
      technicality,
    });
  }, [blocks]);

  // Handlers
  const handleBlocksChange = useCallback((newBlocks: CanvasBlock[]): void => {
    setBlocks(newBlocks);
    setCanUndo(true);
  }, []);

  const handleBlockSelect = useCallback(
    (block: ContentBlockDefinition): void => {
      // Add to recently used
      setRecentlyUsed((prev) => {
        const filtered = prev.filter((id) => id !== block.id);
        return [block.id, ...filtered].slice(0, 10);
      });

      // Create new block and add to canvas
      const newBlock: CanvasBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: block.id,
        blockDefinition: block,
        content: {},
        styles: {},
        inspire: {
          phase: currentPhase,
          cognitiveLoad: block.cognitiveLoad,
          estimatedTime: block.estimatedTime,
          accessibilityScore: block.accessibilityScore,
        },
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isVisible: true,
      };

      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
      setCanUndo(true);
    },
    [currentPhase],
  );

  const handleToggleFavorite = useCallback((blockId: string): void => {
    setFavorites((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId],
    );
  }, []);

  const handleBlockDelete = useCallback(
    (id: string): void => {
      setBlocks((prev) => prev.filter((block) => block.id !== id));
      if (selectedBlockId === id) {
        setSelectedBlockId(null);
      }
      setCanUndo(true);
    },
    [selectedBlockId],
  );

  const handleBlockDuplicate = useCallback(
    (id: string): void => {
      const blockToDuplicate = blocks.find((b) => b.id === id);
      if (!blockToDuplicate) return;

      const newBlock: CanvasBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const index = blocks.findIndex((b) => b.id === id);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
      setSelectedBlockId(newBlock.id);
      setCanUndo(true);
    },
    [blocks],
  );

  const handleSave = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    // Simulated save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  }, []);

  const handleUndo = useCallback((): void => {
    // Placeholder for undo functionality
    setCanUndo(false);
  }, []);

  const handleRedo = useCallback((): void => {
    // Placeholder for redo functionality
    setCanRedo(false);
  }, []);

  const currentPhaseInfo = INSPIRE_PHASES.find((p) => p.id === currentPhase);
  const CurrentPhaseIcon = currentPhaseInfo?.icon || Layers;

  return (
    <DndContext
      onDragEnd={(event: DragEndEvent) => {
        // Handle drop from palette
        if (event.active.data.current?.block) {
          handleBlockSelect(event.active.data.current.block as ContentBlockDefinition);
        }
      }}
    >
      <div className="flex flex-col h-screen bg-studio-bg-dark">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-studio-bg border-b border-studio-border/50">
          {/* Left: Lesson Title & Phase */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Untitled Lesson</h1>

            {/* Current Phase Selector */}
            <Select value={currentPhase} onValueChange={setCurrentPhase}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <div className="flex items-center gap-2">
                  <CurrentPhaseIcon
                    className="w-4 h-4"
                    style={{ color: currentPhaseInfo?.color }}
                  />
                  <SelectValue placeholder="Select phase" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {INSPIRE_PHASES.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id}>
                    <div className="flex items-center gap-2">
                      <phase.icon className="w-4 h-4" style={{ color: phase.color }} />
                      <span>{phase.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Center: Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={!canUndo}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={!canRedo}>
              <Redo className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-studio-border/50 mx-2" />
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>

          {/* Right: Preview & Publish */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button variant="default" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Publish
            </Button>
          </div>
        </div>

        {/* Editor Ribbon */}
        <EditorRibbon
          documentTitle="Untitled Lesson"
          canUndo={canUndo}
          canRedo={canRedo}
          isSaving={isSaving}
          cognitiveLoad={cognitiveLoad}
          onSave={handleSave}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onInsert={(type, options) => {
            void type;
            void options;
            // Handle block insertion from ribbon - implementation pending
          }}
        />

        {/* Main Content Area */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Block Palette Sidebar */}
          {isPaletteOpen && (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                className="bg-studio-bg-dark"
              >
                <BlockPalette
                  onBlockSelect={handleBlockSelect}
                  favorites={favorites}
                  recentlyUsed={recentlyUsed}
                  onToggleFavorite={handleToggleFavorite}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Canvas */}
          <ResizablePanel defaultSize={isPaletteOpen ? 60 : 80}>
            <div className="relative h-full">
              {/* Toggle Palette Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 left-2 z-10"
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              >
                {isPaletteOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeft className="w-4 h-4" />
                )}
              </Button>

              {/* Lesson Canvas */}
              <LessonCanvas
                blocks={blocks}
                onBlocksChange={handleBlocksChange}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onBlockDelete={handleBlockDelete}
                onBlockDuplicate={handleBlockDuplicate}
                currentPhase={currentPhase}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Sidebar - Cognitive Load & Properties */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-studio-bg-dark border-l border-studio-border/50 overflow-y-auto">
              {/* Cognitive Load Section */}
              <div className="p-4 border-b border-studio-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-studio-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Cognitive Load</h3>
                </div>
                <CognitiveLoadMeter
                  value={cognitiveLoad}
                  target={60}
                  showLabel
                  showTips
                  variant="horizontal"
                />
              </div>

              {/* INSPIRE Phase Timeline */}
              <div className="p-4 border-b border-studio-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-4">INSPIRE Phases</h3>
                <div className="space-y-2">
                  {INSPIRE_PHASES.map((phase) => {
                    const blocksInPhase = blocks.filter((b) => b.inspire.phase === phase.id);
                    const isActive = currentPhase === phase.id;
                    const PhaseIcon = phase.icon;

                    return (
                      <motion.button
                        key={phase.id}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                          isActive
                            ? 'bg-studio-surface border border-studio-accent/50'
                            : 'hover:bg-studio-surface/50',
                        )}
                        onClick={() => setCurrentPhase(phase.id)}
                        whileHover={{ x: 4 }}
                      >
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded"
                          style={{ backgroundColor: `${phase.color}20` }}
                        >
                          <PhaseIcon className="w-4 h-4" style={{ color: phase.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{phase.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {blocksInPhase.length} blocks
                          </div>
                        </div>
                        {isActive && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5"
                            style={{
                              backgroundColor: `${phase.color}20`,
                              color: phase.color,
                            }}
                          >
                            Active
                          </Badge>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Block Statistics */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Lesson Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Blocks</span>
                    <span className="font-medium text-foreground">{blocks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time</span>
                    <span className="font-medium text-foreground">
                      {Math.round(blocks.reduce((acc, b) => acc + b.inspire.estimatedTime, 0) / 60)}{' '}
                      min
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Accessibility</span>
                    <span className="font-medium text-foreground">
                      {blocks.length > 0
                        ? Math.round(
                            blocks.reduce((acc, b) => acc + b.inspire.accessibilityScore, 0) /
                              blocks.length,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>{/* Handled by LessonCanvas */}</DragOverlay>
    </DndContext>
  );
}
