'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Home Tab Component
 * =============================================================================
 *
 * The default tab containing the most commonly used tools.
 * Users spend ~80% of their time here. Includes clipboard, font formatting,
 * paragraph, styles, quick insert, INSPIRE framework, and AI quick actions.
 */

import {
  AlignCenter,
  AlignJustify,
  // Alignment
  AlignLeft,
  AlignRight,
  Baseline,
  // Text formatting
  Bold,
  // Other
  ChevronDown,
  // Clipboard
  ClipboardCopy,
  ClipboardPaste,
  Code,
  Compass,
  Eye,
  // INSPIRE
  Flame,
  Highlighter,
  // Insert common
  Image,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Layers,
  Link2,
  // Lists
  List,
  ListChecks,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Paintbrush,
  // Paragraph
  Pilcrow,
  Puzzle,
  Rocket,
  Scissors,
  // AI
  Sparkles,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Target,
  TextQuote,
  Underline,
  Video,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';

import {
  RibbonButton,
  RibbonColorPicker,
  RibbonDropdown,
  RibbonFontPicker,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
  RibbonToggle,
} from '../groups';

interface HomeTabProps {
  selection?: unknown;
  activeFormats?: string[];
  currentFont?: string;
  currentFontSize?: string;
  cognitiveLoad?: number;
  onFormatting?: (format: string, value?: unknown) => void;
  onInsert?: (type: string, options?: unknown) => void;
  onAIAction?: (action: string, options?: unknown) => void;
  onINSPIREStage?: (stage: string) => void;
}

export function HomeTab({
  selection,
  activeFormats = [],
  currentFont = 'Inter',
  currentFontSize = '16',
  cognitiveLoad = 65,
  onFormatting,
  onInsert,
  onAIAction,
  onINSPIREStage,
}: HomeTabProps) {
  const [textColor, setTextColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [activeINSPIREStage, setActiveINSPIREStage] = useState<string | null>(null);

  const handleFormat = (format: string, value?: unknown) => {
    onFormatting?.(format, value);
  };

  const getCognitiveLoadColor = () => {
    if (cognitiveLoad < 40) return 'from-green-500 to-green-400';
    if (cognitiveLoad < 70) return 'from-green-500 via-yellow-500 to-yellow-400';
    return 'from-green-500 via-yellow-500 to-red-500';
  };

  const getCognitiveLoadTextColor = () => {
    if (cognitiveLoad < 40) return 'text-brand-success';
    if (cognitiveLoad < 70) return 'text-brand-warning';
    return 'text-brand-error';
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: CLIPBOARD
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Clipboard">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={ClipboardPaste}
            label="Paste"
            size="large"
            onClick={() => handleFormat('paste')}
            shortcut="Ctrl+V"
            tooltip="Paste"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Scissors}
              label="Cut"
              size="small"
              onClick={() => handleFormat('cut')}
              shortcut="Ctrl+X"
              tooltip="Cut"
            />
            <RibbonButton
              icon={ClipboardCopy}
              label="Copy"
              size="small"
              onClick={() => handleFormat('copy')}
              shortcut="Ctrl+C"
              tooltip="Copy"
            />
            <RibbonButton
              icon={Paintbrush}
              label="Format"
              size="small"
              onClick={() => handleFormat('formatPainter')}
              tooltip="Format Painter"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: FONT FORMATTING
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Font">
        <div className="flex flex-col gap-1">
          {/* Row 1: Font family and size */}
          <div className="flex items-center gap-1">
            <RibbonFontPicker
              value={currentFont}
              onChange={(font) => handleFormat('fontFamily', font)}
              width={130}
            />
            <RibbonDropdown
              value={currentFontSize}
              options={[
                '10',
                '11',
                '12',
                '14',
                '16',
                '18',
                '20',
                '24',
                '28',
                '32',
                '36',
                '48',
                '72',
              ]}
              onChange={(size) => handleFormat('fontSize', size)}
              width={55}
            />
          </div>

          {/* Row 2: Text formatting buttons */}
          <div className="flex items-center gap-0.5">
            <RibbonToggle
              icon={Bold}
              isActive={activeFormats.includes('bold')}
              onClick={() => handleFormat('bold')}
              tooltip="Bold (Ctrl+B)"
            />
            <RibbonToggle
              icon={Italic}
              isActive={activeFormats.includes('italic')}
              onClick={() => handleFormat('italic')}
              tooltip="Italic (Ctrl+I)"
            />
            <RibbonToggle
              icon={Underline}
              isActive={activeFormats.includes('underline')}
              onClick={() => handleFormat('underline')}
              tooltip="Underline (Ctrl+U)"
            />
            <RibbonToggle
              icon={Strikethrough}
              isActive={activeFormats.includes('strikethrough')}
              onClick={() => handleFormat('strikethrough')}
              tooltip="Strikethrough"
            />

            <div className="w-px h-6 border-studio-surface/50 mx-0.5" />

            <RibbonToggle
              icon={Subscript}
              isActive={activeFormats.includes('subscript')}
              onClick={() => handleFormat('subscript')}
              tooltip="Subscript"
            />
            <RibbonToggle
              icon={Superscript}
              isActive={activeFormats.includes('superscript')}
              onClick={() => handleFormat('superscript')}
              tooltip="Superscript"
            />

            <div className="w-px h-6 border-studio-surface/50 mx-0.5" />

            <RibbonColorPicker
              icon={Baseline}
              color={textColor}
              onChange={(color) => {
                setTextColor(color);
                handleFormat('textColor', color);
              }}
              tooltip="Text Color"
            />
            <RibbonColorPicker
              icon={Highlighter}
              color={highlightColor}
              onChange={(color) => {
                setHighlightColor(color);
                handleFormat('highlight', color);
              }}
              tooltip="Highlight Color"
            />

            <div className="w-px h-6 border-studio-surface/50 mx-0.5" />

            <RibbonToggle
              icon={Code}
              isActive={activeFormats.includes('code')}
              onClick={() => handleFormat('inlineCode')}
              tooltip="Inline Code"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: PARAGRAPH
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Paragraph">
        <div className="flex flex-col gap-1">
          {/* Row 1: Alignment and spacing */}
          <div className="flex items-center gap-0.5">
            <RibbonToggle
              icon={AlignLeft}
              isActive={activeFormats.includes('alignLeft')}
              onClick={() => handleFormat('align', 'left')}
              tooltip="Align Left"
            />
            <RibbonToggle
              icon={AlignCenter}
              isActive={activeFormats.includes('alignCenter')}
              onClick={() => handleFormat('align', 'center')}
              tooltip="Align Center"
            />
            <RibbonToggle
              icon={AlignRight}
              isActive={activeFormats.includes('alignRight')}
              onClick={() => handleFormat('align', 'right')}
              tooltip="Align Right"
            />
            <RibbonToggle
              icon={AlignJustify}
              isActive={activeFormats.includes('alignJustify')}
              onClick={() => handleFormat('align', 'justify')}
              tooltip="Justify"
            />

            <div className="w-px h-6 border-studio-surface/50 mx-0.5" />

            <RibbonSplitButton
              icon={Pilcrow}
              onClick={() => handleFormat('lineSpacing', '1.5')}
              tooltip="Line Spacing"
              menuItems={[
                { label: '1.0', onClick: () => handleFormat('lineSpacing', '1') },
                { label: '1.15', onClick: () => handleFormat('lineSpacing', '1.15') },
                { label: '1.5', onClick: () => handleFormat('lineSpacing', '1.5') },
                { label: '2.0', onClick: () => handleFormat('lineSpacing', '2') },
                { label: '2.5', onClick: () => handleFormat('lineSpacing', '2.5') },
                { label: '3.0', onClick: () => handleFormat('lineSpacing', '3') },
                { type: 'separator' },
                { label: 'Line Spacing Options...', onClick: () => {} },
              ]}
            />
          </div>

          {/* Row 2: Lists and indentation */}
          <div className="flex items-center gap-0.5">
            <RibbonSplitButton
              icon={List}
              onClick={() => handleFormat('bulletList')}
              tooltip="Bullet List"
              menuItems={[
                { label: '• Disc', onClick: () => handleFormat('bulletList', 'disc') },
                { label: '○ Circle', onClick: () => handleFormat('bulletList', 'circle') },
                { label: '■ Square', onClick: () => handleFormat('bulletList', 'square') },
                { label: '✓ Check', onClick: () => handleFormat('bulletList', 'check') },
                { label: '→ Arrow', onClick: () => handleFormat('bulletList', 'arrow') },
              ]}
            />
            <RibbonSplitButton
              icon={ListOrdered}
              onClick={() => handleFormat('numberedList')}
              tooltip="Numbered List"
              menuItems={[
                { label: '1. 2. 3.', onClick: () => handleFormat('numberedList', 'decimal') },
                { label: 'a. b. c.', onClick: () => handleFormat('numberedList', 'alpha-lower') },
                { label: 'A. B. C.', onClick: () => handleFormat('numberedList', 'alpha-upper') },
                {
                  label: 'i. ii. iii.',
                  onClick: () => handleFormat('numberedList', 'roman-lower'),
                },
                {
                  label: 'I. II. III.',
                  onClick: () => handleFormat('numberedList', 'roman-upper'),
                },
              ]}
            />
            <RibbonToggle
              icon={ListChecks}
              isActive={activeFormats.includes('checklist')}
              onClick={() => handleFormat('checklist')}
              tooltip="Checklist"
            />

            <div className="w-px h-6 border-studio-surface/50 mx-0.5" />

            <RibbonButton
              icon={IndentDecrease}
              onClick={() => handleFormat('outdent')}
              tooltip="Decrease Indent"
            />
            <RibbonButton
              icon={IndentIncrease}
              onClick={() => handleFormat('indent')}
              tooltip="Increase Indent"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: STYLES (Headings & Quick Styles)
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Styles">
        <div className="flex flex-col gap-1">
          {/* Style gallery */}
          <div className="flex items-center gap-1">
            <StylePreviewButton
              style="heading1"
              label="H1"
              preview="Aa"
              isActive={activeFormats.includes('h1')}
              onClick={() => handleFormat('heading', 1)}
            />
            <StylePreviewButton
              style="heading2"
              label="H2"
              preview="Aa"
              isActive={activeFormats.includes('h2')}
              onClick={() => handleFormat('heading', 2)}
            />
            <StylePreviewButton
              style="heading3"
              label="H3"
              preview="Aa"
              isActive={activeFormats.includes('h3')}
              onClick={() => handleFormat('heading', 3)}
            />
            <StylePreviewButton
              style="body"
              label="Body"
              preview="Aa"
              isActive={activeFormats.includes('p')}
              onClick={() => handleFormat('paragraph')}
            />
            <RibbonDropdown trigger={<ChevronDown className="w-4 h-4" />} width={200}>
              <StyleMenuItem
                label="Heading 1"
                shortcut="Ctrl+Alt+1"
                onClick={() => handleFormat('heading', 1)}
              />
              <StyleMenuItem
                label="Heading 2"
                shortcut="Ctrl+Alt+2"
                onClick={() => handleFormat('heading', 2)}
              />
              <StyleMenuItem
                label="Heading 3"
                shortcut="Ctrl+Alt+3"
                onClick={() => handleFormat('heading', 3)}
              />
              <StyleMenuItem
                label="Heading 4"
                shortcut="Ctrl+Alt+4"
                onClick={() => handleFormat('heading', 4)}
              />
              <div className="h-px border-studio-surface/50 my-1" />
              <StyleMenuItem label="Body Text" onClick={() => handleFormat('paragraph')} />
              <StyleMenuItem label="Body Large" onClick={() => handleFormat('bodyLarge')} />
              <StyleMenuItem label="Body Small" onClick={() => handleFormat('bodySmall')} />
              <StyleMenuItem label="Caption" onClick={() => handleFormat('caption')} />
              <div className="h-px border-studio-surface/50 my-1" />
              <StyleMenuItem label="Quote" onClick={() => handleFormat('blockquote')} />
              <StyleMenuItem label="Code Block" onClick={() => handleFormat('codeBlock')} />
              <StyleMenuItem label="Callout" onClick={() => onInsert?.('callout')} />
            </RibbonDropdown>
          </div>

          {/* Quick format buttons */}
          <div className="flex items-center gap-0.5">
            <RibbonButton
              icon={TextQuote}
              onClick={() => handleFormat('blockquote')}
              tooltip="Block Quote"
            />
            <RibbonButton
              icon={Code}
              onClick={() => handleFormat('codeBlock')}
              tooltip="Code Block"
            />
            <RibbonButton
              icon={Minus}
              onClick={() => handleFormat('horizontalRule')}
              tooltip="Horizontal Line"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: INSERT (Quick Access)
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Insert">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={Image}
            label="Image"
            size="large"
            onClick={() => onInsert?.('image')}
            shortcut="Ctrl+Shift+I"
            tooltip="Insert Image"
          />
          <RibbonButton
            icon={Video}
            label="Video"
            size="large"
            onClick={() => onInsert?.('video')}
            tooltip="Insert Video"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Link2}
              label="Link"
              size="small"
              onClick={() => onInsert?.('link')}
              shortcut="Ctrl+K"
              tooltip="Insert Link"
            />
            <RibbonButton
              icon={Table2}
              label="Table"
              size="small"
              onClick={() => onInsert?.('table')}
              tooltip="Insert Table"
            />
            <RibbonSplitButton
              icon={MoreHorizontal}
              label="More"
              size="small"
              menuItems={[
                { icon: Image, label: 'Image', onClick: () => onInsert?.('image') },
                { icon: Video, label: 'Video', onClick: () => onInsert?.('video') },
                { label: 'Audio', onClick: () => onInsert?.('audio') },
                { label: 'Code Block', onClick: () => onInsert?.('code') },
                { label: 'Quote', onClick: () => onInsert?.('quote') },
                { type: 'separator' },
                { label: 'See all blocks...', onClick: () => {} },
              ]}
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: INSPIRE FRAMEWORK
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="INSPIRE">
        <div className="flex flex-col gap-1">
          {/* INSPIRE Stage Selector */}
          <div className="flex items-center gap-0.5">
            <INSPIREStageButton
              stage="ignite"
              icon={Flame}
              color="#f97316"
              tooltip="Ignite - Capture Attention"
              isActive={activeINSPIREStage === 'ignite'}
              onClick={() => {
                setActiveINSPIREStage(activeINSPIREStage === 'ignite' ? null : 'ignite');
                onINSPIREStage?.('ignite');
              }}
            />
            <INSPIREStageButton
              stage="navigate"
              icon={Compass}
              color="var(--info)"
              tooltip="Navigate - Set Direction"
              isActive={activeINSPIREStage === 'navigate'}
              onClick={() => {
                setActiveINSPIREStage(activeINSPIREStage === 'navigate' ? null : 'navigate');
                onINSPIREStage?.('navigate');
              }}
            />
            <INSPIREStageButton
              stage="scaffold"
              icon={Layers}
              color="#a855f7"
              tooltip="Scaffold - Build Foundation"
              isActive={activeINSPIREStage === 'scaffold'}
              onClick={() => {
                setActiveINSPIREStage(activeINSPIREStage === 'scaffold' ? null : 'scaffold');
                onINSPIREStage?.('scaffold');
              }}
            />
            <INSPIREStageButton
              stage="practice"
              icon={Target}
              color="var(--success)"
              tooltip="Practice - Apply Learning"
              isActive={activeINSPIREStage === 'practice'}
              onClick={() => {
                setActiveINSPIREStage(activeINSPIREStage === 'practice' ? null : 'practice');
                onINSPIREStage?.('practice');
              }}
            />
            <INSPIREStageButton
              stage="integrate"
              icon={Puzzle}
              color="#06b6d4"
              tooltip="Integrate - Connect Concepts"
              isActive={activeINSPIREStage === 'integrate'}
              onClick={() => {
                setActiveINSPIREStage(activeINSPIREStage === 'integrate' ? null : 'integrate');
                onINSPIREStage?.('integrate');
              }}
            />
            <INSPIREStageButton
              stage="reflect"
              icon={Eye}
              color="#ec4899"
              tooltip="Reflect - Metacognition"
              isActive={activeINSPIREStage === 'reflect'}
              onClick={() => {
                setActiveINSPIREStage(activeINSPIREStage === 'reflect' ? null : 'reflect');
                onINSPIREStage?.('reflect');
              }}
            />
            <INSPIREStageButton
              stage="extend"
              icon={Rocket}
              color="var(--warning)"
              tooltip="Extend - Transfer Learning"
              isActive={activeINSPIREStage === 'extend'}
              onClick={() => {
                setActiveINSPIREStage(activeINSPIREStage === 'extend' ? null : 'extend');
                onINSPIREStage?.('extend');
              }}
            />
          </div>

          {/* Cognitive Load Indicator */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-[10px] text-studio-text-muted">Load:</span>
            <div className="flex-1 h-1.5 border-studio-surface rounded-full overflow-hidden min-w-[60px]">
              <div
                className={`h-full bg-linear-to-r ${getCognitiveLoadColor()} transition-all duration-300`}
                style={{ width: `${cognitiveLoad}%` }}
              />
            </div>
            <span className={`text-[10px] font-medium ${getCognitiveLoadTextColor()}`}>
              {cognitiveLoad}%
            </span>
            <RibbonButton
              icon={MoreHorizontal}
              size="tiny"
              onClick={() => onAIAction?.('cognitiveLoadDetails')}
              tooltip="Cognitive Load Details"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: AI QUICK ACTIONS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="AI Assistant">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Sparkles}
            label="AI Generate"
            size="large"
            gradient
            onClick={() => onAIAction?.('generate')}
            menuItems={[
              {
                icon: Sparkles,
                label: 'Generate Content',
                onClick: () => onAIAction?.('generate'),
              },
              { icon: Wand2, label: 'Improve Selection', onClick: () => onAIAction?.('improve') },
              { label: 'Translate', onClick: () => onAIAction?.('translate') },
              { label: 'Summarize', onClick: () => onAIAction?.('summarize') },
              { label: 'Expand', onClick: () => onAIAction?.('expand') },
              { label: 'Simplify', onClick: () => onAIAction?.('simplify') },
              { type: 'separator' },
              { label: 'Generate Quiz', onClick: () => onAIAction?.('quiz') },
              { label: 'Generate Image', onClick: () => onAIAction?.('image') },
              { type: 'separator' },
              { label: 'AI Studio...', onClick: () => {} },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Wand2}
              label="Improve"
              size="small"
              onClick={() => onAIAction?.('improve')}
              disabled={!selection}
              tooltip="Improve Selection"
            />
            <RibbonButton
              icon={Eye}
              label="A11y Check"
              size="small"
              onClick={() => onAIAction?.('accessibility')}
              tooltip="Check Accessibility"
            />
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}

// Helper Components

interface StylePreviewButtonProps {
  style: string;
  label: string;
  preview: string;
  isActive: boolean;
  onClick: () => void;
}

function StylePreviewButton({ style, label, preview, isActive, onClick }: StylePreviewButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg border transition-all ${
        isActive
          ? 'border-studio-accent bg-studio-accent/10'
          : 'border-studio-surface/50 hover:border-studio-accent/50 hover:bg-studio-surface/30'
      }`}
      title={label}
    >
      <span
        className={`font-bold ${
          style === 'heading1'
            ? 'text-lg'
            : style === 'heading2'
              ? 'text-base'
              : style === 'heading3'
                ? 'text-sm'
                : 'text-xs'
        } text-brand-primary`}
      >
        {preview}
      </span>
      <span className="text-[9px] text-studio-text-muted mt-0.5">{label}</span>
    </button>
  );
}

interface INSPIREStageButtonProps {
  stage: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
}

function INSPIREStageButton({
  icon: Icon,
  color,
  tooltip,
  isActive,
  onClick,
}: INSPIREStageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        isActive ? 'ring-2 ring-offset-1 ring-offset-studio-bg' : 'hover:bg-studio-surface/50'
      }`}
      style={
        {
          backgroundColor: isActive ? `${color}20` : 'transparent',
          '--tw-ring-color': isActive ? color : 'transparent',
        } as React.CSSProperties
      }
      title={tooltip}
    >
      <Icon className="w-4 h-4" style={{ color }} />
    </button>
  );
}

interface StyleMenuItemProps {
  label: string;
  shortcut?: string;
  onClick?: () => void;
}

function StyleMenuItem({ label, shortcut, onClick }: StyleMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 text-sm text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary transition-colors"
    >
      <span>{label}</span>
      {shortcut && <span className="text-xs text-studio-text-muted">{shortcut}</span>}
    </button>
  );
}
