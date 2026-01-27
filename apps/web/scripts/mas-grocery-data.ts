/**
 * Ma's Grocery LLC Demo Tenant Data
 *
 * Contains all user data for the Ma's Grocery demo tenant.
 * This file is consumed by seed-mas-grocery.ts for seeding Firestore and Firebase Auth.
 *
 * @module scripts/mas-grocery-data
 */

import type { Persona } from '../lib/rbac/personas';

// =============================================================================
// TENANT CONFIGURATION
// =============================================================================

export const TENANT_ID = 'mas-grocery';
export const TENANT_NAME = "Ma's Grocery LLC";
export const TENANT_SLUG = 'mas-grocery';
export const TENANT_LOCATION = 'Daphne, Alabama 36526';

/** Default password for demo users (NOT used for Phill's real account) */
export const DEFAULT_PASSWORD = '123peasandcarrots';

// =============================================================================
// O*NET OCCUPATION MAPPINGS
// =============================================================================

export const ONET_OCCUPATIONS = {
  cashier: '41-2011.00',
  stocker: '43-5081.00',
  butcher: '51-3021.00',
  baker: '51-3011.00',
  deli_clerk: '35-2021.00',
  manager: '41-1011.00',
  owner: '11-1021.00', // General and Operations Managers
  admin: '43-6014.00', // Administrative Specialists
} as const;

export type OccupationKey = keyof typeof ONET_OCCUPATIONS;

// =============================================================================
// DEPARTMENT DEFINITIONS
// =============================================================================

export const DEPARTMENTS = {
  front_end: {
    id: 'front_end',
    name: 'Front End',
    description: 'Cashiers and customer service',
  },
  deli_bakery: {
    id: 'deli_bakery',
    name: 'Deli & Bakery',
    description: 'Deli counter and bakery operations',
  },
  warehouse: {
    id: 'warehouse',
    name: 'Warehouse',
    description: 'Receiving, stocking, and inventory',
  },
  meat: {
    id: 'meat',
    name: 'Meat Department',
    description: 'Butcher shop and meat counter',
  },
  produce: {
    id: 'produce',
    name: 'Produce',
    description: 'Fresh fruits and vegetables',
  },
  administration: {
    id: 'administration',
    name: 'Administration',
    description: 'Store management and administration',
  },
} as const;

export type DepartmentId = keyof typeof DEPARTMENTS;

// =============================================================================
// USER TYPE DEFINITIONS
// =============================================================================

