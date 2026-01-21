import { Check, Edit2, Loader, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface AIContentGeneratorData {
  prompt?: string;
  contentType?: 'explanation' | 'example' | 'activity' | 'summary';
  tone?: 'formal' | 'conversational' | 'technical';
  length?: 'brief' | 'moderate' | 'detailed';
  generatedContent?: string;
  acceptedContent?: string;
}

export const AIContentGeneratorBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as AIContentGeneratorData) || {};
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [contentType, setContentType] = useState(data.contentType || 'explanation');
  const [tone, setTone] = useState(data.tone || 'conversational');
  const [length, setLength] = useState(data.length || 'moderate');
  const [generatedContent, setGeneratedContent] = useState(data.generatedContent || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // TODO(LXD-301): Implement Cloud Functions AI content generation
      setError('AI content generation temporarily unavailable during Firebase migration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = (): void => {
    props.onUpdate({
      ...props.block,
      content: {
        ...data,
        acceptedContent: generatedContent,
      } as Record<string, unknown>,
    });
  };

  const handleContentEdit = (newContent: string): void => {
    setGeneratedContent(newContent);
    props.onUpdate({
      ...props.block,
      content: {
        ...data,
        generatedContent: newContent,
      } as Record<string, unknown>,
    });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">AI Content Generator</h3>
        </div>

        <div>
          <label
            htmlFor="ai-content-type"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Content Type
          </label>
          <select
            id="ai-content-type"
            value={contentType}
            onChange={(e) =>
              setContentType(e.target.value as 'explanation' | 'example' | 'activity' | 'summary')
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          >
            <option value="explanation">Explanatory Text</option>
            <option value="example">Example/Case Study</option>
            <option value="activity">Practice Activity</option>
            <option value="summary">Summary/Key Takeaways</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="ai-content-prompt"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            What do you want to create?
          </label>
          <textarea
            id="ai-content-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Explain machine learning concepts for beginners with real-world examples"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="ai-content-tone"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Tone
            </label>
            <select
              id="ai-content-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as 'formal' | 'conversational' | 'technical')}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
            >
              <option value="formal">Formal</option>
              <option value="conversational">Conversational</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ai-content-length"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Length
            </label>
            <select
              id="ai-content-length"
              value={length}
              onChange={(e) => setLength(e.target.value as 'brief' | 'moderate' | 'detailed')}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
            >
              <option value="brief">Brief</option>
              <option value="moderate">Moderate</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-brand-primary rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Content
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {generatedContent && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-sm font-medium text-brand-secondary">
                Generated Content
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-brand-secondary hover:text-brand-primary hover:bg-brand-surface rounded transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Preview' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={generatedContent}
                onChange={(e) => handleContentEdit(e.target.value)}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent resize-none font-mono text-sm"
                rows={12}
              />
            ) : (
              <div className="p-4 bg-brand-page border border-brand-default rounded-lg">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {generatedContent}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="flex items-center gap-2 px-4 py-2 bg-brand-success text-brand-primary rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-brand-secondary rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseBlockEditor>
  );
};
