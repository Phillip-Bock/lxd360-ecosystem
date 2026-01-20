import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  AccordionBlock,
  AlertBlock,
  ARPortalBlock,
  AudioBlock,
  ButtonBlock,
  CalculatorBlock,
  ChecklistBlock,
  CodeBlock,
  CollaborationBlock,
  ContentBlock,
  ContentBlockType,
  CriticalIncidentBlock,
  DecisionTreeBlock,
  DiagnosticTestBlock,
  DiscussionBlock,
  DividerBlock,
  DragDropBlock,
  EmbedBlock,
  EssayBlock,
  FileBlock,
  FillBlankBlock,
  FlashcardBlock,
  HeadingBlock,
  HotspotBlock,
  ImageBlock,
  InteractiveInfographicBlock,
  InteractiveSpreadsheetBlock,
  ListBlock,
  MatchingBlock,
  MindMapBlock,
  MoralDilemmaBlock,
  MultipleChoiceBlock,
  PollBlock,
  QuizBlock,
  QuoteBlock,
  ReflectionBlock,
  ReflectiveJournalBlock,
  RichTextBlock,
  ScenarioBlock,
  ShortAnswerBlock,
  SimulationBlock,
  SliderBlock,
  SoftwareSimulationBlock,
  SortingBlock,
  SurveyBlock,
  TableBlock,
  TabsBlock,
  TextBlock,
  TimelineBlock,
  TrueFalseBlock,
  VideoBlock,
  VRSimulationBlock,
} from '@/lib/inspire-studio/types/contentBlocks';
import { AccordionBlockEditor } from './blocks/AccordionBlockEditor';
import { AIContentGeneratorBlockEditor } from './blocks/AIContentGeneratorBlockEditor';
import { AINarrationBlockEditor } from './blocks/AINarrationBlockEditor';
import { AIQuizGeneratorBlockEditor } from './blocks/AIQuizGeneratorBlockEditor';
import { AITranslationBlockEditor } from './blocks/AITranslationBlockEditor';
import { AlertBlockEditor } from './blocks/AlertBlockEditor';
import { ARHotspotExplorerBlockEditor } from './blocks/ARHotspotExplorerBlockEditor';
import { ARObjectViewerBlockEditor } from './blocks/ARObjectViewerBlockEditor';
import { ARPortalBlockEditor } from './blocks/ARPortalBlockEditor';
import { ARScavengerHuntBlockEditor } from './blocks/ARScavengerHuntBlockEditor';
import { AskExpertBlockEditor } from './blocks/AskExpertBlockEditor';
import { AudioBlockEditor } from './blocks/AudioBlockEditor';
import { AudioResponseBlockEditor } from './blocks/AudioResponseBlockEditor';
import { BaseBlockEditor } from './blocks/BaseBlockEditor';
import { BranchingVideoBlockEditor } from './blocks/BranchingVideoBlockEditor';
import { ButtonBlockEditor } from './blocks/ButtonBlockEditor';
import { CalculatorBlockEditor } from './blocks/CalculatorBlockEditor';
import { CalendarSchedulingBlockEditor } from './blocks/CalendarSchedulingBlockEditor';
import { CertificateBlockEditor } from './blocks/CertificateBlockEditor';
import { ChecklistBlockEditor } from './blocks/ChecklistBlockEditor';
import { CodeBlockEditor } from './blocks/CodeBlockEditor';
import { CodeValidatorBlockEditor } from './blocks/CodeValidatorBlockEditor';
import { CollaborationBlockEditor } from './blocks/CollaborationBlockEditor';
import { CriticalIncidentBlockEditor } from './blocks/CriticalIncidentBlockEditor';
import { DecisionTreeBlockEditor } from './blocks/DecisionTreeBlockEditor';
import { DiagnosticTestBlockEditor } from './blocks/DiagnosticTestBlockEditor';
import { DiscussionBlockEditor } from './blocks/DiscussionBlockEditor';
import { DividerBlockEditor } from './blocks/DividerBlockEditor';
import { DragDropBlockEditor } from './blocks/DragDropBlockEditor';
import { EmbedBlockEditor } from './blocks/EmbedBlockEditor';
import { EscapeRoomBlockEditor } from './blocks/EscapeRoomBlockEditor';
import { EssayBlockEditor } from './blocks/EssayBlockEditor';
import { FileBlockEditor } from './blocks/FileBlockEditor';
import { FillBlankBlockEditor } from './blocks/FillBlankBlockEditor';
import { FlashcardBlockEditor } from './blocks/FlashcardBlockEditor';
import { GamificationHubBlockEditor } from './blocks/GamificationHubBlockEditor';
import { GroupDiscussionBlockEditor } from './blocks/GroupDiscussionBlockEditor';
import { HeadingBlockEditor } from './blocks/HeadingBlockEditor';
import { HotspotBlockEditor } from './blocks/HotspotBlockEditor';
import { HotspotImageBlockEditor } from './blocks/HotspotImageBlockEditor';
import { ImageBlockEditor } from './blocks/ImageBlockEditor';
import { InteractiveInfographicBlockEditor } from './blocks/InteractiveInfographicBlockEditor';
import { InteractiveMapBlockEditor } from './blocks/InteractiveMapBlockEditor';
import { InteractiveSpreadsheetBlockEditor } from './blocks/InteractiveSpreadsheetBlockEditor';
import { LearnerNotebookBlockEditor } from './blocks/LearnerNotebookBlockEditor';
import { ListBlockEditor } from './blocks/ListBlockEditor';
import { LivePollBlockEditor } from './blocks/LivePollBlockEditor';
import { MatchingBlockEditor } from './blocks/MatchingBlockEditor';
import { MindMapBlockEditor } from './blocks/MindMapBlockEditor';
import { MoralDilemmaBlockEditor } from './blocks/MoralDilemmaBlockEditor';
import { MultipleChoiceBlockEditor } from './blocks/MultipleChoiceBlockEditor';
import { PeerReviewBlockEditor } from './blocks/PeerReviewBlockEditor';
import { PersonalizedActionPlanBlockEditor } from './blocks/PersonalizedActionPlanBlockEditor';
import { PollBlockEditor } from './blocks/PollBlockEditor';
import { QuizBlockEditor } from './blocks/QuizBlockEditor';
import { QuoteBlockEditor } from './blocks/QuoteBlockEditor';
import { RankOrderComplexBlockEditor } from './blocks/RankOrderComplexBlockEditor';
import { ReflectionBlockEditor } from './blocks/ReflectionBlockEditor';
import { ReflectiveJournalBlockEditor } from './blocks/ReflectiveJournalBlockEditor';
import { ResourceGlossaryBlockEditor } from './blocks/ResourceGlossaryBlockEditor';
import { RichTextBlockEditor } from './blocks/RichTextBlockEditor';
import { ScenarioBlockEditor } from './blocks/ScenarioBlockEditor';
import { SharedWhiteboardBlockEditor } from './blocks/SharedWhiteboardBlockEditor';
import { ShortAnswerBlockEditor } from './blocks/ShortAnswerBlockEditor';
import { SimulationBlockEditor } from './blocks/SimulationBlockEditor';
import { SliderBlockEditor } from './blocks/SliderBlockEditor';
import { SoftwareSimulationBlockEditor } from './blocks/SoftwareSimulationBlockEditor';
import { SortingBlockEditor } from './blocks/SortingBlockEditor';
import { SurveyBlockEditor } from './blocks/SurveyBlockEditor';
import { TableBlockEditor } from './blocks/TableBlockEditor';
import { TabsBlockEditor } from './blocks/TabsBlockEditor';
import { TeamChallengeBlockEditor } from './blocks/TeamChallengeBlockEditor';
import { TextBlockEditor } from './blocks/TextBlockEditor';
import { TimelineBlockEditor } from './blocks/TimelineBlockEditor';
import { TrueFalseBlockEditor } from './blocks/TrueFalseBlockEditor';
import { UserGalleryBlockEditor } from './blocks/UserGalleryBlockEditor';
import { VideoBlockEditor } from './blocks/VideoBlockEditor';
import { VideoResponseBlockEditor } from './blocks/VideoResponseBlockEditor';
import { VREnvironmentBlockEditor } from './blocks/VREnvironmentBlockEditor';
import { VRRolePlayBlockEditor } from './blocks/VRRolePlayBlockEditor';
import { VRSimulationBlockEditor } from './blocks/VRSimulationBlockEditor';
import { XRInteractiveDiagramBlockEditor } from './blocks/XRInteractiveDiagramBlockEditor';

