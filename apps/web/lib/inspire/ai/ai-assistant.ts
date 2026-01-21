import { logger } from '@/lib/logger';
import type {
  AIAssistanceRequest,
  AIAssistanceResponse,
  AIAssistanceType,
  CourseType,
  ExperienceLevel,
  TargetIndustry,
} from '../types/inspire-types';

const log = logger.child({ module: 'inspire-ai-assistant' });

import { getILATool, INSPIRE_PILLARS, NEUROSCIENCE_FACTS } from '../engine/inspire-framework';

import { getPhaseForStep, getStep } from '../types/wizard-config';

// ============================================================================
// SECTION 1: CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * AI model configuration
 * Note: Actual credentials come from GOOGLE_CREDENTIALS env variable
 */
export const AI_CONFIG = {
  /** Vertex AI model for text generation */
  model: 'gemini-pro',

  /** Maximum tokens for responses */
  maxOutputTokens: 2048,

  /** Temperature for response creativity (0-1) */
  temperature: {
    factual: 0.2, // For explanations, validation
    creative: 0.7, // For examples, suggestions
    balanced: 0.4, // Default
  },

  /** Safety settings */
  safetySettings: {
    harassmentThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
    hateSpeechThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
    sexuallyExplicitThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
    dangerousContentThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
};

/**
 * Experience level affects AI response complexity and detail
 */
const EXPERIENCE_LEVEL_PROMPTS: Record<ExperienceLevel, string> = {
  novice: `The user is a NOVICE instructional designer. Use simple, clear language. 
Avoid jargon unless you explain it. Provide step-by-step guidance. 
Be encouraging and supportive. Assume minimal prior knowledge of learning theory.`,

  intermediate: `The user is an INTERMEDIATE instructional designer with some experience. 
They understand basic concepts but may need help with advanced topics. 
Balance accessibility with depth. You can use common ID terminology.`,

  advanced: `The user is an ADVANCED instructional designer with significant experience. 
They know ID fundamentals and want deeper insights and nuances. 
Be direct and concise. Focus on advanced techniques and edge cases.`,

  expert: `The user is an EXPERT instructional designer and/or learning scientist. 
They want research-backed insights, citations, and technical precision. 
Engage at a peer level. Reference specific studies and theories.`,
};

// ============================================================================
// SECTION 2: PROMPT TEMPLATES
// ============================================================================

/**
 * System prompt that establishes the AI's role and knowledge base
 */
const SYSTEM_PROMPT = `You are the INSPIRE AI Assistant, an expert in learning experience design 
powered by the INSPIRE methodology developed by LXD360. Your knowledge includes:

THE INSPIRE FRAMEWORK (7 Pillars):
- Integrative: Blending theories, modalities, breaking silos
- Neuroscience-Informed: Brain-based design, cognitive load, memory science
- Strategic: Business alignment, ROI, stakeholder management
- Personalized: Adaptive learning, accessibility, learner-centered
- Immersive: Experiential, scenario-based, emotional engagement
- Results-Focused: Kirkpatrick evaluation, xAPI analytics, ESSA compliance
- Evolutionary: Continuous improvement, agile iteration

LEARNING SCIENCE FOUNDATIONS:
- Cognitive Load Theory (Sweller): Intrinsic, extraneous, germane load
- Working memory limits (~4 chunks, not 7)
- Forgetting curve and spaced repetition
- Retrieval practice effectiveness
- Adult Learning Theory (Knowles/Andragogy)
- Bloom's Taxonomy (Revised)
- Experiential Learning (Kolb)

THE ILA (INSPIRE Learning Architecture) - 12 Tools across 3 Stages:
ENCODING: ITLA, NPPM, ILMI, ICES
SYNTHESIZATION: ICL, ICDT, IPMG, ICPF
ASSIMILATION: IDNS, IADC, ILEM, IALM

You are helpful, encouraging, and focused on practical application. 
You always ground recommendations in neuroscience and evidence.
When uncertain, acknowledge limitations and suggest resources.`;

/**
 * Prompt templates for different assistance types
 */
const ASSISTANCE_PROMPTS: Record<AIAssistanceType, string> = {
  'explain-better': `Help the user understand the concept better. Based on their request:
- If they want simpler: Use plain language, analogies, and concrete examples
- If they want deeper: Provide more technical detail, research connections, and nuances
- Always relate to practical application in instructional design

Format your response with clear sections if needed. Be concise but thorough.`,

  'give-example': `Provide relevant, practical examples for the user's context.
Consider their:
- Industry: {{industry}}
- Course type: {{courseType}}
- Current step in the wizard: {{currentStep}}

Examples should be:
- Specific and detailed enough to be actionable
- Grounded in realistic scenarios
- Demonstrating best practices from the INSPIRE methodology
- Showing both what to do and what to avoid when helpful`,

  help: `Provide helpful guidance for the user's current situation.
They are on Step {{currentStep}}: {{stepName}}

Your guidance should:
- Address their specific question or confusion
- Connect to the INSPIRE methodology and neuroscience principles
- Provide actionable next steps
- Be encouraging and supportive`,

  'dive-deeper': `Provide an academic/theoretical deep dive on this topic.
Include:
- Foundational research and key studies
- Connections to learning theory
- Neuroscience principles that apply
- Practical implications for design
- Additional resources for further learning

Cite specific researchers and studies where relevant.`,

  'generate-draft': `Generate a draft based on the user's input and context.
Consider:
- Industry: {{industry}}
- Course type: {{courseType}}
- Current step: {{currentStep}}
- Their inputs so far: {{context}}

The draft should:
- Follow INSPIRE methodology principles
- Be appropriate for their experience level
- Include placeholders [LIKE THIS] where specific information is needed
- Be ready for review and refinement`,

  validate: `Review the user's work for completeness and quality.
Check for:
- Alignment with INSPIRE principles
- Cognitive load considerations
- Missing elements or gaps
- Potential improvements
- Best practice alignment

Be constructive and specific in feedback. Acknowledge what's working well.`,

  suggest: `Provide thoughtful recommendations based on the context.
Consider:
- What they've done so far
- Common patterns in similar projects
- INSPIRE best practices
- Potential issues to avoid
- Opportunities to enhance

Prioritize suggestions by impact and ease of implementation.`,

  'cognitive-check': `Analyze the content for cognitive load issues.
Evaluate:
- Intrinsic load: Content complexity relative to learner expertise
- Extraneous load: Design elements that waste cognitive resources
- Germane load: Productive effort supporting schema formation

Provide specific, actionable recommendations using CLT principles.
Reference working memory limits, split attention, and redundancy effects as relevant.`,
};

// ============================================================================
// SECTION 3: CONTEXT BUILDING FUNCTIONS
// ============================================================================

/**
 * Build context about the current wizard step
 */
function buildStepContext(currentStep: number): string {
  const step = getStep(currentStep);
  const phase = getPhaseForStep(currentStep);
  const tools = step?.tools.map((t) => getILATool(t)).filter(Boolean) || [];

  if (!step) return '';

  return `
CURRENT STEP CONTEXT:
- Step ${step.stepNumber}: ${step.name}
- Phase ${phase?.phaseNumber}: ${phase?.name}
- Description: ${step.description}
- ILA Tools in use: ${tools.map((t) => `${t?.acronym} (${t?.fullName})`).join(', ')}
- Key questions: ${step.keyQuestions.join('; ')}
- Deliverables: ${step.deliverables.join('; ')}
`;
}

/**
 * Build context about the industry
 */
function buildIndustryContext(industry: TargetIndustry): string {
  const industryContexts: Partial<Record<TargetIndustry, string>> = {
    healthcare: `Healthcare training context: Consider HIPAA compliance, patient safety protocols, 
clinical workflows, varied shift schedules, multi-disciplinary teams, regulatory requirements (Joint Commission, CMS), 
and the critical nature of medical decisions. Focus on simulation for clinical skills.`,

    aerospace: `Aerospace/Aviation training context: Consider FAA/EASA regulations, safety-critical procedures, 
simulator-based training, technical certification requirements, high-consequence environments, 
maintenance documentation standards, and crew resource management principles.`,

    manufacturing: `Manufacturing training context: Consider OSHA safety requirements, equipment-specific certifications, 
production floor constraints, variable literacy levels, shift work, hands-on skill requirements, 
quality control standards, and lean/continuous improvement culture.`,

    finance: `Financial services training context: Consider regulatory compliance (SEC, FINRA), 
risk management protocols, data security requirements, professional certifications, 
client confidentiality, and market-driven time pressures.`,

    technology: `Technology/IT training context: Consider rapid skill obsolescence, 
agile/DevOps practices, hands-on lab environments, certification pathways, 
remote work considerations, and continuous learning culture.`,
  };

  return industryContexts[industry] || 'General corporate training context.';
}

/**
 * Build context about course type
 */
function buildCourseTypeContext(courseType: CourseType): string {
  const courseContexts: Record<CourseType, string> = {
    compliance: `Compliance training requires: Documented completion, audit trails, 
mandatory assessments with passing scores, annual recertification tracking, 
legal/regulatory defensibility. Focus on knowledge verification over engagement.`,

    onboarding: `Onboarding training requires: Culture introduction, role clarity, 
process familiarity, early wins for confidence, connection to colleagues, 
time-to-productivity focus. Balance information with not overwhelming new hires.`,

    'technical-skills': `Technical skills training requires: Hands-on practice, 
simulation environments, performance-based assessment, job aids for reference, 
progressive skill building, realistic scenarios.`,

    'soft-skills': `Soft skills training requires: Self-reflection activities, 
behavioral practice, feedback mechanisms, scenario-based learning, 
coaching integration, emotional engagement.`,

    leadership: `Leadership development requires: Self-awareness exercises, 
360 feedback integration, executive presence, strategic thinking, 
real project application, peer learning, coaching support.`,

    safety: `Safety training requires: Clear procedures, consequence awareness, 
hazard recognition practice, emergency response drills, 
compliance documentation, reinforcement programs.`,

    'product-knowledge': `Product training requires: Feature/benefit mastery, 
competitive positioning, hands-on product experience, 
sales/support scenario practice, update mechanisms, certification.`,

    certification: `Certification training requires: Standards alignment, 
comprehensive assessment, practical demonstrations, 
documentation requirements, recertification planning.`,

    'professional-development': `Professional development requires: Self-directed options, 
career path alignment, skill gap addressing, 
networking opportunities, recognition systems.`,

    'change-management': `Change management training requires: Stakeholder engagement, 
resistance addressing, communication planning, 
success metrics, reinforcement mechanisms.`,
  };

  return courseContexts[courseType] || '';
}

/**
 * Build complete context for AI prompt
 */
function buildFullContext(request: AIAssistanceRequest): string {
  const stepContext = buildStepContext(request.currentStep);
  const industryContext = buildIndustryContext(request.context.industry);
  const courseTypeContext = buildCourseTypeContext(request.context.courseType);
  const experienceContext = EXPERIENCE_LEVEL_PROMPTS[request.experienceLevel];

  return `
${experienceContext}

${stepContext}

INDUSTRY CONTEXT:
${industryContext}

COURSE TYPE CONTEXT:
${courseTypeContext}

USER'S CURRENT CONTENT:
${request.context.currentContent || 'No content yet'}

${request.context.specificQuestion ? `USER'S SPECIFIC QUESTION: ${request.context.specificQuestion}` : ''}
`;
}

// ============================================================================
// SECTION 4: RESPONSE GENERATION
// ============================================================================

/**
 * Generate the complete prompt for the AI
 */
function generatePrompt(request: AIAssistanceRequest): {
  systemPrompt: string;
  userPrompt: string;
} {
  const assistancePrompt = ASSISTANCE_PROMPTS[request.type]
    .replace('{{industry}}', request.context.industry)
    .replace('{{courseType}}', request.context.courseType)
    .replace('{{currentStep}}', request.currentStep.toString())
    .replace('{{stepName}}', getStep(request.currentStep)?.name || '')
    .replace('{{context}}', request.context.currentContent);

  const fullContext = buildFullContext(request);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `${assistancePrompt}\n\n${fullContext}`,
  };
}

/**
 * Select appropriate temperature based on request type
 */
function selectTemperature(type: AIAssistanceType): number {
  switch (type) {
    case 'validate':
    case 'explain-better':
    case 'cognitive-check':
      return AI_CONFIG.temperature.factual;
    case 'give-example':
    case 'generate-draft':
    case 'suggest':
      return AI_CONFIG.temperature.creative;
    default:
      return AI_CONFIG.temperature.balanced;
  }
}

/**
 * Generate follow-up suggestions based on the response
 */
function generateFollowUpSuggestions(type: AIAssistanceType, currentStep: number): string[] {
  const baseSuggestions: string[] = [];

  // Add type-specific suggestions
  switch (type) {
    case 'explain-better':
      baseSuggestions.push(
        'Would you like a specific example of this concept?',
        'Should I dive deeper into the neuroscience behind this?',
      );
      break;
    case 'give-example':
      baseSuggestions.push(
        'Would you like me to adapt this example for a different scenario?',
        'Should I explain the principles this example demonstrates?',
      );
      break;
    case 'validate':
      baseSuggestions.push(
        'Would you like help addressing unknown of these points?',
        'Should I generate a revised draft incorporating feedback?',
      );
      break;
    case 'generate-draft':
      baseSuggestions.push(
        'Would you like me to validate this draft?',
        'Should I adjust the complexity level?',
        'Want me to add more specific examples?',
      );
      break;
    case 'cognitive-check':
      baseSuggestions.push(
        'Would you like specific strategies to reduce cognitive load?',
        'Should I analyze a specific section in more detail?',
      );
      break;
  }

  // Add step-related suggestions
  const step = getStep(currentStep);
  if (step && currentStep < 17) {
    baseSuggestions.push(`Ready to move to Step ${currentStep + 1}?`);
  }

  return baseSuggestions.slice(0, 3); // Max 3 suggestions
}

/**
 * Get related resources based on the request
 */
function getRelatedResources(request: AIAssistanceRequest): AIAssistanceResponse['resources'] {
  const resources: AIAssistanceResponse['resources'] = [];

  // Add pillar references based on step
  const step = getStep(request.currentStep);
  const phase = getPhaseForStep(request.currentStep);

  if (phase) {
    phase.inspireEmphasis.forEach((pillarId) => {
      const pillar = INSPIRE_PILLARS.find((p) => p.id === pillarId);
      if (pillar) {
        resources?.push({
          type: 'book-reference',
          title: `INSPIRE Pillar: ${pillar.name}`,
          content: `${pillar.description.substring(0, 200)}...`,
        });
      }
    });
  }

  // Add tool references
  step?.tools.forEach((toolId) => {
    const tool = getILATool(toolId);
    if (tool) {
      resources?.push({
        type: 'template',
        title: `${tool.acronym}: ${tool.fullName}`,
        content: tool.shortDescription,
      });
    }
  });

  // Add dive-deeper resources if that type
  if (request.type === 'dive-deeper') {
    resources?.push({
      type: 'book-reference',
      title: 'Cognitive Load Theory (Sweller)',
      content: NEUROSCIENCE_FACTS.cognitiveLoad.intrinsicLoad.fact,
    });
  }

  return resources?.slice(0, 5); // Max 5 resources
}

// ============================================================================
// SECTION 5: MAIN API FUNCTIONS
// ============================================================================

/**
 * Main function to get AI assistance
 * This is the primary entry point for AI interactions
 *
 * Note: In production, this calls Google Vertex AI (Gemini)
 * The implementation here shows the structure; actual API call
 * would be made in the API route with proper authentication
 *
 * @param request - The assistance request
 * @returns Promise resolving to AI response
 */
export async function getAIAssistance(request: AIAssistanceRequest): Promise<AIAssistanceResponse> {
  // Generate the prompt
  const { systemPrompt: _systemPrompt, userPrompt: _userPrompt } = generatePrompt(request);
  void _systemPrompt;
  void _userPrompt;

  // Get temperature for this request type
  const _temperature = selectTemperature(request.type);
  void _temperature;

  // In production, this would call Vertex AI:
  // const response = await callVertexAI(systemPrompt, userPrompt, temperature);

  // For now, return a structured placeholder
  // The actual implementation would be in the API route
  const response: AIAssistanceResponse = {
    id: `response-${Date.now()}`,
    requestId: request.id,
    content: `[AI Response would be generated here by Gemini]
    
This is a placeholder for the actual AI response. In production:
1. The request is sent to the API route (/api/inspire/ai-assist)
2. The API route authenticates with Google Cloud using GOOGLE_CREDENTIALS
3. Vertex AI (Gemini Pro) generates the response
4. The response is formatted and returned

Request Type: ${request.type}
Current Step: ${request.currentStep}
Experience Level: ${request.experienceLevel}

The AI would respond with context-aware guidance based on:
- The INSPIRE methodology
- Neuroscience-informed design principles
- Industry-specific considerations (${request.context.industry})
- Course type requirements (${request.context.courseType})`,
    resources: getRelatedResources(request),
    followUpSuggestions: generateFollowUpSuggestions(request.type, request.currentStep),
    confidence: 0.85,
    model: AI_CONFIG.model,
    tokensUsed: 0, // Would be populated by actual API call
    generatedAt: new Date(),
  };

  return response;
}

/**
 * Prepare the request payload for the Vertex AI API
 * This would be used by the API route
 */
export function prepareVertexAIPayload(request: AIAssistanceRequest): {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    topK: number;
  };
} {
  const { systemPrompt, userPrompt } = generatePrompt(request);

  return {
    model: AI_CONFIG.model,
    systemPrompt,
    userPrompt,
    generationConfig: {
      temperature: selectTemperature(request.type),
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      topP: 0.95,
      topK: 40,
    },
  };
}

/**
 * Create an AI assistance request object
 * Helper function for components
 */
export function createAssistanceRequest(
  type: AIAssistanceType,
  projectId: string,
  currentStep: number,
  experienceLevel: ExperienceLevel,
  industry: TargetIndustry,
  courseType: CourseType,
  currentContent: string,
  specificQuestion?: string,
): AIAssistanceRequest {
  return {
    id: `request-${Date.now()}`,
    projectId,
    currentStep,
    type,
    experienceLevel,
    context: {
      industry,
      courseType,
      currentContent,
      specificQuestion,
    },
    requestedAt: new Date(),
  };
}

// ============================================================================
// SECTION 6: SPECIALIZED AI FUNCTIONS
// ============================================================================

/**
 * Get an "Explain Better" response
 * Used when learner clicks the "Explain Better" button
 */
export async function explainBetter(
  concept: string,
  currentExplanation: string,
  mode: 'simpler' | 'deeper',
  _experienceLevel: ExperienceLevel,
): Promise<string> {
  void _experienceLevel;

  const _prompt =
    mode === 'simpler'
      ? `Explain this concept in simpler terms, using analogies and everyday language:

       Concept: ${concept}
       Current explanation: ${currentExplanation}

       Make it accessible for someone new to instructional design.`
      : `Provide a deeper explanation with research connections and technical nuances:

       Concept: ${concept}
       Current explanation: ${currentExplanation}

       Include relevant neuroscience and learning theory foundations.`;
  void _prompt;

  // In production, call Vertex AI
  // For now, return placeholder
  return `[${mode === 'simpler' ? 'Simplified' : 'Deeper'} explanation would be generated here]`;
}

/**
 * Generate industry-specific example
 */
export async function generateExample(
  _concept: string,
  industry: TargetIndustry,
  courseType: CourseType,
  _currentStep: number,
): Promise<{
  example: string;
  explanation: string;
  bestPractices: string[];
  pitfalls: string[];
}> {
  void _currentStep;

  // In production, call Vertex AI with structured output
  return {
    example: `[Example for ${industry} ${courseType} would be generated here]`,
    explanation: '[Explanation of why this example works]',
    bestPractices: ['Best practice 1', 'Best practice 2'],
    pitfalls: ['Common mistake to avoid'],
  };
}

/**
 * Analyze content for cognitive load
 * Provides AI-powered CLT analysis beyond the algorithmic engine
 */
export async function analyzeCognitiveLoadWithAI(
  _content: string,
  _objectives: string[],
  _targetAudience: string,
  _priorKnowledge: string,
): Promise<{
  analysis: string;
  intrinsicLoadFactors: string[];
  extraneousLoadIssues: string[];
  germaneLoadOpportunities: string[];
  recommendations: string[];
}> {
  void _content;
  void _objectives;
  void _targetAudience;
  void _priorKnowledge;

  // In production, call Vertex AI
  return {
    analysis: '[AI analysis of cognitive load would appear here]',
    intrinsicLoadFactors: ['Factor 1', 'Factor 2'],
    extraneousLoadIssues: ['Issue 1', 'Issue 2'],
    germaneLoadOpportunities: ['Opportunity 1'],
    recommendations: ['Recommendation 1', 'Recommendation 2'],
  };
}

/**
 * Generate draft content for a step
 */
export async function generateDraft(
  stepNumber: number,
  _industry: TargetIndustry,
  _courseType: CourseType,
  _existingInputs: Record<string, string>,
  _experienceLevel: ExperienceLevel,
): Promise<{
  draft: Record<string, string>;
  explanation: string;
  placeholders: string[];
}> {
  void _industry;
  void _courseType;
  void _existingInputs;
  void _experienceLevel;

  const step = getStep(stepNumber);

  // In production, call Vertex AI with step-specific prompt
  return {
    draft: {
      '[field1]': '[Generated content]',
      '[field2]': '[Generated content]',
    },
    explanation: `Draft generated for ${step?.name}. Review and customize as needed.`,
    placeholders: ['[COMPANY_NAME]', '[TARGET_AUDIENCE]', '[SPECIFIC_METRIC]'],
  };
}

/**
 * Validate step completion
 */
export async function validateStepCompletion(
  stepNumber: number,
  _stepData: Record<string, unknown>,
  _industry: TargetIndustry,
  _courseType: CourseType,
): Promise<{
  isComplete: boolean;
  completionScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}> {
  void _stepData;
  void _industry;
  void _courseType;

  const _step = getStep(stepNumber);
  void _step;

  // In production, call Vertex AI for intelligent validation
  return {
    isComplete: false,
    completionScore: 0.75,
    strengths: ['Clear objectives', 'Good alignment'],
    gaps: ['Missing success metrics', 'Stakeholders not fully identified'],
    suggestions: ['Add measurable KPIs', 'Include IT and compliance stakeholders'],
  };
}

// ============================================================================
// SECTION 7: UTILITY FUNCTIONS
// ============================================================================

/**
 * Format AI response for display
 * Handles markdown conversion and sanitization
 */
export function formatAIResponse(response: string): string {
  // In production, would include:
  // - Markdown to HTML conversion
  // - XSS sanitization
  // - Link handling
  // - Code block formatting
  return response;
}

/**
 * Track AI usage for analytics
 */
export function trackAIUsage(request: AIAssistanceRequest, response: AIAssistanceResponse): void {
  // In production, send to analytics:
  // - BigQuery for detailed analysis
  // - Usage metrics for billing/limits
  // - Quality feedback for model improvement
  log.debug('AI Usage', {
    type: request.type,
    step: request.currentStep,
    tokensUsed: response.tokensUsed,
  });
}

/**
 * Check if AI assistance is available
 * May be limited by plan tier or usage limits
 */
export function isAIAssistanceAvailable(
  _organizationId: string,
  _requestType: AIAssistanceType,
): {
  available: boolean;
  reason?: string;
  remainingCredits?: number;
} {
  void _organizationId;
  void _requestType;

  // In production, check:
  // - Organization's subscription tier
  // - Usage limits
  // - Feature flags
  return {
    available: true,
    remainingCredits: 100,
  };
}

// ============================================================================
// END OF AI ASSISTANT ENGINE
// ============================================================================
