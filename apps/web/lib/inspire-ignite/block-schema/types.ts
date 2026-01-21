import { z } from 'zod';

/**
 * Content Block Categories
 */
export const BlockCategorySchema = z.enum([
  'assessment',
  'interactive',
  'text',
  'media',
  'chart',
  'structure',
]);
export type BlockCategory = z.infer<typeof BlockCategorySchema>;

/**
 * Assessment Block Types (14 types from xAPI spec)
 */
export const AssessmentBlockTypeSchema = z.enum([
  'multiple_choice',
  'multiple_response',
  'fill_in_blank',
  'matching',
  'audio_response',
  'video_response',
  'critical_incident',
  'true_false',
  'short_answer',
  'essay_response',
  'ranking',
  'likert_scale',
  'hotspot_question',
]);
export type AssessmentBlockType = z.infer<typeof AssessmentBlockTypeSchema>;

/**
 * Interactive Block Types (10 types)
 */
export const InteractiveBlockTypeSchema = z.enum([
  'accordion_collapsible',
  'drag_drop_categorize',
  'flip_cards',
  'hotspot_image',
  'modal_trigger',
  'progressive_disclosure',
  'reveal_spoiler',
  'sortable_sequence',
  'tab_groups',
  'tooltip_text',
]);
export type InteractiveBlockType = z.infer<typeof InteractiveBlockTypeSchema>;

/**
 * Text Block Types (40+ types)
 */
export const TextBlockTypeSchema = z.enum([
  'title_only',
  'title_with_paragraph',
  'subtitle_only',
  'subtitle_with_paragraph',
  'paragraph_with_image',
  'bulleted_list',
  'numbered_list',
  'checkbox_list',
  'definition_list',
  'blockquote_classic',
  'blockquote_centered',
  'blockquote_card',
  'blockquote_large_marks',
  'pull_quote',
  'quote_centered',
  'quote_left_aligned',
  'alert_block',
  'note_block',
  'warning_block',
  'caution_block',
  'danger_block',
  'success_block',
  'custom_callout_block',
  'expert_insight_block',
  'peer_review_block',
  'dashed_statement_block',
  'inverted_statement_block',
  'statement_block',
  'comparison_table',
  'sortable_table',
  'statistics_display',
  'faq_accordion',
  'references_block',
  'testimonial_block',
  'multi_column_layout',
  'process_horizontal',
  'step_by_step_vertical',
  'timeline_horizontal',
  'timeline_vertical',
]);
export type TextBlockType = z.infer<typeof TextBlockTypeSchema>;

/**
 * Media Block Types
 */
export const MediaBlockTypeSchema = z.enum([
  'video_player',
  'audio_player',
  'interactive_image',
  'image_gallery',
]);
export type MediaBlockType = z.infer<typeof MediaBlockTypeSchema>;

/**
 * Base Content Block schema
 */
export const BaseBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: BlockCategorySchema,
  title: z.string().optional(),

  // Cognitive load metadata
  cognitiveLoad: z
    .object({
      intrinsicEstimate: z.number().min(0).max(100),
      extraneousRisk: z.number().min(0).max(100),
      elementCount: z.number().min(1),
      interactionLevel: z.enum(['isolated', 'sequential', 'interconnected']),
    })
    .optional(),

  // Learning objectives
  objectives: z.array(z.string()).optional(),
  skillIds: z.array(z.string()).optional(),

  // xAPI tracking configuration
  xapiConfig: z
    .object({
      verb: z.string(), // ADL verb ID
      trackTiming: z.boolean().default(true),
      trackAttempts: z.boolean().default(true),
      trackChanges: z.boolean().default(false),
      customExtensions: z.record(z.unknown()).optional(),
    })
    .optional(),

  // Display settings
  display: z
    .object({
      width: z.enum(['narrow', 'medium', 'wide', 'full']).default('medium'),
      alignment: z.enum(['left', 'center', 'right']).default('left'),
      spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
    })
    .optional(),
});
export type BaseBlock = z.infer<typeof BaseBlockSchema>;

/**
 * Assessment Block with answer configuration
 */
