'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CourseTypeModal } from '@/components/dashboard/CourseTypeModal';
import { getIcon } from '@/lib/config/navigationIcons';

interface NavigationItem {
  label: string;
  url?: string;
  action?: string;
  icon: string;
  roles: string[];
}

interface NavigationSection {
  sectionTitle?: string;
  sectionRoles?: string[];
  items: NavigationItem[];
}

interface DashboardNavigationProps {
  navigationData: NavigationSection[];
  selectedRole: string | null;
  onCourseTypeSelect: (route: string) => void;
}

export function DashboardNavigation({
  navigationData,
  selectedRole,
  onCourseTypeSelect,
}: DashboardNavigationProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionTitle: string): void => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const handleNavClick = (item: NavigationItem): void => {
    if (item.action === 'openModal') {
      setCourseModalOpen(true);
    } else if (item.url) {
      router.push(item.url);
    }
  };

  const handleCourseTypeSelect = (route: string): void => {
    onCourseTypeSelect(route);
    setCourseModalOpen(false);
  };

  // Check if an item is active - only one item can be active at a time
  // Dashboard requires exact match, other items use longest path match
  const isActive = (url?: string): boolean => {
    if (!url || !pathname) return false;

    // Dashboard links require exact match (e.g., /dashboard/lxd)
    const dashboardPattern = /^\/dashboard\/[^/]+$/;
    if (dashboardPattern.test(url)) {
      return pathname === url;
    }

    // For other items, check if current path starts with this URL
    // But only if no longer match exists
    if (pathname === url) return true;
    if (pathname.startsWith(`${url}/`)) {
      // Check if there's a more specific match in the navigation
      const allUrls = navigationData
        .flatMap((s) => s.items.map((i) => i.url))
        .filter(Boolean) as string[];
      const longerMatch = allUrls.find(
        (u) => u !== url && u.startsWith(url) && (pathname === u || pathname.startsWith(`${u}/`)),
      );
      return !longerMatch;
    }
    return false;
  };

  // Filter navigation based on selected role
  const filteredNavigation = navigationData
    .filter((section) => {
      if (section.sectionRoles && section.sectionRoles.length > 0) {
        return selectedRole && section.sectionRoles.includes(selectedRole);
      }
      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => selectedRole && item.roles.includes(selectedRole)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <nav className="p-4 space-y-1">
        {filteredNavigation.map((section, sectionIndex) => {
          const sectionKey = section.sectionTitle || `section-${sectionIndex}`;
          const isCollapsed = collapsedSections[sectionKey] || false;
          const hasTitle = Boolean(section.sectionTitle);

          return (
            <div key={sectionIndex} className="mb-2 last:mb-0">
              {hasTitle && (
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  <span>{section.sectionTitle}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map((item, itemIndex) => {
                    const IconComponent = getIcon(item.icon);
                    const active = isActive(item.url);
                    return (
                      <button
                        type="button"
                        key={item.url || `action-${sectionIndex}-${itemIndex}`}
                        onClick={() => handleNavClick(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-left ${
                          active ? 'text-brand-primary' : 'text-sidebar-foreground'
                        }`}
                        style={active ? { backgroundColor: 'var(--lxd-blue-light)' } : {}}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'rgba(4, 132, 203, 0.2)';
                            e.currentTarget.style.color = 'var(--lxd-blue-light)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = '';
                          }
                        }}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${active ? 'text-brand-primary' : 'text-muted-foreground'}`}
                        />
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <CourseTypeModal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onSelectType={handleCourseTypeSelect}
      />
    </>
  );
}
