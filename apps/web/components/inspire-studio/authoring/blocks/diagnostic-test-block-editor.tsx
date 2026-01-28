import { CheckCircle, ClipboardList, Eye, GitBranch, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type {
  DiagnosticQuestion,
  DiagnosticTestBlock,
} from '@/lib/inspire-studio/types/contentBlocks';

interface DiagnosticTestBlockEditorProps {
  block: DiagnosticTestBlock;
  onChange: (content: DiagnosticTestBlock['content']) => void;
}

export const DiagnosticTestBlockEditor = ({
  block,
  onChange,
}: DiagnosticTestBlockEditorProps): React.JSX.Element => {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>(block.content.questions || []);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (updatedQuestions: DiagnosticQuestion[]): void => {
    setQuestions(updatedQuestions);
    onChange({
      ...block.content,
      questions: updatedQuestions,
    });
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  const addQuestion = (): void => {
    const newId = `question-${Date.now()}`;
    const newQuestion: DiagnosticQuestion = {
      id: newId,
      question: 'New Question',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0,
      skillArea: 'General',
      competencyLevel: 'beginner',
      points: 1,
    };
    updateContent([...questions, newQuestion]);
    setSelectedQuestionId(newId);
  };

  const deleteQuestion = (id: string): void => {
    updateContent(questions.filter((q) => q.id !== id));
    if (selectedQuestionId === id) setSelectedQuestionId(null);
  };

  const updateQuestion = (id: string, updates: Partial<DiagnosticQuestion>): void => {
    updateContent(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const addOption = (questionId: string): void => {
    updateContent(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [...(q.options || []), `Option ${(q.options || []).length + 1}`],
            }
          : q,
      ),
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string): void => {
    updateContent(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: (q.options || []).map((opt, i) => (i === optionIndex ? value : opt)),
            }
          : q,
      ),
    );
  };

  const deleteOption = (questionId: string, optionIndex: number): void => {
    updateContent(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: (q.options || []).filter((_, i) => i !== optionIndex),
            }
          : q,
      ),
    );
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="diagnostic-test-title-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <ClipboardList className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Diagnostic Test Title
        </label>
        <input
          id="diagnostic-test-title-input"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Pre-Course Assessment, Skills Evaluation"
        />
      </div>

      {/* Instructions */}
      <div>
        <label
          htmlFor="diagnostic-test-instructions-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Instructions
        </label>
        <textarea
          id="diagnostic-test-instructions-input"
          value={block.content.instructions}
          onChange={(e) => onChange({ ...block.content, instructions: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Explain the purpose of this diagnostic test..."
        />
      </div>

      {/* Passing Score */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="diagnostic-test-passing-score-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Passing Score (%)
          </label>
          <input
            id="diagnostic-test-passing-score-input"
            type="number"
            value={block.content.passingScore || 70}
            onChange={(e) =>
              onChange({ ...block.content, passingScore: parseInt(e.target.value, 10) || 70 })
            }
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="diagnostic-test-time-limit-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Time Limit (minutes)
          </label>
          <input
            id="diagnostic-test-time-limit-input"
            type="number"
            value={block.content.timeLimit || 0}
            onChange={(e) =>
              onChange({ ...block.content, timeLimit: parseInt(e.target.value, 10) || 0 })
            }
            min="0"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="0 = unlimited"
          />
        </div>
      </div>

      {/* Questions Builder */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">
            Questions ({questions.length}) | Total Points: {totalPoints}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-blue hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Eye className="w-3 h-3" aria-hidden="true" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
              Add Question
            </button>
          </div>
        </div>

        {showPreview ? (
          // Preview Mode
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {questions.length === 0 ? (
              <p className="text-sm text-brand-muted text-center py-8">
                No questions yet. Add questions to build your diagnostic test.
              </p>
            ) : (
              questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="bg-brand-surface rounded-lg p-4 border border-brand-default"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="shrink-0 w-6 h-6 bg-brand-primary text-brand-primary rounded-full flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-brand-primary mb-2">{question.question}</p>
                      <div className="flex gap-2 text-xs mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {question.skillArea}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {question.competencyLevel}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          {question.points} pts
                        </span>
                      </div>
                      {question.type === 'multiple_choice' ? (
                        <div className="space-y-2">
                          {(question.options || []).map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                question.correctAnswer === optIdx
                                  ? 'bg-green-50 border border-green-300'
                                  : 'bg-brand-page border border-brand-default'
                              }`}
                            >
                              {question.correctAnswer === optIdx ? (
                                <CheckCircle
                                  className="w-4 h-4 text-green-600"
                                  aria-hidden="true"
                                />
                              ) : (
                                <div
                                  className="w-4 h-4 border-2 border-brand-strong rounded-full"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              question.correctAnswer === true
                                ? 'bg-green-50 border border-green-300'
                                : 'bg-brand-page border border-brand-default'
                            }`}
                          >
                            {question.correctAnswer === true ? (
                              <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />
                            ) : (
                              <div
                                className="w-4 h-4 border-2 border-brand-strong rounded-full"
                                aria-hidden="true"
                              />
                            )}
                            <span className="text-sm">True</span>
                          </div>
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              question.correctAnswer === false
                                ? 'bg-green-50 border border-green-300'
                                : 'bg-brand-page border border-brand-default'
                            }`}
                          >
                            {question.correctAnswer === false ? (
                              <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />
                            ) : (
                              <div
                                className="w-4 h-4 border-2 border-brand-strong rounded-full"
                                aria-hidden="true"
                              />
                            )}
                            <span className="text-sm">False</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="grid grid-cols-3 gap-4 min-h-[400px]">
            {/* Question List */}
            <div className="border border-brand-default rounded-lg p-3 space-y-2 overflow-y-auto max-h-[400px]">
              <p className="text-xs font-medium text-brand-secondary mb-2">
                Questions ({questions.length})
              </p>
              {questions.length === 0 ? (
                <p className="text-xs text-brand-muted text-center py-4">
                  No questions yet. Click "Add Question" to start.
                </p>
              ) : (
                questions.map((question, idx) => (
                  <button
                    type="button"
                    key={question.id}
                    onClick={() => setSelectedQuestionId(question.id)}
                    className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                      selectedQuestionId === question.id
                        ? 'border-brand-primary bg-blue-50'
                        : 'border-brand-default hover:border-brand-strong'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span className="shrink-0 w-5 h-5 bg-brand-primary text-brand-primary rounded-full flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium flex-1 line-clamp-2">
                        {question.question}
                      </span>
                    </div>
                    <div className="flex gap-1 text-xs mt-1">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {question.skillArea}
                      </span>
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                        {question.competencyLevel}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Question Editor */}
            {selectedQuestion ? (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 space-y-4 overflow-y-auto max-h-[400px]">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-brand-primary">Edit Question</h4>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(selectedQuestion.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    aria-label="Delete question"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Question Text */}
                <div>
                  <label
                    htmlFor={`diagnostic-question-text-${selectedQuestion.id}`}
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Question Text
                  </label>
                  <textarea
                    id={`diagnostic-question-text-${selectedQuestion.id}`}
                    value={selectedQuestion.question}
                    onChange={(e) =>
                      updateQuestion(selectedQuestion.id, { question: e.target.value })
                    }
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="Enter the question..."
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label
                    htmlFor={`diagnostic-question-type-${selectedQuestion.id}`}
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Question Type
                  </label>
                  <select
                    id={`diagnostic-question-type-${selectedQuestion.id}`}
                    value={selectedQuestion.type}
                    onChange={(e) => {
                      const newType = e.target.value as 'multiple_choice' | 'true_false';
                      updateQuestion(selectedQuestion.id, {
                        type: newType,
                        correctAnswer: newType === 'true_false' ? true : 0,
                      });
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                  </select>
                </div>

                {/* Options (Multiple Choice) */}
                {selectedQuestion.type === 'multiple_choice' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-brand-secondary">Options</span>
                      <button
                        type="button"
                        onClick={() => addOption(selectedQuestion.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-brand-blue hover:text-blue-700"
                      >
                        <Plus className="w-3 h-3" aria-hidden="true" />
                        Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(selectedQuestion.options || []).map((option, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <input
                            id={`diagnostic-option-radio-${selectedQuestion.id}-${idx}`}
                            type="radio"
                            name={`correct-answer-${selectedQuestion.id}`}
                            checked={selectedQuestion.correctAnswer === idx}
                            onChange={() =>
                              updateQuestion(selectedQuestion.id, { correctAnswer: idx })
                            }
                            className="mt-1.5"
                            aria-label={`Mark option ${idx + 1} as correct answer`}
                          />
                          <input
                            id={`diagnostic-option-text-${selectedQuestion.id}-${idx}`}
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(selectedQuestion.id, idx, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-brand-strong rounded"
                            placeholder={`Option ${idx + 1}`}
                            aria-label={`Option ${idx + 1} text`}
                          />
                          {(selectedQuestion.options || []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => deleteOption(selectedQuestion.id, idx)}
                              className="text-red-600 hover:text-red-700 p-1"
                              aria-label={`Delete option ${idx + 1}`}
                            >
                              <Trash2 className="w-3 h-3" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Correct Answer (True/False) */}
                {selectedQuestion.type === 'true_false' && (
                  <div>
                    <span className="block text-xs font-medium text-brand-secondary mb-2">
                      Correct Answer
                    </span>
                    <div
                      className="flex gap-3"
                      role="radiogroup"
                      aria-label="Correct answer selection"
                    >
                      <label
                        htmlFor={`diagnostic-tf-true-${selectedQuestion.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          id={`diagnostic-tf-true-${selectedQuestion.id}`}
                          type="radio"
                          name={`tf-answer-${selectedQuestion.id}`}
                          checked={selectedQuestion.correctAnswer === true}
                          onChange={() =>
                            updateQuestion(selectedQuestion.id, { correctAnswer: true })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">True</span>
                      </label>
                      <label
                        htmlFor={`diagnostic-tf-false-${selectedQuestion.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          id={`diagnostic-tf-false-${selectedQuestion.id}`}
                          type="radio"
                          name={`tf-answer-${selectedQuestion.id}`}
                          checked={selectedQuestion.correctAnswer === false}
                          onChange={() =>
                            updateQuestion(selectedQuestion.id, { correctAnswer: false })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">False</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Skill Area & Competency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`diagnostic-skill-area-${selectedQuestion.id}`}
                      className="block text-xs font-medium text-brand-secondary mb-1"
                    >
                      Skill Area
                    </label>
                    <input
                      id={`diagnostic-skill-area-${selectedQuestion.id}`}
                      type="text"
                      value={selectedQuestion.skillArea}
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, { skillArea: e.target.value })
                      }
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="e.g., Math, Science"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`diagnostic-competency-level-${selectedQuestion.id}`}
                      className="block text-xs font-medium text-brand-secondary mb-1"
                    >
                      Competency Level
                    </label>
                    <select
                      id={`diagnostic-competency-level-${selectedQuestion.id}`}
                      value={selectedQuestion.competencyLevel}
                      onChange={(e) => {
                        const level = e.target.value as 'beginner' | 'intermediate' | 'advanced';
                        updateQuestion(selectedQuestion.id, {
                          competencyLevel: level,
                        });
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Points */}
                <div>
                  <label
                    htmlFor={`diagnostic-points-${selectedQuestion.id}`}
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Points
                  </label>
                  <input
                    id={`diagnostic-points-${selectedQuestion.id}`}
                    type="number"
                    value={selectedQuestion.points}
                    onChange={(e) =>
                      updateQuestion(selectedQuestion.id, {
                        points: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    min="1"
                    className="w-24 px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 flex items-center justify-center text-brand-muted">
                Select a question to edit
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adaptive Learning Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <div className="flex items-start gap-2 text-xs text-indigo-800">
          <GitBranch className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium mb-1">Adaptive Path Integration</p>
            <p>
              Results automatically determine which lessons are shown or hidden for each learner
              based on their skill areas and competency levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
