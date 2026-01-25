/**
 * O*NET Seed Data
 *
 * Pre-seeded occupations and skills for cold-start capability.
 * This data mimics O*NET structure for 5 key roles across LXD360 target markets.
 *
 * In production, this would be supplemented with actual O*NET API ingestion.
 */

import type { ONetOccupation, ONetSkill, SkillCategory } from './types';

// =============================================================================
// SKILLS DATABASE (50 representative skills)
// =============================================================================

export const ONET_SKILLS: ONetSkill[] = [
  // -------------------------------------------------------------------------
  // Basic Skills
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.A.1.a',
    name: 'Reading Comprehension',
    description: 'Understanding written sentences and paragraphs in work-related documents.',
    category: 'basic_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.A.1.b',
    name: 'Active Listening',
    description:
      'Giving full attention to what other people are saying, taking time to understand the points being made.',
    category: 'basic_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.A.1.c',
    name: 'Writing',
    description:
      'Communicating effectively in writing as appropriate for the needs of the audience.',
    category: 'basic_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.A.1.d',
    name: 'Speaking',
    description: 'Talking to others to convey information effectively.',
    category: 'basic_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.A.1.e',
    name: 'Mathematics',
    description: 'Using mathematics to solve problems.',
    category: 'basic_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.A.1.f',
    name: 'Science',
    description: 'Using scientific rules and methods to solve problems.',
    category: 'basic_skills',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Complex Problem Solving
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.A.2.a',
    name: 'Complex Problem Solving',
    description:
      'Identifying complex problems and reviewing related information to develop and evaluate options.',
    category: 'complex_problem_solving',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Social Skills
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.B.1.a',
    name: 'Social Perceptiveness',
    description: "Being aware of others' reactions and understanding why they react as they do.",
    category: 'social_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.B.1.b',
    name: 'Coordination',
    description: "Adjusting actions in relation to others' actions.",
    category: 'social_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.B.1.c',
    name: 'Persuasion',
    description: 'Persuading others to change their minds or behavior.',
    category: 'social_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.B.1.d',
    name: 'Negotiation',
    description: 'Bringing others together and trying to reconcile differences.',
    category: 'social_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.B.1.e',
    name: 'Instructing',
    description: 'Teaching others how to do something.',
    category: 'social_skills',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Technical Skills
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.C.1.a',
    name: 'Programming',
    description: 'Writing computer programs for various purposes.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.b',
    name: 'Systems Analysis',
    description: 'Determining how a system should work and how changes will affect outcomes.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.c',
    name: 'Systems Evaluation',
    description:
      'Identifying measures or indicators of system performance and needed improvements.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.d',
    name: 'Technology Design',
    description: 'Generating or adapting equipment and technology to serve user needs.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.e',
    name: 'Equipment Selection',
    description: 'Determining the kind of tools and equipment needed to do a job.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.f',
    name: 'Quality Control Analysis',
    description: 'Conducting tests and inspections of products or services to evaluate quality.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.g',
    name: 'Operations Monitoring',
    description:
      'Watching gauges, dials, or other indicators to make sure a machine is working properly.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.h',
    name: 'Operation and Control',
    description: 'Controlling operations of equipment or systems.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.i',
    name: 'Troubleshooting',
    description: 'Determining causes of operating errors and deciding what to do about it.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.1.j',
    name: 'Repairing',
    description: 'Repairing machines or systems using the needed tools.',
    category: 'technical_skills',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Resource Management
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.D.1.a',
    name: 'Time Management',
    description: "Managing one's own time and the time of others.",
    category: 'resource_management',
    elementType: 'skill',
  },
  {
    onetElementId: '2.D.1.b',
    name: 'Management of Financial Resources',
    description: 'Determining how money will be spent to get the work done.',
    category: 'resource_management',
    elementType: 'skill',
  },
  {
    onetElementId: '2.D.1.c',
    name: 'Management of Material Resources',
    description: 'Obtaining and seeing to the appropriate use of equipment and materials.',
    category: 'resource_management',
    elementType: 'skill',
  },
  {
    onetElementId: '2.D.1.d',
    name: 'Management of Personnel Resources',
    description: 'Motivating, developing, and directing people as they work.',
    category: 'resource_management',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Systems Skills
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.E.1.a',
    name: 'Judgment and Decision Making',
    description: 'Considering the relative costs and benefits of potential actions.',
    category: 'systems_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.E.1.b',
    name: 'Critical Thinking',
    description:
      'Using logic and reasoning to identify strengths and weaknesses of alternative solutions.',
    category: 'systems_skills',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Software Development Skills (Extended Technical)
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.C.2.a',
    name: 'Software Development',
    description: 'Designing, coding, testing, and maintaining software applications.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.2.b',
    name: 'Database Management',
    description: 'Designing and managing databases to store and retrieve information.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.2.c',
    name: 'Cloud Computing',
    description: 'Deploying and managing applications and services in cloud environments.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.2.d',
    name: 'Cybersecurity',
    description: 'Protecting systems, networks, and data from digital attacks.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.2.e',
    name: 'Data Analysis',
    description:
      'Inspecting, cleansing, transforming, and modeling data to discover useful information.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.2.f',
    name: 'Machine Learning',
    description:
      'Developing algorithms that allow computers to learn from and make predictions on data.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.2.g',
    name: 'API Development',
    description:
      'Designing and building application programming interfaces for software communication.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.C.2.h',
    name: 'Version Control',
    description: 'Managing changes to source code and collaborating with other developers.',
    category: 'technical_skills',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Sales & Business Skills
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.F.1.a',
    name: 'Sales',
    description: 'Convincing others to buy merchandise or services.',
    category: 'social_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.F.1.b',
    name: 'Customer Service',
    description: 'Assessing customer needs and meeting quality standards for services.',
    category: 'social_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.F.1.c',
    name: 'Marketing',
    description: 'Promoting and selling products or services, including market research.',
    category: 'social_skills',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Welding & Manufacturing Skills
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.G.1.a',
    name: 'Welding',
    description: 'Joining metal parts using welding equipment and techniques.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.G.1.b',
    name: 'Blueprint Reading',
    description: 'Interpreting technical drawings and specifications.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.G.1.c',
    name: 'Metal Fabrication',
    description: 'Cutting, shaping, and assembling metal parts.',
    category: 'technical_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.G.1.d',
    name: 'Safety Compliance',
    description: 'Following and enforcing safety protocols and regulations.',
    category: 'technical_skills',
    elementType: 'skill',
  },

  // -------------------------------------------------------------------------
  // Healthcare Skills
  // -------------------------------------------------------------------------
  {
    onetElementId: '2.H.1.a',
    name: 'Patient Care',
    description: 'Providing physical and emotional care to patients.',
    category: 'social_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.H.1.b',
    name: 'Medical Terminology',
    description: 'Understanding and using medical vocabulary and abbreviations.',
    category: 'basic_skills',
    elementType: 'knowledge',
  },
  {
    onetElementId: '2.H.1.c',
    name: 'Clinical Documentation',
    description: 'Recording patient information accurately in medical records.',
    category: 'basic_skills',
    elementType: 'skill',
  },
  {
    onetElementId: '2.H.1.d',
    name: 'Medication Administration',
    description: 'Safely preparing and administering medications to patients.',
    category: 'technical_skills',
    elementType: 'skill',
  },
];

