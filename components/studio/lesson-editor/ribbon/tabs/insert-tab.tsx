'use client';

/**
 * InsertTab - Content insertion ribbon tab for lesson editing
 * Contains: Text, Media, Interactive, Data, Assessment, Layout blocks
 */

import {
  AlertCircle,
  AlignLeft,
  ArrowUpDown,
  Award,
  BarChart3,
  Box,
  CheckSquare,
  CircleHelp,
  Clock,
  Code,
  Columns3,
  Cpu,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FlipVertical,
  GitBranch,
  Glasses,
  Heading,
  Headphones,
  Image,
  Layers,
  Lightbulb,
  Link2,
  List,
  Lock,
  MessageSquare,
  Minus,
  MousePointerClick,
  Move,
  PanelTopClose,
  Quote,
  Split,
  Square,
  Table,
  Target,
  TextCursor,
  ToggleLeft,
  Trophy,
  Users,
  Video,
  Vote,
  Workflow,
} from 'lucide-react';
import { RibbonButton, RibbonContent, RibbonGroup, RibbonSeparator } from '@/components/ribbon';

// Super light blue for icons
const ICON = 'text-sky-400';

export interface InsertTabProps {
  // Text insertion callbacks
  onInsertParagraph?: () => void;
  onInsertHeading?: (level: 1 | 2 | 3) => void;
  onInsertList?: (type: 'bullet' | 'numbered') => void;
  onInsertQuote?: () => void;
  onInsertCode?: () => void;

  // Media insertion callbacks
  onInsertImage?: () => void;
  onInsertVideo?: () => void;
  onInsertAudio?: () => void;
  onInsertEmbed?: () => void;
  onInsertFile?: () => void;

  // Interactive block callbacks
  onInsertAccordion?: () => void;
  onInsertTabs?: () => void;
  onInsertFlipCard?: () => void;
  onInsertHotspot?: () => void;
  onInsertDragDrop?: () => void;
  onInsertClickReveal?: () => void;

  // Data & visualization callbacks
  onInsertTable?: () => void;
  onInsertChart?: () => void;
  onInsertDiagram?: () => void;
  onInsertTimeline?: () => void;
  onInsertProcessFlow?: () => void;

  // Assessment callbacks
  onInsertMultipleChoice?: () => void;
  onInsertMultipleSelect?: () => void;
  onInsertTrueFalse?: () => void;
  onInsertFillBlank?: () => void;
  onInsertMatching?: () => void;
  onInsertOrdering?: () => void;
  onInsertShortAnswer?: () => void;

  // Knowledge check callbacks
  onInsertQuickPoll?: () => void;
  onInsertReflection?: () => void;
  onInsertScenarioBranch?: () => void;
  onInsertKnowledgeGate?: () => void;

  // Gamification callbacks
  onInsertPointsAward?: () => void;
  onInsertBadgeTrigger?: () => void;
  onInsertLeaderboard?: () => void;
  onInsertProgressMilestone?: () => void;

  // Layout callbacks
  onInsertColumns?: (count: 2 | 3 | 4) => void;
  onInsertDivider?: () => void;
  onInsertSpacer?: () => void;
  onInsertCard?: () => void;
  onInsertCallout?: () => void;

  // Advanced callbacks
  onInsert3DModel?: () => void;
  onInsertVRScene?: () => void;
  onInsertSimulation?: () => void;
  onInsertBranchingScenario?: () => void;
  onInsertCustomHTML?: () => void;
}

// Gallery items for quick insertion (unused - using direct buttons instead)
// const textGalleryItems: GalleryItem[] = [
//   { id: "paragraph", label: "Paragraph", preview: <AlignLeft className="h-5 w-5" /> },
//   { id: "heading", label: "Heading", preview: <Heading className="h-5 w-5" /> },
//   { id: "list", label: "List", preview: <List className="h-5 w-5" /> },
//   { id: "quote", label: "Quote", preview: <Quote className="h-5 w-5" /> },
//   { id: "code", label: "Code", preview: <Code className="h-5 w-5" /> },
// ];

// const assessmentGalleryItems: GalleryItem[] = [
//   { id: "multiple-choice", label: "Multiple Choice", preview: <CircleHelp className="h-5 w-5" /> },
//   { id: "multiple-select", label: "Multiple Select", preview: <CheckSquare className="h-5 w-5" /> },
//   { id: "true-false", label: "True/False", preview: <ToggleLeft className="h-5 w-5" /> },
//   { id: "fill-blank", label: "Fill Blank", preview: <TextCursor className="h-5 w-5" /> },
//   { id: "matching", label: "Matching", preview: <Link2 className="h-5 w-5" /> },
//   { id: "ordering", label: "Ordering", preview: <ArrowUpDown className="h-5 w-5" /> },
// ];

