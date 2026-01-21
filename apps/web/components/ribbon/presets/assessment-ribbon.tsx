'use client';

import {
  BarChart3,
  CheckCircle,
  CheckSquare,
  CircleDot,
  Clock,
  Copy,
  FileQuestion,
  GripVertical,
  MessageSquare,
  Plus,
  Settings,
  Shuffle,
  Star,
  Target,
  Timer,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Ribbon,
  RibbonButton,
  RibbonDropdown,
  RibbonGroup,
  RibbonSeparator,
  RibbonTab,
  RibbonTabList,
  RibbonTabPanel,
  RibbonTabs,
  RibbonToggleGroup,
} from '../index';

// Question types
export const QUESTION_TYPES = {
  multipleChoice: {
    label: 'Multiple Choice',
    icon: CircleDot,
    description: 'Single answer from options',
  },
  multiSelect: {
    label: 'Multi-Select',
    icon: CheckSquare,
    description: 'Multiple answers allowed',
  },
  trueFalse: {
    label: 'True/False',
    icon: CheckCircle,
    description: 'Binary choice question',
  },
  shortAnswer: {
    label: 'Short Answer',
    icon: MessageSquare,
    description: 'Brief text response',
  },
  essay: {
    label: 'Essay',
    icon: FileQuestion,
    description: 'Extended text response',
  },
  matching: {
    label: 'Matching',
    icon: GripVertical,
    description: 'Match pairs of items',
  },
  ordering: {
    label: 'Ordering',
    icon: Shuffle,
    description: 'Arrange in sequence',
  },
  fillInBlank: {
    label: 'Fill in the Blank',
    icon: MessageSquare,
    description: 'Complete the sentence',
  },
} as const;

export type QuestionType = keyof typeof QUESTION_TYPES;

// Dropdown options for question types
const questionTypeOptions = Object.entries(QUESTION_TYPES).map(([key, type]) => ({
  value: key,
  label: type.label,
  icon: <type.icon className="h-4 w-4" />,
}));

export interface AssessmentRibbonProps {
  // Selected question
  selectedQuestionId?: string;
  selectedQuestionType?: QuestionType;

  // Assessment settings
  isTimedAssessment?: boolean;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showFeedback?: boolean;

  // Callbacks
  onAddQuestion?: (type: QuestionType) => void;
  onDuplicateQuestion?: () => void;
  onDeleteQuestion?: () => void;
  onMoveQuestion?: (direction: 'up' | 'down') => void;

  // Settings callbacks
  onTimedChange?: (value: boolean) => void;
  onShuffleQuestionsChange?: (value: boolean) => void;
  onShuffleAnswersChange?: (value: boolean) => void;
  onShowFeedbackChange?: (value: boolean) => void;

  // Assessment actions
  onPreview?: () => void;
  onImportQuestions?: () => void;
  onExportQuestions?: () => void;
  onViewAnalytics?: () => void;
}

export function AssessmentRibbon({
  selectedQuestionId,
  isTimedAssessment = false,
  shuffleQuestions = false,
  shuffleAnswers = false,
  showFeedback = true,
  onAddQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onTimedChange,
  onShuffleQuestionsChange,
  onShuffleAnswersChange,
  onShowFeedbackChange,
  onImportQuestions,
  onExportQuestions,
  onViewAnalytics,
}: AssessmentRibbonProps) {
  const hasSelection = !!selectedQuestionId;

  // Build settings toggle values
  const shuffleValues: string[] = [];
  if (shuffleQuestions) shuffleValues.push('shuffleQ');
  if (shuffleAnswers) shuffleValues.push('shuffleA');

  const handleShuffleChange = (value: string | string[]) => {
    const values = Array.isArray(value) ? value : [value];
    onShuffleQuestionsChange?.(values.includes('shuffleQ'));
    onShuffleAnswersChange?.(values.includes('shuffleA'));
  };

  return (
    <Ribbon defaultTab="questions">
      <RibbonTabs>
        <RibbonTabList>
          <RibbonTab value="questions">Questions</RibbonTab>
          <RibbonTab value="settings">Settings</RibbonTab>
          <RibbonTab value="analytics">Analytics</RibbonTab>
        </RibbonTabList>

        {/* Questions Tab */}
        <RibbonTabPanel value="questions">
          <RibbonGroup label="Add Question">
            <div className="flex gap-1">
              <RibbonButton
                icon={<Plus className="h-5 w-5" />}
                label="Add"
                size="lg"
                onClick={() => onAddQuestion?.('multipleChoice')}
              />
              <RibbonDropdown
                options={questionTypeOptions}
                placeholder="Type"
                onValueChange={(value) => onAddQuestion?.(value as QuestionType)}
              />
            </div>
            <RibbonButton
              icon={<Upload className="h-5 w-5" />}
              label="Import"
              size="lg"
              onClick={onImportQuestions}
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Edit">
            <RibbonButton
              icon={<Copy className="h-4 w-4" />}
              onClick={onDuplicateQuestion}
              disabled={!hasSelection}
              aria-label="Duplicate Question"
            />
            <RibbonButton
              icon={<Trash2 className="h-4 w-4" />}
              onClick={onDeleteQuestion}
              disabled={!hasSelection}
              aria-label="Delete Question"
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Scoring">
            <RibbonButton
              icon={<Star className="h-5 w-5" />}
              label="Points"
              size="lg"
              disabled={!hasSelection}
            />
            <RibbonButton
              icon={<Target className="h-5 w-5" />}
              label="Rubric"
              size="lg"
              disabled={!hasSelection}
            />
          </RibbonGroup>
        </RibbonTabPanel>

        {/* Settings Tab */}
        <RibbonTabPanel value="settings">
          <RibbonGroup label="Timing">
            <RibbonButton
              icon={<Clock className="h-5 w-5" />}
              label="Time Limit"
              size="lg"
              active={isTimedAssessment}
              onClick={() => onTimedChange?.(!isTimedAssessment)}
            />
            <RibbonButton icon={<Timer className="h-5 w-5" />} label="Per Question" size="lg" />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Randomization">
            <RibbonToggleGroup
              type="multiple"
              value={shuffleValues}
              onValueChange={handleShuffleChange}
              items={[
                {
                  value: 'shuffleQ',
                  icon: Shuffle,
                  label: 'Shuffle Questions',
                },
                {
                  value: 'shuffleA',
                  icon: Shuffle,
                  label: 'Shuffle Answers',
                },
              ]}
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Feedback">
            <RibbonButton
              icon={<MessageSquare className="h-5 w-5" />}
              label="Show Feedback"
              size="lg"
              active={showFeedback}
              onClick={() => onShowFeedbackChange?.(!showFeedback)}
            />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Advanced">
            <RibbonButton icon={<Settings className="h-5 w-5" />} label="Settings" size="lg" />
          </RibbonGroup>
        </RibbonTabPanel>

        {/* Analytics Tab */}
        <RibbonTabPanel value="analytics">
          <RibbonGroup label="Reports">
            <RibbonButton
              icon={<BarChart3 className="h-5 w-5" />}
              label="Analytics"
              size="lg"
              onClick={onViewAnalytics}
            />
            <RibbonButton icon={<Target className="h-5 w-5" />} label="Item Analysis" size="lg" />
          </RibbonGroup>

          <RibbonSeparator />

          <RibbonGroup label="Export">
            <RibbonButton
              icon={<Upload className="h-5 w-5" />}
              label="Export Data"
              size="lg"
              onClick={onExportQuestions}
            />
          </RibbonGroup>
        </RibbonTabPanel>
      </RibbonTabs>
    </Ribbon>
  );
}
