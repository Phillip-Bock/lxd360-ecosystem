'use client';

import {
  Check,
  ChevronDown,
  Clock,
  Edit3,
  Eye,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Tablet,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { contentBlocksData } from '@/lib/inspire/config/authoringBlocks';
import type { ContentBlock } from '@/lib/inspire-studio/types/contentBlocks';
import { ContentBlocksSidebar } from './ContentBlocksSidebar';
import { ContentEditor } from './ContentEditor';
import { RibbonToolbar } from './RibbonToolbar';
import { VersionRevertModal } from './VersionRevertModal';

interface Version {
  id: string;
  number: number;
  timestamp: string;
  content: ContentBlock[];
}

interface BlockFormatting {
  fontFamily?: string;
  fontSize?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textColor?: string;
  highlight?: string;
  textStyle?: string;
  listType?: 'none' | 'bullet' | 'numbered';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
  lineSpacing?: string;
  textDirection?: string;
}

interface LessonAuthorProps {
  courseType?: string;
}

export function LessonAuthor({ courseType }: LessonAuthorProps = {}): React.JSX.Element {
  const isMicrolearning = courseType === 'microlearning';
  const [lessonTitle, setLessonTitle] = useState(
    isMicrolearning ? 'New Micro Learning Module' : 'New Lesson',
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revertModalOpen, setRevertModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [ribbonCollapsed, setRibbonCollapsed] = useState(false);
  const [history, setHistory] = useState<ContentBlock[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<ContentBlock | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v1',
      number: 1,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      content: [],
    },
  ]);

  const [currentVersion, setCurrentVersion] = useState<Version>(versions[0]);

  const handleSave = (): void => {
    const newVersionNumber = currentVersion.number + 1;
    const newVersion: Version = {
      id: `v${newVersionNumber}`,
      number: newVersionNumber,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      content: [...contentBlocks],
    };

    setVersions([newVersion, ...versions]);
    setCurrentVersion(newVersion);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleVersionSelect = (version: Version): void => {
    if (version.id !== currentVersion.id) {
      setSelectedVersion(version);
      setRevertModalOpen(true);
    }
    setVersionDropdownOpen(false);
  };

  const handleRevertConfirm = (): void => {
    if (selectedVersion) {
      setCurrentVersion(selectedVersion);
      setContentBlocks([...selectedVersion.content]);
      setRevertModalOpen(false);
      setSelectedVersion(null);
    }
  };

  const addToHistory = (blocks: ContentBlock[]): void => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...blocks]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleRibbonAction = (action: string, value?: unknown): void => {
    switch (action) {
      case 'undo':
        if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setContentBlocks(history[historyIndex - 1]);
        }
        break;

      case 'redo':
        if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setContentBlocks(history[historyIndex + 1]);
        }
        break;

      case 'save':
      case 'saveVersion':
        handleSave();
        break;

      case 'paste':
        if (copiedBlock) {
          const newBlock = {
            ...copiedBlock,
            id: `block_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          if (value === 'plain') {
            if ('text' in newBlock.content) {
              newBlock.content = { text: newBlock.content.text };
            }
          }

          setContentBlocks([...contentBlocks, newBlock]);
          addToHistory([...contentBlocks, newBlock]);
        }
        break;

      case 'cut':
        if (selectedBlockId) {
          const blockToCut = contentBlocks.find((b) => b.id === selectedBlockId);
          if (blockToCut) {
            setCopiedBlock(blockToCut);
            const newBlocks = contentBlocks.filter((b) => b.id !== selectedBlockId);
            setContentBlocks(newBlocks);
            addToHistory(newBlocks);
            setSelectedBlockId(null);
          }
        }
        break;

      case 'copy':
        if (selectedBlockId) {
          const blockToCopy = contentBlocks.find((b) => b.id === selectedBlockId);
          if (blockToCopy) {
            setCopiedBlock(blockToCopy);
          }
        }
        break;

      case 'duplicate':
        if (selectedBlockId) {
          const blockToDuplicate = contentBlocks.find((b) => b.id === selectedBlockId);
          if (blockToDuplicate) {
            const newBlock = {
              ...blockToDuplicate,
              id: `block_${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setContentBlocks([...contentBlocks, newBlock]);
            addToHistory([...contentBlocks, newBlock]);
          }
        }
        break;

      case 'formatPainter':
        console.error('[LessonAuthor] Format Painter functionality not yet implemented');
        break;

      case 'fontFamily':
      case 'fontSize':
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strikethrough':
      case 'textColor':
      case 'highlight':
      case 'clearFormatting':
      case 'textStyle':
      case 'bulletList':
      case 'numberedList':
      case 'alignLeft':
      case 'alignCenter':
      case 'alignRight':
      case 'alignJustify':
      case 'increaseIndent':
      case 'decreaseIndent':
      case 'lineSpacing':
      case 'textDirection':
        if (selectedBlockId) {
          const updatedBlocks = contentBlocks.map((block) => {
            if (block.id === selectedBlockId) {
              const currentFormatting = (block.content.formatting ?? {}) as BlockFormatting;
              const formatting: BlockFormatting = { ...currentFormatting };

              switch (action) {
                case 'fontFamily':
                  formatting.fontFamily = value as string;
                  break;
                case 'fontSize':
                  formatting.fontSize = value as string;
                  break;
                case 'bold':
                  formatting.bold = !formatting.bold;
                  break;
                case 'italic':
                  formatting.italic = !formatting.italic;
                  break;
                case 'underline':
                  formatting.underline = !formatting.underline;
                  break;
                case 'strikethrough':
                  formatting.strikethrough = !formatting.strikethrough;
                  break;
                case 'textColor':
                  formatting.textColor = value as string;
                  break;
                case 'highlight':
                  formatting.highlight = value as string;
                  break;
                case 'clearFormatting':
                  break;
                case 'textStyle':
                  formatting.textStyle = value as string;
                  break;
                case 'bulletList':
                  formatting.listType = formatting.listType === 'bullet' ? 'none' : 'bullet';
                  break;
                case 'numberedList':
                  formatting.listType = formatting.listType === 'numbered' ? 'none' : 'numbered';
                  break;
                case 'alignLeft':
                  formatting.textAlign = 'left';
                  break;
                case 'alignCenter':
                  formatting.textAlign = 'center';
                  break;
                case 'alignRight':
                  formatting.textAlign = 'right';
                  break;
                case 'alignJustify':
                  formatting.textAlign = 'justify';
                  break;
                case 'increaseIndent':
                  formatting.indent = (formatting.indent ?? 0) + 1;
                  break;
                case 'decreaseIndent':
                  formatting.indent = Math.max(0, (formatting.indent ?? 0) - 1);
                  break;
                case 'lineSpacing':
                  formatting.lineSpacing = value as string;
                  break;
                case 'textDirection':
                  formatting.textDirection = value as string;
                  break;
              }

              const updatedContent =
                action === 'clearFormatting'
                  ? { ...block.content, formatting: {} }
                  : { ...block.content, formatting };

              return {
                ...block,
                content: updatedContent,
                updatedAt: new Date().toISOString(),
              } as ContentBlock;
            }
            return block;
          });

          setContentBlocks(updatedBlocks);
          addToHistory(updatedBlocks);
        }
        break;

      case 'focusOrder':
        console.error('[LessonAuthor] Focus Order functionality not yet implemented');
        break;

      case 'altText':
        if (selectedBlockId) {
          const block = contentBlocks.find((b) => b.id === selectedBlockId);
          if (block && (block.type === 'image' || block.type === 'video')) {
            // TODO(LXD-412): Replace with proper modal UI for alt text input
            console.error('[LessonAuthor] Alt text editor not yet implemented');
          } else {
            console.error('[LessonAuthor] Alt text is only available for image and video blocks');
          }
        }
        break;

      case 'openBlocksSidebar':
        setSidebarOpen(true);
        break;

      case 'viewHistory':
        setVersionDropdownOpen(!versionDropdownOpen);
        break;

      case 'spellCheck':
        console.error('[LessonAuthor] Spell check functionality not yet implemented');
        break;

      case 'addComment':
        if (selectedBlockId) {
          // TODO(LXD-412): Replace with proper modal UI for comment input
          console.error('[LessonAuthor] Comment functionality not yet implemented');
        } else {
          console.error('[LessonAuthor] Please select a block to add a comment');
        }
        break;

      case 'insertText':
      case 'insertHeading':
      case 'insertImage':
      case 'insertVideo':
      case 'insertQuiz':
      case 'insertTable':
      case 'insertCode':
      case 'insertQuote':
      case 'insertDivider':
      case 'insertLink':
        setSidebarOpen(true);
        break;

      case 'theme':
        console.error('[LessonAuthor] Theme functionality not yet implemented', { theme: value });
        break;

      case 'layout':
        console.error('[LessonAuthor] Layout functionality not yet implemented', { layout: value });
        break;

      case 'backgroundColor':
        console.error('[LessonAuthor] Background color functionality not yet implemented', {
          color: value,
        });
        break;

      case 'animations':
        console.error('[LessonAuthor] Animations functionality not yet implemented');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-brand-page">
      {/* Header */}
      <header className="bg-brand-surface border-b border-brand-default sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="text-2xl font-bold text-brand-primary bg-transparent border-b-2 border-transparent hover:border-brand-strong focus:border-brand-primary focus:outline-hidden px-2 py-1 transition-colors"
              />
              {isMicrolearning && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm">
                  <Zap className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-semibold text-brand-primary">Micro Learning</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Version Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setVersionDropdownOpen(!versionDropdownOpen)}
                  className="px-4 py-2 bg-brand-surface border border-brand-strong text-brand-secondary rounded-lg font-medium hover:bg-brand-page transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Version {currentVersion.number}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {versionDropdownOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 border-none bg-transparent cursor-default"
                      onClick={() => setVersionDropdownOpen(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.key === 'Enter') setVersionDropdownOpen(false);
                      }}
                      aria-label="Close version dropdown"
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-brand-surface border border-brand-default rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-brand-default bg-brand-page">
                        <h3 className="text-sm font-semibold text-brand-primary">
                          Version History
                        </h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {versions.map((version) => (
                          <button
                            type="button"
                            key={version.id}
                            onClick={() => handleVersionSelect(version)}
                            className={`w-full px-4 py-3 text-left hover:bg-brand-page transition-colors border-b border-gray-100 last:border-b-0 ${
                              version.id === currentVersion.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-brand-primary">
                                Version {version.number}
                              </span>
                              {version.id === currentVersion.id && (
                                <span className="flex items-center gap-1 text-xs text-brand-blue font-medium">
                                  <Check className="w-3 h-3" />
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-brand-secondary flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {version.timestamp}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                className="relative px-4 py-2 bg-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-primary-hover transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
                {showSaveSuccess && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-success rounded-full animate-ping" />
                )}
              </button>

              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isPreviewMode
                    ? 'bg-gray-200 text-brand-primary hover:bg-gray-300'
                    : 'bg-brand-surface border border-brand-strong text-brand-secondary hover:bg-brand-page'
                }`}
              >
                <Eye className="w-4 h-4" />
                {isPreviewMode ? 'Exit Preview' : 'Preview'}
              </button>

              {/* Add Block Button */}
              {!isPreviewMode && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="px-4 py-2 bg-brand-success text-brand-primary rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Block
                </button>
              )}
            </div>
          </div>

          {/* Save Success Message */}
          {showSaveSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" />
              Saved as Version {currentVersion.number}
            </div>
          )}
        </div>
      </header>

      {/* Ribbon Toolbar */}
      {!isPreviewMode && (
        <RibbonToolbar
          onAction={handleRibbonAction}
          isCollapsed={ribbonCollapsed}
          onToggleCollapse={() => setRibbonCollapsed(!ribbonCollapsed)}
          selectedBlockId={selectedBlockId}
        />
      )}

      {/* Main Content Area */}
      <div className="px-6 py-6">
        <div className="bg-brand-surface border-b border-brand-default px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-brand-primary">{lessonTitle}</h2>
        </div>

        <div className="bg-brand-surface rounded-b-xl shadow-sm border border-brand-default min-h-[600px]">
          {isPreviewMode ? (
            <div className="h-full flex flex-col">
              {/* Device Selector */}
              <div className="border-b border-brand-default bg-brand-page px-6 py-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-brand-primary text-brand-primary'
                      : 'bg-brand-surface text-brand-secondary hover:bg-brand-surface'
                  }`}
                  title="Desktop View (1920px)"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewDevice === 'tablet'
                      ? 'bg-brand-primary text-brand-primary'
                      : 'bg-brand-surface text-brand-secondary hover:bg-brand-surface'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-4 h-4" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-brand-primary text-brand-primary'
                      : 'bg-brand-surface text-brand-secondary hover:bg-brand-surface'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 bg-brand-surface p-8 flex justify-center overflow-auto">
                <div
                  className={`bg-brand-surface shadow-xl transition-all duration-300 ${
                    previewDevice === 'desktop'
                      ? 'w-full max-w-7xl'
                      : previewDevice === 'tablet'
                        ? 'w-[768px]'
                        : 'w-[375px]'
                  }`}
                  style={{ minHeight: '600px' }}
                >
                  <div className="p-8">
                    {contentBlocks.length === 0 ? (
                      <div className="text-center py-16 text-brand-muted">
                        <Edit3 className="w-12 h-12 mx-auto mb-3 text-brand-muted" />
                        <p className="font-medium">No content to preview</p>
                        <p className="text-sm mt-1">Add content blocks to see them here</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {contentBlocks.map((block) => {
                          const text =
                            typeof block.content === 'object' &&
                            block.content !== null &&
                            'text' in block.content
                              ? String(block.content.text)
                              : typeof block.content === 'string'
                                ? block.content
                                : '';

                          return (
                            <div key={block.id} className="animate-fadeIn">
                              {block.type === 'heading' && (
                                <h2 className="text-2xl font-bold text-brand-primary">
                                  {text || 'Heading'}
                                </h2>
                              )}
                              {block.type === 'text' && (
                                <p className="text-brand-secondary leading-relaxed">
                                  {text || 'Text content'}
                                </p>
                              )}
                              {block.type === 'divider' && (
                                <hr className="border-t-2 border-brand-default my-4" />
                              )}
                              {!['heading', 'text', 'divider'].includes(block.type) &&
                                ((): React.JSX.Element => {
                                  const blockDef = contentBlocksData.find(
                                    (b) => b.type === block.type,
                                  );
                                  const blockName =
                                    blockDef?.name ||
                                    block.type
                                      .replace(/_/g, ' ')
                                      .replace(/\b\w/g, (l) => l.toUpperCase());
                                  const blockColor = blockDef?.color || 'bg-gray-600';
                                  return (
                                    <div className="border border-brand-default rounded-lg p-6 bg-brand-page">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div
                                          className={`w-8 h-8 ${blockColor} rounded-lg flex items-center justify-center text-brand-primary text-xs font-bold`}
                                        >
                                          {blockName.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-brand-primary">
                                          {blockName}
                                        </span>
                                      </div>
                                      <p className="text-brand-secondary">
                                        {text || `${blockName} content would appear here`}
                                      </p>
                                    </div>
                                  );
                                })()}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <ContentEditor
                initialBlocks={contentBlocks}
                onSave={(blocks) => {
                  setContentBlocks(blocks);
                  addToHistory(blocks);
                }}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Blocks Sidebar */}
      <ContentBlocksSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Version Revert Modal */}
      <VersionRevertModal
        isOpen={revertModalOpen}
        onClose={() => {
          setRevertModalOpen(false);
          setSelectedVersion(null);
        }}
        onConfirm={handleRevertConfirm}
        versionNumber={selectedVersion?.number || 0}
        versionDate={selectedVersion?.timestamp || ''}
      />
    </div>
  );
}
