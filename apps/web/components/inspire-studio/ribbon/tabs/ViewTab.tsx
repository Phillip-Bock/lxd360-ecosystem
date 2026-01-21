'use client';

/**
 * =============================================================================
 * INSPIRE Studio | View Tab Component
 * =============================================================================
 *
 * View options and display settings.
 * Includes zoom, preview modes, grid/guides, panels, and window arrangement.
 */

import {
  AlignHorizontalJustifyCenter,
  BookOpen,
  Columns,
  Contrast,
  // Views
  Eye,
  FolderTree,
  Fullscreen,
  // Grid & Guides
  Grid3x3,
  Layers,
  LayoutDashboard,
  // Navigation
  List,
  // Navigation icon
  MapIcon,
  Maximize,
  Monitor,
  // Other
  Moon,
  Palette,
  PanelBottom,
  // Panels
  PanelLeft,
  PanelRight,
  // Preview
  Play,
  Ruler,
  Search,
  // Tools
  Settings,
  SkipForward,
  SlidersHorizontal,
  Smartphone,
  // Split view
  SplitSquareHorizontal,
  SplitSquareVertical,
  Sun,
  Tablet,
  // Zoom
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';
import {
  RibbonButton,
  RibbonDropdown,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
  RibbonToggle,
} from '../groups';

interface ViewTabProps {
  zoomLevel?: number;
  showGrid?: boolean;
  showRulers?: boolean;
  darkMode?: boolean;
  onAction?: (action: string, value?: unknown) => void;
}

export function ViewTab({
  zoomLevel = 100,
  showGrid = false,
  showRulers = true,
  darkMode = true,
  onAction,
}: ViewTabProps) {
  const [gridVisible, setGridVisible] = useState(showGrid);
  const [rulersVisible, setRulersVisible] = useState(showRulers);
  const [isDarkMode, setIsDarkMode] = useState(darkMode);

  const handleAction = (action: string, value?: unknown) => {
    onAction?.(action, value);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: ZOOM
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Zoom">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Search}
            label={`${zoomLevel}%`}
            size="large"
            onClick={() => handleAction('fitToWidth')}
            menuItems={[
              { label: '50%', onClick: () => handleAction('zoom', 50) },
              { label: '75%', onClick: () => handleAction('zoom', 75) },
              { label: '100%', onClick: () => handleAction('zoom', 100) },
              { label: '125%', onClick: () => handleAction('zoom', 125) },
              { label: '150%', onClick: () => handleAction('zoom', 150) },
              { label: '200%', onClick: () => handleAction('zoom', 200) },
              { type: 'separator' },
              { label: 'Fit to Width', onClick: () => handleAction('fitToWidth') },
              { label: 'Fit to Page', onClick: () => handleAction('fitToPage') },
              { label: 'Actual Size', onClick: () => handleAction('actualSize') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={ZoomIn}
              label="Zoom In"
              size="small"
              onClick={() => handleAction('zoomIn')}
              tooltip="Zoom in (Ctrl++)"
            />
            <RibbonButton
              icon={ZoomOut}
              label="Zoom Out"
              size="small"
              onClick={() => handleAction('zoomOut')}
              tooltip="Zoom out (Ctrl+-)"
            />
            <RibbonButton
              icon={Maximize}
              label="Fit"
              size="small"
              onClick={() => handleAction('fitToWidth')}
              tooltip="Fit to width"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: PREVIEW DEVICES
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Preview">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Eye}
            label="Preview"
            size="large"
            onClick={() => handleAction('preview')}
            menuItems={[
              { label: 'Preview in New Tab', onClick: () => handleAction('previewNewTab') },
              { label: 'Preview Current Section', onClick: () => handleAction('previewSection') },
              { label: 'Preview from Beginning', onClick: () => handleAction('previewStart') },
              { type: 'separator' },
              {
                icon: Monitor,
                label: 'Desktop',
                onClick: () => handleAction('previewDevice', 'desktop'),
              },
              {
                icon: Tablet,
                label: 'Tablet',
                onClick: () => handleAction('previewDevice', 'tablet'),
              },
              {
                icon: Smartphone,
                label: 'Mobile',
                onClick: () => handleAction('previewDevice', 'mobile'),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Monitor}
              label="Desktop"
              size="small"
              onClick={() => handleAction('previewDevice', 'desktop')}
              tooltip="Desktop view"
            />
            <RibbonButton
              icon={Tablet}
              label="Tablet"
              size="small"
              onClick={() => handleAction('previewDevice', 'tablet')}
              tooltip="Tablet view"
            />
            <RibbonButton
              icon={Smartphone}
              label="Mobile"
              size="small"
              onClick={() => handleAction('previewDevice', 'mobile')}
              tooltip="Mobile view"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: PLAYER CONTROLS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Player">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={Play}
            label="Play"
            size="large"
            onClick={() => handleAction('playPreview')}
            tooltip="Start preview playback"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={SkipForward}
              label="Next"
              size="small"
              onClick={() => handleAction('nextSlide')}
              tooltip="Next slide"
            />
            <RibbonButton
              icon={Fullscreen}
              label="Fullscreen"
              size="small"
              onClick={() => handleAction('fullscreen')}
              tooltip="Fullscreen preview"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: GRID & GUIDES
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Grid & Guides">
        <div className="flex items-center gap-0.5">
          <div className="flex flex-col gap-0.5">
            <RibbonToggle
              icon={Grid3x3}
              isActive={gridVisible}
              onClick={() => {
                setGridVisible(!gridVisible);
                handleAction('toggleGrid', !gridVisible);
              }}
              tooltip="Show/hide grid"
            />
            <RibbonToggle
              icon={Ruler}
              isActive={rulersVisible}
              onClick={() => {
                setRulersVisible(!rulersVisible);
                handleAction('toggleRulers', !rulersVisible);
              }}
              tooltip="Show/hide rulers"
            />
            <RibbonButton
              icon={AlignHorizontalJustifyCenter}
              onClick={() => handleAction('addGuide')}
              tooltip="Add guide"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonDropdown
              value="8"
              options={['4', '8', '12', '16', '24', '32']}
              onChange={(size) => handleAction('gridSize', size)}
              width={45}
              placeholder="Size"
            />
            <RibbonButton
              icon={Settings}
              label="Options"
              size="small"
              onClick={() => handleAction('gridOptions')}
              tooltip="Grid options"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: PANELS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Panels">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={LayoutDashboard}
            label="Panels"
            size="large"
            onClick={() => handleAction('toggleAllPanels')}
            menuItems={[
              { label: 'Show All Panels', onClick: () => handleAction('showAllPanels') },
              { label: 'Hide All Panels', onClick: () => handleAction('hideAllPanels') },
              { label: 'Reset Panel Layout', onClick: () => handleAction('resetPanels') },
              { type: 'separator' },
              {
                icon: PanelLeft,
                label: 'Left Sidebar',
                onClick: () => handleAction('toggleLeftPanel'),
              },
              {
                icon: PanelRight,
                label: 'Right Sidebar',
                onClick: () => handleAction('toggleRightPanel'),
              },
              {
                icon: PanelBottom,
                label: 'Bottom Panel',
                onClick: () => handleAction('toggleBottomPanel'),
              },
              { type: 'separator' },
              {
                icon: Layers,
                label: 'Layers Panel',
                onClick: () => handleAction('toggleLayersPanel'),
              },
              {
                icon: FolderTree,
                label: 'Structure Panel',
                onClick: () => handleAction('toggleStructurePanel'),
              },
              {
                icon: Palette,
                label: 'Properties Panel',
                onClick: () => handleAction('togglePropertiesPanel'),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonToggle
              icon={PanelLeft}
              isActive={true}
              onClick={() => handleAction('toggleLeftPanel')}
              tooltip="Toggle left sidebar"
            />
            <RibbonToggle
              icon={PanelRight}
              isActive={true}
              onClick={() => handleAction('toggleRightPanel')}
              tooltip="Toggle right sidebar"
            />
            <RibbonToggle
              icon={PanelBottom}
              isActive={false}
              onClick={() => handleAction('toggleBottomPanel')}
              tooltip="Toggle bottom panel"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: NAVIGATION
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Navigation">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={MapIcon}
            label="Navigate"
            size="large"
            onClick={() => handleAction('openNavigator')}
            menuItems={[
              { label: 'Mini Map', onClick: () => handleAction('toggleMiniMap') },
              { label: 'Outline View', onClick: () => handleAction('outlineView') },
              { label: 'Table of Contents', onClick: () => handleAction('tableOfContents') },
              { type: 'separator' },
              { label: 'Go to Slide...', onClick: () => handleAction('goToSlide') },
              { label: 'Go to Section...', onClick: () => handleAction('goToSection') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={List}
              label="Outline"
              size="small"
              onClick={() => handleAction('outlineView')}
              tooltip="Outline view"
            />
            <RibbonButton
              icon={BookOpen}
              label="Pages"
              size="small"
              onClick={() => handleAction('pageView')}
              tooltip="Page view"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: WINDOW
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Window">
        <div className="flex items-center gap-0.5">
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={SplitSquareHorizontal}
              label="Split H"
              size="small"
              onClick={() => handleAction('splitHorizontal')}
              tooltip="Split view horizontal"
            />
            <RibbonButton
              icon={SplitSquareVertical}
              label="Split V"
              size="small"
              onClick={() => handleAction('splitVertical')}
              tooltip="Split view vertical"
            />
            <RibbonButton
              icon={Columns}
              label="Tile"
              size="small"
              onClick={() => handleAction('tileWindows')}
              tooltip="Tile windows"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonToggle
              icon={isDarkMode ? Moon : Sun}
              isActive={isDarkMode}
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                handleAction('toggleDarkMode', !isDarkMode);
              }}
              tooltip={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            <RibbonButton
              icon={Contrast}
              label="Contrast"
              size="small"
              onClick={() => handleAction('highContrast')}
              tooltip="High contrast mode"
            />
            <RibbonButton
              icon={SlidersHorizontal}
              label="Settings"
              size="small"
              onClick={() => handleAction('viewSettings')}
              tooltip="View settings"
            />
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}
