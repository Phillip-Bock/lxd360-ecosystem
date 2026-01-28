'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Insert Tab Component
 * =============================================================================
 *
 * Comprehensive content block and media insertion tab.
 * Provides access to all insertable content types including text,
 * media, layout, interactive elements, assessments, callouts, and templates.
 */

import {
  // Callouts
  AlertTriangle,
  BarChart3,
  Box,
  Calendar,
  CheckSquare,
  Clock,
  Code2,
  // Layout
  Columns,
  Crosshair,
  ExternalLink,
  FileAudio,
  FileCode,
  FileQuestion,
  GalleryHorizontal,
  GitBranch,
  GripVertical,
  Heading1,
  // Assessment
  HelpCircle,
  // Media
  ImageIcon,
  Info,
  Layers,
  LayoutGrid,
  // Templates
  LayoutTemplate,
  Lightbulb,
  ListChecks,
  // Objects
  MapIcon,
  Maximize2,
  MessageSquare,
  MousePointer2,
  // Interactive
  MousePointerClick,
  PanelTop,
  Quote,
  Shapes,
  Sliders,
  Sparkles,
  // Objects
  Table2,
  ToggleLeft,
  // Text blocks
  Type,
  Users,
  Video,
} from 'lucide-react';

import {
  RibbonButton,
  RibbonGallery,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
} from '../groups';

interface InsertTabProps {
  onInsert?: (type: string, options?: unknown) => void;
}

