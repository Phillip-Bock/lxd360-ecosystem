'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Highlighter,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Palette,
  Play,
  Quote,
  Redo,
  Strikethrough,
  Table,
  Underline,
  Undo,
  Video,
} from 'lucide-react';
import {
  Ribbon,
  RibbonButton,
  RibbonColorPicker,
  RibbonCombobox,
  RibbonDropdown,
  RibbonGroup,
  RibbonQuickAccess,
  RibbonSeparator,
  RibbonTab,
  RibbonTabList,
  RibbonTabPanel,
  RibbonTabs,
  RibbonToggleGroup,
} from '../index';

// Font options
const FONT_FAMILIES = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'opensans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'montserrat', label: 'Montserrat' },
];

const FONT_SIZES = [
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '24', label: '24' },
  { value: '32', label: '32' },
  { value: '48', label: '48' },
];

const HEADING_OPTIONS = [
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'p', label: 'Paragraph' },
];

export interface LessonEditorRibbonProps {
  // Text formatting state
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;

  // Alignment
  alignment?: 'left' | 'center' | 'right';

  // Font
  fontFamily?: string;
  fontSize?: string;
  textColor?: string;
  highlightColor?: string;
  headingStyle?: string;

  // Callbacks
  onBoldChange?: (value: boolean) => void;
  onItalicChange?: (value: boolean) => void;
  onUnderlineChange?: (value: boolean) => void;
  onStrikethroughChange?: (value: boolean) => void;
  onAlignmentChange?: (value: 'left' | 'center' | 'right') => void;
  onFontFamilyChange?: (value: string) => void;
  onFontSizeChange?: (value: string) => void;
  onTextColorChange?: (value: string) => void;
  onHighlightColorChange?: (value: string) => void;
  onHeadingChange?: (value: string) => void;

  // Actions
  onUndo?: () => void;
  onRedo?: () => void;
  onInsertImage?: () => void;
  onInsertVideo?: () => void;
  onInsertTable?: () => void;
  onInsertLink?: () => void;
  onInsertCode?: () => void;
  onInsertQuote?: () => void;
  onInsertList?: (type: 'bullet' | 'numbered') => void;

  // Undo/Redo state
  canUndo?: boolean;
  canRedo?: boolean;
}

