'use client';

/**
 * LessonRibbon - Full Office-style ribbon for the Lesson Editor
 * Uses ribbon primitives from @/components/ribbon
 * All tabs visible at all times, contextual tabs appear based on selection
 */

import {
  Brain,
  Eye,
  FileText,
  Gauge,
  HelpCircle,
  ImageIcon,
  MousePointer2,
  Music,
  Palette,
  Redo,
  Save,
  Sparkles,
  Undo,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import {
  Ribbon,
  RibbonQuickAccess,
  RibbonTab,
  RibbonTabList,
  RibbonTabPanel,
  RibbonTabs,
} from '@/components/ribbon';
import {
  AudioToolsTab,
  ImageToolsTab,
  QuizToolsTab,
  VideoToolsTab,
} from '@/components/ribbon/contextual-tabs';
import { ExportDialog } from '@/components/studio/export';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { InspireStage } from '@/lib/cognitive-load';
import type { CanvasBlock } from '../lesson-canvas';
import { AudioEditor } from '../tools/audio-editor';
import { CognitiveLoadMeter } from '../tools/cognitive-load-panel';
import { ImageEditor } from '../tools/image-editor';
import { TTSPanel } from '../tools/tts-panel';
import { VideoEditor } from '../tools/video-editor';
import {
  AIStudioTab,
  CLTTab,
  DesignTab,
  HomeTab,
  InsertTab,
  InteractionsTab,
  ReviewTab,
} from './tabs';

type SelectedBlockType = 'none' | 'image' | 'video' | 'audio' | 'text' | 'quiz';

export interface LessonRibbonProps {
  // Lesson data
  lessonId?: string;
  lessonTitle?: string;
  lessonDuration?: string;
  onTitleChange?: (title: string) => void;
  onDurationChange?: (duration: string) => void;

  // Blocks
  blocks?: CanvasBlock[];
  selectedBlock?: CanvasBlock | null;
  selectedBlockType?: SelectedBlockType;
  onUpdateBlock?: (id: string, updates: Partial<CanvasBlock>) => void;
  onDeleteBlock?: (id: string) => void;
  onDuplicateBlock?: (id: string) => void;
  onAddBlock?: (type: string) => void;

  // INSPIRE methodology
  inspireStage?: InspireStage;
  onInspireStageChange?: (stage: InspireStage) => void;

  // Undo/Redo
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;

  // Save state
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
  onSave?: () => void;
}

/**
 * LessonRibbon - Comprehensive Office-style ribbon for lesson editing
 */
export function LessonRibbon({
  lessonId = '',
  lessonTitle = '',
  lessonDuration = '15',
  onTitleChange,
  onDurationChange,
  blocks = [],
  selectedBlock,
  selectedBlockType = 'none',
  onUpdateBlock: _onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onAddBlock,
  inspireStage = 'scaffold',
  onInspireStageChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isSaving = false,
  hasUnsavedChanges = false,
  lastSaved = null,
  onSave,
}: LessonRibbonProps) {
  // Dialog states
  const [audioEditorOpen, setAudioEditorOpen] = useState(false);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [ttsDialogOpen, setTtsDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Show contextual tabs based on selection
  const showImageTools = selectedBlockType === 'image';
  const showVideoTools = selectedBlockType === 'video';
  const showAudioTools = selectedBlockType === 'audio';
  const showQuizTools = selectedBlockType === 'quiz';

  // Quick access actions
  const quickAccessActions = [
    {
      id: 'save',
      icon: Save,
      label: 'Save',
      shortcut: 'Ctrl+S',
      onClick: onSave || (() => {}),
    },
    {
      id: 'undo',
      icon: Undo,
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      onClick: onUndo || (() => {}),
    },
    {
      id: 'redo',
      icon: Redo,
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      onClick: onRedo || (() => {}),
    },
  ];

  // Create lesson data for export
  const lessonData = {
    id: lessonId || 'lesson-1',
    title: lessonTitle || 'Untitled Lesson',
    description: '',
    version: '1.0.0',
    slides: blocks.map((block, index) => ({
      id: block.id,
      title: `Slide ${index + 1}`,
      index,
      blocks: [
        {
          id: block.id,
          type: block.type,
          content: block.content,
          config: {},
        },
      ],
    })),
    assets: [],
    metadata: {},
  };

  // Convert blocks to content format for CLT
  const cltContent = {
    text: blocks.map((b) => (typeof b.content?.text === 'string' ? b.content.text : '')).join(' '),
    blocks: blocks.map((b) => ({
      type: b.type,
      content: typeof b.content?.text === 'string' ? b.content.text : '',
    })),
  };

  // Block insertion handler
  const handleInsertBlock = (type: string) => {
    onAddBlock?.(type);
  };

  return (
    <div className="bg-(--inspire-canvas-bg) border-b border-(--inspire-separator-light) shadow-xs">
      <Ribbon defaultTab="home">
        {/* Quick Access Toolbar */}
        <RibbonQuickAccess actions={quickAccessActions} />

        <RibbonTabs>
          {/* Tab List */}
          <RibbonTabList className="bg-(--navy-100)/50">
            {/* Main Tabs - Always visible */}
            <RibbonTab value="home">
              <FileText className="h-4 w-4 mr-1.5 text-(--navy-500)" />
              Home
            </RibbonTab>
            <RibbonTab value="insert">
              <Sparkles className="h-4 w-4 mr-1.5 text-(--navy-500)" />
              Insert
            </RibbonTab>
            <RibbonTab value="design">
              <Palette className="h-4 w-4 mr-1.5 text-(--navy-500)" />
              Design
            </RibbonTab>
            <RibbonTab value="interactions">
              <MousePointer2 className="h-4 w-4 mr-1.5 text-(--navy-500)" />
              Interactions
            </RibbonTab>
            <RibbonTab value="clt">
              <Gauge className="h-4 w-4 mr-1.5 text-(--navy-500)" />
              CLT
            </RibbonTab>
            <RibbonTab value="ai-studio">
              <Brain className="h-4 w-4 mr-1.5 text-(--navy-500)" />
              AI Studio
            </RibbonTab>
            <RibbonTab value="review">
              <Eye className="h-4 w-4 mr-1.5 text-(--navy-500)" />
              Review
            </RibbonTab>

            {/* Contextual Tabs - Appear based on selection */}
            {(showImageTools || showVideoTools || showAudioTools || showQuizTools) && (
              <div className="h-6 w-px bg-(--navy-300) mx-2 my-auto" />
            )}

            {showImageTools && (
              <RibbonTab
                value="image-tools"
                className="bg-purple-50 text-purple-700 data-[state=active]:bg-purple-100"
              >
                <ImageIcon className="h-4 w-4 mr-1.5" />
                Image Tools
              </RibbonTab>
            )}

            {showVideoTools && (
              <RibbonTab
                value="video-tools"
                className="bg-cyan-50 text-cyan-700 data-[state=active]:bg-cyan-100"
              >
                <Video className="h-4 w-4 mr-1.5" />
                Video Tools
              </RibbonTab>
            )}

            {showAudioTools && (
              <RibbonTab
                value="audio-tools"
                className="bg-green-50 text-green-700 data-[state=active]:bg-green-100"
              >
                <Music className="h-4 w-4 mr-1.5" />
                Audio Tools
              </RibbonTab>
            )}

            {showQuizTools && (
              <RibbonTab
                value="quiz-tools"
                className="bg-amber-50 text-amber-700 data-[state=active]:bg-amber-100"
              >
                <HelpCircle className="h-4 w-4 mr-1.5" />
                Quiz Tools
              </RibbonTab>
            )}

            {/* CLT Meter on right side of tab bar */}
            <div className="ml-auto flex items-center pr-2">
              <CognitiveLoadMeter />
            </div>
          </RibbonTabList>

          {/* Tab Panels */}
          <RibbonTabPanel value="home">
            <HomeTab
              lessonTitle={lessonTitle}
              lessonDuration={lessonDuration}
              onTitleChange={onTitleChange}
              onDurationChange={onDurationChange}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={onUndo}
              onRedo={onRedo}
              onSave={onSave}
              onPreview={() => window.open('/preview/lesson/', '_blank')}
              onPublish={() => setExportDialogOpen(true)}
              onExport={() => setExportDialogOpen(true)}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSaved={lastSaved}
            />
          </RibbonTabPanel>

          <RibbonTabPanel value="insert">
            <InsertTab
              onInsertParagraph={() => handleInsertBlock('paragraph')}
              onInsertHeading={(level) => handleInsertBlock(`heading-${level}`)}
              onInsertList={(type) => handleInsertBlock(`list-${type}`)}
              onInsertQuote={() => handleInsertBlock('quote')}
              onInsertCode={() => handleInsertBlock('code')}
              onInsertImage={() => {
                handleInsertBlock('image');
                setImageEditorOpen(true);
              }}
              onInsertVideo={() => {
                handleInsertBlock('video');
                setVideoEditorOpen(true);
              }}
              onInsertAudio={() => {
                handleInsertBlock('audio');
                setAudioEditorOpen(true);
              }}
              onInsertEmbed={() => handleInsertBlock('embed')}
              onInsertFile={() => handleInsertBlock('file')}
              onInsertAccordion={() => handleInsertBlock('accordion')}
              onInsertTabs={() => handleInsertBlock('tabs')}
              onInsertFlipCard={() => handleInsertBlock('flip-card')}
              onInsertHotspot={() => handleInsertBlock('hotspot')}
              onInsertDragDrop={() => handleInsertBlock('drag-drop')}
              onInsertClickReveal={() => handleInsertBlock('click-reveal')}
              onInsertTable={() => handleInsertBlock('table')}
              onInsertChart={() => handleInsertBlock('chart')}
              onInsertDiagram={() => handleInsertBlock('diagram')}
              onInsertTimeline={() => handleInsertBlock('timeline')}
              onInsertProcessFlow={() => handleInsertBlock('process-flow')}
              onInsertMultipleChoice={() => handleInsertBlock('multiple-choice')}
              onInsertMultipleSelect={() => handleInsertBlock('multiple-select')}
              onInsertTrueFalse={() => handleInsertBlock('true-false')}
              onInsertFillBlank={() => handleInsertBlock('fill-blank')}
              onInsertMatching={() => handleInsertBlock('matching')}
              onInsertOrdering={() => handleInsertBlock('ordering')}
              onInsertShortAnswer={() => handleInsertBlock('short-answer')}
              onInsertQuickPoll={() => handleInsertBlock('quick-poll')}
              onInsertReflection={() => handleInsertBlock('reflection')}
              onInsertScenarioBranch={() => handleInsertBlock('scenario-branch')}
              onInsertKnowledgeGate={() => handleInsertBlock('knowledge-gate')}
              onInsertPointsAward={() => handleInsertBlock('points-award')}
              onInsertBadgeTrigger={() => handleInsertBlock('badge-trigger')}
              onInsertLeaderboard={() => handleInsertBlock('leaderboard')}
              onInsertProgressMilestone={() => handleInsertBlock('progress-milestone')}
              onInsertColumns={(count) => handleInsertBlock(`columns-${count}`)}
              onInsertDivider={() => handleInsertBlock('divider')}
              onInsertSpacer={() => handleInsertBlock('spacer')}
              onInsertCard={() => handleInsertBlock('card-container')}
              onInsertCallout={() => handleInsertBlock('callout')}
              onInsert3DModel={() => handleInsertBlock('3d-model')}
              onInsertVRScene={() => handleInsertBlock('vr-ar-scene')}
              onInsertSimulation={() => handleInsertBlock('simulation')}
              onInsertBranchingScenario={() => handleInsertBlock('branching-scenario')}
              onInsertCustomHTML={() => handleInsertBlock('custom-html')}
            />
          </RibbonTabPanel>

          <RibbonTabPanel value="design">
            <DesignTab />
          </RibbonTabPanel>

          <RibbonTabPanel value="interactions">
            <InteractionsTab
              onAddQuiz={() => handleInsertBlock('multiple-choice')}
              onAddPoll={() => handleInsertBlock('quick-poll')}
              onAddReflection={() => handleInsertBlock('reflection')}
              onAddHotspot={() => handleInsertBlock('hotspot')}
              onAddClickReveal={() => handleInsertBlock('click-reveal')}
              onAddAccordion={() => handleInsertBlock('accordion')}
              onAddTabs={() => handleInsertBlock('tabs')}
              onAddFlipCard={() => handleInsertBlock('flip-card')}
              onAddDragDrop={() => handleInsertBlock('drag-drop')}
              onAddBranch={() => handleInsertBlock('scenario-branch')}
              onAddKnowledgeGate={() => handleInsertBlock('knowledge-gate')}
              onAddPointsAward={() => handleInsertBlock('points-award')}
              onAddBadgeTrigger={() => handleInsertBlock('badge-trigger')}
              onAddLeaderboard={() => handleInsertBlock('leaderboard')}
              onAddProgressMilestone={() => handleInsertBlock('progress-milestone')}
            />
          </RibbonTabPanel>

          <RibbonTabPanel value="clt">
            <CLTTab
              content={cltContent}
              inspireStage={inspireStage}
              onInspireStageChange={onInspireStageChange}
              onOptimize={() => {
                // AI optimization - to be implemented
              }}
            />
          </RibbonTabPanel>

          <RibbonTabPanel value="ai-studio">
            <AIStudioTab
              onOpenTTS={() => setTtsDialogOpen(true)}
              onGenerateNarration={() => setTtsDialogOpen(true)}
            />
          </RibbonTabPanel>

          <RibbonTabPanel value="review">
            <ReviewTab onPreviewNewTab={() => window.open('/preview/lesson/', '_blank')} />
          </RibbonTabPanel>

          {/* Contextual Tab Panels */}
          {showImageTools && (
            <RibbonTabPanel value="image-tools">
              <ImageToolsTab
                onOpenCrop={() => setImageEditorOpen(true)}
                onGenerateAltText={() => {
                  // AI alt text - to be implemented
                }}
                onReplaceImage={() => {
                  // Replace image - to be implemented
                }}
                onDuplicate={() => selectedBlock && onDuplicateBlock?.(selectedBlock.id)}
                onDelete={() => selectedBlock && onDeleteBlock?.(selectedBlock.id)}
                onOpenSettings={() => {
                  // Image settings - to be implemented
                }}
              />
            </RibbonTabPanel>
          )}

          {showVideoTools && (
            <RibbonTabPanel value="video-tools">
              <VideoToolsTab
                onOpenTrimEditor={() => setVideoEditorOpen(true)}
                onAddChapter={() => {
                  // Add chapter - to be implemented
                }}
                onManageChapters={() => {
                  // Manage chapters - to be implemented
                }}
                onGenerateChapters={() => {
                  // AI generate chapters - to be implemented
                }}
                onAddHotspot={() => {
                  // Add hotspot - to be implemented
                }}
                onManageHotspots={() => {
                  // Manage hotspots - to be implemented
                }}
                onDuplicate={() => selectedBlock && onDuplicateBlock?.(selectedBlock.id)}
                onDelete={() => selectedBlock && onDeleteBlock?.(selectedBlock.id)}
                onOpenSettings={() => {
                  // Video settings - to be implemented
                }}
              />
            </RibbonTabPanel>
          )}

          {showAudioTools && (
            <RibbonTabPanel value="audio-tools">
              <AudioToolsTab
                onOpenFullEditor={() => setAudioEditorOpen(true)}
                onGenerateTTS={() => setTtsDialogOpen(true)}
                onOpenSettings={() => {
                  // Audio settings - to be implemented
                }}
              />
            </RibbonTabPanel>
          )}

          {showQuizTools && (
            <RibbonTabPanel value="quiz-tools">
              <QuizToolsTab
                onOpenSettings={() => {
                  // Quiz settings - to be implemented
                }}
              />
            </RibbonTabPanel>
          )}
        </RibbonTabs>
      </Ribbon>

      {/* TTS Dialog */}
      <Dialog open={ttsDialogOpen} onOpenChange={setTtsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Text to Speech
            </DialogTitle>
          </DialogHeader>
          <TTSPanel
            onAudioGenerated={() => {
              // Handle generated audio
            }}
            onInsertAudioBlock={() => {
              setTtsDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Audio Editor Dialog */}
      <AudioEditor
        open={audioEditorOpen}
        onClose={() => setAudioEditorOpen(false)}
        onSave={() => {
          // Handle saved audio
        }}
      />

      {/* Image Editor Dialog */}
      <ImageEditor
        open={imageEditorOpen}
        onClose={() => setImageEditorOpen(false)}
        onSave={() => {
          // Handle saved image
        }}
      />

      {/* Video Editor Dialog */}
      <VideoEditor
        open={videoEditorOpen}
        onClose={() => setVideoEditorOpen(false)}
        onSave={() => {
          // Handle saved video
        }}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        lesson={lessonData}
      />
    </div>
  );
}
