'use client';

import { cn } from '@/lib/utils';

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  category: 'news' | 'update' | 'bugfix' | 'feature';
  title?: string;
  description?: string;
  changes?: string[];
}

interface ChangelogCardProps {
  entries: ChangelogEntry[];
  className?: string;
}

export function ChangelogCard({ entries, className }: ChangelogCardProps): React.JSX.Element {
  const categoryStyles = {
    news: 'bg-brand-primary/10 text-brand-blue dark:text-brand-cyan',
    update: 'bg-brand-success/10 text-green-600 dark:text-brand-success',
    bugfix: 'bg-brand-error/10 text-red-600 dark:text-brand-error',
    feature: 'bg-brand-secondary/10 text-purple-600 dark:text-brand-purple',
  };

  const categoryLabels = {
    news: 'News',
    update: 'Update',
    bugfix: 'Bug fix',
    feature: 'Feature',
  };

  return (
    <div className={cn('bg-card border-2 border-border rounded-[10px] p-6', className)}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Changelog</h3>
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={cn(
              'relative pl-6',
              index !== entries.length - 1 && 'pb-6 border-l-2 border-border',
            )}
          >
            {/* Timeline Dot */}
            <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-primary -translate-x-[7px]" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-foreground">{entry.version}</span>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  categoryStyles[entry.category],
                )}
              >
                {categoryLabels[entry.category]}
              </span>
            </div>

            {/* Title */}
            {entry.title && (
              <h4 className="text-sm font-medium text-foreground mb-1">{entry.title}</h4>
            )}

            {/* Description */}
            {entry.description && (
              <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
            )}

            {/* Changes List */}
            {entry.changes && entry.changes.length > 0 && (
              <ul className="space-y-1 mt-2">
                {entry.changes.map((change, changeIndex) => (
                  <li
                    key={changeIndex}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1.5">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