export function LessonEditorRibbon({
  isBold = false,
  isItalic = false,
  isUnderline = false,
  isStrikethrough = false,
  alignment = 'left',
  fontFamily = 'inter',
  fontSize = '16',
  textColor = '#000000',
  highlightColor = '#FFFF00',
  headingStyle = 'p',
  onBoldChange,
  onItalicChange,
  onUnderlineChange,
  onStrikethroughChange,
  onAlignmentChange,
  onFontFamilyChange,
  onFontSizeChange,
  onTextColorChange,
  onHighlightColorChange,
  onHeadingChange,
  onUndo,
  onRedo,
  onInsertImage,
  onInsertVideo,
  onInsertTable,
  onInsertLink,
  onInsertCode,
  onInsertQuote,
  onInsertList,
  canUndo = false,
  canRedo = false,
}: LessonEditorRibbonProps) {
  // Build formatting toggle values
  const formattingValues: string[] = [];
  if (isBold) formattingValues.push('bold');
  if (isItalic) formattingValues.push('italic');
  if (isUnderline) formattingValues.push('underline');
  if (isStrikethrough) formattingValues.push('strikethrough');

  const handleFormattingChange = (value: string | string[]) => {
    const values = Array.isArray(value) ? value : [value];
    onBoldChange?.(values.includes('bold'));
    onItalicChange?.(values.includes('italic'));
    onUnderlineChange?.(values.includes('underline'));
    onStrikethroughChange?.(values.includes('strikethrough'));
  };

  const handleAlignmentChange = (value: string | string[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    if (val) {
      onAlignmentChange?.(val as 'left' | 'center' | 'right');
    }
  };

  const quickAccessActions = [
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

  return (
    <Ribbon defaultTab="home">
      <RibbonQuickAccess actions={quickAccessActions} />

      <RibbonTabs>
        <RibbonTabList>
          <RibbonTab value="home">Home</RibbonTab>
          <RibbonTab value="insert">Insert</RibbonTab>
          <RibbonTab value="format">Format</RibbonTab>
          <RibbonTab value="view">View</RibbonTab>
        </RibbonTabList>

        {/* Home Tab */}
        <RibbonTabPanel value="home">
          <RibbonGroup label="Clipboard">
            <RibbonButton
              icon={<Undo className="h-5 w-5" />}
              label="Undo"
              size="lg"
              onClick={onUndo}
              disabled={!canUndo}
            />
            <RibbonButton
              icon={<Redo className="h-5 w-5" />}
              label="Redo"
              size="lg"
              onClick={onRedo}
              disabled={!canRedo}
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Font">
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <RibbonCombobox
                  options={FONT_FAMILIES}
                  value={fontFamily}
                  onSelect={onFontFamilyChange || (() => {})}
                  placeholder="Font"
                  width={120}
                />
                <RibbonCombobox
                  options={FONT_SIZES}
                  value={fontSize}
                  onSelect={onFontSizeChange || (() => {})}
                  placeholder="Size"
                  width={60}
                />
              </div>
              <div className="flex gap-1 items-center">
                <RibbonToggleGroup
                  type="multiple"
                  value={formattingValues}
                  onValueChange={handleFormattingChange}
                  items={[
                    { value: 'bold', icon: Bold, label: 'Bold' },
                    { value: 'italic', icon: Italic, label: 'Italic' },
                    { value: 'underline', icon: Underline, label: 'Underline' },
                    {
                      value: 'strikethrough',
                      icon: Strikethrough,
                      label: 'Strikethrough',
                    },
                  ]}
                />
                <RibbonColorPicker
                  value={textColor}
                  onSelect={onTextColorChange || (() => {})}
                  icon={Palette}
                  label="Text Color"
                />
                <RibbonColorPicker
                  value={highlightColor}
                  onSelect={onHighlightColorChange || (() => {})}
                  icon={Highlighter}
                  label="Highlight"
                />
              </div>
            </div>
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Paragraph">
            <div className="flex flex-col gap-1">
              <RibbonDropdown
                options={HEADING_OPTIONS}
                value={headingStyle}
                onValueChange={onHeadingChange}
                placeholder="Style"
              />
              <RibbonToggleGroup
                type="single"
                value={alignment}
                onValueChange={handleAlignmentChange}
                items={[
                  { value: 'left', icon: AlignLeft, label: 'Align Left' },
                  { value: 'center', icon: AlignCenter, label: 'Center' },
                  { value: 'right', icon: AlignRight, label: 'Align Right' },
                ]}
              />
            </div>
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Lists">
            <RibbonButton
              icon={<List className="h-4 w-4" />}
              onClick={() => onInsertList?.('bullet')}
              aria-label="Bullet List"
            />
            <RibbonButton
              icon={<ListOrdered className="h-4 w-4" />}
              onClick={() => onInsertList?.('numbered')}
              aria-label="Numbered List"
            />
          </RibbonGroup>
        </RibbonTabPanel>

        {/* Insert Tab */}
        <RibbonTabPanel value="insert">
          <RibbonGroup label="Media">
            <RibbonButton
              icon={<Image className="h-5 w-5" />}
              label="Image"
              size="lg"
              onClick={onInsertImage}
            />
            <RibbonButton
              icon={<Video className="h-5 w-5" />}
              label="Video"
              size="lg"
              onClick={onInsertVideo}
            />
            <RibbonButton icon={<Play className="h-5 w-5" />} label="Audio" size="lg" />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Content">
            <RibbonButton
              icon={<Table className="h-5 w-5" />}
              label="Table"
              size="lg"
              onClick={onInsertTable}
            />
            <RibbonButton
              icon={<Code className="h-5 w-5" />}
              label="Code"
              size="lg"
              onClick={onInsertCode}
            />
            <RibbonButton
              icon={<Quote className="h-5 w-5" />}
              label="Quote"
              size="lg"
              onClick={onInsertQuote}
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Links">
            <RibbonButton
              icon={<Link className="h-5 w-5" />}
              label="Hyperlink"
              size="lg"
              onClick={onInsertLink}
            />
          </RibbonGroup>
        </RibbonTabPanel>

        {/* Format Tab */}
        <RibbonTabPanel value="format">
          <RibbonGroup label="Text">
            <RibbonToggleGroup
              type="multiple"
              value={formattingValues}
              onValueChange={handleFormattingChange}
              items={[
                { value: 'bold', icon: Bold, label: 'Bold' },
                { value: 'italic', icon: Italic, label: 'Italic' },
                { value: 'underline', icon: Underline, label: 'Underline' },
                {
                  value: 'strikethrough',
                  icon: Strikethrough,
                  label: 'Strikethrough',
                },
              ]}
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Alignment">
            <RibbonToggleGroup
              type="single"
              value={alignment}
              onValueChange={handleAlignmentChange}
              items={[
                { value: 'left', icon: AlignLeft, label: 'Align Left' },
                { value: 'center', icon: AlignCenter, label: 'Center' },
                { value: 'right', icon: AlignRight, label: 'Align Right' },
              ]}
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Colors">
            <RibbonColorPicker
              value={textColor}
              onSelect={onTextColorChange || (() => {})}
              icon={Palette}
              label="Text Color"
            />
            <RibbonColorPicker
              value={highlightColor}
              onSelect={onHighlightColorChange || (() => {})}
              icon={Highlighter}
              label="Highlight"
            />
          </RibbonGroup>
        </RibbonTabPanel>

        {/* View Tab */}
        <RibbonTabPanel value="view">
          <RibbonGroup label="Preview">
            <RibbonButton icon={<Play className="h-5 w-5" />} label="Preview" size="lg" />
          </RibbonGroup>
        </RibbonTabPanel>
      </RibbonTabs>
    </Ribbon>
  );
}
