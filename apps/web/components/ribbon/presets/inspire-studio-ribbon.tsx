'use client';

import {
  BookOpen,
  Brain,
  CheckCircle,
  FileText,
  Folder,
  HelpCircle,
  Layers,
  Lightbulb,
  type LucideIcon,
  PlayCircle,
  Plus,
  Rocket,
  Save,
  Settings,
  Share2,
  Sparkles,
  Target,
  Upload,
  Wand2,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Ribbon,
  RibbonBackstage,
  RibbonBackstageTrigger,
  RibbonButton,
  RibbonGroup,
  RibbonQuickAccess,
  RibbonSeparator,
  RibbonTab,
  RibbonTabList,
  RibbonTabPanel,
  RibbonTabs,
} from '../index';

// INSPIRE Methodology Phases
export const INSPIRE_PHASES = {
  investigate: {
    label: 'Investigate',
    icon: Lightbulb,
    color: 'text-yellow-500',
    description: 'Research and discovery phase',
  },
  nurture: {
    label: 'Nurture',
    icon: Brain,
    color: 'text-green-500',
    description: 'Develop and grow ideas',
  },
  structure: {
    label: 'Structure',
    icon: Layers,
    color: 'text-blue-500',
    description: 'Organize and plan content',
  },
  produce: {
    label: 'Produce',
    icon: Wand2,
    color: 'text-purple-500',
    description: 'Create learning materials',
  },
  implement: {
    label: 'Implement',
    icon: Rocket,
    color: 'text-orange-500',
    description: 'Deploy and distribute',
  },
  refine: {
    label: 'Refine',
    icon: Target,
    color: 'text-red-500',
    description: 'Iterate and improve',
  },
  evolve: {
    label: 'Evolve',
    icon: Sparkles,
    color: 'text-cyan-500',
    description: 'Continuous enhancement',
  },
} as const;

export type InspirePhase = keyof typeof INSPIRE_PHASES;

// Backstage Panel Configuration
export interface BackstagePanel {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

const defaultBackstagePanels: BackstagePanel[] = [
  {
    id: 'new',
    label: 'New',
    icon: Plus,
    content: <div className="p-8">Create new learning experience</div>,
  },
  {
    id: 'open',
    label: 'Open',
    icon: Folder,
    content: <div className="p-8">Open existing project</div>,
  },
  {
    id: 'save',
    label: 'Save',
    icon: Save,
    content: <div className="p-8">Save options</div>,
  },
  {
    id: 'share',
    label: 'Share & Export',
    icon: Share2,
    content: <div className="p-8">Share and export options</div>,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    content: <div className="p-8">Application settings</div>,
  },
];

export interface InspireStudioRibbonProps {
  currentPhase?: InspirePhase;
  onPhaseChange?: (phase: InspirePhase) => void;
  backstagePanels?: BackstagePanel[];
  showQuickAccess?: boolean;
  quickAccessActions?: Array<{
    id: string;
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onClick: () => void;
  }>;
}

export function InspireStudioRibbon({
  currentPhase = 'investigate',
  onPhaseChange,
  backstagePanels = defaultBackstagePanels,
  showQuickAccess = true,
  quickAccessActions,
}: InspireStudioRibbonProps) {
  const [backstageOpen, setBackstageOpen] = useState(false);

  const defaultQuickAccessActions = [
    { id: 'save', icon: Save, label: 'Save', onClick: () => {} },
    { id: 'preview', icon: PlayCircle, label: 'Preview', onClick: () => {} },
    { id: 'share', icon: Share2, label: 'Share', onClick: () => {} },
  ];

  const actions = quickAccessActions || defaultQuickAccessActions;

  return (
    <>
      <Ribbon defaultTab={currentPhase}>
        {showQuickAccess && <RibbonQuickAccess actions={actions} />}

        <RibbonTabs>
          <RibbonTabList>
            <RibbonBackstageTrigger
              onClick={() => setBackstageOpen(true)}
              className="bg-(--ribbon-accent) text-white"
            >
              File
            </RibbonBackstageTrigger>

            {Object.entries(INSPIRE_PHASES).map(([key, phase]) => (
              <RibbonTab key={key} value={key} onClick={() => onPhaseChange?.(key as InspirePhase)}>
                <phase.icon className={`h-4 w-4 mr-1 ${phase.color}`} />
                {phase.label}
              </RibbonTab>
            ))}
          </RibbonTabList>

          {/* Investigate Phase */}
          <RibbonTabPanel value="investigate">
            <RibbonGroup label="Research">
              <RibbonButton icon={<Lightbulb className="h-5 w-5" />} label="Brainstorm" size="lg" />
              <RibbonButton icon={<BookOpen className="h-5 w-5" />} label="Resources" size="lg" />
            </RibbonGroup>
            <RibbonSeparator />
            <RibbonGroup label="Analysis">
              <RibbonButton icon={<Brain className="h-4 w-4" />} />
              <RibbonButton icon={<Target className="h-4 w-4" />} />
              <RibbonButton icon={<HelpCircle className="h-4 w-4" />} />
            </RibbonGroup>
          </RibbonTabPanel>

          {/* Nurture Phase */}
          <RibbonTabPanel value="nurture">
            <RibbonGroup label="Development">
              <RibbonButton icon={<Brain className="h-5 w-5" />} label="Ideate" size="lg" />
              <RibbonButton icon={<Sparkles className="h-5 w-5" />} label="AI Assist" size="lg" />
            </RibbonGroup>
          </RibbonTabPanel>

          {/* Structure Phase */}
          <RibbonTabPanel value="structure">
            <RibbonGroup label="Organization">
              <RibbonButton icon={<Layers className="h-5 w-5" />} label="Outline" size="lg" />
              <RibbonButton icon={<FileText className="h-5 w-5" />} label="Modules" size="lg" />
            </RibbonGroup>
          </RibbonTabPanel>

          {/* Produce Phase */}
          <RibbonTabPanel value="produce">
            <RibbonGroup label="Create">
              <RibbonButton icon={<Wand2 className="h-5 w-5" />} label="Generate" size="lg" />
              <RibbonButton icon={<Upload className="h-5 w-5" />} label="Import" size="lg" />
            </RibbonGroup>
          </RibbonTabPanel>

          {/* Implement Phase */}
          <RibbonTabPanel value="implement">
            <RibbonGroup label="Deploy">
              <RibbonButton icon={<Rocket className="h-5 w-5" />} label="Publish" size="lg" />
              <RibbonButton icon={<Share2 className="h-5 w-5" />} label="Distribute" size="lg" />
            </RibbonGroup>
          </RibbonTabPanel>

          {/* Refine Phase */}
          <RibbonTabPanel value="refine">
            <RibbonGroup label="Optimize">
              <RibbonButton icon={<Target className="h-5 w-5" />} label="Analytics" size="lg" />
              <RibbonButton icon={<CheckCircle className="h-5 w-5" />} label="Feedback" size="lg" />
            </RibbonGroup>
          </RibbonTabPanel>

          {/* Evolve Phase */}
          <RibbonTabPanel value="evolve">
            <RibbonGroup label="Enhance">
              <RibbonButton icon={<Sparkles className="h-5 w-5" />} label="Iterate" size="lg" />
              <RibbonButton icon={<Zap className="h-5 w-5" />} label="Optimize" size="lg" />
            </RibbonGroup>
          </RibbonTabPanel>
        </RibbonTabs>
      </Ribbon>

      <RibbonBackstage
        open={backstageOpen}
        onOpenChange={setBackstageOpen}
        items={backstagePanels}
        defaultItem="new"
      />
    </>
  );
}
