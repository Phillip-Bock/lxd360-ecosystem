'use client';

/**
 * =============================================================================
 * INSPIRE Studio | AI Studio Tab Component
 * =============================================================================
 *
 * AI-powered content creation tools including content generation,
 * improvement, media generation, assessment creation, translation,
 * accessibility checking, and the AI assistant.
 */

import {
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle,
  Coffee,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  Image,
  Languages,
  Lightbulb,
  ListChecks,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  RefreshCw,
  Sliders,
  Smile,
  Sparkles,
  Target,
  Users,
  Video,
  Wand2,
  Zap,
} from 'lucide-react';

import { RibbonButton, RibbonGroup, RibbonSeparator, RibbonSplitButton } from '../groups';

interface AIStudioTabProps {
  selection?: unknown;
  tokenUsage?: number;
  onAIAction?: (action: string, options?: unknown) => void;
}

export function AIStudioTab({ selection, tokenUsage = 42, onAIAction }: AIStudioTabProps) {
  const handleAIAction = (action: string, options?: unknown) => {
    onAIAction?.(action, options);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: GENERATE CONTENT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Generate">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={Sparkles}
            label="Generate"
            size="large"
            gradient
            onClick={() => handleAIAction('generateContent')}
            tooltip="AI Generate Content"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={FileText}
              label="From Topic"
              size="small"
              onClick={() => handleAIAction('generateFromTopic')}
              tooltip="Generate from topic"
            />
            <RibbonButton
              icon={BookOpen}
              label="From Doc"
              size="small"
              onClick={() => handleAIAction('generateFromDocument')}
              tooltip="Generate from document"
            />
            <RibbonButton
              icon={RefreshCw}
              label="Regenerate"
              size="small"
              onClick={() => handleAIAction('regenerate')}
              disabled={!selection}
              tooltip="Regenerate selection"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: IMPROVE & TRANSFORM
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Improve">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Wand2}
            label="Improve"
            size="large"
            onClick={() => handleAIAction('improve')}
            disabled={!selection}
            menuItems={[
              {
                icon: Wand2,
                label: 'Improve Writing',
                onClick: () => handleAIAction('improveWriting'),
              },
              {
                icon: Minimize2,
                label: 'Make Concise',
                onClick: () => handleAIAction('makeConcise'),
              },
              { icon: Maximize2, label: 'Expand', onClick: () => handleAIAction('expand') },
              { label: 'Fix Grammar', onClick: () => handleAIAction('fixGrammar') },
              { icon: Smile, label: 'Change Tone', onClick: () => handleAIAction('changeTone') },
              { type: 'separator' },
              {
                icon: GraduationCap,
                label: 'Academic',
                onClick: () => handleAIAction('tone', { style: 'academic' }),
              },
              {
                icon: Briefcase,
                label: 'Professional',
                onClick: () => handleAIAction('tone', { style: 'professional' }),
              },
              {
                icon: Coffee,
                label: 'Casual',
                onClick: () => handleAIAction('tone', { style: 'casual' }),
              },
              {
                icon: Users,
                label: 'Friendly',
                onClick: () => handleAIAction('tone', { style: 'friendly' }),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Lightbulb}
              label="Simplify"
              size="small"
              onClick={() => handleAIAction('simplify')}
              disabled={!selection}
              tooltip="Simplify content"
            />
            <RibbonButton
              icon={Target}
              label="Examples"
              size="small"
              onClick={() => handleAIAction('addExamples')}
              disabled={!selection}
              tooltip="Add examples"
            />
            <RibbonButton
              icon={ListChecks}
              label="Summarize"
              size="small"
              onClick={() => handleAIAction('summarize')}
              disabled={!selection}
              tooltip="Summarize content"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: GENERATE MEDIA
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Media">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Image}
            label="Image"
            size="large"
            gradient
            onClick={() => handleAIAction('generateImage')}
            menuItems={[
              {
                label: 'Generate from Text',
                onClick: () => handleAIAction('generateImage', { mode: 'text' }),
              },
              {
                label: 'Generate Diagram',
                onClick: () => handleAIAction('generateImage', { mode: 'diagram' }),
              },
              {
                label: 'Generate Icon',
                onClick: () => handleAIAction('generateImage', { mode: 'icon' }),
              },
              {
                label: 'Generate Illustration',
                onClick: () => handleAIAction('generateImage', { mode: 'illustration' }),
              },
              { type: 'separator' },
              { label: 'Edit with AI', onClick: () => handleAIAction('editImage') },
              { label: 'Remove Background', onClick: () => handleAIAction('removeBackground') },
              { label: 'Upscale', onClick: () => handleAIAction('upscaleImage') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Mic}
              label="Voice"
              size="small"
              onClick={() => handleAIAction('generateVoice')}
              tooltip="Generate voiceover"
            />
            <RibbonButton
              icon={Video}
              label="Avatar"
              size="small"
              onClick={() => handleAIAction('generateAvatar')}
              badge="Beta"
              tooltip="AI Avatar video"
            />
            <RibbonButton
              icon={MessageSquare}
              label="Dialogue"
              size="small"
              onClick={() => handleAIAction('generateDialogue')}
              tooltip="Generate dialogue"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: GENERATE ASSESSMENT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Assessment">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={HelpCircle}
            label="Quiz"
            size="large"
            onClick={() => handleAIAction('generateQuiz')}
            menuItems={[
              { label: 'From Selection', onClick: () => handleAIAction('quizFromSelection') },
              { label: 'From Lesson', onClick: () => handleAIAction('quizFromLesson') },
              { label: 'From Topic', onClick: () => handleAIAction('quizFromTopic') },
              { type: 'separator' },
              { label: 'Multiple Choice', onClick: () => handleAIAction('quiz', { type: 'mc' }) },
              { label: 'True/False', onClick: () => handleAIAction('quiz', { type: 'tf' }) },
              { label: 'Fill in Blank', onClick: () => handleAIAction('quiz', { type: 'fib' }) },
              { label: 'Matching', onClick: () => handleAIAction('quiz', { type: 'match' }) },
              { type: 'separator' },
              {
                label: 'Scenario-Based',
                onClick: () => handleAIAction('quiz', { type: 'scenario' }),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={CheckCircle}
              label="K-Check"
              size="small"
              onClick={() => handleAIAction('generateKnowledgeCheck')}
              tooltip="Generate knowledge check"
            />
            <RibbonButton
              icon={Target}
              label="Scenario"
              size="small"
              onClick={() => handleAIAction('generateScenario')}
              tooltip="Generate scenario"
            />
            <RibbonButton
              icon={Brain}
              label="Rubric"
              size="small"
              onClick={() => handleAIAction('generateRubric')}
              tooltip="Generate rubric"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: TRANSLATE
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Translate">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Languages}
            label="Translate"
            size="large"
            onClick={() => handleAIAction('translate')}
            menuItems={[
              { label: 'Spanish', onClick: () => handleAIAction('translate', { to: 'es' }) },
              { label: 'French', onClick: () => handleAIAction('translate', { to: 'fr' }) },
              { label: 'German', onClick: () => handleAIAction('translate', { to: 'de' }) },
              { label: 'Portuguese', onClick: () => handleAIAction('translate', { to: 'pt' }) },
              {
                label: 'Chinese (Simplified)',
                onClick: () => handleAIAction('translate', { to: 'zh' }),
              },
              { label: 'Japanese', onClick: () => handleAIAction('translate', { to: 'ja' }) },
              { label: 'Korean', onClick: () => handleAIAction('translate', { to: 'ko' }) },
              { label: 'Arabic', onClick: () => handleAIAction('translate', { to: 'ar' }) },
              { type: 'separator' },
              { label: 'More Languages...', onClick: () => handleAIAction('translateDialog') },
              { type: 'separator' },
              {
                label: 'Translate Entire Lesson',
                onClick: () => handleAIAction('translateLesson'),
              },
              { label: 'Translate Course', onClick: () => handleAIAction('translateCourse') },
            ]}
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: ACCESSIBILITY
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Accessibility">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={Eye}
            label="Check A11y"
            size="large"
            onClick={() => handleAIAction('accessibilityCheck')}
            tooltip="Run accessibility check"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Image}
              label="Alt Text"
              size="small"
              onClick={() => handleAIAction('generateAltText')}
              tooltip="Generate alt text"
            />
            <RibbonButton
              icon={FileText}
              label="Transcribe"
              size="small"
              onClick={() => handleAIAction('transcribe')}
              tooltip="Transcribe media"
            />
            <RibbonButton
              icon={Sliders}
              label="Readability"
              size="small"
              onClick={() => handleAIAction('readabilityAnalysis')}
              tooltip="Readability analysis"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: AI ASSISTANT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Assistant">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={Zap}
            label="AI Chat"
            size="large"
            gradient
            onClick={() => handleAIAction('openAssistant')}
            tooltip="Open AI Assistant Panel"
          />
          <div className="flex flex-col gap-1">
            {/* Token usage indicator */}
            <div className="flex items-center gap-1 px-2">
              <span className="text-[10px] text-studio-text-muted">Tokens:</span>
              <div className="w-16 h-1.5 bg-studio-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-studio-accent to-purple-500 transition-all duration-300"
                  style={{ width: `${tokenUsage}%` }}
                />
              </div>
              <span className="text-[10px] text-studio-accent">{tokenUsage}%</span>
            </div>
            {/* Model indicator */}
            <div className="flex items-center gap-1 px-2">
              <span className="text-[10px] text-studio-text-muted">Model:</span>
              <span className="text-[10px] text-studio-text">GPT-4o</span>
            </div>
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}
