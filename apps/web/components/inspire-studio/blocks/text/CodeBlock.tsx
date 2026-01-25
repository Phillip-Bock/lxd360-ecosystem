'use client';

import { Check, ChevronDown, Copy, FileCode } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { logger } from '@/lib/logger';
import type { CodeBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const log = logger.scope('CodeBlock');

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'plaintext', label: 'Plain Text' },
];

/**
 * CodeBlock - Code with syntax highlighting
 */
export function CodeBlock({ block, isEditing, onUpdate }: BlockComponentProps<CodeBlockContent>) {
  const content = block.content as CodeBlockContent;
  const [copied, setCopied] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const language = content.language || 'javascript';
  const showLineNumbers = content.showLineNumbers !== false;
  const showCopyButton = content.showCopyButton !== false;
  const theme = content.theme || 'dark';

  // Copy code to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      log.error('Failed to copy code', err instanceof Error ? err : new Error(String(err)));
    }
  }, [content.code]);

  // Update code
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({
        content: {
          ...content,
          code: e.target.value,
        },
      });
    },
    [content, onUpdate],
  );

  // Update language
  const handleLanguageChange = useCallback(
    (lang: string) => {
      onUpdate({
        content: {
          ...content,
          language: lang,
        },
      });
      setShowLanguageMenu(false);
    },
    [content, onUpdate],
  );

  // Split code into lines
  const lines = (content.code || '').split('\n');
  const highlightLines = content.highlightLines || [];

  return (
    <div
      className={`rounded-xl overflow-hidden border ${theme === 'dark' ? 'bg-studio-bg-dark border-studio-surface/50' : 'bg-muted border-border'}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${theme === 'dark' ? 'bg-studio-bg border-studio-surface/50' : 'bg-secondary border-border'}`}
      >
        {/* Filename or language */}
        <div className="flex items-center gap-2">
          <FileCode
            className={`w-4 h-4 ${theme === 'dark' ? 'text-studio-accent' : 'text-brand-blue'}`}
          />
          {content.filename ? (
            <span
              className={`text-sm font-mono ${theme === 'dark' ? 'text-studio-text' : 'text-muted-foreground'}`}
            >
              {content.filename}
            </span>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => isEditing && setShowLanguageMenu(!showLanguageMenu)}
                className={`
                  flex items-center gap-1 text-sm font-mono
                  ${isEditing ? 'cursor-pointer hover:text-brand-primary' : ''}
                  ${theme === 'dark' ? 'text-studio-text-muted' : 'text-muted-foreground'}
                `}
              >
                {LANGUAGES.find((l) => l.value === language)?.label || language}
                {isEditing && <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Language dropdown */}
              {showLanguageMenu && (
                <div className="absolute top-full left-0 mt-1 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl py-1 z-20 max-h-60 overflow-y-auto w-40">
                  {LANGUAGES.map((lang) => (
                    <button
                      type="button"
                      key={lang.value}
                      onClick={() => handleLanguageChange(lang.value)}
                      className={`
                        w-full px-3 py-1.5 text-sm text-left transition-colors
                        ${
                          language === lang.value
                            ? 'bg-studio-accent/20 text-studio-accent'
                            : 'text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary'
                        }
                      `}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Copy button */}
        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm transition-colors
              ${
                copied
                  ? 'bg-brand-success/20 text-brand-success'
                  : theme === 'dark'
                    ? 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }
            `}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto">
        {isEditing ? (
          <div className="flex">
            {/* Line numbers */}
            {showLineNumbers && (
              <div
                className={`shrink-0 px-4 py-4 text-right select-none font-mono text-sm ${theme === 'dark' ? 'text-studio-text-muted bg-studio-bg/50' : 'text-muted-foreground bg-secondary'}`}
              >
                {lines.map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* Code textarea */}
            <textarea
              value={content.code || ''}
              onChange={handleCodeChange}
              className={`
                flex-1 p-4 font-mono text-sm leading-6 resize-none outline-hidden
                ${theme === 'dark' ? 'bg-transparent text-studio-text' : 'bg-background text-foreground'}
                min-h-[100px]
              `}
              placeholder="// Enter your code here..."
              spellCheck={false}
              style={{ tabSize: 2 }}
            />
          </div>
        ) : (
          <div className="flex">
            {/* Line numbers */}
            {showLineNumbers && (
              <div
                className={`shrink-0 px-4 py-4 text-right select-none font-mono text-sm ${theme === 'dark' ? 'text-studio-text-muted bg-studio-bg/50' : 'text-muted-foreground bg-secondary'}`}
              >
                {lines.map((_, i) => (
                  <div
                    key={i}
                    className={`leading-6 ${highlightLines.includes(i + 1) ? 'text-studio-accent' : ''}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* Code display */}
            <pre
              className={`flex-1 p-4 overflow-x-auto font-mono text-sm ${theme === 'dark' ? 'text-studio-text' : 'text-foreground'}`}
            >
              <code>
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className={`leading-6 ${highlightLines.includes(i + 1) ? 'bg-studio-accent/10 -mx-4 px-4' : ''}`}
                  >
                    {line || ' '}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeBlock;
