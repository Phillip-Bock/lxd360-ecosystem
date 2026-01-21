'use client';

/**
 * InteractionsTab - Interactive elements and branching ribbon tab
 * Contains: Knowledge Checks, Hotspots, Branching, Gamification, Triggers
 */

import {
  ArrowUpDown,
  Award,
  CheckCircle,
  CircleHelp,
  Eye,
  Flag,
  FlipVertical,
  Gamepad2,
  GitBranch,
  Layers,
  Lightbulb,
  ListChecks,
  Lock,
  Medal,
  MessageSquare,
  MousePointerClick,
  Move,
  Network,
  PanelTopClose,
  Route,
  Settings2,
  Split,
  Target,
  Timer,
  Trophy,
  Users,
  Vote,
  Zap,
} from 'lucide-react';
import {
  RibbonButton,
  RibbonContent,
  RibbonDropdown,
  RibbonGroup,
  RibbonSeparator,
} from '@/components/ribbon';

// Super light blue for icons
const ICON = 'text-sky-400';

export interface InteractionsTabProps {
  // Knowledge checks
  onAddQuiz?: () => void;
  onAddPoll?: () => void;
  onAddReflection?: () => void;
  onAddSurvey?: () => void;
  onConfigureKnowledgeCheck?: () => void;

  // Hotspots & reveals
  onAddHotspot?: () => void;
  onAddClickReveal?: () => void;
  onAddTooltip?: () => void;
  onAddLightbox?: () => void;
  onConfigureHotspots?: () => void;

  // Interactive elements
  onAddAccordion?: () => void;
  onAddTabs?: () => void;
  onAddFlipCard?: () => void;
  onAddCarousel?: () => void;
  onAddDragDrop?: () => void;
  onAddSorting?: () => void;

  // Branching & navigation
  onAddBranch?: () => void;
  onAddCondition?: () => void;
  onAddKnowledgeGate?: () => void;
  onAddJumpTo?: () => void;
  onViewBranchingMap?: () => void;

  // Gamification
  onAddPointsAward?: () => void;
  onAddBadgeTrigger?: () => void;
  onAddAchievement?: () => void;
  onAddLeaderboard?: () => void;
  onAddProgressMilestone?: () => void;
  onConfigureGamification?: () => void;

  // Triggers & automation
  onAddTimeTrigger?: () => void;
  onAddScrollTrigger?: () => void;
  onAddCompletionTrigger?: () => void;
  onAddCustomTrigger?: () => void;

  // Settings
  interactionMode?: 'guided' | 'explore' | 'assessment';
  onInteractionModeChange?: (mode: string) => void;
  requireCompletion?: boolean;
  onRequireCompletionChange?: (required: boolean) => void;
}

const INTERACTION_MODES = [
  { value: 'guided', label: 'Guided Mode' },
  { value: 'explore', label: 'Explore Mode' },
  { value: 'assessment', label: 'Assessment Mode' },
];

