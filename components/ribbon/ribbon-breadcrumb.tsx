'use client';

import { ChevronRight, Home, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
}

export interface RibbonBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  showHome?: boolean;
  onHomeClick?: () => void;
  maxItems?: number;
  className?: string;
}

export function RibbonBreadcrumb({
  items,
  separator = <ChevronRight className="h-3 w-3 text-(--ribbon-text)/40" />,
  showHome = true,
  onHomeClick,
  maxItems = 5,
  className = '',
}: RibbonBreadcrumbProps) {
  // Truncate items if needed
  const displayItems =
    items.length > maxItems
      ? [
          items[0],
          { id: 'ellipsis', label: '...', onClick: undefined },
          ...items.slice(-(maxItems - 2)),
        ]
      : items;

  return (
    <nav className={`flex items-center gap-1 text-sm ${className}`} aria-label="Breadcrumb">
      {showHome && (
        <>
          <button
            type="button"
            onClick={onHomeClick}
            className="p-1 rounded hover:bg-(--ribbon-hover) transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </button>
          {items.length > 0 && separator}
        </>
      )}

      {displayItems.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1">
          {index > 0 && separator}
          <BreadcrumbItemRenderer item={item} isLast={index === displayItems.length - 1} />
        </div>
      ))}
    </nav>
  );
}

interface BreadcrumbItemRendererProps {
  item: BreadcrumbItem;
  isLast: boolean;
}

function BreadcrumbItemRenderer({ item, isLast }: BreadcrumbItemRendererProps) {
  const baseClasses = 'flex items-center gap-1 px-2 py-1 rounded';

  if (item.id === 'ellipsis') {
    return <span className={`${baseClasses} text-(--ribbon-text)/50`}>...</span>;
  }

  if (isLast) {
    return (
      <span className={`${baseClasses} font-medium text-(--ribbon-text)`} aria-current="page">
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.label}
      </span>
    );
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={`${baseClasses} text-(--ribbon-text)/70 hover:text-(--ribbon-text) hover:bg-(--ribbon-hover) transition-colors`}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.label}
      </button>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        className={`${baseClasses} text-(--ribbon-text)/70 hover:text-(--ribbon-text) hover:bg-(--ribbon-hover) transition-colors`}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.label}
      </a>
    );
  }

  return (
    <span className={`${baseClasses} text-(--ribbon-text)/70`}>
      {item.icon && <item.icon className="h-4 w-4" />}
      {item.label}
    </span>
  );
}

// Specialized breadcrumb for course navigation
export interface CourseBreadcrumbProps {
  courseName?: string;
  moduleName?: string;
  lessonName?: string;
  onCourseClick?: () => void;
  onModuleClick?: () => void;
  className?: string;
}

export function CourseBreadcrumb({
  courseName,
  moduleName,
  lessonName,
  onCourseClick,
  onModuleClick,
  className = '',
}: CourseBreadcrumbProps) {
  const items: BreadcrumbItem[] = [];

  if (courseName) {
    items.push({
      id: 'course',
      label: courseName,
      onClick: onCourseClick,
    });
  }

  if (moduleName) {
    items.push({
      id: 'module',
      label: moduleName,
      onClick: onModuleClick,
    });
  }

  if (lessonName) {
    items.push({
      id: 'lesson',
      label: lessonName,
    });
  }

  return <RibbonBreadcrumb items={items} className={className} />;
}

// Breadcrumb with dropdown for each level
export interface BreadcrumbDropdownItem extends BreadcrumbItem {
  siblings?: Array<{ id: string; label: string; onClick: () => void }>;
}

export interface RibbonBreadcrumbDropdownProps {
  items: BreadcrumbDropdownItem[];
  className?: string;
}

export function RibbonBreadcrumbDropdown({ items, className = '' }: RibbonBreadcrumbDropdownProps) {
  return (
    <nav className={`flex items-center gap-1 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1 group relative">
          {index > 0 && <ChevronRight className="h-3 w-3 text-(--ribbon-text)/40" />}

          <button
            type="button"
            onClick={item.onClick}
            className={`
              flex items-center gap-1 px-2 py-1 rounded
              ${index === items.length - 1 ? 'font-medium text-(--ribbon-text)' : 'text-(--ribbon-text)/70 hover:text-(--ribbon-text)'}
              hover:bg-(--ribbon-hover) transition-colors
            `}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
            {item.siblings && item.siblings.length > 0 && (
              <ChevronRight className="h-3 w-3 rotate-90 ml-0.5" />
            )}
          </button>

          {/* Dropdown */}
          {item.siblings && item.siblings.length > 0 && (
            <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-50">
              <div className="bg-(--ribbon-bg) border border-(--ribbon-border) rounded-md shadow-lg py-1 min-w-[150px]">
                {item.siblings.map((sibling) => (
                  <button
                    key={sibling.id}
                    type="button"
                    onClick={sibling.onClick}
                    className={`
                      w-full px-3 py-1.5 text-left text-sm
                      hover:bg-(--ribbon-hover) transition-colors
                      ${sibling.id === item.id ? 'bg-(--ribbon-active) font-medium' : ''}
                    `}
                  >
                    {sibling.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