interface ContentEditorProps {
  initialBlocks?: ContentBlock[];
  onSave: (blocks: ContentBlock[]) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
}

export const ContentEditor = ({
  initialBlocks = [],
  onSave,
  selectedBlockId = null,
  onSelectBlock,
}: ContentEditorProps): React.JSX.Element => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const createNewBlock = (type: string): ContentBlock => {
    const baseBlock = {
      id: `block_${Date.now()}`,
      type: type as ContentBlockType,
      order: blocks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (type) {
      case 'heading':
        return { ...baseBlock, type: 'heading', content: { text: '', level: 1 } };
      case 'text':
        return { ...baseBlock, type: 'text', content: { text: '' } };
      case 'richtext':
        return { ...baseBlock, type: 'richtext', content: { html: '' } };
      case 'image':
        return { ...baseBlock, type: 'image', content: { url: '', alt: '' } };
      case 'video':
        return { ...baseBlock, type: 'video', content: { url: '' } };
      case 'audio':
        return { ...baseBlock, type: 'audio', content: { url: '' } };
      case 'file':
        return { ...baseBlock, type: 'file', content: { url: '', filename: '' } };
      case 'quote':
        return { ...baseBlock, type: 'quote', content: { text: '' } };
      case 'list':
        return { ...baseBlock, type: 'list', content: { items: [''], ordered: false } };
      case 'multiple_choice':
        return {
          ...baseBlock,
          type: 'multiple_choice',
          content: {
            question: '',
            options: [
              { id: 'opt1', text: '', isCorrect: false },
              { id: 'opt2', text: '', isCorrect: false },
            ],
            allowMultiple: false,
          },
        };
      case 'true_false':
        return { ...baseBlock, type: 'true_false', content: { question: '', correctAnswer: true } };
      case 'short_answer':
        return { ...baseBlock, type: 'short_answer', content: { question: '' } };
      case 'essay':
        return { ...baseBlock, type: 'essay', content: { prompt: '' } };
      case 'fill_blank':
        return { ...baseBlock, type: 'fill_blank', content: { text: '', blanks: [] } };
      case 'matching':
        return {
          ...baseBlock,
          type: 'matching',
          content: {
            instruction: '',
            pairs: [
              { id: 'p1', left: '', right: '' },
              { id: 'p2', left: '', right: '' },
            ],
          },
        };
      case 'poll':
        return {
          ...baseBlock,
          type: 'poll',
          content: {
            question: '',
            options: [
              { id: 'o1', text: '' },
              { id: 'o2', text: '' },
            ],
            allowMultiple: false,
            showResults: true,
          },
        };
      case 'discussion':
        return {
          ...baseBlock,
          type: 'discussion',
          content: { prompt: '', allowReplies: true, requireApproval: false },
        };
      case 'survey':
        return { ...baseBlock, type: 'survey', content: { title: '', questions: [] } };
      case 'code':
        return {
          ...baseBlock,
          type: 'code',
          content: { code: '', language: 'javascript', showLineNumbers: true },
        };
      case 'divider':
        return { ...baseBlock, type: 'divider', content: { style: 'solid' } };
      case 'accordion':
        return {
          ...baseBlock,
          type: 'accordion',
          content: {
            items: [{ id: 'i1', title: '', content: '', isOpen: false }],
            allowMultiple: false,
          },
        };
      case 'tabs':
        return {
          ...baseBlock,
          type: 'tabs',
          content: { tabs: [{ id: 't1', label: '', content: '' }], activeTab: 't1' },
        };
      case 'checklist':
        return {
          ...baseBlock,
          type: 'checklist',
          content: {
            title: '',
            items: [{ id: 'i1', text: '', checked: false }],
            showProgress: true,
          },
        };
      case 'button':
        return {
          ...baseBlock,
          type: 'button',
          content: { text: 'Click me', style: 'primary', size: 'medium' },
        };
      case 'alert':
        return {
          ...baseBlock,
          type: 'alert',
          content: { message: '', type: 'info', dismissible: false },
        };
      case 'table':
        return {
          ...baseBlock,
          type: 'table',
          content: { headers: ['Column 1', 'Column 2'], rows: [['', '']] },
        };
      case 'embed':
        return { ...baseBlock, type: 'embed', content: { url: '' } };
      case 'flashcard':
        return {
          ...baseBlock,
          type: 'flashcard',
          content: { cards: [{ id: 'c1', front: '', back: '' }], shuffleCards: false },
        };
      case 'timeline':
        return {
          ...baseBlock,
          type: 'timeline',
          content: {
            events: [{ id: 'e1', date: '', title: '', description: '' }],
            orientation: 'vertical',
          },
        };
      case 'slider':
        return {
          ...baseBlock,
          type: 'slider',
          content: { question: '', min: 0, max: 100, step: 1 },
        };
      case 'hotspot':
        return { ...baseBlock, type: 'hotspot', content: { imageUrl: '', hotspots: [] } };
      case 'drag_drop':
        return {
          ...baseBlock,
          type: 'drag_drop',
          content: { instruction: '', items: [], zones: [{ id: 'z1', label: '' }] },
        };
      case 'sorting':
        return { ...baseBlock, type: 'sorting', content: { instruction: '', items: [] } };
      case 'quiz':
        return {
          ...baseBlock,
          type: 'quiz',
          content: { question: '', type: 'multiple_choice', correctAnswer: '' },
        };
      case 'calculator':
        return { ...baseBlock, type: 'calculator', content: {} };
      case 'simulation':
        return {
          ...baseBlock,
          type: 'simulation',
          content: { title: '', description: '', simulationType: '' },
        };
      case 'mind_map':
        return {
          ...baseBlock,
          type: 'mind_map',
          content: { title: '', nodes: [{ id: 'root', text: '', parentId: undefined }] },
        };
      case 'collaboration':
        return {
          ...baseBlock,
          type: 'collaboration',
          content: { title: '', instruction: '', activityType: 'group_discussion' },
        };
      case 'scenario':
        return {
          ...baseBlock,
          type: 'scenario',
          content: {
            title: '',
            description: '',
            scenes: [
              {
                id: 's1',
                text: '',
                choices: [{ id: 'c1', text: '', nextSceneId: '', feedback: '' }],
              },
            ],
            startSceneId: 's1',
          },
        };
      case 'reflection':
        return { ...baseBlock, type: 'reflection', content: { prompt: '', isPrivate: false } };
      case 'ai_content_generator':
        return {
          ...baseBlock,
          type: 'ai_content_generator',
          content: {
            prompt: '',
            contentType: 'explanation',
            tone: 'conversational',
            length: 'moderate',
          },
        };
      case 'ai_quiz_generator':
        return {
          ...baseBlock,
          type: 'ai_quiz_generator',
          content: {
            sourceContent: '',
            questionCount: 5,
            questionTypes: ['multiple_choice', 'true_false'],
            difficulty: 'medium',
            questions: [],
          },
        };
      case 'ai_narration':
        return {
          ...baseBlock,
          type: 'ai_narration',
          content: { text: '', voiceId: 'alloy', language: 'en-US' },
        };
      case 'ai_translation':
        return {
          ...baseBlock,
          type: 'ai_translation',
          content: { sourceText: '', translations: [] },
        };
      case 'ar_object_viewer':
        return {
          ...baseBlock,
          type: 'ar_object_viewer',
          content: { title: '', modelUrl: '', modelFormat: 'glb' },
        };
      case 'ar_hotspot_explorer':
        return {
          ...baseBlock,
          type: 'ar_hotspot_explorer',
          content: { title: '', targetImageUrl: '', hotspots: [] },
        };
      case 'ar_scavenger_hunt':
        return {
          ...baseBlock,
          type: 'ar_scavenger_hunt',
          content: { title: '', timeLimitMinutes: 30, huntItems: [] },
        };
      case 'ar_portal':
        return { ...baseBlock, type: 'ar_portal', content: { title: '', environmentUrl: '' } };
      case 'vr_environment':
        return {
          ...baseBlock,
          type: 'vr_environment',
          content: { title: '', environmentUrl: '', mediaType: '360_image' },
        };
      case 'vr_simulation':
        return {
          ...baseBlock,
          type: 'vr_simulation',
          content: { title: '', simulationType: 'safety_training' },
        };
      case 'vr_roleplay':
        return {
          ...baseBlock,
          type: 'vr_roleplay',
          content: { title: '', scenarioType: 'presentation', aiCharacters: [] },
        };
      case 'xr_interactive_diagram':
        return {
          ...baseBlock,
          type: 'xr_interactive_diagram',
          content: { title: '', modelUrl: '', interactionMode: 'hand_tracking' },
        };
      case 'group_discussion':
        return {
          ...baseBlock,
          type: 'group_discussion',
          content: { title: '', description: '', moderationEnabled: true, allowAnonymous: false },
        };
      case 'peer_review':
        return {
          ...baseBlock,
          type: 'peer_review',
          content: {
            title: '',
            instructions: '',
            submissionType: 'text',
            reviewsRequired: 3,
            rubricCriteria: ['Quality', 'Clarity', 'Relevance'],
          },
        };
      case 'live_poll':
        return {
          ...baseBlock,
          type: 'live_poll',
          content: {
            question: '',
            pollType: 'multiple_choice',
            displayType: 'bar_chart',
            options: ['Option 1', 'Option 2'],
          },
        };
      case 'team_challenge':
        return {
          ...baseBlock,
          type: 'team_challenge',
          content: { title: '', instructions: '', challengeType: 'puzzle', teamSize: 4 },
        };
      case 'shared_whiteboard':
        return {
          ...baseBlock,
          type: 'shared_whiteboard',
          content: {
            title: '',
            maxParticipants: 50,
            allowDrawing: true,
            allowText: true,
            allowStickyNotes: true,
          },
        };
      case 'user_gallery':
        return {
          ...baseBlock,
          type: 'user_gallery',
          content: {
            title: '',
            prompt: '',
            moderationRequired: true,
            allowedFormats: ['image', 'video', 'document'],
          },
        };
      case 'ask_expert':
        return {
          ...baseBlock,
          type: 'ask_expert',
          content: { title: '', description: '', allowAnonymous: false },
        };
      case 'branching_video':
        return {
          ...baseBlock,
          type: 'branching_video',
          content: { title: '', initialVideoUrl: '', decisionPoints: [] },
        };
      case 'software_simulation':
        return {
          ...baseBlock,
          type: 'software_simulation',
          content: { title: '', simulationType: 'guided' },
        };
      case 'decision_tree':
        return { ...baseBlock, type: 'decision_tree', content: { title: '', instructions: '' } };
      case 'interactive_map':
        return {
          ...baseBlock,
          type: 'interactive_map',
          content: { title: '', mapType: 'world', displayMode: 'clickable' },
        };
      case 'escape_room':
        return {
          ...baseBlock,
          type: 'escape_room',
          content: { title: '', unlockCode: '', timeLimitMinutes: 30 },
        };
      case 'gamification_hub':
        return {
          ...baseBlock,
          type: 'gamification_hub',
          content: {
            title: '',
            pointsEnabled: true,
            badgesEnabled: true,
            leaderboardEnabled: true,
          },
        };
      case 'moral_dilemma':
        return { ...baseBlock, type: 'moral_dilemma', content: { title: '', scenario: '' } };
      case 'interactive_infographic':
        return {
          ...baseBlock,
          type: 'interactive_infographic',
          content: { title: '', layoutType: 'vertical' },
        };
      case 'audio_response':
        return {
          ...baseBlock,
          type: 'audio_response',
          content: { title: '', prompt: '', maxDurationSeconds: 60, allowRetakes: true },
        };
      case 'video_response':
        return {
          ...baseBlock,
          type: 'video_response',
          content: { title: '', prompt: '', maxDurationSeconds: 120 },
        };
      case 'critical_incident':
        return { ...baseBlock, type: 'critical_incident', content: { title: '', scenario: '' } };
      case 'diagnostic_test':
        return { ...baseBlock, type: 'diagnostic_test', content: { title: '', instructions: '' } };
      case 'rank_order_complex':
        return { ...baseBlock, type: 'rank_order_complex', content: { title: '', items: [] } };
      case 'hotspot_image':
        return { ...baseBlock, type: 'hotspot_image', content: { title: '', imageUrl: '' } };
      case 'reflective_journal':
        return {
          ...baseBlock,
          type: 'reflective_journal',
          content: { title: '', prompt: '', downloadable: true },
        };
      case 'interactive_spreadsheet':
        return {
          ...baseBlock,
          type: 'interactive_spreadsheet',
          content: {
            title: '',
            instructions: '',
            grid: Array(5)
              .fill(null)
              .map(() =>
                Array(5)
                  .fill(null)
                  .map(() => ({
                    value: '',
                    type: 'text' as const,
                    isEditable: true,
                    validationFormula: '',
                  })),
              ),
            rows: 5,
            cols: 5,
          },
        };
      case 'code_validator':
        return {
          ...baseBlock,
          type: 'code_validator',
          content: { title: '', language: 'python', starterCode: '' },
        };
      case 'personalized_action_plan':
        return {
          ...baseBlock,
          type: 'personalized_action_plan',
          content: {
            title: '',
            analysisMethod: 'automatic',
            passingThreshold: 70,
            includeRemediation: true,
            includeStrengths: true,
            downloadFormat: 'pdf',
          },
        };
      case 'learner_notebook':
        return {
          ...baseBlock,
          type: 'learner_notebook',
          content: {
            title: 'My Learning Notes',
            placement: 'sidebar',
            defaultOpen: false,
            allowExport: true,
            exportFormat: 'pdf',
            placeholder: 'Take notes as you learn...',
            maxCharacters: 10000,
            autoSave: true,
          },
        };
      case 'certificate':
        return {
          ...baseBlock,
          type: 'certificate',
          content: {
            title: 'Certificate of Completion',
            templateStyle: 'modern',
            includeDate: true,
            includeSignature: true,
            signatureText: 'Course Instructor',
            signatureTitle: 'Lead Instructor',
            includeScore: false,
            customMessage: 'has successfully completed',
            downloadFormat: 'pdf',
            requireAllBlocks: true,
            minimumScore: 70,
          },
        };
      case 'calendar_scheduling':
        return {
          ...baseBlock,
          type: 'calendar_scheduling',
          content: {
            title: '',
            description: '',
            allowBooking: true,
            calendarIntegration: 'google',
          },
        };
      case 'resource_glossary':
        return {
          ...baseBlock,
          type: 'resource_glossary',
          content: { title: 'Glossary', entries: [], sortAlphabetically: true, allowSearch: true },
        };
      default:
        return { ...baseBlock, type: 'text', content: { text: '' } } as ContentBlock;
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    const blockType = e.dataTransfer.getData('blockType');

    if (blockType) {
      const newBlock = createNewBlock(blockType);
      const updatedBlocks = [...blocks, newBlock];
      setBlocks(updatedBlocks);
      onSave(updatedBlocks);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const updateBlock = (blockId: string, content: ContentBlock['content']): void => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, content, updatedAt: new Date().toISOString() } : block,
    );
    setBlocks(updatedBlocks);
    onSave(updatedBlocks);
  };

  const deleteBlock = (blockId: string): void => {
    const updatedBlocks = blocks.filter((block) => block.id !== blockId);
    setBlocks(updatedBlocks);
    onSave(updatedBlocks);
  };

  const duplicateBlock = (blockId: string): void => {
    const blockToDuplicate = blocks.find((b) => b.id === blockId);
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: `block_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedBlocks = [...blocks, newBlock];
      setBlocks(updatedBlocks);
      onSave(updatedBlocks);
    }
  };

  const renderBlockEditor = (block: ContentBlock): React.JSX.Element => {
    const onChange = (content: ContentBlock['content']): void => updateBlock(block.id, content);

    switch (block.type) {
      case 'heading':
        return <HeadingBlockEditor block={block as HeadingBlock} onChange={onChange} />;
      case 'text':
        return <TextBlockEditor block={block as TextBlock} onChange={onChange} />;
      case 'richtext':
        return <RichTextBlockEditor block={block as RichTextBlock} onChange={onChange} />;
      case 'image':
        return <ImageBlockEditor block={block as ImageBlock} onChange={onChange} />;
      case 'video':
        return <VideoBlockEditor block={block as VideoBlock} onChange={onChange} />;
      case 'audio':
        return <AudioBlockEditor block={block as AudioBlock} onChange={onChange} />;
      case 'file':
        return <FileBlockEditor block={block as FileBlock} onChange={onChange} />;
      case 'quote':
        return <QuoteBlockEditor block={block as QuoteBlock} onChange={onChange} />;
      case 'list':
        return <ListBlockEditor block={block as ListBlock} onChange={onChange} />;
      case 'multiple_choice':
        return (
          <MultipleChoiceBlockEditor block={block as MultipleChoiceBlock} onChange={onChange} />
        );
      case 'true_false':
        return <TrueFalseBlockEditor block={block as TrueFalseBlock} onChange={onChange} />;
      case 'short_answer':
        return <ShortAnswerBlockEditor block={block as ShortAnswerBlock} onChange={onChange} />;
      case 'essay':
        return <EssayBlockEditor block={block as EssayBlock} onChange={onChange} />;
      case 'fill_blank':
        return <FillBlankBlockEditor block={block as FillBlankBlock} onChange={onChange} />;
      case 'matching':
        return <MatchingBlockEditor block={block as MatchingBlock} onChange={onChange} />;
      case 'poll':
        return <PollBlockEditor block={block as PollBlock} onChange={onChange} />;
      case 'discussion':
        return <DiscussionBlockEditor block={block as DiscussionBlock} onChange={onChange} />;
      case 'survey':
        return <SurveyBlockEditor block={block as SurveyBlock} onChange={onChange} />;
      case 'code':
        return <CodeBlockEditor block={block as CodeBlock} onChange={onChange} />;
      case 'divider':
        return <DividerBlockEditor block={block as DividerBlock} onChange={onChange} />;
      case 'accordion':
        return <AccordionBlockEditor block={block as AccordionBlock} onChange={onChange} />;
      case 'tabs':
        return <TabsBlockEditor block={block as TabsBlock} onChange={onChange} />;
      case 'checklist':
        return <ChecklistBlockEditor block={block as ChecklistBlock} onChange={onChange} />;
      case 'button':
        return <ButtonBlockEditor block={block as ButtonBlock} onChange={onChange} />;
      case 'alert':
        return <AlertBlockEditor block={block as AlertBlock} onChange={onChange} />;
      case 'table':
        return <TableBlockEditor block={block as TableBlock} onChange={onChange} />;
      case 'embed':
        return <EmbedBlockEditor block={block as EmbedBlock} onChange={onChange} />;
      case 'flashcard':
        return <FlashcardBlockEditor block={block as FlashcardBlock} onChange={onChange} />;
      case 'timeline':
        return <TimelineBlockEditor block={block as TimelineBlock} onChange={onChange} />;
      case 'slider':
        return <SliderBlockEditor block={block as SliderBlock} onChange={onChange} />;
      case 'hotspot':
        return <HotspotBlockEditor block={block as HotspotBlock} onChange={onChange} />;
      case 'drag_drop':
        return <DragDropBlockEditor block={block as DragDropBlock} onChange={onChange} />;
      case 'sorting':
        return <SortingBlockEditor block={block as SortingBlock} onChange={onChange} />;
      case 'quiz':
        return <QuizBlockEditor block={block as QuizBlock} onChange={onChange} />;
      case 'calculator':
        return <CalculatorBlockEditor block={block as CalculatorBlock} onChange={onChange} />;
      case 'simulation':
        return <SimulationBlockEditor block={block as SimulationBlock} onChange={onChange} />;
      case 'mind_map':
        return <MindMapBlockEditor block={block as MindMapBlock} onChange={onChange} />;
      case 'collaboration':
        return <CollaborationBlockEditor block={block as CollaborationBlock} onChange={onChange} />;
      case 'scenario':
        return <ScenarioBlockEditor block={block as ScenarioBlock} onChange={onChange} />;
      case 'reflection':
        return <ReflectionBlockEditor block={block as ReflectionBlock} onChange={onChange} />;
      case 'ai_content_generator':
        return (
          <AIContentGeneratorBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></AIContentGeneratorBlockEditor>
        );
      case 'ai_quiz_generator':
        return (
          <AIQuizGeneratorBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></AIQuizGeneratorBlockEditor>
        );
      case 'ai_narration':
        return (
          <AINarrationBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></AINarrationBlockEditor>
        );
      case 'ai_translation':
        return (
          <AITranslationBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></AITranslationBlockEditor>
        );
      case 'ar_object_viewer':
        return (
          <ARObjectViewerBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></ARObjectViewerBlockEditor>
        );
      case 'ar_hotspot_explorer':
        return (
          <ARHotspotExplorerBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></ARHotspotExplorerBlockEditor>
        );
      case 'ar_scavenger_hunt':
        return (
          <ARScavengerHuntBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></ARScavengerHuntBlockEditor>
        );
      case 'ar_portal':
        return (
          <ARPortalBlockEditor
            block={block as ARPortalBlock}
            onChange={(content) => updateBlock(block.id, content)}
          />
        );
      case 'vr_environment':
        return (
          <VREnvironmentBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></VREnvironmentBlockEditor>
        );
      case 'vr_simulation':
        return <VRSimulationBlockEditor block={block as VRSimulationBlock} onChange={onChange} />;
      case 'vr_roleplay':
        return (
          <VRRolePlayBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></VRRolePlayBlockEditor>
        );
      case 'xr_interactive_diagram':
        return (
          <XRInteractiveDiagramBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></XRInteractiveDiagramBlockEditor>
        );
      case 'group_discussion':
        return (
          <GroupDiscussionBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></GroupDiscussionBlockEditor>
        );
      case 'peer_review':
        return (
          <PeerReviewBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></PeerReviewBlockEditor>
        );
      case 'live_poll':
        return (
          <LivePollBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></LivePollBlockEditor>
        );
      case 'team_challenge':
        return (
          <TeamChallengeBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></TeamChallengeBlockEditor>
        );
      case 'shared_whiteboard':
        return (
          <SharedWhiteboardBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></SharedWhiteboardBlockEditor>
        );
      case 'user_gallery':
        return (
          <UserGalleryBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></UserGalleryBlockEditor>
        );
      case 'ask_expert':
        return (
          <AskExpertBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></AskExpertBlockEditor>
        );
      case 'branching_video':
        return (
          <BranchingVideoBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></BranchingVideoBlockEditor>
        );
      case 'software_simulation':
        return (
          <SoftwareSimulationBlockEditor
            block={block as SoftwareSimulationBlock}
            onChange={onChange}
          />
        );
      case 'decision_tree':
        return <DecisionTreeBlockEditor block={block as DecisionTreeBlock} onChange={onChange} />;
      case 'interactive_map':
        return (
          <InteractiveMapBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></InteractiveMapBlockEditor>
        );
      case 'escape_room':
        return (
          <EscapeRoomBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></EscapeRoomBlockEditor>
        );
      case 'gamification_hub':
        return (
          <GamificationHubBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></GamificationHubBlockEditor>
        );
      case 'moral_dilemma':
        return <MoralDilemmaBlockEditor block={block as MoralDilemmaBlock} onChange={onChange} />;
      case 'interactive_infographic':
        return (
          <InteractiveInfographicBlockEditor
            block={block as InteractiveInfographicBlock}
            onChange={onChange}
          />
        );
      case 'audio_response':
        return (
          <AudioResponseBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></AudioResponseBlockEditor>
        );
      case 'video_response':
        return (
          <VideoResponseBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></VideoResponseBlockEditor>
        );
      case 'critical_incident':
        return (
          <CriticalIncidentBlockEditor block={block as CriticalIncidentBlock} onChange={onChange} />
        );
      case 'diagnostic_test':
        return (
          <DiagnosticTestBlockEditor block={block as DiagnosticTestBlock} onChange={onChange} />
        );
      case 'rank_order_complex':
        return (
          <RankOrderComplexBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></RankOrderComplexBlockEditor>
        );
      case 'hotspot_image':
        return (
          <HotspotImageBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></HotspotImageBlockEditor>
        );
      case 'reflective_journal':
        return (
          <ReflectiveJournalBlockEditor
            block={block as ReflectiveJournalBlock}
            onChange={onChange}
          />
        );
      case 'interactive_spreadsheet':
        return (
          <InteractiveSpreadsheetBlockEditor
            block={block as InteractiveSpreadsheetBlock}
            onChange={onChange}
          />
        );
      case 'code_validator':
        return (
          <CodeValidatorBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></CodeValidatorBlockEditor>
        );
      case 'personalized_action_plan':
        return (
          <PersonalizedActionPlanBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></PersonalizedActionPlanBlockEditor>
        );
      case 'learner_notebook':
        return (
          <LearnerNotebookBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></LearnerNotebookBlockEditor>
        );
      case 'certificate':
        return (
          <CertificateBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></CertificateBlockEditor>
        );
      case 'calendar_scheduling':
        return (
          <CalendarSchedulingBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></CalendarSchedulingBlockEditor>
        );
      case 'resource_glossary':
        return (
          <ResourceGlossaryBlockEditor
            block={block}
            onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
          ></ResourceGlossaryBlockEditor>
        );
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Editor for &quot;{(block as ContentBlock).type}&quot; block type is coming soon!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Drop Zone */}
      <section
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        aria-label="Content block drop zone"
        className="min-h-[400px] space-y-4"
      >
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-brand-strong rounded-lg">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto text-brand-muted mb-2" />
              <p className="text-brand-secondary font-medium">
                Drag content blocks here to start building
              </p>
              <p className="text-sm text-brand-muted mt-1">
                Open the sidebar and drag blocks into this area
              </p>
            </div>
          </div>
        ) : (
          blocks.map((block) => (
            <BaseBlockEditor
              key={block.id}
              block={block}
              onUpdate={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock.content)}
              onDelete={deleteBlock}
              onDuplicate={duplicateBlock}
              isSelected={selectedBlockId === block.id}
              onSelect={onSelectBlock}
            >
              {renderBlockEditor(block)}
            </BaseBlockEditor>
          ))
        )}
      </section>

      {/* Save Button */}
      {blocks.length > 0 && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setBlocks(initialBlocks)}
            className="px-6 py-2.5 text-brand-secondary bg-brand-surface border border-brand-strong rounded-lg hover:bg-brand-page font-medium transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onSave(blocks)}
            className="px-6 py-2.5 text-brand-primary bg-brand-primary rounded-lg hover:bg-brand-primary-hover font-medium transition-colors"
          >
            Save Content
          </button>
        </div>
      )}
    </div>
  );
};
