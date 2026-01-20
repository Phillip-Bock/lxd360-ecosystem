import { BookOpen, Download, Eye, Lock, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import type {
  JournalPrompt,
  ReflectiveJournalBlock,
} from '@/lib/inspire-studio/types/contentBlocks';

interface ReflectiveJournalBlockEditorProps {
  block: ReflectiveJournalBlock;
  onChange: (content: ReflectiveJournalBlock['content']) => void;
}

export const ReflectiveJournalBlockEditor = ({
  block,
  onChange,
}: ReflectiveJournalBlockEditorProps): React.JSX.Element => {
  const [prompts, setPrompts] = useState<JournalPrompt[]>(
    block.content.prompts || [
      {
        id: 'prompt-1',
        question: 'What did you learn today?',
        category: 'Learning',
        required: false,
      },
    ],
  );
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (updatedPrompts: JournalPrompt[]): void => {
    setPrompts(updatedPrompts);
    onChange({
      ...block.content,
      prompts: updatedPrompts,
    });
  };

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);

  const addPrompt = (): void => {
    const newId = `prompt-${Date.now()}`;
    const newPrompt: JournalPrompt = {
      id: newId,
      question: 'New reflection prompt',
      category: 'General',
      required: false,
    };
    updateContent([...prompts, newPrompt]);
    setSelectedPromptId(newId);
  };

  const deletePrompt = (id: string): void => {
    updateContent(prompts.filter((p) => p.id !== id));
    if (selectedPromptId === id) setSelectedPromptId(null);
  };

  const updatePrompt = (id: string, updates: Partial<JournalPrompt>): void => {
    updateContent(prompts.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="journal-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <BookOpen className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Journal Title
        </label>
        <input
          id="journal-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., My Learning Journey, Weekly Reflections"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="journal-description"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Description
        </label>
        <textarea
          id="journal-description"
          value={block.content.description || ''}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Explain the purpose of this reflective journal..."
        />
      </div>

      {/* Journal Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="reflection-frequency"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Reflection Frequency
          </label>
          <select
            id="reflection-frequency"
            value={block.content.frequency || 'weekly'}
            onChange={(e) => onChange({ ...block.content, frequency: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="per-lesson">Per Lesson</option>
            <option value="anytime">Anytime</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="privacy-setting"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Privacy Setting
          </label>
          <select
            id="privacy-setting"
            value={block.content.privacy || 'private'}
            onChange={(e) => onChange({ ...block.content, privacy: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            <option value="private">Private (learner only)</option>
            <option value="instructor">Instructor can view</option>
            <option value="peers">Share with peers</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      {/* Reflection Prompts */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">
            Reflection Prompts ({prompts.length})
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-blue hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Eye className="w-3 h-3" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={addPrompt}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
            >
              <Plus className="w-3 h-3" />
              Add Prompt
            </button>
          </div>
        </div>

        {showPreview ? (
          // Preview Mode
          <div className="bg-linear-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {prompts.length === 0 ? (
              <p className="text-sm text-brand-muted text-center py-8">
                No prompts yet. Add prompts to structure the reflective journal.
              </p>
            ) : (
              prompts.map((prompt, idx) => (
                <div
                  key={prompt.id}
                  className="bg-brand-surface rounded-lg p-4 border border-brand-default"
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 bg-brand-secondary text-brand-primary rounded-full flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded">
                          {prompt.category}
                        </span>
                        {prompt.required && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-primary">{prompt.question}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="grid grid-cols-3 gap-4 min-h-[300px]">
            {/* Prompt List */}
            <div className="border border-brand-default rounded-lg p-3 space-y-2 overflow-y-auto max-h-[300px]">
              <p className="text-xs font-medium text-brand-secondary mb-2">
                Prompts ({prompts.length})
              </p>
              {prompts.length === 0 ? (
                <p className="text-xs text-brand-muted text-center py-4">
                  No prompts yet. Click "Add Prompt" to start.
                </p>
              ) : (
                prompts.map((prompt, idx) => (
                  <button
                    type="button"
                    key={prompt.id}
                    onClick={() => setSelectedPromptId(prompt.id)}
                    className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                      selectedPromptId === prompt.id
                        ? 'border-brand-primary bg-blue-50'
                        : 'border-brand-default hover:border-brand-strong'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span className="shrink-0 w-5 h-5 bg-brand-secondary text-brand-primary rounded-full flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium flex-1 line-clamp-2">
                        {prompt.question}
                      </span>
                    </div>
                    <div className="flex gap-1 text-xs mt-1">
                      <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
                        {prompt.category}
                      </span>
                      {prompt.required && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Prompt Editor */}
            {selectedPrompt ? (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 space-y-4 overflow-y-auto max-h-[300px]">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-brand-primary">Edit Prompt</h4>
                  <button
                    type="button"
                    onClick={() => deletePrompt(selectedPrompt.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Question */}
                <div>
                  <label
                    htmlFor="reflection-question"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Reflection Question
                  </label>
                  <textarea
                    id="reflection-question"
                    value={selectedPrompt.question}
                    onChange={(e) => updatePrompt(selectedPrompt.id, { question: e.target.value })}
                    rows={3}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="What question should learners reflect on?"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="prompt-category"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="prompt-category"
                    value={selectedPrompt.category}
                    onChange={(e) => updatePrompt(selectedPrompt.id, { category: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  >
                    <option value="General">General</option>
                    <option value="Learning">Learning</option>
                    <option value="Growth">Personal Growth</option>
                    <option value="Application">Application</option>
                    <option value="Challenges">Challenges</option>
                    <option value="Goals">Goals</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>

                {/* Required Toggle */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPrompt.required}
                      onChange={(e) =>
                        updatePrompt(selectedPrompt.id, { required: e.target.checked })
                      }
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="text-sm text-brand-secondary">
                      Required (learners must respond to this prompt)
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 flex items-center justify-center text-brand-muted">
                Select a prompt to edit
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Options */}
      <div className="border-t border-brand-default pt-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.downloadable !== false}
            onChange={(e) => onChange({ ...block.content, downloadable: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm text-brand-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Allow learners to download journal as PDF
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.autosave || false}
            onChange={(e) => onChange({ ...block.content, autosave: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm text-brand-secondary">
            Enable auto-save (saves drafts automatically)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.showTimestamps || false}
            onChange={(e) => onChange({ ...block.content, showTimestamps: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm text-brand-secondary">Show timestamps on entries</span>
        </label>
      </div>

      {/* Privacy Info */}
      <div
        className={`rounded-lg p-3 ${
          block.content.privacy === 'private'
            ? 'bg-blue-50 border border-blue-200'
            : block.content.privacy === 'instructor'
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-purple-50 border border-purple-200'
        }`}
      >
        <div className="flex items-start gap-2 text-xs">
          {block.content.privacy === 'private' ? (
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-brand-blue" />
          ) : (
            <Users className="w-4 h-4 shrink-0 mt-0.5 text-purple-600" />
          )}
          <div>
            <p
              className={`font-medium mb-1 ${
                block.content.privacy === 'private'
                  ? 'text-blue-800'
                  : block.content.privacy === 'instructor'
                    ? 'text-yellow-800'
                    : 'text-purple-800'
              }`}
            >
              Privacy:{' '}
              {block.content.privacy === 'private'
                ? 'Private'
                : block.content.privacy === 'instructor'
                  ? 'Instructor Can View'
                  : block.content.privacy === 'peers'
                    ? 'Shared with Peers'
                    : 'Public'}
            </p>
            <p
              className={
                block.content.privacy === 'private'
                  ? 'text-blue-700'
                  : block.content.privacy === 'instructor'
                    ? 'text-yellow-700'
                    : 'text-purple-700'
              }
            >
              {block.content.privacy === 'private' &&
                'Journal entries are visible only to the learner.'}
              {block.content.privacy === 'instructor' &&
                'Instructors can view entries for assessment and feedback.'}
              {block.content.privacy === 'peers' &&
                "Learners can see each other's entries to foster discussion."}
              {block.content.privacy === 'public' && 'Journal entries are publicly visible.'}
            </p>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Reflective Journal tip:</strong> Use prompts to guide learners' thinking. Mix
          required and optional prompts. Consider privacy settings based on your learning goals.
          Journals persist throughout the course, allowing learners to track their growth over time.
        </p>
      </div>
    </div>
  );
};