export function InteractionsTab({
  onAddQuiz,
  onAddPoll,
  onAddReflection,
  onAddSurvey,
  onConfigureKnowledgeCheck,
  onAddHotspot,
  onAddClickReveal,
  onAddTooltip,
  onAddLightbox,
  onConfigureHotspots: _onConfigureHotspots,
  onAddAccordion,
  onAddTabs,
  onAddFlipCard,
  onAddCarousel: _onAddCarousel,
  onAddDragDrop,
  onAddSorting,
  onAddBranch,
  onAddCondition,
  onAddKnowledgeGate,
  onAddJumpTo,
  onViewBranchingMap,
  onAddPointsAward,
  onAddBadgeTrigger,
  onAddAchievement,
  onAddLeaderboard,
  onAddProgressMilestone,
  onConfigureGamification,
  onAddTimeTrigger,
  onAddScrollTrigger,
  onAddCompletionTrigger,
  onAddCustomTrigger,
  interactionMode = 'guided',
  onInteractionModeChange,
  requireCompletion = false,
  onRequireCompletionChange,
}: InteractionsTabProps) {
  return (
    <RibbonContent>
      {/* Knowledge Checks Group */}
      <RibbonGroup label="Knowledge Checks">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<CircleHelp className={`h-5 w-5 ${ICON}`} />}
            label="Quiz"
            size="lg"
            onClick={onAddQuiz}
            tooltip="Add quiz question"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Vote className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddPoll}
              tooltip="Add quick poll"
            />
            <RibbonButton
              icon={<Lightbulb className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddReflection}
              tooltip="Add reflection prompt"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<ListChecks className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddSurvey}
              tooltip="Add survey"
            />
            <RibbonButton
              icon={<Settings2 className={`h-4 w-4 ${ICON}`} />}
              onClick={onConfigureKnowledgeCheck}
              tooltip="Configure settings"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Hotspots & Reveals Group */}
      <RibbonGroup label="Hotspots">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<MousePointerClick className={`h-5 w-5 ${ICON}`} />}
            label="Hotspot"
            size="lg"
            onClick={onAddHotspot}
            tooltip="Add image hotspot"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Eye className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddClickReveal}
              tooltip="Click to reveal"
            />
            <RibbonButton
              icon={<MessageSquare className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddTooltip}
              tooltip="Add tooltip"
            />
          </div>
          <RibbonButton
            icon={<Zap className={`h-4 w-4 ${ICON}`} />}
            onClick={onAddLightbox}
            tooltip="Lightbox popup"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Interactive Elements Group */}
      <RibbonGroup label="Interactive">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<PanelTopClose className={`h-5 w-5 ${ICON}`} />}
            label="Accordion"
            size="lg"
            onClick={onAddAccordion}
            tooltip="Add accordion"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Layers className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddTabs}
              tooltip="Add tabs"
            />
            <RibbonButton
              icon={<FlipVertical className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddFlipCard}
              tooltip="Add flip card"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Move className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddDragDrop}
              tooltip="Drag & drop"
            />
            <RibbonButton
              icon={<ArrowUpDown className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddSorting}
              tooltip="Sorting activity"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Branching Group */}
      <RibbonGroup label="Branching">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<GitBranch className={`h-5 w-5 ${ICON}`} />}
            label="Branch"
            size="lg"
            onClick={onAddBranch}
            tooltip="Add branching path"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Split className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddCondition}
              tooltip="Add condition"
            />
            <RibbonButton
              icon={<Lock className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddKnowledgeGate}
              tooltip="Knowledge gate"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Route className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddJumpTo}
              tooltip="Jump to section"
            />
            <RibbonButton
              icon={<Network className={`h-4 w-4 ${ICON}`} />}
              onClick={onViewBranchingMap}
              tooltip="View branching map"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Gamification Group */}
      <RibbonGroup label="Gamification">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Trophy className={`h-5 w-5 ${ICON}`} />}
            label="Points"
            size="lg"
            onClick={onAddPointsAward}
            tooltip="Award points"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Award className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddBadgeTrigger}
              tooltip="Badge trigger"
            />
            <RibbonButton
              icon={<Medal className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddAchievement}
              tooltip="Achievement"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Users className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddLeaderboard}
              tooltip="Leaderboard"
            />
            <RibbonButton
              icon={<Target className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddProgressMilestone}
              tooltip="Progress milestone"
            />
          </div>
          <RibbonButton
            icon={<Gamepad2 className={`h-4 w-4 ${ICON}`} />}
            onClick={onConfigureGamification}
            tooltip="Configure gamification"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Triggers Group */}
      <RibbonGroup label="Triggers">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Zap className={`h-5 w-5 ${ICON}`} />}
            label="Trigger"
            size="lg"
            onClick={onAddCustomTrigger}
            tooltip="Add custom trigger"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Timer className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddTimeTrigger}
              tooltip="Time-based trigger"
            />
            <RibbonButton
              icon={<Flag className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddScrollTrigger}
              tooltip="Scroll trigger"
            />
          </div>
          <RibbonButton
            icon={<CheckCircle className={`h-4 w-4 ${ICON}`} />}
            onClick={onAddCompletionTrigger}
            tooltip="Completion trigger"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Settings Group */}
      <RibbonGroup label="Settings">
        <div className="flex items-center gap-2">
          <RibbonDropdown
            options={INTERACTION_MODES}
            value={interactionMode}
            onValueChange={onInteractionModeChange}
            placeholder="Mode"
          />
          <RibbonButton
            icon={<Lock className={`h-4 w-4 ${ICON}`} />}
            active={requireCompletion}
            onClick={() => onRequireCompletionChange?.(!requireCompletion)}
            tooltip={requireCompletion ? 'Completion required' : 'Completion optional'}
          />
        </div>
      </RibbonGroup>
    </RibbonContent>
  );
}
