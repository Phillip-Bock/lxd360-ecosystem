import type { ILAStage, INSPIREPillar } from '../types/inspire-types';

// ============================================================================
// SECTION 1: THE 7 INSPIRE PILLARS
// ============================================================================

/**
 * Complete definition of an INSPIRE pillar
 * Each pillar represents a core principle of the methodology
 */
export interface INSPIREPillarDefinition {
  /** Pillar identifier */
  id: INSPIREPillar;

  /** Letter in the acronym */
  letter: string;

  /** Full name */
  name: string;

  /** Short tagline */
  tagline: string;

  /** Detailed description */
  description: string;

  /** Neuroscience foundation */
  neuroscienceFoundation: string;

  /** Key brain regions/systems involved */
  brainSystems: string[];

  /** Research citations */
  researchCitations: string[];

  /** Practical applications */
  practicalApplications: string[];

  /** Common mistakes to avoid */
  commonMistakes: string[];

  /** Key statistics from research */
  keyStatistics: string[];

  /** Icon name for UI */
  icon: string;

  /** Color for UI */
  color: string;
}

/**
 * The complete INSPIRE pillar definitions
 * Based on the INSPIRE book and architecture documents
 */
export const INSPIRE_PILLARS: INSPIREPillarDefinition[] = [
  {
    id: 'integrative',
    letter: 'I',
    name: 'Integrative',
    tagline: 'Breaking silos, blending theories, creating unified experiences',
    description: `The Integrative pillar recognizes that effective learning doesn't happen in isolation. It brings together multiple learning theories, modalities, and organizational systems into a cohesive whole. Rather than treating formal training, on-the-job learning, and social learning as separate activities, INSPIRE integrates them into a seamless learning ecosystem.

This pillar also addresses the common organizational problem of siloed training - where compliance, leadership, technical, and soft skills programs operate independently. Integration creates connections between these programs, helping learners see the bigger picture and transfer learning across contexts.`,
    neuroscienceFoundation: `The brain is an integrative organ - it doesn't process information in isolated modules but creates rich connections across regions. The phenomenon of "binding" describes how the brain integrates separate features (color, shape, motion) into unified perceptions. Similarly, learning is enhanced when concepts are connected rather than isolated.

Cross-modal integration (combining visual, auditory, and kinesthetic inputs) activates multiple brain regions simultaneously, creating stronger and more accessible memories. This is the neural basis for multimedia learning and varied practice.`,
    brainSystems: [
      'Association cortices (integrating information across modalities)',
      'Prefrontal cortex (executive integration)',
      'Hippocampus (binding episodic memories)',
      'Default mode network (self-referential integration)',
    ],
    researchCitations: [
      'Mayer, R.E. (2009). Multimedia Learning',
      'Bransford et al. (2000). How People Learn',
      'Ambrose et al. (2010). How Learning Works',
    ],
    practicalApplications: [
      'Blend formal courses with coaching and on-the-job practice (70-20-10)',
      'Connect new content to existing knowledge through analogies',
      'Use multiple modalities (visual + auditory + kinesthetic)',
      'Create learning paths that span multiple programs/competencies',
      'Design for transfer - show how skills apply in different contexts',
    ],
    commonMistakes: [
      'Creating isolated courses with no connection to job context',
      'Relying on single modality (text-only or video-only)',
      'Treating compliance, technical, and soft skills as unrelated',
      'Not connecting new learning to prior knowledge',
    ],
    keyStatistics: [
      '70-20-10 framework: 70% on-job, 20% coaching, 10% formal learning',
      'Multimodal learning can improve retention by 29-50%',
      'Transfer of learning is highest when training matches job context',
    ],
    icon: 'puzzle-piece',
    color: '#3B82F6', // Blue
  },

  {
    id: 'neuroscience-informed',
    letter: 'N',
    name: 'Neuroscience-Informed',
    tagline: 'Designing for how the brain actually learns',
    description: `The Neuroscience-Informed pillar grounds all design decisions in brain science. Rather than relying on learning myths (like fixed learning styles), INSPIRE applies evidence-based principles from cognitive neuroscience.

Key neuroscience principles include:
- **Working memory limits**: We can only hold 3-5 new items at once
- **Neuroplasticity**: The brain physically changes with learning ("neurons that fire together, wire together")
- **Spaced repetition**: Memory consolidation requires time and repetition
- **Retrieval practice**: Actively recalling strengthens memories more than re-reading
- **Emotion and memory**: Emotionally significant experiences are remembered better
- **Sleep and consolidation**: Memory requires rest periods for consolidation`,
    neuroscienceFoundation: `Learning creates physical changes in the brain through synaptic plasticity. When we learn, neurons strengthen their connections (long-term potentiation) or prune unused connections. This is captured in Hebb's rule: "neurons that fire together, wire together."

Memory formation involves encoding (initial processing), consolidation (stabilizing in long-term storage), and retrieval (accessing stored memories). Each stage can be optimized through evidence-based techniques. The hippocampus plays a crucial role in forming new declarative memories, while the prefrontal cortex manages working memory and executive function.`,
    brainSystems: [
      'Hippocampus (memory formation and consolidation)',
      'Prefrontal cortex (working memory, executive function)',
      'Amygdala (emotional significance tagging)',
      'Basal ganglia (procedural learning, habits)',
      'Cerebellum (motor learning, timing)',
    ],
    researchCitations: [
      'Sweller, J. (1988). Cognitive load during problem solving',
      'Roediger & Karpicke (2006). Test-enhanced learning',
      'Ebbinghaus (1885). Memory: A Contribution to Experimental Psychology',
      'Cowan, N. (2001). The magical number 4 in short-term memory',
    ],
    practicalApplications: [
      'Chunk content into 3-5 new concepts at a time',
      'Use spaced repetition for long-term retention',
      'Include retrieval practice (quizzes, recall activities)',
      'Manage cognitive load (intrinsic, extraneous, germane)',
      'Create emotionally engaging experiences (stories, relevance)',
      'Allow time for consolidation between intensive sessions',
    ],
    commonMistakes: [
      'Information overload (too much at once)',
      'Massed practice (cramming vs. spacing)',
      'Passive learning (reading/watching without retrieval)',
      'Ignoring the forgetting curve',
      'Designing based on learning style myths',
    ],
    keyStatistics: [
      'Forgetting curve: 70% forgotten within 24 hours without reinforcement',
      'Retrieval practice can improve retention by 50%+ (Karpicke & Roediger)',
      'Working memory capacity: ~4 chunks (Cowan, 2001)',
      'Spaced learning: 35% better retention after 3 months vs. massed',
    ],
    icon: 'brain',
    color: '#8B5CF6', // Purple
  },

  {
    id: 'strategic',
    letter: 'S',
    name: 'Strategic',
    tagline: 'Aligned with business outcomes and organizational strategy',
    description: `The Strategic pillar ensures learning investments are directly tied to business results. Every learning initiative should trace back to organizational goals, performance metrics, and ROI.

This means starting with the end in mind:
- What business problem are we solving?
- What performance gap exists?
- How will we measure success?
- What is the expected ROI?

Strategic alignment also involves stakeholder management, resource allocation, and change management. Learning doesn't exist in a vacuum - it must integrate with broader organizational initiatives and culture.`,
    neuroscienceFoundation: `From a neuroscience perspective, learning is most effective when it's perceived as relevant and valuable. The brain's reward system (dopamine pathways) activates when we see clear purpose and progress toward meaningful goals. This is why adults need to understand "What's In It For Me?" (WIIFM) before engaging deeply.

Goal-directed behavior is managed by the prefrontal cortex, which helps maintain focus on long-term objectives. When learning aligns with personal and professional goals, motivation and retention naturally improve.`,
    brainSystems: [
      'Prefrontal cortex (goal-directed behavior, planning)',
      'Dopamine reward pathways (motivation, reward anticipation)',
      'Anterior cingulate cortex (effort/reward calculation)',
    ],
    researchCitations: [
      'Kirkpatrick & Kirkpatrick (2016). Four Levels of Training Evaluation',
      'Phillips, J. (2003). Return on Investment in Training',
      "Brinkerhoff, R. (2006). Telling Training's Story",
    ],
    practicalApplications: [
      'Start with needs analysis and gap identification',
      'Define measurable success criteria upfront',
      'Align learning objectives with job performance requirements',
      'Involve stakeholders throughout the process',
      'Calculate and communicate ROI',
      'Plan for behavior change, not just knowledge transfer',
    ],
    commonMistakes: [
      'Building training without clear business need',
      'No baseline metrics for comparison',
      'Measuring only completion rates (Level 1)',
      'Not involving stakeholders until launch',
      'Assuming training will solve all performance problems',
    ],
    keyStatistics: [
      'Companies with strong learning cultures: 218% higher income per employee',
      '24% higher profit margins for organizations investing in training',
      '83% of organizations plan to sustain/increase L&D investment (2025)',
      'External hires 61% more likely to be let go than internal promotions',
    ],
    icon: 'target',
    color: '#10B981', // Green
  },

  {
    id: 'personalized',
    letter: 'P',
    name: 'Personalized',
    tagline: 'Tailored to individual learners, not one-size-fits-all',
    description: `The Personalized pillar recognizes that learners are individuals with different backgrounds, preferences, needs, and goals. Rather than forcing everyone through identical content, personalization adapts the learning experience to each person.

Personalization can occur at multiple levels:
- **Content**: Adaptive learning paths based on knowledge/skill level
- **Pace**: Self-paced options with flexible timelines
- **Format**: Choice of modalities (video, text, audio)
- **Context**: Role-specific scenarios and examples
- **Support**: Varying levels of scaffolding based on need
- **Accessibility**: Accommodations for neurodiversity and disabilities`,
    neuroscienceFoundation: `The brain learns most effectively when operating in the "stretch zone" - challenged enough to require effort, but not so overwhelmed that stress hormones impair learning. This optimal zone varies by individual based on prior knowledge, cognitive capacity, and current state.

Personalization also leverages the brain's natural motivation systems. When learners have autonomy and can see relevance to their personal goals, dopamine release enhances motivation and memory formation. This aligns with Self-Determination Theory (autonomy, competence, relatedness).`,
    brainSystems: [
      'Dopamine pathways (motivation from autonomy and relevance)',
      'Prefrontal cortex (self-directed learning)',
      'Stress response systems (cortisol and optimal challenge)',
      'Individual differences in working memory capacity',
    ],
    researchCitations: [
      'Knowles, M. (1984). Andragogy in Action (Adult Learning Theory)',
      'Deci & Ryan (2000). Self-Determination Theory',
      'Vygotsky, L. (1978). Zone of Proximal Development',
    ],
    practicalApplications: [
      'Offer pre-assessments to personalize starting points',
      'Provide adaptive branching based on performance',
      'Include role-specific scenarios and examples',
      'Offer format choices (video, text, audio)',
      'Support self-paced learning with guidance',
      'Build comprehensive accessibility features',
      'Create learner personas to guide design',
    ],
    commonMistakes: [
      'Forcing all learners through identical linear content',
      'Ignoring prior knowledge differences',
      'No accommodation for accessibility needs',
      'One-size-fits-all examples that lack relevance',
      'Confusing personalization with isolated self-study',
    ],
    keyStatistics: [
      '77% of employees say personalized training increases engagement (Docebo)',
      '58% of employees prefer self-paced learning',
      'Adaptive learning can reduce training time by 20-50%',
      '68% prefer to learn at work (in the flow of work)',
    ],
    icon: 'user-cog',
    color: '#F59E0B', // Amber
  },

  {
    id: 'immersive',
    letter: 'I',
    name: 'Immersive',
    tagline: 'Hands-on, experiential, emotionally engaging',
    description: `The Immersive pillar moves beyond passive content consumption to create engaging, experiential learning. Immersion can range from interactive scenarios to full VR simulations.

Key aspects of immersion:
- **Active participation**: Learners do, not just watch
- **Realistic context**: Scenarios that mirror job situations
- **Emotional engagement**: Stories, stakes, consequences
- **Safe failure**: Practice without real-world consequences
- **Feedback loops**: Immediate feedback on actions

Immersive learning activates more of the brain, creates stronger memories, and builds confidence through practice.`,
    neuroscienceFoundation: `Experiential learning engages the brain more completely than passive observation. Motor planning (even without physical action) activates motor cortex regions. Emotional engagement activates the amygdala, which tags experiences as significant and enhances memory consolidation.

Mirror neurons fire both when we perform an action and when we observe others performing it, making observational learning possible. But doing creates stronger neural pathways than watching. The brain's simulation circuits allow us to learn from imagined scenarios and role-plays, not just real experiences.`,
    brainSystems: [
      'Motor cortex and premotor cortex (action and planning)',
      'Mirror neuron system (learning by observation and imitation)',
      'Amygdala (emotional significance and memory)',
      'Hippocampus (episodic memory for experiences)',
      'Insula (interoception and emotional processing)',
    ],
    researchCitations: [
      'Kolb, D. (1984). Experiential Learning',
      'PwC (2020). VR Soft Skills Training Study',
      'Bailenson, J. (2018). Experience on Demand (VR research)',
    ],
    practicalApplications: [
      'Design scenario-based learning with realistic situations',
      'Create safe spaces for practice and failure',
      'Use storytelling to create emotional engagement',
      'Incorporate simulations where appropriate',
      'Provide immediate, actionable feedback',
      'Consider VR/AR for high-risk or hard-to-access situations',
      'Include role-plays and collaborative exercises',
    ],
    commonMistakes: [
      'Passive click-through content disguised as "interactive"',
      "Scenarios that don't reflect real job situations",
      'No consequences or feedback for decisions',
      "Technology for technology's sake (VR without purpose)",
      'Skipping emotional engagement for "just the facts"',
    ],
    keyStatistics: [
      'Learners retain 75% when practicing vs. 10% from reading alone',
      'VR training: 4x more focused, 275% more confident (PwC)',
      'Stories remembered 22x more than isolated facts (Stanford)',
      'Simulation training reduces errors by 30-40% in healthcare',
    ],
    icon: 'vr-cardboard',
    color: '#EC4899', // Pink
  },

  {
    id: 'results-focused',
    letter: 'R',
    name: 'Results-Focused',
    tagline: 'Measurable outcomes, continuous evaluation, proven impact',
    description: `The Results-Focused pillar ensures we measure what matters. Beyond completion rates, INSPIRE tracks learning outcomes, behavior change, and business impact using Kirkpatrick's four levels:

- **Level 1 - Reaction**: Did they find it valuable and engaging?
- **Level 2 - Learning**: Did they gain knowledge and skills?
- **Level 3 - Behavior**: Did they apply it on the job?
- **Level 4 - Results**: Did it impact business metrics?

This pillar also supports ESSA Tier IV compliance for evidence-based efficacy and enables ROI calculation for demonstrating training value.`,
    neuroscienceFoundation: `Measurement and feedback activate the brain's learning systems. The dopamine reward pathway responds to progress indicators and achievement recognition. Clear goals and visible progress maintain motivation through the "progress principle."

From a cognitive perspective, evaluation activities (tests, demonstrations) serve as retrieval practice, strengthening the very memories they measure. Assessment is not just measurement - it's a learning intervention.`,
    brainSystems: [
      'Dopamine reward pathways (progress, achievement)',
      'Prefrontal cortex (goal monitoring)',
      'Anterior cingulate cortex (error detection, adjustment)',
    ],
    researchCitations: [
      'Kirkpatrick & Kirkpatrick (2016). Four Levels of Training Evaluation',
      'Phillips, J. (2003). Return on Investment in Training',
      'Amabile & Kramer (2011). The Progress Principle',
    ],
    practicalApplications: [
      'Design with evaluation in mind from the start',
      'Establish baseline metrics before training',
      'Use xAPI/learning analytics for tracking',
      'Include Level 2 assessments (knowledge/skill)',
      'Plan for Level 3 observation (behavior change)',
      'Connect to Level 4 business metrics',
      'Calculate and communicate ROI',
      'Document for ESSA Tier IV compliance',
    ],
    commonMistakes: [
      'Only measuring completion and satisfaction (Level 1)',
      'No baseline for comparison',
      "Assessments that don't match objectives",
      'Not following up on behavior change',
      'Treating evaluation as an afterthought',
    ],
    keyStatistics: [
      'Only 8% of organizations measure Level 4 impact (ATD)',
      '92% of employees report good learning makes them more engaged',
      'Companies with evaluation culture: 3x more likely to achieve goals',
      'ROI of training programs can range from 200-1000%',
    ],
    icon: 'chart-line',
    color: '#EF4444', // Red
  },

  {
    id: 'evolutionary',
    letter: 'E',
    name: 'Evolutionary',
    tagline: 'Continuous improvement, agile iteration, future-ready',
    description: `The Evolutionary pillar recognizes that learning design is never "done." Content becomes outdated, learner needs change, new research emerges, and technology evolves. INSPIRE builds in continuous improvement from the start.

This means:
- **Iterative design**: Build, test, improve cycles
- **Data-driven updates**: Use analytics to identify issues
- **Feedback incorporation**: Listen to learners and SMEs
- **Currency maintenance**: Regular content reviews
- **Technology adoption**: Embrace new capabilities
- **Research integration**: Apply emerging evidence`,
    neuroscienceFoundation: `The brain itself is evolutionary - neuroplasticity means our neural networks continuously adapt based on experience and environment. Learning systems should mirror this adaptability.

From a cognitive science perspective, our understanding of learning continues to evolve. New research regularly updates best practices. An evolutionary approach ensures learning design stays current with evidence-based methods rather than relying on outdated assumptions.`,
    brainSystems: [
      'The entire brain exhibits plasticity (continuous change)',
      'Prefrontal cortex (flexibility, adaptation)',
      'Dopamine system (novelty seeking, curiosity)',
    ],
    researchCitations: [
      'Agile Learning Design methodologies',
      'SAM (Successive Approximation Model)',
      'Design Thinking for Learning',
    ],
    practicalApplications: [
      'Build feedback mechanisms into every course',
      'Schedule regular content reviews (quarterly/annually)',
      'Use analytics to identify problem areas',
      'Implement rapid iteration based on data',
      'Stay current with learning science research',
      'Pilot test before full rollout',
      'Create modular content for easy updates',
      'Embrace emerging technologies thoughtfully',
    ],
    commonMistakes: [
      '"Set it and forget it" approach to content',
      'Ignoring learner feedback',
      'Not using available analytics',
      'Resistance to updating "finished" courses',
      'Chasing technology trends without purpose',
    ],
    keyStatistics: [
      "44% of workers' core skills expected to change within 5 years",
      'Average content shelf life decreasing rapidly',
      'Organizations with agile L&D: 2x more responsive to business needs',
      'Continuous improvement can reduce development costs by 30%',
    ],
    icon: 'sync',
    color: '#6366F1', // Indigo
  },
];

