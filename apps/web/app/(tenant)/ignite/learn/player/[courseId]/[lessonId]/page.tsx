'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';

/**
 * Course Player page - Main lesson delivery interface
 * This page loads the full player shell with content blocks
 */
export default function PlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);

  // TODO(LXD-413): Replace with actual player implementation
  // This is a placeholder that will be replaced with the full player shell
  return (
    <div className="flex flex-col h-full">
      {/* Player header will go here */}
      <div className="h-14 bg-lxd-dark-surface border-b border-lxd-dark-border flex items-center px-4">
        <span className="text-sm text-muted-foreground">
          Course: {courseId} | Lesson: {lessonId}
        </span>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center bg-lxd-dark-bg">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-brand-primary mb-4">Course Player</h1>
          <p className="text-muted-foreground mb-2">
            Full player shell will be implemented in Phase 3
          </p>
          <p className="text-sm text-muted-foreground">This page will include:</p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Content blocks rendering</li>
            <li>• Navigation controls</li>
            <li>• Progress tracking</li>
            <li>• xAPI statement generation</li>
            <li>• Adaptive learning panel</li>
            <li>• Glass Box AI explainability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
