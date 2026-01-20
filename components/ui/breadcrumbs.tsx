import * as React from 'react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const items = React.Children.toArray(children);

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)} {...props}>
      <ol className="flex items-center gap-1.5">
        {items.map((child, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <svg
                className="h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
            {child}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface BreadcrumbsItemProps extends React.HTMLAttributes<HTMLElement> {
  href?: string;
}

export function BreadcrumbsItem({ className, href, children, ...props }: BreadcrumbsItemProps) {
  if (href) {
    return (
      <a
        href={href}
        className={cn('text-muted-foreground hover:text-foreground transition-colors', className)}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <span className={cn('text-foreground font-medium', className)} {...props}>
      {children}
    </span>
  );
}
