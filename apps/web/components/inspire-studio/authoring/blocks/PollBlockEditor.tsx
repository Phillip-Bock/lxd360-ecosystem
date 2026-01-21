import {
  BarChart3,
  Clock,
  Eye,
  Image as ImageIcon,
  Info,
  List,
  PieChart,
  Plus,
  TrendingUp,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { PollBlock, PollOption } from '@/lib/inspire-studio/types/contentBlocks';

interface PollBlockEditorProps {
  block: PollBlock;
  onChange: (content: PollBlock['content']) => void;
}

type MockPollResult = PollOption & { votes: number };

export const PollBlockEditor = ({ block, onChange }: PollBlockEditorProps): React.JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);

  const addOption = (): void => {
    onChange({
      ...block.content,
      options: [
        ...block.content.options,
        { id: `opt_${Date.now()}`, text: '', color: getRandomColor() },
      ],
    });
  };

  const removeOption = (id: string): void => {
    onChange({
      ...block.content,
      options: block.content.options.filter((opt) => opt.id !== id),
    });
  };

  const updateOption = (id: string, field: string, value: unknown): void => {
    onChange({
      ...block.content,
      options: block.content.options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt,
      ),
    });
  };

  const getRandomColor = (): string => {
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Mock data for preview
  const mockResults: MockPollResult[] = block.content.options.map((opt) => ({
    ...opt,
    votes: Math.floor(Math.random() * 100) + 10,
  }));
  const totalVotes = mockResults.reduce((sum, opt) => sum + opt.votes, 0);

  const renderResultsPreview = (): React.JSX.Element => {
    const visualizationType = block.content.resultVisualization || 'bar';

    if (visualizationType === 'bar') {
      return (
        <div className="space-y-3">
          {mockResults.map((opt) => {
            const percentage = (opt.votes / totalVotes) * 100;
            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{opt.text || '(Empty option)'}</span>
                  <span className="text-brand-secondary">
                    {opt.votes} votes ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-6 bg-brand-surface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: opt.color || '#3B82F6',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (visualizationType === 'pie') {
      return (
        <div className="flex items-center justify-center gap-8">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90" aria-hidden="true">
              {
                mockResults.reduce<{ currentAngle: number; paths: React.JSX.Element[] }>(
                  (acc, opt) => {
                    const percentage = (opt.votes / totalVotes) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = acc.currentAngle;
                    const endAngle = startAngle + angle;
                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                    acc.currentAngle = endAngle;
                    acc.paths.push(
                      <path
                        key={opt.id}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={opt.color || '#3B82F6'}
                        className="hover:opacity-80 transition-opacity"
                      />,
                    );
                    return acc;
                  },
                  { currentAngle: 0, paths: [] },
                ).paths
              }
            </svg>
          </div>
          <div className="space-y-2">
            {mockResults.map((opt) => {
              const percentage = (opt.votes / totalVotes) * 100;
              return (
                <div key={opt.id} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: opt.color || '#3B82F6' }}
                  />
                  <span>
                    {opt.text || '(Empty)'}: {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          {mockResults.map((opt) => {
            const percentage = (opt.votes / totalVotes) * 100;
            return (
              <div
                key={opt.id}
                className="flex items-center justify-between p-2 border border-brand-default rounded-lg"
              >
                <span className="text-sm font-medium">{opt.text || '(Empty option)'}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-brand-secondary">{opt.votes} votes</span>
                  <span className="text-sm font-medium text-brand-blue">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Poll Question */}
      <div>
        <label
          htmlFor="poll-question"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Poll Question
        </label>
        <input
          id="poll-question"
          type="text"
          value={block.content.question}
          onChange={(e) => onChange({ ...block.content, question: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., What&apos;s your preferred learning format?"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="poll-description"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Description (optional)
        </label>
        <textarea
          id="poll-description"
          value={block.content.description || ''}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Additional context or instructions for the poll..."
        />
      </div>

      {/* Options Section */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">Poll Options</span>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
          >
            <Plus className="w-3 h-3" />
            Add Option
          </button>
        </div>

        <div className="space-y-3">
          {block.content.options.map((option, index) => (
            <div
              key={option.id}
              className="border-2 border-brand-default rounded-lg p-3 hover:border-blue-300 transition-colors bg-brand-surface"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 bg-brand-primary text-brand-primary rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-3">
                  {/* Option Text */}
                  <div>
                    <label
                      htmlFor={`option-text-${option.id}`}
                      className="block text-xs font-medium text-brand-secondary mb-1"
                    >
                      Option Text
                    </label>
                    <input
                      id={`option-text-${option.id}`}
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-brand-strong rounded-lg text-sm"
                      placeholder="Option text"
                    />
                  </div>

                  {/* Option Color & Image */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor={`option-color-${option.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Color
                      </label>
                      <input
                        id={`option-color-${option.id}`}
                        type="color"
                        value={option.color || '#3B82F6'}
                        onChange={(e) => updateOption(option.id, 'color', e.target.value)}
                        className="w-full h-10 border border-brand-strong rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`option-image-${option.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1 flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" aria-hidden="true" />
                        Image URL (optional)
                      </label>
                      <input
                        id={`option-image-${option.id}`}
                        type="url"
                        value={option.imageUrl || ''}
                        onChange={(e) => updateOption(option.id, 'imageUrl', e.target.value)}
                        className="w-full px-2 py-1.5 border border-brand-strong rounded-lg text-xs"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                {block.content.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Poll Settings */}
      <div className="border-t border-brand-default pt-4 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary">Poll Settings</h4>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.allowMultiple}
              onChange={(e) => onChange({ ...block.content, allowMultiple: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Allow multiple selections</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.anonymous !== false}
              onChange={(e) => onChange({ ...block.content, anonymous: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Anonymous voting</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.allowChangeVote !== false}
              onChange={(e) => onChange({ ...block.content, allowChangeVote: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">
              Allow learners to change their vote
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showResults}
              onChange={(e) => onChange({ ...block.content, showResults: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">
              Show results to learners after voting
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showRealTimeResults || false}
              onChange={(e) =>
                onChange({ ...block.content, showRealTimeResults: e.target.checked })
              }
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">
              Show real-time results (updates live)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showVoteCount !== false}
              onChange={(e) => onChange({ ...block.content, showVoteCount: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Show vote counts in results</span>
          </label>
        </div>

        {/* Time Limit */}
        <div>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.hasTimeLimit || false}
              onChange={(e) => onChange({ ...block.content, hasTimeLimit: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm font-medium text-brand-secondary flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Enable time limit
            </span>
          </label>
          {block.content.hasTimeLimit && (
            <div className="ml-6 flex gap-2 items-center">
              <input
                type="number"
                value={block.content.timeLimitHours || 24}
                onChange={(e) =>
                  onChange({ ...block.content, timeLimitHours: parseInt(e.target.value, 10) || 24 })
                }
                className="w-24 px-3 py-2 border border-brand-strong rounded-lg"
                min="1"
              />
              <span className="text-sm text-brand-secondary">
                hours (poll closes automatically)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Visualization */}
      <div className="border-t border-brand-default pt-4">
        <span className="block text-sm font-medium text-brand-secondary mb-2 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" aria-hidden="true" />
          Results Visualization Type
        </span>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(
            [
              {
                value: 'bar' as const,
                label: 'Bar Chart',
                icon: <BarChart3 className="w-4 h-4" />,
              },
              { value: 'pie' as const, label: 'Pie Chart', icon: <PieChart className="w-4 h-4" /> },
              { value: 'list' as const, label: 'List View', icon: <List className="w-4 h-4" /> },
            ] as const
          ).map((type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => onChange({ ...block.content, resultVisualization: type.value })}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.resultVisualization || 'bar') === type.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-blue-700 mb-3"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide' : 'Show'} Results Preview
        </button>

        {/* Preview */}
        {showPreview && (
          <div className="bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-brand-blue" />
              <span className="text-sm font-medium text-blue-900">Poll Results Preview</span>
              <span className="ml-auto text-xs text-blue-700">
                {totalVotes} total votes (mock data)
              </span>
            </div>
            <div className="bg-brand-surface rounded-lg p-4 border border-brand-default">
              {renderResultsPreview()}
            </div>
            <div className="mt-3 flex gap-2 text-xs text-blue-700">
              <Info className="w-4 h-4 shrink-0" />
              <p>
                This is how results will appear to learners. The visualization updates automatically
                as votes come in.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            <strong>Poll tip:</strong> Use clear, concise questions. Avoid leading language.
            Consider using colors and images to make options more engaging. Enable real-time results
            for live sessions. Use anonymous voting for sensitive topics.
          </p>
        </div>
      </div>
    </div>
  );
};