export const AssessmentBlockSchema = BaseBlockSchema.extend({
  category: z.literal('assessment'),
  type: AssessmentBlockTypeSchema,

  // Question configuration
  question: z.object({
    text: z.string(),
    mediaUrl: z.string().url().optional(),
    hints: z.array(z.string()).optional(),
  }),

  // Answer configuration
  answers: z
    .object({
      correctPattern: z.array(z.string()),
      options: z
        .array(
          z.object({
            id: z.string(),
            text: z.string(),
            isCorrect: z.boolean().optional(),
            distractorType: z.string().optional(), // For analytics
          }),
        )
        .optional(),
      caseSensitive: z.boolean().default(false),
      partialCredit: z.boolean().default(false),
    })
    .optional(),

  // Feedback configuration
  feedback: z
    .object({
      correct: z.string().optional(),
      incorrect: z.string().optional(),
      partial: z.string().optional(),
      perOption: z.record(z.string()).optional(),
    })
    .optional(),

  // Assessment settings
  settings: z
    .object({
      maxAttempts: z.number().min(1).default(3),
      shuffleOptions: z.boolean().default(false),
      showCorrectAnswer: z.boolean().default(true),
      timeLimit: z.number().min(0).optional(), // seconds
      pointValue: z.number().min(0).default(1),
    })
    .optional(),
});
export type AssessmentBlock = z.infer<typeof AssessmentBlockSchema>;

/**
 * Interactive Block configuration
 */
export const InteractiveBlockSchema = BaseBlockSchema.extend({
  category: z.literal('interactive'),
  type: InteractiveBlockTypeSchema,

  // Interaction data
  items: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      content: z.string(),
      mediaUrl: z.string().url().optional(),
      metadata: z.record(z.unknown()).optional(),
    }),
  ),

  // Interaction settings
  settings: z
    .object({
      animationDuration: z.number().min(0).default(300),
      allowMultipleOpen: z.boolean().default(false),
      startExpanded: z.boolean().default(false),
    })
    .optional(),
});
export type InteractiveBlock = z.infer<typeof InteractiveBlockSchema>;

/**
 * Media Block configuration
 */
export const MediaBlockSchema = BaseBlockSchema.extend({
  category: z.literal('media'),
  type: MediaBlockTypeSchema,

  // Media source
  source: z.object({
    url: z.string().url(),
    mimeType: z.string(),
    thumbnailUrl: z.string().url().optional(),
    duration: z.number().min(0).optional(), // seconds
    fileSize: z.number().min(0).optional(), // bytes
  }),

  // Captions/Accessibility
  accessibility: z
    .object({
      altText: z.string().optional(),
      captionsUrl: z.string().url().optional(),
      transcriptUrl: z.string().url().optional(),
      audioDescription: z.boolean().default(false),
    })
    .optional(),

  // Playback settings
  settings: z
    .object({
      autoplay: z.boolean().default(false),
      loop: z.boolean().default(false),
      muted: z.boolean().default(false),
      controls: z.boolean().default(true),
      playbackRate: z.number().min(0.25).max(2).default(1),
    })
    .optional(),
});
export type MediaBlock = z.infer<typeof MediaBlockSchema>;

/**
 * INSPIRE Package - collection of blocks with metadata
 */
export const InspirePackageSchema = z.object({
  id: z.string().uuid(),
  version: z.string(),
  title: z.string(),
  description: z.string().optional(),

  // Authoring metadata
  author: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Content
  blocks: z.array(BaseBlockSchema),
  totalBlocks: z.number().min(0),

  // Cognitive load summary
  cognitiveProfile: z
    .object({
      totalIntrinsicLoad: z.number().min(0).max(100),
      totalExtraneousLoad: z.number().min(0).max(100),
      estimatedDuration: z.number().min(0), // minutes
      difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      recommendedBreaks: z.array(z.number()), // Block indices where breaks are recommended
    })
    .optional(),

  // Learning objectives
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),

  // Export configuration
  exportConfig: z
    .object({
      scormVersion: z.enum(['1.2', '2004']).optional(),
      xapiEndpoint: z.string().url().optional(),
      cmi5Enabled: z.boolean().default(false),
    })
    .optional(),
});
export type InspirePackage = z.infer<typeof InspirePackageSchema>;
