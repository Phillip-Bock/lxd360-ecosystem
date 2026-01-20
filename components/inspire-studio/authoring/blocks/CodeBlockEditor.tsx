import { Check, Code, Copy, Eye, EyeOff, FileCode, Hash, Monitor } from 'lucide-react';
import { useState } from 'react';
import type { CodeBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface CodeBlockEditorProps {
  block: CodeBlock;
  onChange: (content: CodeBlock['content']) => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'csharp', label: 'C#', icon: '💜' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'c', label: 'C', icon: '🔵' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'swift', label: 'Swift', icon: '🍎' },
  { value: 'kotlin', label: 'Kotlin', icon: '🎯' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'scss', label: 'SCSS', icon: '💅' },
  { value: 'sql', label: 'SQL', icon: '💾' },
  { value: 'bash', label: 'Bash', icon: '🐚' },
  { value: 'powershell', label: 'PowerShell', icon: '⚙️' },
  { value: 'json', label: 'JSON', icon: '📋' },
  { value: 'xml', label: 'XML', icon: '📄' },
  { value: 'yaml', label: 'YAML', icon: '📝' },
  { value: 'markdown', label: 'Markdown', icon: '📖' },
  { value: 'plaintext', label: 'Plain Text', icon: '📃' },
];

const THEMES = [
  { value: 'vs-dark', label: 'VS Code Dark' },
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'dracula', label: 'Dracula' },
];

export const CodeBlockEditor = ({ block, onChange }: CodeBlockEditorProps): React.JSX.Element => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const selectedLang = LANGUAGES.find((l) => l.value === block.content.language) || LANGUAGES[0];

  const handleCopy = (): void => {
    navigator.clipboard.writeText(block.content.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Language Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="code-language-select"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            <Code className="w-4 h-4 inline mr-1" />
            Programming Language
          </label>
          <select
            id="code-language-select"
            value={block.content.language}
            onChange={(e) => onChange({ ...block.content, language: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="code-filename-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            <FileCode className="w-4 h-4 inline mr-1" />
            Filename (optional)
          </label>
          <input
            id="code-filename-input"
            type="text"
            value={block.content.filename || ''}
            onChange={(e) => onChange({ ...block.content, filename: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="example.js"
          />
        </div>
      </div>

      {/* Code Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="code-editor-textarea"
            className="text-sm font-medium text-brand-secondary"
          >
            Code
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-muted">
              {block.content.code.split('\n').length} lines • {block.content.code.length} chars
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-brand-surface hover:bg-gray-200 rounded transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="relative">
          <textarea
            id="code-editor-textarea"
            value={block.content.code}
            onChange={(e) => onChange({ ...block.content, code: e.target.value })}
            rows={16}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm bg-brand-page text-brand-success"
            placeholder="// Enter your code here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Code Options */}
      <div className="border-t border-brand-default pt-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.showLineNumbers}
                onChange={(e) => onChange({ ...block.content, showLineNumbers: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <Hash className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Show line numbers</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.wrapLines || false}
                onChange={(e) => onChange({ ...block.content, wrapLines: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <svg
                className="w-4 h-4 text-brand-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-labelledby="wrap-lines-icon-title"
              >
                <title id="wrap-lines-icon-title">Wrap lines icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span className="text-sm text-brand-secondary">Wrap long lines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.copyButton !== false}
                onChange={(e) => onChange({ ...block.content, copyButton: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <Copy className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Show copy button</span>
            </label>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="code-theme-select"
                className="block text-sm text-brand-secondary mb-1"
              >
                Theme
              </label>
              <select
                id="code-theme-select"
                value={block.content.theme || 'vs-dark'}
                onChange={(e) => onChange({ ...block.content, theme: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {THEMES.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="code-highlight-lines-input"
                className="block text-sm text-brand-secondary mb-1"
              >
                Highlight lines
              </label>
              <input
                id="code-highlight-lines-input"
                type="text"
                value={block.content.highlightLines?.join(', ') || ''}
                onChange={(e) => {
                  const lines = e.target.value
                    .split(',')
                    .map((n) => parseInt(n.trim(), 10))
                    .filter((n) => !Number.isNaN(n));
                  onChange({
                    ...block.content,
                    highlightLines: lines.length > 0 ? lines : undefined,
                  });
                }}
                className="w-full px-3 py-1.5 text-sm border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="1, 5, 10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Toggle */}
      {block.content.code && (
        <div className="border-t border-brand-default pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm font-medium text-brand-secondary hover:text-green-600 mb-3"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>

          {showPreview && (
            <div className="bg-brand-page border border-brand-default rounded-lg p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-brand-default">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-brand-muted" />
                  <span className="text-xs text-brand-muted">
                    {selectedLang.icon} {selectedLang.label}
                    {block.content.filename && ` • ${block.content.filename}`}
                  </span>
                </div>
                {block.content.copyButton !== false && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2 py-1 text-xs text-brand-muted hover:text-brand-primary transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <pre className="text-sm text-brand-success font-mono whitespace-pre-wrap">
                {block.content.code}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-xs text-green-800">
          <strong>Pro tip:</strong> Your code will be displayed with syntax highlighting for the
          selected language. Use the highlight lines feature to emphasize specific parts of the
          code.
        </p>
      </div>
    </div>
  );
};