// ============================================================================
// SECTION 2: CLASSICAL LEARNING THEORIES
// ============================================================================

/**
 * Learning theory definition
 */
export interface LearningTheory {
  /** Theory identifier */
  id: string;

  /** Theory name */
  name: string;

  /** Key theorists */
  theorists: string[];

  /** Core premise */
  corePremise: string;

  /** Detailed description */
  description: string;

  /** Key concepts */
  keyConcepts: string[];

  /** Application in instructional design */
  applications: string[];

  /** Limitations */
  limitations: string[];

  /** INSPIRE pillars most aligned with */
  inspireAlignment: INSPIREPillar[];
}

/**
 * Classical learning theories that inform INSPIRE
 */
export const LEARNING_THEORIES: LearningTheory[] = [
  {
    id: 'behaviorism',
    name: 'Behaviorism',
    theorists: ['B.F. Skinner', 'Ivan Pavlov', 'John Watson', 'Edward Thorndike'],
    corePremise:
      'Learning is a change in observable behavior caused by external stimuli and reinforcement.',
    description: `Behaviorism focuses on observable behaviors rather than internal mental states. Learning occurs through stimulus-response associations, reinforced by consequences (rewards or punishments). This theory gave us operant conditioning, positive/negative reinforcement, and immediate feedback.

While criticized for ignoring cognition, behaviorist principles remain valuable for skill training, habit formation, and motivation through gamification.`,
    keyConcepts: [
      'Operant conditioning (behavior shaped by consequences)',
      'Positive reinforcement (reward increases behavior)',
      'Negative reinforcement (removing aversive stimulus increases behavior)',
      'Immediate feedback',
      'Shaping (reinforcing successive approximations)',
      'Extinction (behavior decreases without reinforcement)',
    ],
    applications: [
      'Gamification (points, badges, leaderboards)',
      'Immediate quiz feedback',
      'Repetition and drill for procedural skills',
      'Clear success criteria and rewards',
      'Habit formation through consistent reinforcement',
    ],
    limitations: [
      'Ignores internal cognitive processes',
      'May reduce intrinsic motivation if overdone',
      'Limited for complex problem-solving',
      "Doesn't explain all types of learning",
    ],
    inspireAlignment: ['results-focused', 'immersive'],
  },

  {
    id: 'cognitivism',
    name: 'Cognitivism',
    theorists: ['Jean Piaget', 'Jerome Bruner', 'Robert Gagné', 'John Sweller'],
    corePremise:
      'Learning is an internal mental process of acquiring, organizing, and storing knowledge in memory.',
    description: `Cognitivism views the mind as an information processor, like a computer. Learning involves encoding information into memory, organizing it into schemas, and retrieving it when needed. Key concerns include attention, working memory limits, and cognitive load.

This theory is foundational to INSPIRE's neuroscience-informed pillar, especially Cognitive Load Theory (Sweller).`,
    keyConcepts: [
      'Working memory (limited capacity ~4 items)',
      'Long-term memory (unlimited storage, retrieval challenges)',
      'Schema formation (organizing knowledge structures)',
      'Cognitive load (intrinsic, extraneous, germane)',
      'Chunking (grouping information for easier processing)',
      'Metacognition (thinking about thinking)',
    ],
    applications: [
      'Chunking content (microlearning)',
      'Managing cognitive load',
      'Providing advance organizers',
      'Using multimedia effectively',
      'Building on prior knowledge',
      'Teaching metacognitive strategies',
    ],
    limitations: [
      'Can over-emphasize individual learning',
      'May undervalue social and emotional factors',
      'Computer metaphor has limits for human mind',
    ],
    inspireAlignment: ['neuroscience-informed', 'integrative'],
  },

  {
    id: 'constructivism',
    name: 'Constructivism',
    theorists: ['Jean Piaget', 'Lev Vygotsky', 'John Dewey', 'Jerome Bruner'],
    corePremise:
      'Learning is an active process of constructing meaning from experience, not passive reception.',
    description: `Constructivism holds that learners actively build their own understanding rather than receiving knowledge passively. Learning is influenced by prior knowledge, context, and social interaction. Vygotsky's social constructivism emphasizes learning through collaboration and guided support within the "zone of proximal development."

This theory supports INSPIRE's emphasis on active learning, personalization, and immersive experiences.`,
    keyConcepts: [
      'Active construction of meaning',
      'Prior knowledge as foundation',
      'Zone of Proximal Development (ZPD)',
      'Scaffolding (temporary support, gradually removed)',
      'Social learning (learning with others)',
      'Authentic tasks (real-world context)',
    ],
    applications: [
      'Problem-based learning',
      'Case studies and scenarios',
      'Collaborative learning activities',
      'Scaffolded instruction with fading support',
      'Connecting to prior knowledge',
      'Reflection activities',
    ],
    limitations: [
      'Can be time-consuming',
      'May not suit all content types',
      'Requires skilled facilitation',
      'Assessment can be challenging',
    ],
    inspireAlignment: ['immersive', 'personalized', 'integrative'],
  },

  {
    id: 'experiential',
    name: 'Experiential Learning',
    theorists: ['David Kolb', 'John Dewey', 'Kurt Lewin'],
    corePremise:
      'Learning is the process of creating knowledge through the transformation of experience.',
    description: `Kolb's Experiential Learning Cycle describes learning as a four-stage process: Concrete Experience → Reflective Observation → Abstract Conceptualization → Active Experimentation. Effective learning requires moving through all four stages.

This theory directly supports INSPIRE's immersive pillar and the emphasis on learning by doing.`,
    keyConcepts: [
      'Concrete Experience (doing/having an experience)',
      'Reflective Observation (reviewing/reflecting)',
      'Abstract Conceptualization (concluding/learning)',
      'Active Experimentation (planning/trying out)',
      'Learning styles (Divergers, Assimilators, Convergers, Accommodators)',
    ],
    applications: [
      'Simulations and role-plays',
      'Reflection activities after experiences',
      'Case studies with application',
      'On-the-job learning with coaching',
      'Project-based learning',
      'Internships and apprenticeships',
    ],
    limitations: [
      'Learning styles aspect not well-supported by research',
      'Cycle may not apply to all learning',
      'Requires time and resources for experiences',
    ],
    inspireAlignment: ['immersive', 'evolutionary', 'integrative'],
  },
];

