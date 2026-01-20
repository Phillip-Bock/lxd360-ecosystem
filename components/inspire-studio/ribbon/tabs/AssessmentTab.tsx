'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Assessment Tab Component
 * =============================================================================
 *
 * Comprehensive assessment and quiz creation tools.
 * Includes question types, grading options, feedback settings,
 * rubrics, surveys, and assessment analytics.
 */

import {
  ArrowLeftRight,
  Award,
  // Analytics
  BarChart3,
  Brain,
  // Grading
  Calculator,
  CheckSquare,
  CircleDot,
  ClipboardList,
  Crosshair,
  Eye,
  EyeOff,
  FileQuestion,
  FileText,
  // Advanced
  GitBranch,
  GraduationCap,
  // Question types
  HelpCircle,
  Lightbulb,
  ListOrdered,
  Lock,
  // Feedback
  MessageSquare,
  PenLine,
  Percent,
  RotateCcw,
  // Settings
  Settings,
  Shuffle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Timer,
  ToggleLeft,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  RibbonButton,
  RibbonDropdown,
  RibbonGallery,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
  RibbonToggle,
} from '../groups';

interface AssessmentTabProps {
  onInsert?: (type: string, options?: unknown) => void;
  onAction?: (action: string, options?: unknown) => void;
}