export interface MasGroceryUser {
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  persona: Persona;
  department: DepartmentId;
  jobTitle: string;
  onetCode: string;
  age: number;
  gender: 'M' | 'F' | 'NB';
  hireDate: string; // ISO date string
  managerId?: string; // email of manager
  isRealAccount?: boolean; // For Phill's account - don't create with default password
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// =============================================================================
// CROSS-TENANT ADMIN (REAL ACCOUNT)
// =============================================================================

export const CROSS_TENANT_ADMIN: MasGroceryUser = {
  email: 'bockphillipj@outlook.com',
  displayName: 'Phill Bock',
  firstName: 'Phill',
  lastName: 'Bock',
  persona: 'owner',
  department: 'administration',
  jobTitle: 'Platform Administrator',
  onetCode: ONET_OCCUPATIONS.owner,
  age: 45,
  gender: 'M',
  hireDate: '2024-01-01',
  isRealAccount: true, // Special handling - link existing or create with secure password
  notifications: {
    email: true,
    push: true,
    sms: true,
  },
};

// =============================================================================
// OWNERS (2)
// =============================================================================

export const OWNERS: MasGroceryUser[] = [
  {
    email: 'ma@masgrocery.com',
    displayName: 'Martha "Ma" Jenkins',
    firstName: 'Martha',
    lastName: 'Jenkins',
    persona: 'owner',
    department: 'administration',
    jobTitle: 'Owner & CEO',
    onetCode: ONET_OCCUPATIONS.owner,
    age: 68,
    gender: 'F',
    hireDate: '1985-03-15',
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
  },
  {
    email: 'pa@masgrocery.com',
    displayName: 'Robert "Pa" Jenkins',
    firstName: 'Robert',
    lastName: 'Jenkins',
    persona: 'owner',
    department: 'administration',
    jobTitle: 'Owner & COO',
    onetCode: ONET_OCCUPATIONS.owner,
    age: 71,
    gender: 'M',
    hireDate: '1985-03-15',
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
  },
];

// =============================================================================
// EDITORS/ADMINS (2)
// =============================================================================

export const EDITORS: MasGroceryUser[] = [
  {
    email: 'sarah.mitchell@masgrocery.com',
    displayName: 'Sarah Mitchell',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    persona: 'editor',
    department: 'administration',
    jobTitle: 'LMS Administrator',
    onetCode: ONET_OCCUPATIONS.admin,
    age: 34,
    gender: 'F',
    hireDate: '2019-06-01',
    managerId: 'ma@masgrocery.com',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
  {
    email: 'david.chen@masgrocery.com',
    displayName: 'David Chen',
    firstName: 'David',
    lastName: 'Chen',
    persona: 'editor',
    department: 'administration',
    jobTitle: 'Curriculum Developer',
    onetCode: ONET_OCCUPATIONS.admin,
    age: 29,
    gender: 'M',
    hireDate: '2021-02-15',
    managerId: 'sarah.mitchell@masgrocery.com',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
];

// =============================================================================
// MANAGERS (3)
// =============================================================================

export const MANAGERS: MasGroceryUser[] = [
  {
    email: 'james.washington@masgrocery.com',
    displayName: 'James Washington',
    firstName: 'James',
    lastName: 'Washington',
    persona: 'manager',
    department: 'front_end',
    jobTitle: 'Front End Manager',
    onetCode: ONET_OCCUPATIONS.manager,
    age: 42,
    gender: 'M',
    hireDate: '2010-04-12',
    managerId: 'pa@masgrocery.com',
    notifications: {
      email: true,
      push: true,
      sms: true,
    },
  },
  {
    email: 'maria.garcia@masgrocery.com',
    displayName: 'Maria Garcia',
    firstName: 'Maria',
    lastName: 'Garcia',
    persona: 'manager',
    department: 'deli_bakery',
    jobTitle: 'Deli & Bakery Manager',
    onetCode: ONET_OCCUPATIONS.manager,
    age: 38,
    gender: 'F',
    hireDate: '2012-08-20',
    managerId: 'ma@masgrocery.com',
    notifications: {
      email: true,
      push: true,
      sms: true,
    },
  },
  {
    email: 'tyrone.jackson@masgrocery.com',
    displayName: 'Tyrone Jackson',
    firstName: 'Tyrone',
    lastName: 'Jackson',
    persona: 'manager',
    department: 'warehouse',
    jobTitle: 'Warehouse Manager',
    onetCode: ONET_OCCUPATIONS.manager,
    age: 45,
    gender: 'M',
    hireDate: '2008-11-03',
    managerId: 'pa@masgrocery.com',
    notifications: {
      email: true,
      push: true,
      sms: true,
    },
  },
];

// =============================================================================
// STAFF/LEARNERS (20)
// =============================================================================

export const STAFF: MasGroceryUser[] = [
  // Front End Staff
  {
    email: 'emily.thompson@masgrocery.com',
    displayName: 'Emily Thompson',
    firstName: 'Emily',
    lastName: 'Thompson',
    persona: 'learner',
    department: 'front_end',
    jobTitle: 'Cashier',
    onetCode: ONET_OCCUPATIONS.cashier,
    age: 19,
    gender: 'F',
    hireDate: '2025-05-15',
    managerId: 'james.washington@masgrocery.com',
  },
  {
    email: 'marcus.williams@masgrocery.com',
    displayName: 'Marcus Williams',
    firstName: 'Marcus',
    lastName: 'Williams',
    persona: 'learner',
    department: 'front_end',
    jobTitle: 'Head Cashier',
    onetCode: ONET_OCCUPATIONS.cashier,
    age: 24,
    gender: 'M',
    hireDate: '2022-03-10',
    managerId: 'james.washington@masgrocery.com',
  },
  {
    email: 'ashley.brown@masgrocery.com',
    displayName: 'Ashley Brown',
    firstName: 'Ashley',
    lastName: 'Brown',
    persona: 'learner',
    department: 'front_end',
    jobTitle: 'Cashier',
    onetCode: ONET_OCCUPATIONS.cashier,
    age: 22,
    gender: 'F',
    hireDate: '2024-01-08',
    managerId: 'james.washington@masgrocery.com',
  },
  {
    email: 'hannah.wilson@masgrocery.com',
    displayName: 'Hannah Wilson',
    firstName: 'Hannah',
    lastName: 'Wilson',
    persona: 'learner',
    department: 'front_end',
    jobTitle: 'Customer Service',
    onetCode: ONET_OCCUPATIONS.cashier,
    age: 21,
    gender: 'F',
    hireDate: '2024-08-01',
    managerId: 'james.washington@masgrocery.com',
  },
  {
    email: 'crystal.jones@masgrocery.com',
    displayName: 'Crystal Jones',
    firstName: 'Crystal',
    lastName: 'Jones',
    persona: 'learner',
    department: 'front_end',
    jobTitle: 'Cashier',
    onetCode: ONET_OCCUPATIONS.cashier,
    age: 27,
    gender: 'F',
    hireDate: '2023-04-17',
    managerId: 'james.washington@masgrocery.com',
  },

  // Deli & Bakery Staff
  {
    email: 'deshawn.harris@masgrocery.com',
    displayName: 'DeShawn Harris',
    firstName: 'DeShawn',
    lastName: 'Harris',
    persona: 'learner',
    department: 'deli_bakery',
    jobTitle: 'Deli Clerk',
    onetCode: ONET_OCCUPATIONS.deli_clerk,
    age: 28,
    gender: 'M',
    hireDate: '2021-09-22',
    managerId: 'maria.garcia@masgrocery.com',
  },
  {
    email: 'jennifer.martinez@masgrocery.com',
    displayName: 'Jennifer Martinez',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    persona: 'learner',
    department: 'deli_bakery',
    jobTitle: 'Baker',
    onetCode: ONET_OCCUPATIONS.baker,
    age: 35,
    gender: 'F',
    hireDate: '2018-02-14',
    managerId: 'maria.garcia@masgrocery.com',
  },
  {
    email: 'lakisha.johnson@masgrocery.com',
    displayName: 'Lakisha Johnson',
    firstName: 'Lakisha',
    lastName: 'Johnson',
    persona: 'learner',
    department: 'deli_bakery',
    jobTitle: 'Deli Clerk',
    onetCode: ONET_OCCUPATIONS.deli_clerk,
    age: 29,
    gender: 'F',
    hireDate: '2020-06-30',
    managerId: 'maria.garcia@masgrocery.com',
  },
  {
    email: 'rosa.hernandez@masgrocery.com',
    displayName: 'Rosa Hernandez',
    firstName: 'Rosa',
    lastName: 'Hernandez',
    persona: 'learner',
    department: 'deli_bakery',
    jobTitle: 'Lead Baker',
    onetCode: ONET_OCCUPATIONS.baker,
    age: 47,
    gender: 'F',
    hireDate: '2015-11-01',
    managerId: 'maria.garcia@masgrocery.com',
  },
  {
    email: 'ahmad.hassan@masgrocery.com',
    displayName: 'Ahmad Hassan',
    firstName: 'Ahmad',
    lastName: 'Hassan',
    persona: 'learner',
    department: 'deli_bakery',
    jobTitle: 'Deli Clerk',
    onetCode: ONET_OCCUPATIONS.deli_clerk,
    age: 39,
    gender: 'M',
    hireDate: '2019-03-18',
    managerId: 'maria.garcia@masgrocery.com',
  },

  // Warehouse Staff
  {
    email: 'nguyen.tran@masgrocery.com',
    displayName: 'Nguyen Tran',
    firstName: 'Nguyen',
    lastName: 'Tran',
    persona: 'learner',
    department: 'warehouse',
    jobTitle: 'Stocker',
    onetCode: ONET_OCCUPATIONS.stocker,
    age: 31,
    gender: 'M',
    hireDate: '2020-01-06',
    managerId: 'tyrone.jackson@masgrocery.com',
  },
  {
    email: 'robert.taylor@masgrocery.com',
    displayName: 'Robert Taylor',
    firstName: 'Robert',
    lastName: 'Taylor',
    persona: 'learner',
    department: 'warehouse',
    jobTitle: 'Senior Stocker',
    onetCode: ONET_OCCUPATIONS.stocker,
    age: 58,
    gender: 'M',
    hireDate: '2005-07-11',
    managerId: 'tyrone.jackson@masgrocery.com',
  },
  {
    email: 'brandon.lee@masgrocery.com',
    displayName: 'Brandon Lee',
    firstName: 'Brandon',
    lastName: 'Lee',
    persona: 'learner',
    department: 'warehouse',
    jobTitle: 'Receiving Clerk',
    onetCode: ONET_OCCUPATIONS.stocker,
    age: 26,
    gender: 'M',
    hireDate: '2022-10-24',
    managerId: 'tyrone.jackson@masgrocery.com',
  },
  {
    email: 'jerome.davis@masgrocery.com',
    displayName: 'Jerome Davis',
    firstName: 'Jerome',
    lastName: 'Davis',
    persona: 'learner',
    department: 'warehouse',
    jobTitle: 'Stocker',
    onetCode: ONET_OCCUPATIONS.stocker,
    age: 33,
    gender: 'M',
    hireDate: '2019-09-02',
    managerId: 'tyrone.jackson@masgrocery.com',
  },
  {
    email: 'billy.thompson@masgrocery.com',
    displayName: 'Billy Ray Thompson',
    firstName: 'Billy Ray',
    lastName: 'Thompson',
    persona: 'learner',
    department: 'warehouse',
    jobTitle: 'Forklift Operator',
    onetCode: ONET_OCCUPATIONS.stocker,
    age: 48,
    gender: 'M',
    hireDate: '2010-05-17',
    managerId: 'tyrone.jackson@masgrocery.com',
  },

  // Meat Department Staff
  {
    email: 'wei.zhang@masgrocery.com',
    displayName: 'Wei Zhang',
    firstName: 'Wei',
    lastName: 'Zhang',
    persona: 'learner',
    department: 'meat',
    jobTitle: 'Butcher',
    onetCode: ONET_OCCUPATIONS.butcher,
    age: 44,
    gender: 'F',
    hireDate: '2016-04-25',
    managerId: 'pa@masgrocery.com',
  },
  {
    email: 'michael.anderson@masgrocery.com',
    displayName: 'Michael Anderson',
    firstName: 'Michael',
    lastName: 'Anderson',
    persona: 'learner',
    department: 'meat',
    jobTitle: 'Head Butcher',
    onetCode: ONET_OCCUPATIONS.butcher,
    age: 62,
    gender: 'M',
    hireDate: '1998-08-10',
    managerId: 'pa@masgrocery.com',
  },
  {
    email: 'daniel.kim@masgrocery.com',
    displayName: 'Daniel Kim',
    firstName: 'Daniel',
    lastName: 'Kim',
    persona: 'learner',
    department: 'meat',
    jobTitle: 'Meat Clerk',
    onetCode: ONET_OCCUPATIONS.butcher,
    age: 30,
    gender: 'M',
    hireDate: '2021-12-01',
    managerId: 'pa@masgrocery.com',
  },

  // Produce Staff
  {
    email: 'patricia.moore@masgrocery.com',
    displayName: 'Patricia Moore',
    firstName: 'Patricia',
    lastName: 'Moore',
    persona: 'learner',
    department: 'produce',
    jobTitle: 'Produce Lead',
    onetCode: ONET_OCCUPATIONS.stocker,
    age: 55,
    gender: 'F',
    hireDate: '2007-03-05',
    managerId: 'ma@masgrocery.com',
  },
  {
    email: 'aisha.patel@masgrocery.com',
    displayName: 'Aisha Patel',
    firstName: 'Aisha',
    lastName: 'Patel',
    persona: 'learner',
    department: 'produce',
    jobTitle: 'Produce Clerk',
    onetCode: ONET_OCCUPATIONS.stocker,
    age: 36,
    gender: 'F',
    hireDate: '2020-11-16',
    managerId: 'ma@masgrocery.com',
  },
];

// =============================================================================
// ALL USERS COMBINED
// =============================================================================

export const ALL_USERS: MasGroceryUser[] = [
  CROSS_TENANT_ADMIN,
  ...OWNERS,
  ...EDITORS,
  ...MANAGERS,
  ...STAFF,
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate DiceBear avatar URL for a user
 */
export function getAvatarUrl(email: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
}

/**
 * Get all users by persona
 */
export function getUsersByPersona(persona: Persona): MasGroceryUser[] {
  return ALL_USERS.filter((user) => user.persona === persona);
}

/**
 * Get all users by department
 */
export function getUsersByDepartment(departmentId: DepartmentId): MasGroceryUser[] {
  return ALL_USERS.filter((user) => user.department === departmentId);
}

/**
 * Get users managed by a specific manager
 */
export function getDirectReports(managerEmail: string): MasGroceryUser[] {
  return ALL_USERS.filter((user) => user.managerId === managerEmail);
}

/**
 * User count summary
 */
export const USER_COUNTS = {
  total: ALL_USERS.length,
  owners: OWNERS.length + 1, // +1 for cross-tenant admin
  editors: EDITORS.length,
  managers: MANAGERS.length,
  learners: STAFF.length,
} as const;