// ============================================================================
// SECTION 3: ADULT LEARNING THEORY (ANDRAGOGY)
// ============================================================================

/**
 * Knowles' Adult Learning Principles
 */
export interface AndragogyPrinciple {
  /** Principle identifier */
  id: string;

  /** Principle name */
  name: string;

  /** Description */
  description: string;

  /** Implications for design */
  designImplications: string[];

  /** Neuroscience connection */
  neuroscienceConnection: string;
}

/**
 * The six principles of adult learning (Knowles)
 */
export const ANDRAGOGY_PRINCIPLES: AndragogyPrinciple[] = [
  {
    id: 'need-to-know',
    name: 'Need to Know',
    description:
      'Adults need to understand WHY they need to learn something before investing effort. They want to know the benefits and consequences.',
    designImplications: [
      'Start with the "why" - business context and relevance',
      'Show consequences of not learning (risks)',
      'Demonstrate clear benefits (WIIFM)',
      'Provide real examples of application',
    ],
    neuroscienceConnection:
      "The brain's reward system activates when purpose is clear. Dopamine release increases with meaningful goals.",
  },
  {
    id: 'self-concept',
    name: 'Self-Concept (Autonomy)',
    description:
      'Adults see themselves as responsible, self-directed individuals. They resist being told what to do and want control over their learning.',
    designImplications: [
      'Offer choices in learning paths',
      'Allow self-pacing where possible',
      'Treat learners as partners, not passive recipients',
      'Avoid condescending or overly directive language',
    ],
    neuroscienceConnection:
      'Autonomy activates the dopamine reward system. Self-directed choices increase motivation and engagement.',
  },
  {
    id: 'prior-experience',
    name: 'Prior Experience',
    description:
      'Adults bring a wealth of experience that serves as a foundation and resource for learning. This experience should be leveraged, not ignored.',
    designImplications: [
      'Build on existing knowledge and skills',
      'Use examples that connect to work experience',
      'Encourage sharing and peer learning',
      'Acknowledge that experience may also include misconceptions',
    ],
    neuroscienceConnection:
      'New learning encodes more strongly when connected to existing neural networks (schemas). Prior knowledge reduces intrinsic cognitive load.',
  },
  {
    id: 'readiness',
    name: 'Readiness to Learn',
    description:
      'Adults are most ready to learn when the content is relevant to their current life or work situation. Timing matters.',
    designImplications: [
      'Deliver training just-in-time when possible',
      'Create role-specific content paths',
      'Link learning to current projects or challenges',
      'Consider career stage and life circumstances',
    ],
    neuroscienceConnection:
      'Relevance activates attention systems. The brain prioritizes information relevant to current goals and concerns.',
  },
  {
    id: 'orientation',
    name: 'Orientation to Learning',
    description:
      'Adults are problem-centered rather than subject-centered. They want to learn things they can apply immediately to solve real problems.',
    designImplications: [
      'Focus on application, not just information',
      'Use realistic problems and cases',
      'Minimize theoretical content without practical application',
      'Include job aids and performance support',
    ],
    neuroscienceConnection:
      'Problem-solving activates prefrontal executive functions and creates stronger memories through effortful processing.',
  },
  {
    id: 'motivation',
    name: 'Motivation',
    description:
      'Adults are primarily motivated by internal factors (self-esteem, quality of life, job satisfaction) rather than external rewards alone.',
    designImplications: [
      'Connect learning to personal goals and values',
      'Provide recognition and achievement milestones',
      'Support mastery and competence development',
      'Remove barriers to learning (time, access, support)',
    ],
    neuroscienceConnection:
      'Intrinsic motivation engages deeper cognitive processing. External rewards can undermine intrinsic motivation if overused.',
  },
];

