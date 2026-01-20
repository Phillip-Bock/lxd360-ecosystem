import { Brain, Loader, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface Question {
  question: string;
  type: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

interface AIQuizGeneratorData {
  sourceContent?: string;
  questionCount?: number;
  questionTypes?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  questions?: Question[];
}

export const AIQuizGeneratorBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as AIQuizGeneratorData) || {};
  const [sourceContent, setSourceContent] = useState(data.sourceContent || '');
  const [questionCount, setQuestionCount] = useState(data.questionCount || 5);
  const [questionTypes, setQuestionTypes] = useState<string[]>(
    data.questionTypes || ['multiple_choice', 'true_false'],
  );
  const [difficulty, setDifficulty] = useState(data.difficulty || 'medium');
  const [questions, setQuestions] = useState<Question[]>(data.questions || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (): Promise<void> => {
    if (!sourceContent.trim()) {
      setError('Please provide source content');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // TODO(LXD-301): Implement Cloud Functions AI quiz generation
      setError('AI quiz generation temporarily unavailable during Firebase migration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionType = (type: string): void => {
    const newTypes = questionTypes.includes(type)
      ? questionTypes.filter((t) => t !== type)
      : [...questionTypes, type];
    setQuestionTypes(newTypes);
  };

  const removeQuestion = (index: number): void => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    props.onUpdate({
      ...props.block,
      content: { ...data, questions: newQuestions } as Record<string, unknown>,
    });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">AI Quiz Generator</h3>
        </div>

        <div>
          <label
            htmlFor="quiz-source-content"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Source Content
          </label>
          <textarea
            id="quiz-source-content"
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder="Paste lesson content or text to generate questions from..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quiz-question-count"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Number of Questions
            </label>
            <select
              id="quiz-question-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              {[3, 5, 10, 15, 20].map((num) => (
                <option key={num} value={num}>
                  {num} questions
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="quiz-difficulty"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Difficulty
            </label>
            <select
              id="quiz-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Question Types
          </legend>
          <div className="space-y-2">
            {[
              { value: 'multiple_choice', label: 'Multiple Choice' },
              { value: 'true_false', label: 'True/False' },
              { value: 'fill_blank', label: 'Fill in the Blank' },
            ].map((type) => (
              <label key={type.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={questionTypes.includes(type.value)}
                  onChange={() => toggleQuestionType(type.value)}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-2 focus:ring-brand-primary"
                />
                <span className="text-sm text-brand-secondary">{type.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !sourceContent.trim() || questionTypes.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-brand-primary rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Generate Quiz Questions
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-sm font-medium text-brand-secondary">
                Generated Questions ({questions.length})
              </span>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-brand-page border border-brand-default rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-brand-blue">#{idx + 1}</span>
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-brand-secondary rounded">
                          {q.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-brand-primary font-medium mb-2">{q.question}</p>
                      {q.options && (
                        <div className="space-y-1 mb-2">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`text-sm px-2 py-1 rounded ${
                                opt === q.correct_answer
                                  ? 'bg-green-50 text-green-700 font-medium'
                                  : 'text-brand-secondary'
                              }`}
                            >
                              {opt} {opt === q.correct_answer && '✓'}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-brand-secondary">
                        <span className="font-medium">Explanation:</span> {q.explanation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-1 text-brand-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseBlockEditor>
  );
};