export function AssessmentTab({ onInsert, onAction }: AssessmentTabProps) {
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  const handleInsert = (type: string, options?: unknown) => {
    onInsert?.(type, options);
  };

  const handleAction = (action: string, options?: unknown) => {
    onAction?.(action, options);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: QUESTION TYPES
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Questions">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={HelpCircle}
            label="Add Question"
            size="large"
            columns={3}
            items={[
              {
                icon: CircleDot,
                label: 'Multiple Choice',
                onClick: () => handleInsert('quiz', { type: 'multipleChoice' }),
              },
              {
                icon: CheckSquare,
                label: 'Multi-Select',
                onClick: () => handleInsert('quiz', { type: 'multipleSelect' }),
              },
              {
                icon: ToggleLeft,
                label: 'True/False',
                onClick: () => handleInsert('quiz', { type: 'trueFalse' }),
              },
              {
                icon: PenLine,
                label: 'Fill Blank',
                onClick: () => handleInsert('quiz', { type: 'fillBlank' }),
              },
              {
                icon: ArrowLeftRight,
                label: 'Matching',
                onClick: () => handleInsert('quiz', { type: 'matching' }),
              },
              {
                icon: ListOrdered,
                label: 'Ordering',
                onClick: () => handleInsert('quiz', { type: 'ordering' }),
              },
              {
                icon: FileText,
                label: 'Short Answer',
                onClick: () => handleInsert('quiz', { type: 'shortAnswer' }),
              },
              {
                icon: FileText,
                label: 'Essay',
                onClick: () => handleInsert('quiz', { type: 'essay' }),
              },
              {
                icon: Crosshair,
                label: 'Hotspot',
                onClick: () => handleInsert('quiz', { type: 'hotspot' }),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={CircleDot}
              label="MC"
              size="small"
              onClick={() => handleInsert('quiz', { type: 'multipleChoice' })}
              tooltip="Multiple choice"
            />
            <RibbonButton
              icon={ToggleLeft}
              label="T/F"
              size="small"
              onClick={() => handleInsert('quiz', { type: 'trueFalse' })}
              tooltip="True/False"
            />
            <RibbonButton
              icon={PenLine}
              label="Fill"
              size="small"
              onClick={() => handleInsert('quiz', { type: 'fillBlank' })}
              tooltip="Fill in the blank"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: KNOWLEDGE CHECKS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Checks">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={CheckSquare}
            label="K-Check"
            size="large"
            onClick={() => handleInsert('knowledgeCheck')}
            menuItems={[
              {
                label: 'Quick Check',
                onClick: () => handleInsert('knowledgeCheck', { style: 'quick' }),
              },
              {
                label: 'Reflection Prompt',
                onClick: () => handleInsert('knowledgeCheck', { style: 'reflection' }),
              },
              {
                label: 'Apply It',
                onClick: () => handleInsert('knowledgeCheck', { style: 'apply' }),
              },
              {
                label: 'Think About It',
                onClick: () => handleInsert('knowledgeCheck', { style: 'think' }),
              },
              { type: 'separator' },
              {
                icon: Sparkles,
                label: 'AI Generate Check',
                onClick: () => handleAction('generateKnowledgeCheck'),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={ClipboardList}
              label="Survey"
              size="small"
              onClick={() => handleInsert('survey')}
              tooltip="Survey question"
            />
            <RibbonButton
              icon={Brain}
              label="Reflect"
              size="small"
              onClick={() => handleInsert('reflection')}
              tooltip="Reflection prompt"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: GRADING
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Grading">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Calculator}
            label="Scoring"
            size="large"
            onClick={() => handleAction('openScoring')}
            menuItems={[
              {
                label: 'Points (e.g., 10 pts)',
                onClick: () => handleAction('scoringType', 'points'),
              },
              { label: 'Percentage', onClick: () => handleAction('scoringType', 'percentage') },
              { label: 'Pass/Fail', onClick: () => handleAction('scoringType', 'passFail') },
              { label: 'Weighted', onClick: () => handleAction('scoringType', 'weighted') },
              { type: 'separator' },
              { label: 'Partial Credit', onClick: () => handleAction('enablePartialCredit') },
              { label: 'Negative Marking', onClick: () => handleAction('enableNegativeMarking') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonDropdown
              value="10"
              options={['1', '5', '10', '20', '50', '100']}
              onChange={(points) => handleAction('defaultPoints', points)}
              width={50}
              placeholder="Pts"
            />
            <RibbonButton
              icon={Percent}
              label="Pass %"
              size="small"
              onClick={() => handleAction('setPassingScore')}
              tooltip="Set passing score"
            />
            <RibbonButton
              icon={Award}
              label="Rubric"
              size="small"
              onClick={() => handleAction('openRubric')}
              tooltip="Create rubric"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: FEEDBACK
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Feedback">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={MessageSquare}
            label="Feedback"
            size="large"
            onClick={() => handleAction('openFeedback')}
            menuItems={[
              {
                label: 'Correct Answer Feedback',
                onClick: () => handleAction('feedbackType', 'correct'),
              },
              {
                label: 'Incorrect Answer Feedback',
                onClick: () => handleAction('feedbackType', 'incorrect'),
              },
              {
                label: 'Per-Option Feedback',
                onClick: () => handleAction('feedbackType', 'perOption'),
              },
              { label: 'Hint Text', onClick: () => handleAction('feedbackType', 'hint') },
              { type: 'separator' },
              {
                icon: Sparkles,
                label: 'AI Generate Feedback',
                onClick: () => handleAction('generateFeedback'),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={ThumbsUp}
              label="Correct"
              size="small"
              onClick={() => handleAction('editCorrectFeedback')}
              tooltip="Edit correct feedback"
            />
            <RibbonButton
              icon={ThumbsDown}
              label="Incorrect"
              size="small"
              onClick={() => handleAction('editIncorrectFeedback')}
              tooltip="Edit incorrect feedback"
            />
            <RibbonButton
              icon={Lightbulb}
              label="Hint"
              size="small"
              onClick={() => handleAction('addHint')}
              tooltip="Add hint"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: QUIZ SETTINGS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Settings">
        <div className="flex items-center gap-0.5">
          <div className="flex flex-col gap-0.5">
            <RibbonToggle
              icon={Shuffle}
              isActive={shuffleQuestions}
              onClick={() => {
                setShuffleQuestions(!shuffleQuestions);
                handleAction('shuffleQuestions', !shuffleQuestions);
              }}
              tooltip="Shuffle questions"
            />
            <RibbonToggle
              icon={showAnswers ? Eye : EyeOff}
              isActive={showAnswers}
              onClick={() => {
                setShowAnswers(!showAnswers);
                handleAction('showAnswers', !showAnswers);
              }}
              tooltip="Show correct answers"
            />
            <RibbonToggle
              icon={RotateCcw}
              isActive={false}
              onClick={() => handleAction('allowRetry')}
              tooltip="Allow retry"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Timer}
              label="Timer"
              size="small"
              onClick={() => handleAction('setTimer')}
              tooltip="Set time limit"
            />
            <RibbonButton
              icon={Lock}
              label="Lock"
              size="small"
              onClick={() => handleAction('lockQuiz')}
              tooltip="Lock navigation"
            />
            <RibbonButton
              icon={Settings}
              label="Settings"
              size="small"
              onClick={() => handleAction('quizSettings')}
              tooltip="Quiz settings"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: ADVANCED
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Advanced">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={GitBranch}
            label="Scenario"
            size="large"
            onClick={() => handleInsert('branchingScenario')}
            menuItems={[
              { label: 'Branching Scenario', onClick: () => handleInsert('branchingScenario') },
              { label: 'Case Study', onClick: () => handleInsert('caseStudy') },
              { label: 'Simulation', onClick: () => handleInsert('simulation') },
              { type: 'separator' },
              { label: 'Scenario Builder...', onClick: () => handleAction('openScenarioBuilder') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={FileQuestion}
              label="Pool"
              size="small"
              onClick={() => handleAction('openQuestionPool')}
              tooltip="Question pool"
            />
            <RibbonButton
              icon={GraduationCap}
              label="SCORM"
              size="small"
              onClick={() => handleAction('scormSettings')}
              tooltip="SCORM settings"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: ANALYTICS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Analytics">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={BarChart3}
            label="Results"
            size="large"
            onClick={() => handleAction('viewResults')}
            tooltip="View quiz results"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={TrendingUp}
              label="Stats"
              size="small"
              onClick={() => handleAction('viewStats')}
              tooltip="Question statistics"
            />
            <RibbonButton
              icon={Users}
              label="Responses"
              size="small"
              onClick={() => handleAction('viewResponses')}
              tooltip="View responses"
            />
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}
