'use client';

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  ImageIcon,
  Indent,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize,
  Outdent,
  Palette,
  Redo,
  Search,
  Smile,
  Sparkles,
  SpellCheck,
  Strikethrough,
  Table,
  Type,
  Underline,
  Undo,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxChars?: number;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  maxChars = 5000,
  placeholder,
}: RichTextEditorProps): React.JSX.Element {
  const charCount = (value || '').length;

  return (
    <div className="border border-lxd-dark-surface-alt dark:border-lxd-dark-surface-alt rounded-lg overflow-hidden">
      {/* RTE Toolbar */}
      <div className="flex flex-wrap gap-1 bg-background-dark dark:bg-background-dark border-b border-lxd-dark-surface-alt p-2">
        {/* Basic Formatting Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
        </div>

        {/* Font & Style Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Font"
          >
            <Type className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Headings Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Heading 4"
          >
            <Heading4 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Heading 5"
          >
            <Heading5 className="w-4 h-4" />
          </Button>
        </div>

        {/* Alignment Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        {/* Lists Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Bulleted List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Indent"
          >
            <Indent className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Outdent"
          >
            <Outdent className="w-4 h-4" />
          </Button>
        </div>

        {/* Media Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Insert Link"
          >
            <Link2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Insert Video"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Insert Table"
          >
            <Table className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Tools Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Source Code"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Full Screen"
          >
            <Maximize className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Find & Replace"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Spell Check"
          >
            <SpellCheck className="w-4 h-4" />
          </Button>
        </div>

        {/* Undo/Redo Group */}
        <div className="flex gap-1 pr-2 border-r border-lxd-dark-surface-alt">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-brand-secondary hover:text-brand-primary hover:bg-lxd-dark-surface-alt"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Group */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-block-special hover:text-block-special hover:bg-lxd-dark-surface-alt"
            title="Re-write with AI"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div
        contentEditable
        className="min-h-[150px] p-4 outline-hidden bg-background text-foreground focus:ring-2 focus:ring-secondary-blue focus:ring-inset"
        onInput={(e) => {
          const text = e.currentTarget.textContent || '';
          if (text.length <= maxChars) {
            onChange(text);
          }
        }}
        suppressContentEditableWarning
      >
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </div>

      {/* Character Counter */}
      <div className="px-4 py-2 bg-background-dark border-t border-lxd-dark-surface-alt text-right text-sm">
        <span className={charCount >= maxChars ? 'text-brand-error' : 'text-brand-muted'}>
          {charCount} / {maxChars}
        </span>
      </div>
    </div>
  );
}