// ============================================================================
// SECTION 4: ILA TOOL DEFINITIONS
// ============================================================================

/**
 * Complete ILA tool definition
 */
export interface ILAToolDefinition {
  /** Tool ID */
  id: string;

  /** Tool acronym */
  acronym: string;

  /** Full name */
  fullName: string;

  /** ILA Stage */
  stage: ILAStage;

  /** Phase number within stage */
  phaseNumber: 1 | 2 | 3;

  /** Short description */
  shortDescription: string;

  /** Full description */
  fullDescription: string;

  /** Purpose statement */
  purpose: string;

  /** Key outputs */
  outputs: string[];

  /** Neuroscience alignment */
  neuroscienceAlignment: string;

  /** Brain systems involved */
  brainSystems: string[];

  /** Related INSPIRE pillars */
  relatedPillars: INSPIREPillar[];

  /** Wizard steps that use this tool */
  wizardSteps: number[];

  /** Icon name */
  icon: string;
}

/**
 * All 12 ILA tools with complete definitions
 */
export const ILA_TOOLS: ILAToolDefinition[] = [
  // ENCODING STAGE (Phase 1)
  {
    id: 'itla',
    acronym: 'ITLA',
    fullName: 'INSPIRE Theory of Learning Activation',
    stage: 'encoding',
    phaseNumber: 1,
    shortDescription: 'Foundation for understanding how adults learn neurologically',
    fullDescription: `ITLA establishes the neuroscience-based rationale for how adults learn best. It provides a framework for conducting learning analysis using the Learning Analysis Selection Matrix (LASM), which includes four core tables covering different types of learning and data analysis.

This tool ensures that all subsequent design decisions are grounded in evidence about how the brain processes, stores, and retrieves information.`,
    purpose:
      'To establish a neuroscience-informed foundation and conduct comprehensive learning analysis',
    outputs: [
      'Learning Analysis Selection Matrix (LASM)',
      'Needs Assessment Documentation',
      'Learner Analysis Report',
      'Context Analysis Document',
    ],
    neuroscienceAlignment:
      'Establishes understanding of memory formation, attention, and cognitive load as the basis for all design decisions.',
    brainSystems: [
      'All major learning systems',
      'Working memory',
      'Long-term memory',
      'Attention networks',
    ],
    relatedPillars: ['neuroscience-informed', 'strategic', 'integrative'],
    wizardSteps: [1, 2, 3, 4],
    icon: 'lightbulb',
  },

  {
    id: 'nppm',
    acronym: 'NPPM',
    fullName: 'INSPIRE Neuroplasticity Pathways Model',
    stage: 'encoding',
    phaseNumber: 1,
    shortDescription: 'Evidence-based reinforcement strategies for lasting learning',
    fullDescription: `NPPM strategically sequences and reinforces learning over time based on neuroplasticity principles. It operationalizes Hebb's rule ("neurons that fire together, wire together") through strategies like spaced repetition, retrieval practice, emotional arousal, and multisensory integration.

The tool includes a Strategy Selection Flowchart and Reinforcement Planner Template to help designers choose and schedule appropriate reinforcement activities.`,
    purpose:
      'To design reinforcement strategies that create lasting neural pathways and combat the forgetting curve',
    outputs: [
      'Reinforcement Strategy Selection',
      'NPPM Reinforcement Planner',
      'Spaced Learning Schedule',
      'Retrieval Practice Plan',
    ],
    neuroscienceAlignment:
      'Based on long-term potentiation, hippocampal consolidation, and the spacing effect. Targets memory consolidation pathways.',
    brainSystems: ['Hippocampus', 'Cortical consolidation', 'Dopamine reward pathways', 'Amygdala'],
    relatedPillars: ['neuroscience-informed', 'results-focused', 'evolutionary'],
    wizardSteps: [6, 7],
    icon: 'brain',
  },

  {
    id: 'ilmi',
    acronym: 'ILMI',
    fullName: 'INSPIRE Learning Modality Integrator',
    stage: 'encoding',
    phaseNumber: 1,
    shortDescription: 'Strategic selection of optimal sensory modalities',
    fullDescription: `ILMI guides the selection of optimal sensory modalities (visual, auditory, textual, kinesthetic, social) based on dual coding theory. The brain creates multiple memory representations when information is presented through multiple channels.

The tool includes a Modality Decision Map and considers accessibility requirements for learners with sensory impairments.`,
    purpose:
      'To select and integrate learning modalities that maximize encoding and accommodate diverse learners',
    outputs: [
      'Modality Mix Selection',
      'Accessibility Accommodations Plan',
      'Media Specification Document',
      'Dual Coding Strategy',
    ],
    neuroscienceAlignment:
      'Based on dual coding theory and sensory integration. Multiple modalities create redundant memory pathways.',
    brainSystems: [
      'Visual cortex',
      'Auditory cortex',
      'Language centers',
      'Motor cortex',
      'Sensory integration areas',
    ],
    relatedPillars: ['neuroscience-informed', 'personalized', 'immersive'],
    wizardSteps: [7, 9],
    icon: 'palette',
  },

  {
    id: 'ices',
    acronym: 'ICES',
    fullName: 'INSPIRE Cognitive Engagement Spectrum',
    stage: 'encoding',
    phaseNumber: 1,
    shortDescription: 'Selecting appropriate cognitive engagement levels',
    fullDescription: `ICES helps select the appropriate level of cognitive engagement: Passive, Reflective, Active, Collaborative, Exploratory, or Immersive. Each level triggers distinct neural pathways and is appropriate for different learning objectives.

Higher engagement levels generally create stronger memories but require more cognitive resources. The tool helps balance engagement with cognitive load.`,
    purpose:
      'To match cognitive engagement levels to learning objectives and cognitive load constraints',
    outputs: ['Engagement Level Mapping', 'Activity Type Selection', 'Cognitive Load Alignment'],
    neuroscienceAlignment:
      'Higher engagement activates more brain regions, creating richer neural representations and stronger memories.',
    brainSystems: [
      'Prefrontal cortex (active processing)',
      'Motor planning (kinesthetic)',
      'Social cognition (collaborative)',
      'Amygdala (emotional engagement)',
    ],
    relatedPillars: ['immersive', 'neuroscience-informed', 'personalized'],
    wizardSteps: [7, 9],
    icon: 'sliders',
  },

  // SYNTHESIZATION STAGE (Phase 2)
  {
    id: 'icl',
    acronym: 'ICL',
    fullName: 'INSPIRE Competency Ladder',
    stage: 'synthesization',
    phaseNumber: 2,
    shortDescription: 'Maps competencies to learner needs and job requirements',
    fullDescription: `ICL maps the competencies learners need to develop and aligns them with job requirements and organizational standards. It uses a proficiency progression model (Novice → Advanced Beginner → Competent → Proficient → Expert) to establish clear development pathways.

This tool ensures learning objectives are tied to real job competencies, not just content coverage.`,
    purpose: 'To identify, define, and map competencies that drive job performance',
    outputs: [
      'Competency Framework',
      'Proficiency Level Definitions',
      'Job-Competency Alignment',
      'Gap Analysis',
    ],
    neuroscienceAlignment:
      "Competency development reflects the brain's progression from explicit rule-following to intuitive expertise through practice.",
    brainSystems: [
      'Procedural memory (skill development)',
      'Prefrontal cortex (conscious competence)',
      'Basal ganglia (automaticity)',
    ],
    relatedPillars: ['strategic', 'personalized', 'results-focused'],
    wizardSteps: [5],
    icon: 'stairs',
  },

  {
    id: 'icdt',
    acronym: 'ICDT',
    fullName: 'INSPIRE Cognitive Demand Taxonomy',
    stage: 'synthesization',
    phaseNumber: 2,
    shortDescription: 'Aligns cognitive demands with measurable outcomes',
    fullDescription: `ICDT uses Bloom's Revised Taxonomy to classify learning objectives by cognitive level (Remember, Understand, Apply, Analyze, Evaluate, Create) and knowledge dimension (Factual, Conceptual, Procedural, Metacognitive).

This ensures objectives are appropriately challenging and measurable, with assessment methods matched to cognitive demands.`,
    purpose: 'To write clear, measurable learning objectives at appropriate cognitive levels',
    outputs: [
      'Terminal Learning Objectives',
      'Enabling Learning Objectives',
      "Bloom's Taxonomy Alignment",
      'Assessment Criteria',
    ],
    neuroscienceAlignment:
      'Higher cognitive levels require more prefrontal cortex engagement and create deeper processing for better retention.',
    brainSystems: [
      'Prefrontal cortex (executive function)',
      'Working memory',
      'Association cortices',
    ],
    relatedPillars: ['strategic', 'results-focused', 'neuroscience-informed'],
    wizardSteps: [5, 8],
    icon: 'sort-amount-up',
  },

  {
    id: 'ipmg',
    acronym: 'IPMG',
    fullName: 'INSPIRE Performance Mapping Grid',
    stage: 'synthesization',
    phaseNumber: 2,
    shortDescription: 'Maps learning objectives to job performance outcomes',
    fullDescription: `IPMG creates explicit connections between learning objectives and on-the-job performance. It identifies performance indicators, success criteria, and the support needed for successful transfer of learning to the workplace.

This tool ensures that training leads to measurable behavior change, not just knowledge acquisition.`,
    purpose: 'To ensure learning translates to improved job performance',
    outputs: [
      'Performance Mapping Matrix',
      'Transfer Support Plan',
      'Success Criteria Definitions',
      'Business Outcome Alignment',
    ],
    neuroscienceAlignment:
      'Transfer requires encoding in contexts similar to application. Identical elements between training and job enhance transfer.',
    brainSystems: [
      'Hippocampus (context-dependent memory)',
      'Prefrontal cortex (goal-directed application)',
    ],
    relatedPillars: ['strategic', 'results-focused', 'integrative'],
    wizardSteps: [5, 8],
    icon: 'project-diagram',
  },

  {
    id: 'icpf',
    acronym: 'ICPF',
    fullName: 'INSPIRE Capability Progression Framework',
    stage: 'synthesization',
    phaseNumber: 2,
    shortDescription: 'Develops adaptive learning paths from basic to mastery',
    fullDescription: `ICPF designs learning pathways that scaffold learners from foundational knowledge to mastery. It identifies prerequisites, sequences content appropriately, and creates adaptive branches for different learner needs.

The framework supports personalization by allowing multiple paths to the same destination based on prior knowledge and performance.`,
    purpose: 'To create scaffolded, adaptive learning journeys that progressively build capability',
    outputs: [
      'Learning Pathway Design',
      'Prerequisite Mapping',
      'Adaptive Branch Points',
      'Milestone Definitions',
    ],
    neuroscienceAlignment:
      'Scaffolding manages cognitive load by building on prior knowledge. The brain learns best in the "stretch zone."',
    brainSystems: [
      'Working memory (progressive loading)',
      'Schema development (building on prior knowledge)',
    ],
    relatedPillars: ['personalized', 'neuroscience-informed', 'integrative'],
    wizardSteps: [6],
    icon: 'route',
  },

  // ASSIMILATION STAGE (Phase 3)
  {
    id: 'idns',
    acronym: 'IDNS',
    fullName: 'INSPIRE Design NeuroSystem',
    stage: 'assimilation',
    phaseNumber: 3,
    shortDescription: 'Creates engaging, immersive learning experiences',
    fullDescription: `IDNS translates design specifications into engaging learning experiences. It applies neuroscience principles to every design element, ensuring that opening hooks capture attention, content chunks respect working memory, and activities create appropriate cognitive engagement.

This tool manages the flow of cognitive load throughout the learning experience.`,
    purpose: 'To create neurologically-optimized learning experiences that engage and retain',
    outputs: [
      'Storyboard with Neuro-alignment',
      'Cognitive Load Flow Map',
      'Engagement Point Design',
      'Media and Interaction Specs',
    ],
    neuroscienceAlignment:
      'Applies principles of attention, emotion, and memory formation to every design element.',
    brainSystems: [
      'Attention networks',
      'Emotion circuits (amygdala)',
      'Memory formation (hippocampus)',
      'Prefrontal executive function',
    ],
    relatedPillars: ['immersive', 'neuroscience-informed', 'personalized'],
    wizardSteps: [9, 10],
    icon: 'drafting-compass',
  },

  {
    id: 'iadc',
    acronym: 'IADC',
    fullName: 'INSPIRE Adaptive Design Cycle',
    stage: 'assimilation',
    phaseNumber: 3,
    shortDescription: 'Implements iterative feedback loops for continuous improvement',
    fullDescription: `IADC creates adaptive learning experiences that respond to learner performance in real-time. It defines adaptation rules that branch content, provide remediation, or accelerate progress based on performance data.

This tool also supports the evolutionary pillar by enabling continuous improvement based on learning analytics.`,
    purpose: 'To create responsive, adaptive learning experiences that adjust to learner needs',
    outputs: [
      'Adaptation Rule Definitions',
      'Branch Logic Mapping',
      'Remediation Pathway Design',
      'Analytics Configuration',
    ],
    neuroscienceAlignment:
      'Adaptive learning maintains the "stretch zone" by adjusting challenge to learner capability.',
    brainSystems: [
      'Dopamine reward system (appropriate challenge)',
      'Prefrontal cortex (feedback processing)',
    ],
    relatedPillars: ['personalized', 'evolutionary', 'results-focused'],
    wizardSteps: [11],
    icon: 'sync-alt',
  },

  {
    id: 'ilem',
    acronym: 'ILEM',
    fullName: 'INSPIRE Learning Experience Matrix',
    stage: 'assimilation',
    phaseNumber: 3,
    shortDescription: 'Reinforces knowledge retention through structured experience design',
    fullDescription: `ILEM orchestrates all learning experience elements into a cohesive whole. It ensures that modules flow logically, reinforce each other, and create a complete learning journey that achieves all objectives.

This tool is used to assemble final course structures and verify alignment with all prior design decisions.`,
    purpose: 'To integrate all learning elements into a cohesive, complete learning experience',
    outputs: [
      'Complete Course Structure',
      'Module-to-Module Flow',
      'Assessment Integration',
      'Completion Requirements',
    ],
    neuroscienceAlignment:
      'Integration across modules creates richer schema structures and supports long-term retention.',
    brainSystems: [
      'Association cortices (integration)',
      'Hippocampus (episodic memory)',
      'Prefrontal cortex (coherence)',
    ],
    relatedPillars: ['integrative', 'immersive', 'results-focused'],
    wizardSteps: [10, 12, 13],
    icon: 'th-large',
  },

  {
    id: 'ialm',
    acronym: 'IALM',
    fullName: 'INSPIRE Adaptive Learning Measurement',
    stage: 'assimilation',
    phaseNumber: 3,
    shortDescription: 'Robust measurement and analytics for tracking effectiveness',
    fullDescription: `IALM establishes the measurement framework using Kirkpatrick's four levels, xAPI analytics, and ROI calculation. It ensures long-term learning retention and behavioral change can be tracked and demonstrated.

This tool also supports ESSA Tier IV compliance documentation for evidence-based efficacy claims.`,
    purpose: 'To measure learning effectiveness, business impact, and ROI',
    outputs: [
      'Kirkpatrick Evaluation Plan',
      'xAPI Statement Design',
      'Analytics Dashboard Configuration',
      'ROI Calculation Framework',
      'ESSA Tier IV Documentation',
    ],
    neuroscienceAlignment:
      'Measurement activities serve as retrieval practice. Feedback activates learning and motivation circuits.',
    brainSystems: [
      'Dopamine reward system (progress tracking)',
      'Prefrontal cortex (self-assessment)',
      'Anterior cingulate (error detection)',
    ],
    relatedPillars: ['results-focused', 'evolutionary', 'strategic'],
    wizardSteps: [8, 14, 15, 16, 17],
    icon: 'chart-bar',
  },
];

