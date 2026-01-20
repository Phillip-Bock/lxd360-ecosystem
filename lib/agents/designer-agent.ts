import { v4 as uuidv4 } from 'uuid';
import { generateText, MODELS, type ModelId } from '@/lib/ai/gemini-client';
import type {
  ContentBlock,
  ContentBlockType,
  CourseOutline,
  DesignerAgentConfig,
  FullCourse,
  Lesson,
  Module,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MODEL: ModelId = MODELS.GEMINI_2_FLASH;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_RETRIES = 3;

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const SYSTEM_PROMPT = `You are an expert instructional designer working for LXD360, a learning experience platform. You create engaging, effective, and accessible learning content following best practices in learning science.

Key principles you follow:
1. Clear learning objectives aligned with Bloom's Taxonomy
2. Chunked content with appropriate cognitive load
3. Active learning with interactivity and assessments
4. Diverse content types (text, video, quiz, scenarios)
5. Real-world applications and examples
6. Accessibility and inclusive design

You output structured JSON responses that can be parsed programmatically.`;

function getCourseOutlinePrompt(
  topic: string,
  industry: string,
  targetAudience: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  moduleCount: number,
  lessonsPerModule: number,
): string {
  return `Create a course outline for the following specifications:

Topic: ${topic}
Industry: ${industry}
Target Audience: ${targetAudience}
Difficulty Level: ${difficulty}
Number of Modules: ${moduleCount}
Lessons per Module: ${lessonsPerModule}

Generate a complete course outline in JSON format with this exact structure:
{
  "title": "Course title",
  "description": "Course description (2-3 sentences)",
  "targetAudience": "${targetAudience}",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3", "Objective 4"],
  "prerequisites": ["Prerequisite 1"],
  "estimatedDuration": <total minutes as number>,
  "modules": [
    {
      "id": "module-1",
      "title": "Module 1 Title",
      "description": "Module description",
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson Title",
          "description": "Lesson description",
          "objectives": ["Lesson objective 1", "Lesson objective 2"],
          "estimatedDuration": <minutes as number>
        }
      ]
    }
  ]
}

Ensure the content is practical, engaging, and appropriate for the ${industry} industry.
Output ONLY the JSON object, no markdown code blocks or additional text.`;
}

function getContentBlockPrompt(
  courseTitle: string,
  lessonTitle: string,
  lessonObjectives: string[],
  blockType: ContentBlockType,
  blockIndex: number,
): string {
  const typeInstructions: Record<ContentBlockType, string> = {
    text: 'Create an educational text block with rich content, examples, and key takeaways.',
    video:
      'Create a video block with a detailed script outline, key points, and recommended visuals.',
    quiz: 'Create a quiz block with 3-5 questions, each with 4 options and explanations for correct/incorrect answers.',
    interactive:
      'Create an interactive activity block such as a drag-and-drop, matching, or scenario-based exercise.',
    scenario:
      'Create a branching scenario with decision points and consequences that reinforce learning.',
    assessment:
      'Create an assessment block with questions that test comprehension of the lesson objectives.',
  };

  return `Create a ${blockType} content block for the following lesson:

Course: ${courseTitle}
Lesson: ${lessonTitle}
Learning Objectives: ${lessonObjectives.join(', ')}
Block Type: ${blockType}
Block Position: ${blockIndex + 1}

Instructions: ${typeInstructions[blockType]}

Generate the content block in JSON format:
{
  "title": "Block title",
  "content": "The main content of the block (for text, this is the actual text; for quiz, this is the question content; etc.)",
  "duration": <estimated minutes to complete>,
  "metadata": {
    // Type-specific metadata
  }
}

For quiz/assessment blocks, include in metadata:
- questions: Array of question objects with text, options, correctAnswer, and explanation

For video blocks, include in metadata:
- scriptOutline: Array of key points
- recommendedDuration: Duration in seconds

For scenario blocks, include in metadata:
- decisionPoints: Array of decision point objects

Output ONLY the JSON object, no markdown code blocks or additional text.`;
}

// ============================================================================
// DESIGNER AGENT CLASS
// ============================================================================

/**
 * AI Agent that designs and generates learning courses
 */
export class DesignerAgent {
  private model: ModelId;
  private temperature: number;
  private maxRetries: number;
  private baseUrl: string;

  constructor(config: DesignerAgentConfig = {}) {
    this.model = (config.model as ModelId) ?? DEFAULT_MODEL;
    this.temperature = config.temperature ?? DEFAULT_TEMPERATURE;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseUrl = config.baseUrl ?? 'https://lxd360.com';
  }

  /**
   * Generates a course outline based on specifications
   */
  async generateCourseOutline(params: {
    topic: string;
    industry: string;
    targetAudience: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    moduleCount: number;
    lessonsPerModule: number;
  }): Promise<CourseOutline> {
    const prompt = getCourseOutlinePrompt(
      params.topic,
      params.industry,
      params.targetAudience,
      params.difficulty,
      params.moduleCount,
      params.lessonsPerModule,
    );

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await generateText(prompt, {
          model: this.model,
          systemPrompt: SYSTEM_PROMPT,
          config: {
            temperature: this.temperature,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text) as Omit<CourseOutline, 'id'>;

        // Add IDs and structure
        const courseId = uuidv4();
        const courseOutline: CourseOutline = {
          id: courseId,
          title: parsed.title,
          description: parsed.description,
          targetAudience: parsed.targetAudience,
          learningObjectives: parsed.learningObjectives,
          prerequisites: parsed.prerequisites,
          estimatedDuration: parsed.estimatedDuration,
          modules: parsed.modules.map((mod: Module, modIndex: number) => ({
            id: mod.id ?? `module-${modIndex + 1}`,
            title: mod.title,
            description: mod.description,
            lessons: mod.lessons.map((lesson: Lesson, lessonIndex: number) => ({
              id: lesson.id ?? `lesson-${modIndex + 1}-${lessonIndex + 1}`,
              title: lesson.title,
              description: lesson.description,
              objectives: lesson.objectives,
              estimatedDuration: lesson.estimatedDuration,
              blocks: [], // Blocks will be generated separately
            })),
          })),
        };

        return courseOutline;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt + 1} failed:`, lastError.message);
        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
      }
    }

    throw new Error(
      `Failed to generate course outline after ${this.maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Generates a content block for a lesson
   */
  async generateContentBlock(params: {
    courseTitle: string;
    lessonTitle: string;
    lessonObjectives: string[];
    blockType: ContentBlockType;
    blockIndex: number;
  }): Promise<ContentBlock> {
    const prompt = getContentBlockPrompt(
      params.courseTitle,
      params.lessonTitle,
      params.lessonObjectives,
      params.blockType,
      params.blockIndex,
    );

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await generateText(prompt, {
          model: this.model,
          systemPrompt: SYSTEM_PROMPT,
          config: {
            temperature: this.temperature,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text) as Omit<ContentBlock, 'id' | 'type'>;

        const contentBlock: ContentBlock = {
          id: uuidv4(),
          type: params.blockType,
          title: parsed.title,
          content: parsed.content,
          duration: parsed.duration,
          metadata: parsed.metadata,
        };

        return contentBlock;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt + 1} failed:`, lastError.message);
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
      }
    }

    throw new Error(
      `Failed to generate content block after ${this.maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Generates content blocks for a lesson
   */
  async generateLessonBlocks(
    courseTitle: string,
    lesson: Lesson,
    blockTypes: ContentBlockType[],
  ): Promise<ContentBlock[]> {
    const blocks: ContentBlock[] = [];

    for (let i = 0; i < blockTypes.length; i++) {
      const block = await this.generateContentBlock({
        courseTitle,
        lessonTitle: lesson.title,
        lessonObjectives: lesson.objectives,
        blockType: blockTypes[i],
        blockIndex: i,
      });
      blocks.push(block);
    }

    return blocks;
  }

  /**
   * Creates a full course with generated content
   */
  async createFullCourse(params: {
    topic: string;
    industry: string;
    targetAudience: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    moduleCount: number;
    lessonsPerModule: number;
    blocksPerLesson?: number;
  }): Promise<FullCourse> {
    // Generate the course outline
    const outline = await this.generateCourseOutline(params);

    // Define block types pattern for lessons
    const defaultBlockTypes: ContentBlockType[] = ['text', 'video', 'quiz'];
    const advancedBlockTypes: ContentBlockType[] = [
      'text',
      'interactive',
      'scenario',
      'assessment',
    ];

    // Generate content for each lesson
    const modulesWithContent: Module[] = [];

    for (const mod of outline.modules) {
      const lessonsWithBlocks: Lesson[] = [];

      for (const lesson of mod.lessons) {
        // Determine block types based on difficulty and lesson position
        const blockTypes =
          params.difficulty === 'advanced' ? advancedBlockTypes : defaultBlockTypes;
        const numBlocks = params.blocksPerLesson ?? blockTypes.length;
        const selectedBlockTypes = blockTypes.slice(0, numBlocks);

        const blocks = await this.generateLessonBlocks(outline.title, lesson, selectedBlockTypes);

        lessonsWithBlocks.push({
          ...lesson,
          blocks,
        });
      }

      modulesWithContent.push({
        ...mod,
        lessons: lessonsWithBlocks,
      });
    }

    // Create the full course
    const fullCourse: FullCourse = {
      ...outline,
      modules: modulesWithContent,
      createdAt: new Date().toISOString(),
      generatedBy: 'designer-agent',
      version: '1.0.0',
    };

    return fullCourse;
  }

  /**
   * Generates a quick demo course without AI (for testing)
   */
  static createDemoCourse(params: {
    topic: string;
    industry: string;
    targetAudience: string;
    moduleCount: number;
    lessonsPerModule: number;
  }): FullCourse {
    const courseId = uuidv4();
    const modules: Module[] = [];

    for (let m = 0; m < params.moduleCount; m++) {
      const lessons: Lesson[] = [];

      for (let l = 0; l < params.lessonsPerModule; l++) {
        const blocks: ContentBlock[] = [
          {
            id: uuidv4(),
            type: 'text',
            title: `Introduction to ${params.topic} - Part ${l + 1}`,
            content: `This lesson covers essential concepts of ${params.topic} for ${params.targetAudience} in the ${params.industry} industry.`,
            duration: 5,
          },
          {
            id: uuidv4(),
            type: 'video',
            title: `${params.topic} Demonstration`,
            content: 'Watch this video to see practical applications.',
            duration: 10,
            metadata: {
              videoUrl: 'https://example.com/demo-video.mp4',
              scriptOutline: ['Introduction', 'Core concepts', 'Practical examples', 'Summary'],
            },
          },
          {
            id: uuidv4(),
            type: 'quiz',
            title: 'Knowledge Check',
            content: 'Test your understanding of the key concepts.',
            duration: 5,
            metadata: {
              questions: [
                {
                  text: `What is the primary focus of ${params.topic}?`,
                  options: ['Option A', 'Option B', 'Option C', 'Option D'],
                  correctAnswer: 0,
                  explanation: 'This is the correct answer because...',
                },
                {
                  text: `Which best describes ${params.topic} in ${params.industry}?`,
                  options: ['Description A', 'Description B', 'Description C', 'Description D'],
                  correctAnswer: 1,
                  explanation: 'This is the correct answer because...',
                },
              ],
            },
          },
        ];

        lessons.push({
          id: uuidv4(),
          title: `Module ${m + 1} - Lesson ${l + 1}: ${params.topic} Fundamentals`,
          description: `Learn fundamental concepts of ${params.topic}`,
          objectives: [
            `Understand key principles of ${params.topic}`,
            `Apply ${params.topic} concepts in ${params.industry} context`,
          ],
          estimatedDuration: 20,
          blocks,
        });
      }

      modules.push({
        id: uuidv4(),
        title: `Module ${m + 1}: ${params.topic} - ${m === 0 ? 'Foundations' : m === params.moduleCount - 1 ? 'Advanced Applications' : 'Core Concepts'}`,
        description: `This module covers ${m === 0 ? 'foundational' : m === params.moduleCount - 1 ? 'advanced' : 'core'} aspects of ${params.topic}.`,
        lessons,
      });
    }

    return {
      id: courseId,
      title: `${params.topic} for ${params.industry} Professionals`,
      description: `A comprehensive course on ${params.topic} designed for ${params.targetAudience} in the ${params.industry} industry.`,
      targetAudience: params.targetAudience,
      learningObjectives: [
        `Master fundamental concepts of ${params.topic}`,
        `Apply ${params.topic} principles in real-world scenarios`,
        `Evaluate and improve ${params.topic} practices`,
        `Demonstrate proficiency through assessments`,
      ],
      prerequisites: ['Basic understanding of the subject area'],
      estimatedDuration: params.moduleCount * params.lessonsPerModule * 20,
      modules,
      createdAt: new Date().toISOString(),
      generatedBy: 'designer-agent',
      version: '1.0.0',
    };
  }
}