// =============================================================================
// OCCUPATIONS DATABASE (5 key roles across target markets)
// =============================================================================

export const ONET_OCCUPATIONS: ONetOccupation[] = [
  // -------------------------------------------------------------------------
  // Technology: Software Developer
  // -------------------------------------------------------------------------
  {
    onetSocCode: '15-1252.00',
    title: 'Software Developers',
    description:
      'Research, design, and develop computer and network software or specialized utility programs.',
    jobFamily: 'Computer and Mathematical',
    typicalEducation: "Bachelor's degree",
    growthOutlook: 'rapid_growth',
    requiredSkills: [
      {
        skillId: '2.C.2.a',
        importance: 5,
        level: 6,
        skillName: 'Software Development',
      },
      { skillId: '2.C.1.a', importance: 5, level: 6, skillName: 'Programming' },
      {
        skillId: '2.A.2.a',
        importance: 4,
        level: 5,
        skillName: 'Complex Problem Solving',
      },
      { skillId: '2.C.1.b', importance: 4, level: 5, skillName: 'Systems Analysis' },
      { skillId: '2.E.1.b', importance: 4, level: 5, skillName: 'Critical Thinking' },
      {
        skillId: '2.C.2.b',
        importance: 4,
        level: 5,
        skillName: 'Database Management',
      },
      { skillId: '2.C.2.h', importance: 4, level: 5, skillName: 'Version Control' },
      { skillId: '2.C.2.g', importance: 3, level: 4, skillName: 'API Development' },
      {
        skillId: '2.A.1.a',
        importance: 3,
        level: 4,
        skillName: 'Reading Comprehension',
      },
      { skillId: '2.D.1.a', importance: 3, level: 4, skillName: 'Time Management' },
    ],
  },

  // -------------------------------------------------------------------------
  // Business: Sales Manager
  // -------------------------------------------------------------------------
  {
    onetSocCode: '11-2022.00',
    title: 'Sales Managers',
    description:
      'Plan, direct, or coordinate the actual distribution or movement of a product or service.',
    jobFamily: 'Management',
    typicalEducation: "Bachelor's degree",
    growthOutlook: 'growing',
    requiredSkills: [
      { skillId: '2.F.1.a', importance: 5, level: 6, skillName: 'Sales' },
      { skillId: '2.B.1.c', importance: 5, level: 6, skillName: 'Persuasion' },
      {
        skillId: '2.D.1.d',
        importance: 5,
        level: 6,
        skillName: 'Management of Personnel Resources',
      },
      { skillId: '2.B.1.d', importance: 4, level: 5, skillName: 'Negotiation' },
      { skillId: '2.A.1.d', importance: 4, level: 5, skillName: 'Speaking' },
      {
        skillId: '2.B.1.a',
        importance: 4,
        level: 5,
        skillName: 'Social Perceptiveness',
      },
      {
        skillId: '2.E.1.a',
        importance: 4,
        level: 5,
        skillName: 'Judgment and Decision Making',
      },
      {
        skillId: '2.D.1.b',
        importance: 3,
        level: 4,
        skillName: 'Management of Financial Resources',
      },
      { skillId: '2.F.1.c', importance: 3, level: 4, skillName: 'Marketing' },
      { skillId: '2.D.1.a', importance: 3, level: 4, skillName: 'Time Management' },
    ],
  },

  // -------------------------------------------------------------------------
  // Manufacturing: Welder
  // -------------------------------------------------------------------------
  {
    onetSocCode: '51-4121.00',
    title: 'Welders, Cutters, Solderers, and Brazers',
    description:
      'Use hand-welding, flame-cutting, hand-soldering, or brazing equipment to weld or join metal components.',
    jobFamily: 'Production',
    typicalEducation: 'Postsecondary nondegree award',
    growthOutlook: 'stable',
    requiredSkills: [
      { skillId: '2.G.1.a', importance: 5, level: 6, skillName: 'Welding' },
      { skillId: '2.G.1.b', importance: 4, level: 5, skillName: 'Blueprint Reading' },
      {
        skillId: '2.G.1.c',
        importance: 4,
        level: 5,
        skillName: 'Metal Fabrication',
      },
      {
        skillId: '2.G.1.d',
        importance: 5,
        level: 5,
        skillName: 'Safety Compliance',
      },
      {
        skillId: '2.C.1.f',
        importance: 4,
        level: 5,
        skillName: 'Quality Control Analysis',
      },
      {
        skillId: '2.C.1.g',
        importance: 3,
        level: 4,
        skillName: 'Operations Monitoring',
      },
      {
        skillId: '2.C.1.h',
        importance: 4,
        level: 5,
        skillName: 'Operation and Control',
      },
      {
        skillId: '2.C.1.e',
        importance: 3,
        level: 4,
        skillName: 'Equipment Selection',
      },
      { skillId: '2.A.1.e', importance: 3, level: 3, skillName: 'Mathematics' },
      { skillId: '2.C.1.i', importance: 3, level: 4, skillName: 'Troubleshooting' },
    ],
  },

  // -------------------------------------------------------------------------
  // Healthcare: Registered Nurse
  // -------------------------------------------------------------------------
  {
    onetSocCode: '29-1141.00',
    title: 'Registered Nurses',
    description:
      'Assess patient health problems and needs, develop and implement nursing care plans.',
    jobFamily: 'Healthcare Practitioners',
    typicalEducation: "Bachelor's degree",
    growthOutlook: 'rapid_growth',
    requiredSkills: [
      { skillId: '2.H.1.a', importance: 5, level: 6, skillName: 'Patient Care' },
      {
        skillId: '2.H.1.b',
        importance: 5,
        level: 5,
        skillName: 'Medical Terminology',
      },
      {
        skillId: '2.H.1.c',
        importance: 5,
        level: 5,
        skillName: 'Clinical Documentation',
      },
      {
        skillId: '2.H.1.d',
        importance: 5,
        level: 6,
        skillName: 'Medication Administration',
      },
      {
        skillId: '2.B.1.a',
        importance: 5,
        level: 5,
        skillName: 'Social Perceptiveness',
      },
      { skillId: '2.A.1.b', importance: 4, level: 5, skillName: 'Active Listening' },
      {
        skillId: '2.E.1.a',
        importance: 4,
        level: 5,
        skillName: 'Judgment and Decision Making',
      },
      { skillId: '2.E.1.b', importance: 4, level: 5, skillName: 'Critical Thinking' },
      { skillId: '2.B.1.b', importance: 4, level: 4, skillName: 'Coordination' },
      { skillId: '2.D.1.a', importance: 3, level: 4, skillName: 'Time Management' },
    ],
  },

  // -------------------------------------------------------------------------
  // Data Science: Data Scientist
  // -------------------------------------------------------------------------
  {
    onetSocCode: '15-2051.00',
    title: 'Data Scientists',
    description:
      'Develop and implement data analyses, data collection systems, and other strategies.',
    jobFamily: 'Computer and Mathematical',
    typicalEducation: "Master's degree",
    growthOutlook: 'rapid_growth',
    requiredSkills: [
      { skillId: '2.C.2.e', importance: 5, level: 6, skillName: 'Data Analysis' },
      { skillId: '2.C.2.f', importance: 5, level: 6, skillName: 'Machine Learning' },
      { skillId: '2.C.1.a', importance: 4, level: 5, skillName: 'Programming' },
      { skillId: '2.A.1.e', importance: 5, level: 6, skillName: 'Mathematics' },
      { skillId: '2.A.1.f', importance: 4, level: 5, skillName: 'Science' },
      {
        skillId: '2.C.2.b',
        importance: 4,
        level: 5,
        skillName: 'Database Management',
      },
      { skillId: '2.E.1.b', importance: 4, level: 5, skillName: 'Critical Thinking' },
      {
        skillId: '2.A.2.a',
        importance: 4,
        level: 5,
        skillName: 'Complex Problem Solving',
      },
      { skillId: '2.A.1.c', importance: 3, level: 4, skillName: 'Writing' },
      { skillId: '2.A.1.d', importance: 3, level: 4, skillName: 'Speaking' },
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get skill by O*NET element ID
 */
export function getSkillById(skillId: string): ONetSkill | undefined {
  return ONET_SKILLS.find((s) => s.onetElementId === skillId);
}

/**
 * Get occupation by O*NET-SOC code
 */
export function getOccupationByCode(code: string): ONetOccupation | undefined {
  return ONET_OCCUPATIONS.find((o) => o.onetSocCode === code);
}

/**
 * Get all skills in a category
 */
export function getSkillsByCategory(category: SkillCategory): ONetSkill[] {
  return ONET_SKILLS.filter((s) => s.category === category);
}

/**
 * Search occupations by keyword
 */
export function searchOccupations(query: string): ONetOccupation[] {
  const lowerQuery = query.toLowerCase();
  return ONET_OCCUPATIONS.filter(
    (o) =>
      o.title.toLowerCase().includes(lowerQuery) ||
      o.description.toLowerCase().includes(lowerQuery) ||
      o.jobFamily.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Search skills by keyword
 */
export function searchSkills(query: string): ONetSkill[] {
  const lowerQuery = query.toLowerCase();
  return ONET_SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) || s.description.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Get all unique skill IDs required for an occupation
 */
export function getOccupationSkillIds(occupation: ONetOccupation): string[] {
  return occupation.requiredSkills.map((r) => r.skillId);
}

/**
 * Get skills required for an occupation with full details
 */
export function getOccupationSkillsWithDetails(
  occupation: ONetOccupation,
): Array<{ skill: ONetSkill; requirement: ONetOccupation['requiredSkills'][0] }> {
  return occupation.requiredSkills
    .map((req) => {
      const skill = getSkillById(req.skillId);
      return skill ? { skill, requirement: req } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

/**
 * Find occupations that require a specific skill
 */
export function findOccupationsRequiringSkill(skillId: string): ONetOccupation[] {
  return ONET_OCCUPATIONS.filter((o) => o.requiredSkills.some((r) => r.skillId === skillId));
}

/**
 * Get skill overlap between two occupations
 */
export function getSkillOverlap(
  occupation1: ONetOccupation,
  occupation2: ONetOccupation,
): ONetSkill[] {
  const skills1 = new Set(getOccupationSkillIds(occupation1));
  const skills2 = getOccupationSkillIds(occupation2);

  return skills2
    .filter((id) => skills1.has(id))
    .map((id) => getSkillById(id))
    .filter((s): s is ONetSkill => s !== undefined);
}