// ============================================================================
// SECTION 5: KEY NEUROSCIENCE FACTS
// ============================================================================

/**
 * Key neuroscience facts for "Dive Deeper" content
 */
export const NEUROSCIENCE_FACTS = {
  memory: {
    workingMemoryCapacity: {
      fact: 'Working memory can hold approximately 4 chunks of information at once (Cowan, 2001), not 7±2 as previously thought.',
      implication: 'Present no more than 4 new concepts before allowing processing time.',
      citation: 'Cowan, N. (2001). The magical number 4 in short-term memory.',
    },
    forgettingCurve: {
      fact: 'Without reinforcement, learners forget approximately 70% within 24 hours and 90% within a week (Ebbinghaus).',
      implication: 'Build in spaced repetition and retrieval practice to combat forgetting.',
      citation: 'Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology.',
    },
    retrievalPractice: {
      fact: 'Retrieval practice (testing) improves long-term retention by 50% or more compared to restudying.',
      implication: 'Include frequent low-stakes quizzes and recall activities.',
      citation: 'Roediger, H.L. & Karpicke, J.D. (2006). Test-enhanced learning.',
    },
    sleepConsolidation: {
      fact: 'Memory consolidation occurs during sleep, particularly during slow-wave and REM sleep phases.',
      implication: 'Allow time between learning sessions; avoid cramming before assessments.',
      citation: 'Walker, M. (2017). Why We Sleep.',
    },
  },
  attention: {
    limitedResource: {
      fact: 'Attention is a limited resource. The brain cannot truly multitask on cognitive tasks - it switches rapidly.',
      implication: 'Design for focused attention; minimize distractions and competing demands.',
      citation: 'Marois, R. & Ivanoff, J. (2005). Capacity limits of information processing.',
    },
    mindWandering: {
      fact: "People's minds wander approximately 47% of waking hours (Harvard study).",
      implication:
        'Use engagement techniques, varied activities, and chunked content to maintain attention.',
      citation: 'Killingsworth, M.A. & Gilbert, D.T. (2010). A wandering mind is an unhappy mind.',
    },
    noveltyResponse: {
      fact: 'The brain has an automatic orienting response to novelty, which can be leveraged for engagement.',
      implication: 'Introduce variety, surprising elements, and novel presentation methods.',
      citation:
        'Ranganath, C. & Rainer, G. (2003). Neural mechanisms for detecting and remembering novel events.',
    },
  },
  emotion: {
    emotionalMemory: {
      fact: 'Emotionally significant experiences are remembered better due to amygdala involvement in memory tagging.',
      implication:
        'Create emotional engagement through stories, relevance, and meaningful consequences.',
      citation: 'McGaugh, J.L. (2004). The amygdala modulates the consolidation of memories.',
    },
    storyRetention: {
      fact: 'Stories are remembered 22 times more than isolated facts (Stanford research).',
      implication: 'Use narrative structures, case studies, and scenario-based learning.',
      citation: 'Stanford Graduate School of Business research on storytelling.',
    },
    stressAndLearning: {
      fact: 'Moderate arousal enhances learning, but high stress impairs hippocampal function and memory formation.',
      implication: 'Create appropriate challenge (stretch zone) without overwhelming stress.',
      citation: 'Vogel, S. & Schwabe, L. (2016). Learning and memory under stress.',
    },
  },
  cognitiveLoad: {
    intrinsicLoad: {
      fact: 'Intrinsic load is determined by element interactivity - how many elements must be processed simultaneously.',
      implication: 'Scaffold complex content; break down highly interactive elements.',
      citation:
        'Sweller, J. (2010). Element interactivity and intrinsic, extraneous, and germane cognitive load.',
    },
    extraneousLoad: {
      fact: 'Extraneous load comes from poor design that wastes cognitive resources without contributing to learning.',
      implication: 'Minimize split attention, redundancy, and visual clutter.',
      citation: 'Sweller, J. (1988). Cognitive load during problem solving.',
    },
    germaneLoad: {
      fact: 'Germane load is productive effort that contributes to schema formation and learning.',
      implication: 'Encourage active processing, reflection, and connection-making.',
      citation: 'Sweller, J., van Merriënboer, J.J.G., & Paas, F. (1998).',
    },
  },
};

