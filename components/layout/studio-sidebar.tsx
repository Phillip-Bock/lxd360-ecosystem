'use client';

import {
  BarChart3,
  BookOpen,
  Code,
  FileText,
  Folder,
  GraduationCap,
  Home,
  Image,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

type StudioSidebarProps = React.ComponentProps<typeof Sidebar>;

// Navigation button component
function NavButton({
  icon: Icon,
  label,
  href,
  tooltip,
  isCurrent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  tooltip: string;
  isCurrent?: boolean;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const className = isCollapsed
    ? `flex items-center justify-center h-10 w-10 rounded-md text-white transition-all ${isCurrent ? 'bg-white/20' : 'bg-(--inspire-btn-default) hover:bg-(--inspire-btn-hover) active:bg-(--inspire-btn-active)'}`
    : `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white transition-all ${isCurrent ? 'bg-white/20' : 'bg-(--inspire-btn-default) hover:bg-(--inspire-btn-hover) active:bg-(--inspire-btn-active)'}`;

  return (
    <Link href={href} title={tooltip} className={className}>
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

// Button container that centers items when collapsed
function ButtonGroup({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  return (
    <div className={`space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>{children}</div>
  );
}

// Dashboard section with collapse trigger
function DashboardSection() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (isCollapsed) {
    return (
      <SidebarGroup className="px-2">
        <div className="flex flex-col items-center gap-2">
          <NavButton icon={Home} label="Dashboard" href="/" isCurrent tooltip="Dashboard" />
          <SidebarTrigger className="h-10 w-10 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-all" />
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="px-2">
      <div className="flex items-center gap-1">
        <NavButton icon={Home} label="Dashboard" href="/" isCurrent tooltip="Dashboard" />
        <SidebarTrigger className="h-10 w-10 shrink-0 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-all" />
      </div>
    </SidebarGroup>
  );
}

// Create section (Course, Assessment, Survey)
function CreateSection() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup className="px-2">
      {!isCollapsed && (
        <SidebarGroupLabel className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 px-1">
          Create
        </SidebarGroupLabel>
      )}
      <ButtonGroup>
        <NavButton icon={BookOpen} label="Course" href="/inspire-studio" tooltip="Create Course" />
        <NavButton
          icon={GraduationCap}
          label="Question Builder"
          href="/inspire-studio/question-builder"
          tooltip="Question Builder"
        />
        <NavButton
          icon={BarChart3}
          label="Survey Builder"
          href="/inspire-studio/survey-builder"
          tooltip="Survey Builder"
        />
      </ButtonGroup>
    </SidebarGroup>
  );
}

// Main navigation section (Themes, Media, Projects, etc.)
function MainNavSection() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup className="px-2">
      {!isCollapsed && (
        <SidebarGroupLabel className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 px-1">
          Libraries
        </SidebarGroupLabel>
      )}
      <ButtonGroup>
        <NavButton icon={Palette} label="Themes" href="/library/themes" tooltip="Themes" />
        <NavButton icon={Image} label="Media" href="/library/media" tooltip="Media Library" />
        <NavButton icon={Folder} label="Projects" href="/library/projects" tooltip="My Projects" />
        <NavButton
          icon={FileText}
          label="Templates"
          href="/library/templates"
          tooltip="Templates"
        />
        <NavButton icon={Code} label="Code" href="/library/code" tooltip="Code Snippets" />
      </ButtonGroup>
    </SidebarGroup>
  );
}

export default function StudioSidebar(props: StudioSidebarProps) {
  return (
    <Sidebar
      {...props}
      collapsible="icon"
      className="bg-(--inspire-sidebar-bg) border-(--inspire-sidebar-border) w-56 data-[state=collapsed]:w-16"
    >
      <SidebarContent className="bg-(--inspire-sidebar-bg) pt-4 flex flex-col gap-4">
        {/* Dashboard with collapse trigger */}
        <DashboardSection />

        {/* Create section */}
        <CreateSection />

        {/* Libraries section */}
        <MainNavSection />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
