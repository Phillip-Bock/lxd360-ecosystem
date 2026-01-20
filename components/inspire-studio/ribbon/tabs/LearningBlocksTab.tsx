'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Learning Blocks Tab Component
 * =============================================================================
 *
 * Specialized ribbon tab for learning-specific content blocks.
 * Provides quick access to assessment, interactive, multimedia, and social
 * learning blocks organized by function.
 */

import {
  // Assessment
  CircleDot,
  Crosshair,
  FileAudio,
  GitBranch,
  // Interactive
  GripVertical,
  Layers,
  Link2,
  ListOrdered,
  MessageCircle,
  // Social
  MessageSquare,
  MousePointer2,
  // Multimedia
  PlaySquare,
  Target,
  TextCursorInput,
  ToggleLeft,
  UserPlus,
  Users2,
  Video,
} from 'lucide-react';

import {
  RibbonButton,
  RibbonGallery,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
} from '../groups';

interface LearningBlocksTabProps {
  onInsert?: (type: string, options?: unknown) => void;
  onAction?: (action: string, value?: unknown) => void;
}

export function LearningBlocksTab({ onInsert }: LearningBlocksTabProps) {
  const handleInsert = (type: string, options?: unknown) => {
    onInsert?.(type, options);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: ASSESSMENT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Assessment">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={CircleDot}
            label="Questions"
            size="large"
            columns={3}
            items={[
              {
                icon: CircleDot,
                label: 'Multiple Choice',
                onClick: () => handleInsert('multiple-choice'),
              },
              { icon: ToggleLeft, label: 'True/False', onClick: () => handleInsert('true-false') },
              {
                icon: TextCursorInput,
                label: 'Fill in Blank',
                onClick: () => handleInsert('fill-blank'),
              },
              { icon: Link2, label: 'Matching', onClick: () => handleInsert('matching-quiz') },
              {
                icon: ListOrdered,
                label: 'Ordering',
                onClick: () => handleInsert('ordering-quiz'),
              },
              { icon: Target, label: 'Hotspot', onClick: () => handleInsert('hotspot-quiz') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={MessageSquare}
              label="Essay"
              size="small"
              onClick={() => handleInsert('essay')}
              tooltip="Long-form response"
            />
            <RibbonButton
              icon={TextCursorInput}
              label="Short"
              size="small"
              onClick={() => handleInsert('short-answer')}
              tooltip="Short answer"
            />
            <RibbonSplitButton
              icon={GitBranch}
              label="Scenario"
              size="small"
              onClick={() => handleInsert('scenario')}
              menuItems={[
                {
                  label: 'Branching Scenario',
                  onClick: () => handleInsert('scenario', { type: 'branching' }),
                },
                {
                  label: 'Decision Tree',
                  onClick: () => handleInsert('scenario', { type: 'decision' }),
                },
                {
                  label: 'Role Play',
                  onClick: () => handleInsert('scenario', { type: 'roleplay' }),
                },
              ]}
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: INTERACTIVE
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Interactive">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={GripVertical}
            label="Activities"
            size="large"
            columns={3}
            items={[
              {
                icon: GripVertical,
                label: 'Drag & Drop',
                onClick: () => handleInsert('drag-drop'),
              },
              { icon: Layers, label: 'Flip Card', onClick: () => handleInsert('flip-cards') },
              { icon: MousePointer2, label: 'Reveal', onClick: () => handleInsert('reveal') },
              { icon: GitBranch, label: 'Process', onClick: () => handleInsert('process') },
              { icon: ListOrdered, label: 'Branching', onClick: () => handleInsert('branching') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Layers}
              label="Sorting"
              size="small"
              onClick={() => handleInsert('sorting')}
              tooltip="Sort items in order"
            />
            <RibbonButton
              icon={Link2}
              label="Matching"
              size="small"
              onClick={() => handleInsert('matching')}
              tooltip="Match related items"
            />
            <RibbonButton
              icon={Target}
              label="Labeling"
              size="small"
              onClick={() => handleInsert('labeling')}
              tooltip="Label parts of an image"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: MULTIMEDIA
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Multimedia">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={PlaySquare}
            label="Video Quiz"
            size="large"
            onClick={() => handleInsert('video-quiz')}
            menuItems={[
              { label: 'Video with Questions', onClick: () => handleInsert('video-quiz') },
              { label: 'Interactive Video', onClick: () => handleInsert('video-interactive') },
              { label: 'Video + Transcript', onClick: () => handleInsert('video-transcript') },
              { type: 'separator' },
              { label: 'Branching Video', onClick: () => handleInsert('video-branching') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={FileAudio}
              label="Audio"
              size="small"
              onClick={() => handleInsert('audio-transcript')}
              tooltip="Audio with transcript"
            />
            <RibbonButton
              icon={Crosshair}
              label="Annotated"
              size="small"
              onClick={() => handleInsert('image-annotated')}
              tooltip="Annotated image"
            />
            <RibbonButton
              icon={Video}
              label="Interactive"
              size="small"
              onClick={() => handleInsert('video-interactive')}
              tooltip="Interactive video"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: SOCIAL
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Social">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={MessageSquare}
            label="Collaboration"
            size="large"
            columns={2}
            items={[
              {
                icon: MessageSquare,
                label: 'Discussion',
                onClick: () => handleInsert('discussion'),
              },
              { icon: Users2, label: 'Peer Review', onClick: () => handleInsert('peer-review') },
              {
                icon: UserPlus,
                label: 'Collaboration',
                onClick: () => handleInsert('collaboration'),
              },
              { icon: MessageCircle, label: 'Reflection', onClick: () => handleInsert('comment') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={MessageCircle}
              label="Comment"
              size="small"
              onClick={() => handleInsert('comment')}
              tooltip="Add comment section"
            />
            <RibbonButton
              icon={Users2}
              label="Poll"
              size="small"
              onClick={() => handleInsert('poll')}
              tooltip="Quick poll"
            />
            <RibbonButton
              icon={UserPlus}
              label="Reaction"
              size="small"
              onClick={() => handleInsert('reaction')}
              tooltip="Emoji reactions"
            />
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}