// ============================================================================
// SECTION 6: HELPER FUNCTIONS
// ============================================================================

/**
 * Get a pillar definition by ID
 */
export function getPillar(id: INSPIREPillar): INSPIREPillarDefinition | undefined {
  return INSPIRE_PILLARS.find((p) => p.id === id);
}

/**
 * Get a learning theory by ID
 */
export function getLearningTheory(id: string): LearningTheory | undefined {
  return LEARNING_THEORIES.find((t) => t.id === id);
}

/**
 * Get an ILA tool by ID
 */
export function getILATool(id: string): ILAToolDefinition | undefined {
  return ILA_TOOLS.find((t) => t.id === id);
}

/**
 * Get all tools for a specific stage
 */
export function getToolsByStage(stage: ILAStage): ILAToolDefinition[] {
  return ILA_TOOLS.filter((t) => t.stage === stage);
}

/**
 * Get tools used in a specific wizard step
 */
export function getToolsForStep(stepNumber: number): ILAToolDefinition[] {
  return ILA_TOOLS.filter((t) => t.wizardSteps.includes(stepNumber));
}

/**
 * Get andragogy principle by ID
 */
export function getAndragogyPrinciple(id: string): AndragogyPrinciple | undefined {
  return ANDRAGOGY_PRINCIPLES.find((p) => p.id === id);
}

// ============================================================================
// END OF INSPIRE FRAMEWORK PRINCIPLES
// ============================================================================
