/**
 * LXP360 Mock Data
 * Comprehensive sample data for the Learning Experience Platform
 *
 * @deprecated These mock data files are retained as a reference for the seed script
 * (`scripts/seed-demo-data.ts`). For production code, use the Firestore services
 * and React hooks in `lib/firestore/services` and `hooks/firestore`.
 *
 * Migration path:
 * - For Firestore queries: import from '@/lib/firestore/services'
 * - For React components: import hooks from '@/hooks/firestore'
 *
 * This module will be removed in a future release once all inline mock data
 * has been migrated to Firestore.
 */

export * from './badges';
export * from './calendar-events';
export * from './compliance';
export * from './courses';
export * from './discussions';
export * from './groups';
export * from './learning-paths';
export * from './progress';
export * from './skills';
export * from './users';
export * from './xapi-statements';
