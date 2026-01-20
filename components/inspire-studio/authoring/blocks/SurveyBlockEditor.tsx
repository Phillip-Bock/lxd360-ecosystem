import { Check, Eye, GripVertical, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type {
  SurveyBlock,
  SurveyQuestion,
  SurveyQuestionType,
} from '@/lib/inspire-studio/types/contentBlocks';

interface SurveyBlockEditorProps {
  block: SurveyBlock;
  onChange: (content: SurveyBlock['content']) => void;
}

export const SurveyBlockEditor = ({
  block,
  onChange,
}: SurveyBlockEditorProps): React.JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = (): void => {
    const newQuestion: SurveyQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'text',
      required: false,
    };
    onChange({
      ...block.content,
      questions: [...block.content.questions, newQuestion],
    });
  };

  const removeQuestion = (id: string): void => {
    onChange({
      ...block.content,
      questions: block.content.questions.filter((q) => q.id !== id),
    });
  };

  const updateQuestion = <K extends keyof SurveyQuestion>(
    id: string,
    field: K,
    value: SurveyQuestion[K],
  ): void => {
    onChange({
      ...block.content,
      questions: block.content.questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    });
  };

  const updateQuestionOptions = (id: string, optionsText: string): void => {
    const options = optionsText.split('\n').filter((o) => o.trim());
    updateQuestion(id, 'options', options.length > 0 ? options : undefined);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down'): void => {
    const newQuestions = [...block.content.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];
    onChange({ ...block.content, questions: newQuestions });
  };

  const questionTypeOptions: Array<{
    value: SurveyQuestionType;
    label: string;
    icon: string;
    requiresOptions: boolean;
  }> = [
    { value: 'text', label: 'Short Text', icon: '📝', requiresOptions: false },
    { value: 'textarea', label: 'Long Text', icon: '📄', requiresOptions: false },
    { value: 'email', label: 'Email', icon: '📧', requiresOptions: false },
    { value: 'phone', label: 'Phone', icon: '📞', requiresOptions: false },
    { value: 'number', label: 'Number', icon: '🔢', requiresOptions: false },
    { value: 'date', label: 'Date', icon: '📅', requiresOptions: false },
    { value: 'time', label: 'Time', icon: '🕐', requiresOptions: false },
    { value: 'yes_no', label: 'Yes/No', icon: '✓✗', requiresOptions: false },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '⚪', requiresOptions: true },
    { value: 'checkboxes', label: 'Checkboxes', icon: '☑️', requiresOptions: true },
    { value: 'dropdown', label: 'Dropdown', icon: '▼', requiresOptions: true },
    { value: 'rating', label: 'Rating (1-5)', icon: '⭐', requiresOptions: false },
    { value: 'scale', label: 'Scale (1-10)', icon: '📊', requiresOptions: false },
    { value: 'nps', label: 'NPS (0-10)', icon: '📈', requiresOptions: false },
    { value: 'emoji', label: 'Emoji Rating', icon: '😊', requiresOptions: false },
    { value: 'star', label: 'Star Rating', icon: '⭐', requiresOptions: false },
  ];

  const getQuestionTypeInfo = (
    type: SurveyQuestionType,
  ):
    | { value: SurveyQuestionType; label: string; icon: string; requiresOptions: boolean }
    | undefined => {
    return questionTypeOptions.find((opt) => opt.value === type);
  };

  return (
    <div className="space-y-4">
      {/* Survey Title and Description */}
      <div>
        <label
          htmlFor="survey-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Survey Title
        </label>
        <input
          id="survey-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Customer Satisfaction Survey, Employee Feedback"
        />
      </div>

      <div>
        <label
          htmlFor="survey-description"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Description (optional)
        </label>
        <textarea
          id="survey-description"
          value={block.content.description || ''}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Explain the purpose of this survey..."
        />
      </div>

      {/* Survey Settings */}
      <div className="border-t border-brand-default pt-4">
        <h4 className="text-sm font-medium text-brand-primary mb-3">Survey Settings</h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.anonymous !== false}
              onChange={(e) => onChange({ ...block.content, anonymous: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Anonymous responses</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showProgressBar !== false}
              onChange={(e) => onChange({ ...block.content, showProgressBar: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Show progress bar</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.oneQuestionPerPage || false}
              onChange={(e) => onChange({ ...block.content, oneQuestionPerPage: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">One question per page</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.randomizeQuestions || false}
              onChange={(e) => onChange({ ...block.content, randomizeQuestions: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Randomize question order</span>
          </label>
        </div>
      </div>

      {/* Questions Section */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">Survey Questions</span>
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
              onClick={addQuestion}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
            >
              <Plus className="w-3 h-3" />
              Add Question
            </button>
          </div>
        </div>

        {block.content.questions.length === 0 ? (
          <div className="border border-brand-default rounded-lg p-4 text-center text-sm text-brand-muted">
            No questions added yet. Click "Add Question" to start building your survey.
          </div>
        ) : showPreview ? (
          // Preview Mode
          <div className="bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-3">
              <strong>Survey Preview:</strong> {block.content.questions.length} questions
            </p>
            <div className="bg-brand-surface rounded-lg p-4 border border-brand-default space-y-4">
              {block.content.questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="pb-4 border-b border-brand-default last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-medium text-sm text-brand-primary">
                      {idx + 1}. {question.question || '(Untitled question)'}
                    </span>
                    {question.required && <span className="text-red-600 text-sm">*</span>}
                  </div>
                  {question.description && (
                    <p className="text-xs text-brand-secondary mb-2">{question.description}</p>
                  )}
                  <div className="text-xs text-brand-muted">
                    {getQuestionTypeInfo(question.type)?.icon}{' '}
                    {getQuestionTypeInfo(question.type)?.label}
                  </div>
                  {(question.type === 'multiple_choice' ||
                    question.type === 'checkboxes' ||
                    question.type === 'dropdown') &&
                    question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className="text-xs text-brand-secondary flex items-center gap-2"
                          >
                            {question.type === 'checkboxes' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span className="w-3 h-3 border border-brand-strong rounded-full" />
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-3">
            {block.content.questions.map((question, index) => (
              <div
                key={question.id}
                className="border-2 border-brand-default rounded-lg p-4 hover:border-blue-300 transition-colors bg-brand-surface"
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-brand-muted hover:text-brand-secondary disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 space-y-3">
                    {/* Question Number and Delete */}
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-6 h-6 bg-brand-primary text-brand-primary rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-xs text-brand-muted">
                        {getQuestionTypeInfo(question.type)?.icon}{' '}
                        {getQuestionTypeInfo(question.type)?.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="ml-auto p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label
                        htmlFor={`question-text-${question.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Question Text
                      </label>
                      <input
                        id={`question-text-${question.id}`}
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="Enter your question"
                      />
                    </div>

                    {/* Question Description */}
                    <div>
                      <label
                        htmlFor={`question-help-${question.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Help Text (optional)
                      </label>
                      <input
                        id={`question-help-${question.id}`}
                        type="text"
                        value={question.description || ''}
                        onChange={(e) => updateQuestion(question.id, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-xs"
                        placeholder="Additional guidance for respondents"
                      />
                    </div>

                    {/* Question Type Selection */}
                    <div>
                      <label
                        htmlFor={`question-type-${question.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Question Type
                      </label>
                      <select
                        id={`question-type-${question.id}`}
                        value={question.type}
                        onChange={(e) =>
                          updateQuestion(question.id, 'type', e.target.value as SurveyQuestionType)
                        }
                        className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                      >
                        {questionTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.icon} {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Options for specific question types */}
                    {getQuestionTypeInfo(question.type)?.requiresOptions && (
                      <div>
                        <label
                          htmlFor={`question-options-${question.id}`}
                          className="block text-xs font-medium text-brand-secondary mb-1"
                        >
                          Options (one per line)
                        </label>
                        <textarea
                          id={`question-options-${question.id}`}
                          value={question.options?.join('\n') || ''}
                          onChange={(e) => updateQuestionOptions(question.id, e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                          placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                        />
                      </div>
                    )}

                    {/* Validation Rules */}
                    {question.type === 'number' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label
                            htmlFor={`question-min-${question.id}`}
                            className="block text-xs font-medium text-brand-secondary mb-1"
                          >
                            Min Value
                          </label>
                          <input
                            id={`question-min-${question.id}`}
                            type="number"
                            value={question.min || ''}
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                'min',
                                e.target.value ? parseInt(e.target.value, 10) : undefined,
                              )
                            }
                            className="w-full px-2 py-1.5 border border-brand-strong rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`question-max-${question.id}`}
                            className="block text-xs font-medium text-brand-secondary mb-1"
                          >
                            Max Value
                          </label>
                          <input
                            id={`question-max-${question.id}`}
                            type="number"
                            value={question.max || ''}
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                'max',
                                e.target.value ? parseInt(e.target.value, 10) : undefined,
                              )
                            }
                            className="w-full px-2 py-1.5 border border-brand-strong rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Required Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                        className="w-4 h-4 text-brand-blue rounded"
                      />
                      <span className="text-xs font-medium text-brand-secondary">
                        Required question
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Survey tip:</strong> Keep questions clear and concise. Use a mix of question types
          to gather different kinds of feedback. Consider the respondent's time - aim for 5-10
          minutes completion time.
        </p>
      </div>
    </div>
  );
};
