'use client';

/**
 * AIStudioTab - AI-powered content generation ribbon tab
 * Contains: TTS, Content Generation, Translations, Suggestions, Smart Features
 */

import {
  AudioWaveform,
  Brain,
  Captions,
  CheckCircle,
  FileSearch,
  FileText,
  Globe,
  HelpCircle,
  ImagePlus,
  Languages,
  Lightbulb,
  List,
  MessageSquare,
  Mic,
  PenLine,
  RefreshCw,
  Settings2,
  Sparkles,
  Text,
  Type,
  Wand2,
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

export interface AIStudioTabProps {
  // Text-to-Speech
  onOpenTTS?: () => void;
  onGenerateNarration?: () => void;
  onCloneVoice?: () => void;
  onConfigureTTS?: () => void;

  // Content generation
  onGenerateContent?: () => void;
  onGenerateQuiz?: () => void;
  onGenerateSummary?: () => void;
  onGenerateOutline?: () => void;
  onExpandContent?: () => void;
  onSimplifyContent?: () => void;

  // Image generation
  onGenerateImage?: () => void;
  onGenerateAltText?: () => void;
  onEnhanceImage?: () => void;

  // Video features
  onGenerateCaptions?: () => void;
  onGenerateTranscript?: () => void;
  onGenerateChapters?: () => void;

  // Translation
  onTranslateContent?: () => void;
  onLocalizeContent?: () => void;
  targetLanguage?: string;
  onTargetLanguageChange?: (lang: string) => void;

  // Smart suggestions
  onGetSuggestions?: () => void;
  onImproveClarity?: () => void;
  onCheckAccessibility?: () => void;
  onOptimizeCLT?: () => void;

  // Settings
  aiModel?: string;
  onAIModelChange?: (model: string) => void;
  onConfigureAI?: () => void;

  // State
  isProcessing?: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

const AI_MODEL_OPTIONS = [
  { value: 'claude', label: 'Claude' },
  { value: 'gpt4', label: 'GPT-4' },
  { value: 'gemini', label: 'Gemini' },
];

export function AIStudioTab({
  onOpenTTS,
  onGenerateNarration,
  onCloneVoice,
  onConfigureTTS,
  onGenerateContent,
  onGenerateQuiz,
  onGenerateSummary,
  onGenerateOutline,
  onExpandContent,
  onSimplifyContent,
  onGenerateImage,
  onGenerateAltText,
  onEnhanceImage,
  onGenerateCaptions,
  onGenerateTranscript,
  onGenerateChapters,
  onTranslateContent,
  onLocalizeContent,
  targetLanguage = 'es',
  onTargetLanguageChange,
  onGetSuggestions,
  onImproveClarity,
  onCheckAccessibility,
  onOptimizeCLT,
  aiModel = 'claude',
  onAIModelChange,
  onConfigureAI,
  isProcessing = false,
}: AIStudioTabProps) {
  return (
    <RibbonContent>
      {/* Text-to-Speech Group */}
      <RibbonGroup label="Text-to-Speech">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Mic className={`h-5 w-5 ${ICON}`} />}
            label="TTS"
            size="lg"
            onClick={onOpenTTS}
            tooltip="Open Text-to-Speech panel"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<AudioWaveform className={`h-4 w-4 ${ICON}`} />}
              onClick={onGenerateNarration}
              tooltip="Generate narration"
            />
            <RibbonButton
              icon={<Wand2 className={`h-4 w-4 ${ICON}`} />}
              onClick={onCloneVoice}
              tooltip="Clone voice"
            />
          </div>
          <RibbonButton
            icon={<Settings2 className={`h-4 w-4 ${ICON}`} />}
            onClick={onConfigureTTS}
            tooltip="TTS settings"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Content Generation Group */}
      <RibbonGroup label="Content">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Sparkles className={`h-5 w-5 ${ICON}`} />}
            label="Generate"
            size="lg"
            onClick={onGenerateContent}
            tooltip="AI content generation"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<HelpCircle className={`h-4 w-4 ${ICON}`} />}
              onClick={onGenerateQuiz}
              tooltip="Generate quiz questions"
            />
            <RibbonButton
              icon={<FileText className={`h-4 w-4 ${ICON}`} />}
              onClick={onGenerateSummary}
              tooltip="Generate summary"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<List className={`h-4 w-4 ${ICON}`} />}
              onClick={onGenerateOutline}
              tooltip="Generate outline"
            />
            <RibbonButton
              icon={<PenLine className={`h-4 w-4 ${ICON}`} />}
              onClick={onExpandContent}
              tooltip="Expand content"
            />
          </div>
          <RibbonButton
            icon={<Type className={`h-4 w-4 ${ICON}`} />}
            onClick={onSimplifyContent}
            tooltip="Simplify content"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Image AI Group */}
      <RibbonGroup label="Image AI">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<ImagePlus className={`h-5 w-5 ${ICON}`} />}
            label="Generate"
            size="lg"
            onClick={onGenerateImage}
            tooltip="Generate image with AI"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Text className={`h-4 w-4 ${ICON}`} />}
              onClick={onGenerateAltText}
              tooltip="Generate alt text"
            />
            <RibbonButton
              icon={<Wand2 className={`h-4 w-4 ${ICON}`} />}
              onClick={onEnhanceImage}
              tooltip="Enhance image"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Video AI Group */}
      <RibbonGroup label="Video AI">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Captions className={`h-5 w-5 ${ICON}`} />}
            label="Captions"
            size="lg"
            onClick={onGenerateCaptions}
            tooltip="Generate captions"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<FileSearch className={`h-4 w-4 ${ICON}`} />}
              onClick={onGenerateTranscript}
              tooltip="Generate transcript"
            />
            <RibbonButton
              icon={<List className={`h-4 w-4 ${ICON}`} />}
              onClick={onGenerateChapters}
              tooltip="Generate chapters"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Translation Group */}
      <RibbonGroup label="Translation">
        <div className="flex items-center gap-1">
          <RibbonButton
            icon={<Languages className={`h-5 w-5 ${ICON}`} />}
            label="Translate"
            size="lg"
            onClick={onTranslateContent}
            tooltip="Translate content"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonDropdown
              options={LANGUAGE_OPTIONS}
              value={targetLanguage}
              onValueChange={onTargetLanguageChange}
              placeholder="Target"
            />
            <RibbonButton
              icon={<Globe className={`h-4 w-4 ${ICON}`} />}
              onClick={onLocalizeContent}
              tooltip="Localize content"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Smart Suggestions Group */}
      <RibbonGroup label="Smart">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Lightbulb className={`h-5 w-5 ${ICON}`} />}
            label="Suggest"
            size="lg"
            onClick={onGetSuggestions}
            tooltip="Get AI suggestions"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<MessageSquare className={`h-4 w-4 ${ICON}`} />}
              onClick={onImproveClarity}
              tooltip="Improve clarity"
            />
            <RibbonButton
              icon={<CheckCircle className={`h-4 w-4 ${ICON}`} />}
              onClick={onCheckAccessibility}
              tooltip="Check accessibility"
            />
          </div>
          <RibbonButton
            icon={<Brain className={`h-4 w-4 ${ICON}`} />}
            onClick={onOptimizeCLT}
            tooltip="Optimize cognitive load"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* AI Settings Group */}
      <RibbonGroup label="Settings">
        <div className="flex items-center gap-1">
          <RibbonDropdown
            options={AI_MODEL_OPTIONS}
            value={aiModel}
            onValueChange={onAIModelChange}
            placeholder="Model"
          />
          <RibbonButton
            icon={<Settings2 className={`h-4 w-4 ${ICON}`} />}
            onClick={onConfigureAI}
            tooltip="AI configuration"
          />
        </div>
      </RibbonGroup>

      {/* Processing indicator */}
      {isProcessing && (
        <>
          <RibbonSeparator />
          <div className={`flex items-center gap-2 px-2 ${ICON}`}>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        </>
      )}
    </RibbonContent>
  );
}