export function InsertTab({
  onInsertParagraph,
  onInsertHeading,
  onInsertList,
  onInsertQuote,
  onInsertCode,
  onInsertImage,
  onInsertVideo,
  onInsertAudio,
  onInsertEmbed,
  onInsertFile,
  onInsertAccordion,
  onInsertTabs,
  onInsertFlipCard,
  onInsertHotspot,
  onInsertDragDrop,
  onInsertClickReveal,
  onInsertTable,
  onInsertChart,
  onInsertDiagram,
  onInsertTimeline,
  onInsertProcessFlow,
  onInsertMultipleChoice,
  onInsertMultipleSelect,
  onInsertTrueFalse,
  onInsertFillBlank,
  onInsertMatching,
  onInsertOrdering,
  onInsertShortAnswer,
  onInsertQuickPoll,
  onInsertReflection,
  onInsertScenarioBranch,
  onInsertKnowledgeGate,
  onInsertPointsAward,
  onInsertBadgeTrigger,
  onInsertLeaderboard,
  onInsertProgressMilestone,
  onInsertColumns,
  onInsertDivider,
  onInsertSpacer,
  onInsertCard,
  onInsertCallout,
  onInsert3DModel,
  onInsertVRScene,
  onInsertSimulation,
  onInsertBranchingScenario,
  onInsertCustomHTML,
}: InsertTabProps) {
  const _handleTextGallerySelect = (id: string) => {
    switch (id) {
      case 'paragraph':
        onInsertParagraph?.();
        break;
      case 'heading':
        onInsertHeading?.(2);
        break;
      case 'list':
        onInsertList?.('bullet');
        break;
      case 'quote':
        onInsertQuote?.();
        break;
      case 'code':
        onInsertCode?.();
        break;
    }
  };

  const _handleAssessmentSelect = (id: string) => {
    switch (id) {
      case 'multiple-choice':
        onInsertMultipleChoice?.();
        break;
      case 'multiple-select':
        onInsertMultipleSelect?.();
        break;
      case 'true-false':
        onInsertTrueFalse?.();
        break;
      case 'fill-blank':
        onInsertFillBlank?.();
        break;
      case 'matching':
        onInsertMatching?.();
        break;
      case 'ordering':
        onInsertOrdering?.();
        break;
    }
  };

  return (
    <RibbonContent>
      {/* Text Group */}
      <RibbonGroup label="Text">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<AlignLeft className={`h-5 w-5 ${ICON}`} />}
            label="Paragraph"
            size="lg"
            onClick={onInsertParagraph}
            tooltip="Insert paragraph block"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Heading className={`h-4 w-4 ${ICON}`} />}
              onClick={() => onInsertHeading?.(2)}
              tooltip="Insert heading"
            />
            <RibbonButton
              icon={<List className={`h-4 w-4 ${ICON}`} />}
              onClick={() => onInsertList?.('bullet')}
              tooltip="Insert list"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Quote className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertQuote}
              tooltip="Insert quote"
            />
            <RibbonButton
              icon={<Code className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertCode}
              tooltip="Insert code block"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Media Group */}
      <RibbonGroup label="Media">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Image className={`h-5 w-5 ${ICON}`} />}
            label="Image"
            size="lg"
            onClick={onInsertImage}
            tooltip="Insert image"
          />
          <RibbonButton
            icon={<Video className={`h-5 w-5 ${ICON}`} />}
            label="Video"
            size="lg"
            onClick={onInsertVideo}
            tooltip="Insert video"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Headphones className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertAudio}
              tooltip="Insert audio"
            />
            <RibbonButton
              icon={<ExternalLink className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertEmbed}
              tooltip="Insert embed"
            />
          </div>
          <RibbonButton
            icon={<Download className={`h-4 w-4 ${ICON}`} />}
            onClick={onInsertFile}
            tooltip="Insert file download"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Interactive Group */}
      <RibbonGroup label="Interactive">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<PanelTopClose className={`h-5 w-5 ${ICON}`} />}
            label="Accordion"
            size="lg"
            onClick={onInsertAccordion}
            tooltip="Insert accordion"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Layers className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertTabs}
              tooltip="Insert tabs"
            />
            <RibbonButton
              icon={<FlipVertical className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertFlipCard}
              tooltip="Insert flip card"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<MousePointerClick className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertHotspot}
              tooltip="Insert hotspot image"
            />
            <RibbonButton
              icon={<Move className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertDragDrop}
              tooltip="Insert drag & drop"
            />
          </div>
          <RibbonButton
            icon={<Eye className={`h-4 w-4 ${ICON}`} />}
            onClick={onInsertClickReveal}
            tooltip="Insert click to reveal"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Assessment Group */}
      <RibbonGroup label="Assessment">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<CircleHelp className={`h-5 w-5 ${ICON}`} />}
            label="Quiz"
            size="lg"
            onClick={onInsertMultipleChoice}
            tooltip="Insert multiple choice question"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<CheckSquare className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertMultipleSelect}
              tooltip="Multiple select"
            />
            <RibbonButton
              icon={<ToggleLeft className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertTrueFalse}
              tooltip="True/False"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<TextCursor className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertFillBlank}
              tooltip="Fill in the blank"
            />
            <RibbonButton
              icon={<Link2 className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertMatching}
              tooltip="Matching"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<ArrowUpDown className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertOrdering}
              tooltip="Ordering/Sequence"
            />
            <RibbonButton
              icon={<MessageSquare className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertShortAnswer}
              tooltip="Short answer"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Data & Viz Group */}
      <RibbonGroup label="Data">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Table className={`h-5 w-5 ${ICON}`} />}
            label="Table"
            size="lg"
            onClick={onInsertTable}
            tooltip="Insert table"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<BarChart3 className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertChart}
              tooltip="Insert chart"
            />
            <RibbonButton
              icon={<GitBranch className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertDiagram}
              tooltip="Insert diagram"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Clock className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertTimeline}
              tooltip="Insert timeline"
            />
            <RibbonButton
              icon={<Workflow className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertProcessFlow}
              tooltip="Insert process flow"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Knowledge Check Group */}
      <RibbonGroup label="Knowledge">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Lightbulb className={`h-5 w-5 ${ICON}`} />}
            label="Reflect"
            size="lg"
            onClick={onInsertReflection}
            tooltip="Insert reflection prompt"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Vote className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertQuickPoll}
              tooltip="Quick poll"
            />
            <RibbonButton
              icon={<Split className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertScenarioBranch}
              tooltip="Scenario branch"
            />
          </div>
          <RibbonButton
            icon={<Lock className={`h-4 w-4 ${ICON}`} />}
            onClick={onInsertKnowledgeGate}
            tooltip="Knowledge gate"
          />
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
            onClick={onInsertPointsAward}
            tooltip="Insert points award"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Award className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertBadgeTrigger}
              tooltip="Badge trigger"
            />
            <RibbonButton
              icon={<Users className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertLeaderboard}
              tooltip="Leaderboard"
            />
          </div>
          <RibbonButton
            icon={<Target className={`h-4 w-4 ${ICON}`} />}
            onClick={onInsertProgressMilestone}
            tooltip="Progress milestone"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Layout Group */}
      <RibbonGroup label="Layout">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Columns3 className={`h-5 w-5 ${ICON}`} />}
            label="Columns"
            size="lg"
            onClick={() => onInsertColumns?.(2)}
            tooltip="Insert columns"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Minus className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertDivider}
              tooltip="Insert divider"
            />
            <RibbonButton
              icon={<Square className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertSpacer}
              tooltip="Insert spacer"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<CreditCard className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertCard}
              tooltip="Insert card container"
            />
            <RibbonButton
              icon={<AlertCircle className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertCallout}
              tooltip="Insert callout box"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Advanced Group */}
      <RibbonGroup label="Advanced">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Box className={`h-5 w-5 ${ICON}`} />}
            label="3D Model"
            size="lg"
            onClick={onInsert3DModel}
            tooltip="Insert 3D model viewer"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Glasses className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertVRScene}
              tooltip="VR/AR scene"
            />
            <RibbonButton
              icon={<Cpu className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertSimulation}
              tooltip="Simulation"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Split className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertBranchingScenario}
              tooltip="Branching scenario"
            />
            <RibbonButton
              icon={<FileCode className={`h-4 w-4 ${ICON}`} />}
              onClick={onInsertCustomHTML}
              tooltip="Custom HTML/CSS"
            />
          </div>
        </div>
      </RibbonGroup>
    </RibbonContent>
  );
}
