'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Interactions Tab Component
 * =============================================================================
 *
 * Interactive elements and advanced content features including
 * accordions, tabs, carousels, flip cards, timelines, hotspots,
 * branching scenarios, and gamification elements.
 */

import {
  ArrowLeftRight,
  ArrowUpDown,
  // Progress
  BarChart2,
  // Triggers
  Bell,
  CheckCircle,
  Clock,
  Crosshair,
  // Reveal interactions
  Eye,
  Flame,
  GalleryHorizontal,
  GitBranch,
  // Scenario
  GitMerge,
  // Drag & Drop
  GripVertical,
  Layers,
  Maximize2,
  Medal,
  MousePointerClick,
  Network,
  // Interactive containers
  PanelTop,
  // Animation
  Play,
  RefreshCw,
  ScrollText,
  Sparkles,
  Star,
  Target,
  Timer,
  ToggleLeft,
  TreeDeciduous,
  TrendingUp,
  // Gamification
  Trophy,
  Zap,
} from 'lucide-react';

import {
  RibbonButton,
  RibbonDropdown,
  RibbonGallery,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
} from '../groups';

interface InteractionsTabProps {
  onInsert?: (type: string, options?: unknown) => void;
  onAction?: (action: string, options?: unknown) => void;
}

export function InteractionsTab({ onInsert, onAction }: InteractionsTabProps) {
  const handleInsert = (type: string, options?: unknown) => {
    onInsert?.(type, options);
  };

  const handleAction = (action: string, options?: unknown) => {
    onAction?.(action, options);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: CONTAINERS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Containers">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={PanelTop}
            label="Interactive"
            size="large"
            columns={3}
            items={[
              { icon: PanelTop, label: 'Accordion', onClick: () => handleInsert('accordion') },
              { icon: PanelTop, label: 'Tabs', onClick: () => handleInsert('tabs') },
              {
                icon: GalleryHorizontal,
                label: 'Carousel',
                onClick: () => handleInsert('carousel'),
              },
              { icon: Layers, label: 'Flip Cards', onClick: () => handleInsert('flipcard') },
              { icon: Clock, label: 'Timeline', onClick: () => handleInsert('timeline') },
              { icon: GitBranch, label: 'Process', onClick: () => handleInsert('process') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={PanelTop}
              label="Accordion"
              size="small"
              onClick={() => handleInsert('accordion')}
              tooltip="Expandable accordion"
            />
            <RibbonButton
              icon={PanelTop}
              label="Tabs"
              size="small"
              onClick={() => handleInsert('tabs')}
              tooltip="Tab panels"
            />
            <RibbonButton
              icon={GalleryHorizontal}
              label="Carousel"
              size="small"
              onClick={() => handleInsert('carousel')}
              tooltip="Image/content carousel"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: REVEAL INTERACTIONS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Reveal">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Eye}
            label="Click Reveal"
            size="large"
            onClick={() => handleInsert('clickReveal')}
            menuItems={[
              { label: 'Click to Reveal', onClick: () => handleInsert('clickReveal') },
              { label: 'Hover to Reveal', onClick: () => handleInsert('hoverReveal') },
              { label: 'Progressive Reveal', onClick: () => handleInsert('progressiveReveal') },
              { label: 'Scroll Reveal', onClick: () => handleInsert('scrollReveal') },
              { type: 'separator' },
              { label: 'Lightbox', onClick: () => handleInsert('lightbox') },
              { label: 'Modal Popup', onClick: () => handleInsert('modal') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Crosshair}
              label="Hotspots"
              size="small"
              onClick={() => handleInsert('hotspot')}
              tooltip="Interactive hotspots"
            />
            <RibbonButton
              icon={Maximize2}
              label="Lightbox"
              size="small"
              onClick={() => handleInsert('lightbox')}
              tooltip="Lightbox viewer"
            />
            <RibbonButton
              icon={ToggleLeft}
              label="Toggle"
              size="small"
              onClick={() => handleInsert('toggle')}
              tooltip="Toggle switch"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: DRAG & DROP
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Drag & Drop">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={GripVertical}
            label="Drag Drop"
            size="large"
            onClick={() => handleInsert('dragDrop')}
            menuItems={[
              {
                label: 'Sorting (Vertical)',
                onClick: () => handleInsert('dragDrop', { type: 'sort-vertical' }),
              },
              {
                label: 'Sorting (Horizontal)',
                onClick: () => handleInsert('dragDrop', { type: 'sort-horizontal' }),
              },
              { label: 'Matching', onClick: () => handleInsert('dragDrop', { type: 'match' }) },
              {
                label: 'Categorization',
                onClick: () => handleInsert('dragDrop', { type: 'categorize' }),
              },
              {
                label: 'Label the Diagram',
                onClick: () => handleInsert('dragDrop', { type: 'label' }),
              },
              { type: 'separator' },
              { label: 'Free-form', onClick: () => handleInsert('dragDrop', { type: 'freeform' }) },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={ArrowUpDown}
              label="Sort"
              size="small"
              onClick={() => handleInsert('dragDrop', { type: 'sort' })}
              tooltip="Sortable list"
            />
            <RibbonButton
              icon={ArrowLeftRight}
              label="Match"
              size="small"
              onClick={() => handleInsert('dragDrop', { type: 'match' })}
              tooltip="Matching exercise"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: SCENARIOS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Scenarios">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={GitMerge}
            label="Branching"
            size="large"
            onClick={() => handleInsert('branchingScenario')}
            menuItems={[
              {
                label: 'Simple Branch (2 paths)',
                onClick: () => handleInsert('branchingScenario', { paths: 2 }),
              },
              {
                label: 'Complex Branch (3+ paths)',
                onClick: () => handleInsert('branchingScenario', { paths: 3 }),
              },
              { label: 'Decision Tree', onClick: () => handleInsert('decisionTree') },
              { label: 'Role Play Scenario', onClick: () => handleInsert('rolePlay') },
              { type: 'separator' },
              { label: 'Scenario Builder...', onClick: () => handleAction('openScenarioBuilder') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Network}
              label="Decision"
              size="small"
              onClick={() => handleInsert('decisionTree')}
              tooltip="Decision tree"
            />
            <RibbonButton
              icon={TreeDeciduous}
              label="Flow"
              size="small"
              onClick={() => handleInsert('processFlow')}
              tooltip="Process flowchart"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: GAMIFICATION
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Gamification">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={Trophy}
            label="Game Elements"
            size="large"
            columns={3}
            items={[
              {
                icon: Trophy,
                label: 'Trophy',
                color: 'rgb(245 158 11)',
                onClick: () => handleInsert('badge', { type: 'trophy' }),
              },
              {
                icon: Medal,
                label: 'Medal',
                color: 'rgb(99 102 241)',
                onClick: () => handleInsert('badge', { type: 'medal' }),
              },
              {
                icon: Star,
                label: 'Star',
                color: 'rgb(234 179 8)',
                onClick: () => handleInsert('badge', { type: 'star' }),
              },
              {
                icon: Zap,
                label: 'Points',
                color: 'rgb(34 197 94)',
                onClick: () => handleInsert('points'),
              },
              {
                icon: Flame,
                label: 'Streak',
                color: 'rgb(239 68 68)',
                onClick: () => handleInsert('streak'),
              },
              {
                icon: Target,
                label: 'Challenge',
                color: 'rgb(59 130 246)',
                onClick: () => handleInsert('challenge'),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={BarChart2}
              label="Leaderboard"
              size="small"
              onClick={() => handleInsert('leaderboard')}
              tooltip="Leaderboard"
            />
            <RibbonButton
              icon={TrendingUp}
              label="Progress"
              size="small"
              onClick={() => handleInsert('progressTracker')}
              tooltip="Progress tracker"
            />
            <RibbonButton
              icon={CheckCircle}
              label="Achievement"
              size="small"
              onClick={() => handleInsert('achievement')}
              tooltip="Achievement unlock"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: ANIMATIONS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Animation">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Play}
            label="Animate"
            size="large"
            onClick={() => handleAction('openAnimations')}
            menuItems={[
              { label: 'Fade In', onClick: () => handleAction('animation', 'fadeIn') },
              { label: 'Slide In', onClick: () => handleAction('animation', 'slideIn') },
              { label: 'Zoom In', onClick: () => handleAction('animation', 'zoomIn') },
              { label: 'Bounce', onClick: () => handleAction('animation', 'bounce') },
              { label: 'Flip', onClick: () => handleAction('animation', 'flip') },
              { type: 'separator' },
              { label: 'Custom Animation...', onClick: () => handleAction('customAnimation') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Sparkles}
              label="Effects"
              size="small"
              onClick={() => handleAction('openEffects')}
              tooltip="Visual effects"
            />
            <RibbonButton
              icon={RefreshCw}
              label="Transitions"
              size="small"
              onClick={() => handleAction('openTransitions')}
              tooltip="Page transitions"
            />
            <RibbonDropdown
              value="0.3s"
              options={['0.1s', '0.2s', '0.3s', '0.5s', '1s']}
              onChange={(duration) => handleAction('animationDuration', duration)}
              width={55}
              placeholder="Speed"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: TRIGGERS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Triggers">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={MousePointerClick}
            label="Triggers"
            size="large"
            onClick={() => handleAction('openTriggers')}
            menuItems={[
              { label: 'On Click', onClick: () => handleAction('trigger', 'click') },
              { label: 'On Hover', onClick: () => handleAction('trigger', 'hover') },
              { label: 'On Scroll', onClick: () => handleAction('trigger', 'scroll') },
              { label: 'On Timer', onClick: () => handleAction('trigger', 'timer') },
              { label: 'On Video End', onClick: () => handleAction('trigger', 'videoEnd') },
              { label: 'On Form Submit', onClick: () => handleAction('trigger', 'formSubmit') },
              { type: 'separator' },
              { label: 'Manage Triggers...', onClick: () => handleAction('manageTriggers') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Timer}
              label="Timer"
              size="small"
              onClick={() => handleInsert('timer')}
              tooltip="Countdown timer"
            />
            <RibbonButton
              icon={Bell}
              label="Notify"
              size="small"
              onClick={() => handleAction('addNotification')}
              tooltip="Show notification"
            />
            <RibbonButton
              icon={ScrollText}
              label="Scroll To"
              size="small"
              onClick={() => handleAction('addScrollTo')}
              tooltip="Scroll to element"
            />
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}