export function InsertTab({ onInsert }: InsertTabProps) {
  const handleInsert = (type: string, options?: unknown) => {
    onInsert?.(type, options);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: TEXT BLOCKS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Text">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={Type}
            label="Text"
            size="large"
            onClick={() => handleInsert('text')}
            tooltip="Insert text block"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonSplitButton
              icon={Heading1}
              label="Heading"
              size="small"
              onClick={() => handleInsert('heading')}
              menuItems={[
                { label: 'Heading 1', onClick: () => handleInsert('heading', { level: 1 }) },
                { label: 'Heading 2', onClick: () => handleInsert('heading', { level: 2 }) },
                { label: 'Heading 3', onClick: () => handleInsert('heading', { level: 3 }) },
                { label: 'Heading 4', onClick: () => handleInsert('heading', { level: 4 }) },
              ]}
            />
            <RibbonButton
              icon={Quote}
              label="Quote"
              size="small"
              onClick={() => handleInsert('quote')}
              tooltip="Block quote"
            />
            <RibbonButton
              icon={Code2}
              label="Code"
              size="small"
              onClick={() => handleInsert('code')}
              tooltip="Code block"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: MEDIA
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Media">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={ImageIcon}
            label="Image"
            size="large"
            onClick={() => handleInsert('image')}
            menuItems={[
              { label: 'Upload Image', onClick: () => handleInsert('image', { source: 'upload' }) },
              { label: 'From URL', onClick: () => handleInsert('image', { source: 'url' }) },
              { label: 'Stock Library', onClick: () => handleInsert('image', { source: 'stock' }) },
              {
                icon: Sparkles,
                label: 'AI Generate',
                onClick: () => handleInsert('image', { source: 'ai' }),
              },
              { type: 'separator' },
              { label: 'Image Gallery', onClick: () => handleInsert('imageGallery') },
              { label: 'Image with Caption', onClick: () => handleInsert('imageCaption') },
              { label: 'Before/After', onClick: () => handleInsert('imageCompare') },
            ]}
          />
          <RibbonSplitButton
            icon={Video}
            label="Video"
            size="large"
            onClick={() => handleInsert('video')}
            menuItems={[
              { label: 'Upload Video', onClick: () => handleInsert('video', { source: 'upload' }) },
              { label: 'YouTube', onClick: () => handleInsert('video', { source: 'youtube' }) },
              { label: 'Vimeo', onClick: () => handleInsert('video', { source: 'vimeo' }) },
              { label: 'Loom', onClick: () => handleInsert('video', { source: 'loom' }) },
              { label: 'From URL', onClick: () => handleInsert('video', { source: 'url' }) },
              { type: 'separator' },
              {
                icon: Sparkles,
                label: 'AI Avatar Video',
                onClick: () => handleInsert('video', { source: 'ai' }),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={FileAudio}
              label="Audio"
              size="small"
              onClick={() => handleInsert('audio')}
              tooltip="Insert audio"
            />
            <RibbonButton
              icon={ExternalLink}
              label="Embed"
              size="small"
              onClick={() => handleInsert('embed')}
              tooltip="Embed external content"
            />
            <RibbonButton
              icon={FileCode}
              label="iframe"
              size="small"
              onClick={() => handleInsert('iframe')}
              tooltip="Insert iframe"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: LAYOUT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Layout">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Columns}
            label="Columns"
            size="large"
            onClick={() => handleInsert('columns', { count: 2 })}
            menuItems={[
              {
                label: '2 Columns (50/50)',
                onClick: () => handleInsert('columns', { layout: '50-50' }),
              },
              {
                label: '2 Columns (33/67)',
                onClick: () => handleInsert('columns', { layout: '33-67' }),
              },
              {
                label: '2 Columns (67/33)',
                onClick: () => handleInsert('columns', { layout: '67-33' }),
              },
              {
                label: '3 Columns (Equal)',
                onClick: () => handleInsert('columns', { layout: '33-33-33' }),
              },
              {
                label: '3 Columns (25/50/25)',
                onClick: () => handleInsert('columns', { layout: '25-50-25' }),
              },
              {
                label: '4 Columns',
                onClick: () => handleInsert('columns', { layout: '25-25-25-25' }),
              },
              { type: 'separator' },
              {
                label: 'Custom Layout...',
                onClick: () => handleInsert('columns', { custom: true }),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={LayoutGrid}
              label="Grid"
              size="small"
              onClick={() => handleInsert('grid')}
              tooltip="Grid layout"
            />
            <RibbonButton
              icon={Box}
              label="Container"
              size="small"
              onClick={() => handleInsert('container')}
              tooltip="Container block"
            />
            <RibbonButton
              icon={Layers}
              label="Stack"
              size="small"
              onClick={() => handleInsert('stack')}
              tooltip="Stack layout"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: INTERACTIVE ELEMENTS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Interactive">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={MousePointerClick}
            label="Interactions"
            size="large"
            columns={3}
            items={[
              { icon: PanelTop, label: 'Accordion', onClick: () => handleInsert('accordion') },
              { icon: PanelTop, label: 'Tabs', onClick: () => handleInsert('tabs') },
              {
                icon: GalleryHorizontal,
                label: 'Carousel',
                onClick: () => handleInsert('carousel'),
              },
              { icon: Layers, label: 'Flip Cards', onClick: () => handleInsert('flipcard') },
              { icon: Clock, label: 'Timeline', onClick: () => handleInsert('timeline') },
              { icon: GitBranch, label: 'Process', onClick: () => handleInsert('process') },
              { icon: Crosshair, label: 'Hotspots', onClick: () => handleInsert('hotspot') },
              {
                icon: MousePointer2,
                label: 'Click Reveal',
                onClick: () => handleInsert('clickReveal'),
              },
              { icon: Maximize2, label: 'Lightbox', onClick: () => handleInsert('lightbox') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={ToggleLeft}
              label="Toggle"
              size="small"
              onClick={() => handleInsert('toggle')}
              tooltip="Toggle block"
            />
            <RibbonButton
              icon={Sliders}
              label="Slider"
              size="small"
              onClick={() => handleInsert('slider')}
              tooltip="Slider/Range"
            />
            <RibbonButton
              icon={GripVertical}
              label="Drag Drop"
              size="small"
              onClick={() => handleInsert('dragDrop')}
              tooltip="Drag and drop"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: ASSESSMENT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Assessment">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={HelpCircle}
            label="Quiz"
            size="large"
            onClick={() => handleInsert('quiz')}
            menuItems={[
              {
                label: 'Multiple Choice',
                onClick: () => handleInsert('quiz', { type: 'multipleChoice' }),
              },
              {
                label: 'Multiple Select',
                onClick: () => handleInsert('quiz', { type: 'multipleSelect' }),
              },
              { label: 'True/False', onClick: () => handleInsert('quiz', { type: 'trueFalse' }) },
              {
                label: 'Fill in Blank',
                onClick: () => handleInsert('quiz', { type: 'fillBlank' }),
              },
              { label: 'Matching', onClick: () => handleInsert('quiz', { type: 'matching' }) },
              { label: 'Ordering', onClick: () => handleInsert('quiz', { type: 'ordering' }) },
              {
                label: 'Short Answer',
                onClick: () => handleInsert('quiz', { type: 'shortAnswer' }),
              },
              { label: 'Essay', onClick: () => handleInsert('quiz', { type: 'essay' }) },
              { label: 'Hotspot', onClick: () => handleInsert('quiz', { type: 'hotspot' }) },
              { type: 'separator' },
              { label: 'Knowledge Check', onClick: () => handleInsert('knowledgeCheck') },
              { label: 'Survey Question', onClick: () => handleInsert('survey') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={CheckSquare}
              label="Check"
              size="small"
              onClick={() => handleInsert('knowledgeCheck')}
              tooltip="Knowledge check"
            />
            <RibbonButton
              icon={ListChecks}
              label="Survey"
              size="small"
              onClick={() => handleInsert('survey')}
              tooltip="Survey question"
            />
            <RibbonButton
              icon={FileQuestion}
              label="Scenario"
              size="small"
              onClick={() => handleInsert('scenario')}
              tooltip="Branching scenario"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: CALLOUTS & NOTES
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Callouts">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={AlertTriangle}
            label="Callout"
            size="large"
            columns={2}
            items={[
              {
                icon: Info,
                label: 'Info',
                color: 'rgb(59 130 246)',
                onClick: () => handleInsert('callout', { type: 'info' }),
              },
              {
                icon: Lightbulb,
                label: 'Tip',
                color: 'rgb(34 197 94)',
                onClick: () => handleInsert('callout', { type: 'tip' }),
              },
              {
                icon: AlertTriangle,
                label: 'Warning',
                color: 'rgb(245 158 11)',
                onClick: () => handleInsert('callout', { type: 'warning' }),
              },
              {
                icon: AlertTriangle,
                label: 'Danger',
                color: 'rgb(239 68 68)',
                onClick: () => handleInsert('callout', { type: 'danger' }),
              },
              {
                icon: Quote,
                label: 'Note',
                color: 'text-studio-text-muted',
                onClick: () => handleInsert('callout', { type: 'note' }),
              },
              {
                icon: CheckSquare,
                label: 'Success',
                color: 'rgb(34 197 94)',
                onClick: () => handleInsert('callout', { type: 'success' }),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={MessageSquare}
              label="Dialogue"
              size="small"
              onClick={() => handleInsert('dialogue')}
              tooltip="Character dialogue"
            />
            <RibbonButton
              icon={Users}
              label="Character"
              size="small"
              onClick={() => handleInsert('character')}
              tooltip="Insert character"
            />
            <RibbonButton
              icon={Quote}
              label="Testimony"
              size="small"
              onClick={() => handleInsert('testimonial')}
              tooltip="Testimonial"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: OBJECTS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Objects">
        <div className="flex items-center gap-0.5">
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Table2}
              label="Table"
              size="small"
              onClick={() => handleInsert('table')}
              tooltip="Insert table"
            />
            <RibbonButton
              icon={Shapes}
              label="Shapes"
              size="small"
              onClick={() => handleInsert('shape')}
              tooltip="Insert shape"
            />
            <RibbonButton
              icon={BarChart3}
              label="Chart"
              size="small"
              onClick={() => handleInsert('chart')}
              tooltip="Insert chart"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Calendar}
              label="Date"
              size="small"
              onClick={() => handleInsert('date')}
              tooltip="Date picker"
            />
            <RibbonButton
              icon={MapIcon}
              label="Map"
              size="small"
              onClick={() => handleInsert('map')}
              tooltip="Interactive map"
            />
            <RibbonButton
              icon={FileCode}
              label="HTML"
              size="small"
              onClick={() => handleInsert('customHtml')}
              tooltip="Custom HTML"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 8: TEMPLATES
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Templates">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={LayoutTemplate}
            label="Templates"
            size="large"
            onClick={() => handleInsert('templateBrowser')}
            menuItems={[
              {
                label: 'INSPIRE Ignite Opener',
                onClick: () => handleInsert('template', { id: 'ignite-opener' }),
              },
              {
                label: 'Key Concept Card',
                onClick: () => handleInsert('template', { id: 'concept-card' }),
              },
              {
                label: 'Step-by-Step Process',
                onClick: () => handleInsert('template', { id: 'process-steps' }),
              },
              {
                label: 'Practice Scenario',
                onClick: () => handleInsert('template', { id: 'practice-scenario' }),
              },
              {
                label: 'Knowledge Check',
                onClick: () => handleInsert('template', { id: 'knowledge-check' }),
              },
              {
                label: 'Summary & Reflect',
                onClick: () => handleInsert('template', { id: 'summary-reflect' }),
              },
              { type: 'separator' },
              { label: 'Browse All Templates...', onClick: () => handleInsert('templateBrowser') },
              { label: 'Save as Template...', onClick: () => handleInsert('saveTemplate') },
            ]}
          />
        </div>
      </RibbonGroup>
    </div>
  );
}
