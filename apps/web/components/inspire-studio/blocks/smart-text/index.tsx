'use client';

import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Clock, Type } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { BaseBlockProps, SmartTextConfig, SmartTextContent } from '../types';
import {
  calculateReadingTime,
  getDefaultSmartTextConfig,
  getDefaultSmartTextContent,
} from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

interface SmartTextBlockProps extends BaseBlockProps {
  content?: SmartTextContent;
  config?: SmartTextConfig;
}

/**
 * SmartTextBlock - Adaptive text block with rich formatting
 *
 * Features:
 * - Multiple variants (paragraph, heading, callout, quote, code)
 * - Text alignment options
 * - Reading time calculation
 * - Highlighting support
 */
export function SmartTextBlock({
  content = getDefaultSmartTextContent(),
  config = getDefaultSmartTextConfig(),
  isEditing = false,
  onContentChange,
  onConfigChange,
  className,
}: SmartTextBlockProps) {
  const readingTime = useMemo(() => calculateReadingTime(content.plainText), [content.plainText]);

  const handleTextChange = useCallback(
    (text: string) => {
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      onContentChange?.({
        html: text,
        plainText: text,
        wordCount,
        readingTimeMinutes: calculateReadingTime(text),
      });
    },
    [onContentChange],
  );

  const handleConfigChange = useCallback(
    (key: keyof SmartTextConfig, value: unknown) => {
      onConfigChange?.({ ...config, [key]: value });
    },
    [config, onConfigChange],
  );

  // Render editing mode
  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Config Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Variant Select */}
          <Select value={config.variant} onValueChange={(v) => handleConfigChange('variant', v)}>
            <SelectTrigger className="w-[120px] h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="heading">Heading</SelectItem>
              <SelectItem value="callout">Callout</SelectItem>
              <SelectItem value="quote">Quote</SelectItem>
              <SelectItem value="code">Code</SelectItem>
            </SelectContent>
          </Select>

          {/* Heading Level (if heading) */}
          {config.variant === 'heading' && (
            <Select
              value={String(config.headingLevel ?? 2)}
              onValueChange={(v) => handleConfigChange('headingLevel', Number(v))}
            >
              <SelectTrigger className="w-[80px] h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
                <SelectItem value="5">H5</SelectItem>
                <SelectItem value="6">H6</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Callout Type (if callout) */}
          {config.variant === 'callout' && (
            <Select
              value={config.calloutType ?? 'info'}
              onValueChange={(v) => handleConfigChange('calloutType', v)}
            >
              <SelectTrigger className="w-[100px] h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="tip">Tip</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Alignment */}
          <div className="flex items-center border border-lxd-dark-border rounded-md overflow-hidden">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight },
              { value: 'justify', icon: AlignJustify },
            ].map(({ value, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 rounded-none',
                  config.alignment === value && 'bg-lxd-purple/20 text-lxd-purple',
                )}
                onClick={() => handleConfigChange('alignment', value)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Text Size */}
          <Select value={config.textSize} onValueChange={(v) => handleConfigChange('textSize', v)}>
            <SelectTrigger className="w-[80px] h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
              <Type className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="base">Normal</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">XL</SelectItem>
              <SelectItem value="2xl">2XL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Editor */}
        <Textarea
          value={content.plainText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your text..."
          className={cn(
            'min-h-[150px] bg-lxd-dark-bg border-lxd-dark-border resize-y',
            `text-${config.textSize}`,
            `text-${config.alignment}`,
          )}
        />

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{content.wordCount} words</span>
          {config.showReadingTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} min read
            </span>
          )}
        </div>
      </div>
    );
  }

  // Render preview/display mode
  const textClasses = cn(
    `text-${config.textSize}`,
    `text-${config.alignment}`,
    config.variant === 'code' && 'font-mono bg-lxd-dark-bg p-4 rounded-lg',
    config.variant === 'quote' && 'italic border-l-4 border-lxd-purple pl-4',
  );

  const calloutClasses = cn(
    'p-4 rounded-lg border',
    config.calloutType === 'info' && 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    config.calloutType === 'warning' && 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    config.calloutType === 'success' && 'bg-green-500/10 border-green-500/30 text-green-300',
    config.calloutType === 'error' && 'bg-red-500/10 border-red-500/30 text-red-300',
    config.calloutType === 'tip' && 'bg-purple-500/10 border-purple-500/30 text-purple-300',
  );

  return (
    <div className={cn('relative', className)}>
      {config.variant === 'heading' && (
        <HeadingTag level={config.headingLevel ?? 2} className={textClasses}>
          {content.plainText}
        </HeadingTag>
      )}

      {config.variant === 'paragraph' && <p className={textClasses}>{content.plainText}</p>}

      {config.variant === 'callout' && (
        <div className={cn(calloutClasses, textClasses)}>{content.plainText}</div>
      )}

      {config.variant === 'quote' && (
        <blockquote className={textClasses}>{content.plainText}</blockquote>
      )}

      {config.variant === 'code' && (
        <pre className={textClasses}>
          <code>{content.plainText}</code>
        </pre>
      )}

      {config.showReadingTime && readingTime > 0 && (
        <Badge variant="outline" className="absolute top-2 right-2 text-[10px]">
          <Clock className="h-3 w-3 mr-1" />
          {readingTime} min
        </Badge>
      )}
    </div>
  );
}

// Helper component for dynamic heading levels
function HeadingTag({
  level,
  className,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}) {
  const sizeClasses = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  };

  const headingClass = cn(sizeClasses[level], className);

  switch (level) {
    case 1:
      return <h1 className={headingClass}>{children}</h1>;
    case 2:
      return <h2 className={headingClass}>{children}</h2>;
    case 3:
      return <h3 className={headingClass}>{children}</h3>;
    case 4:
      return <h4 className={headingClass}>{children}</h4>;
    case 5:
      return <h5 className={headingClass}>{children}</h5>;
    case 6:
      return <h6 className={headingClass}>{children}</h6>;
    default:
      return <h2 className={headingClass}>{children}</h2>;
  }
}

export default SmartTextBlock;
