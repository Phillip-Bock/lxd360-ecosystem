'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Design Tab Component
 * =============================================================================
 *
 * Styling and layout tools for customizing the visual appearance
 * of lessons. Includes themes, colors, typography, spacing, and backgrounds.
 */

import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Box,
  Circle,
  Contrast,
  Droplets,
  Frame,
  GalleryThumbnails,
  Grid3x3,
  Hexagon,
  Image,
  Layers,
  LayoutGrid,
  Maximize,
  Minimize,
  Moon,
  Paintbrush,
  Palette,
  PanelLeftDashed,
  PanelRightDashed,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  Sun,
  Triangle,
  Type,
} from 'lucide-react';
import { useState } from 'react';
import {
  RibbonButton,
  RibbonColorPicker,
  RibbonDropdown,
  RibbonGallery,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
} from '../groups';

interface DesignTabProps {
  currentTheme?: string;
  onDesignAction?: (action: string, value?: unknown) => void;
}

export function DesignTab({ currentTheme = 'default', onDesignAction }: DesignTabProps) {
  const [backgroundColor, setBackgroundColor] = useState('bg-studio-bg');
  const [accentColor, setAccentColor] = useState('bg-studio-accent');

  const handleAction = (action: string, value?: unknown) => {
    onDesignAction?.(action, value);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: THEMES
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Themes">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Palette}
            label="Themes"
            size="large"
            onClick={() => handleAction('openThemes')}
            menuItems={[
              { label: 'Default Dark', onClick: () => handleAction('theme', 'default-dark') },
              { label: 'Default Light', onClick: () => handleAction('theme', 'default-light') },
              { label: 'Corporate Blue', onClick: () => handleAction('theme', 'corporate-blue') },
              { label: 'Modern Purple', onClick: () => handleAction('theme', 'modern-purple') },
              { label: 'Nature Green', onClick: () => handleAction('theme', 'nature-green') },
              { label: 'Warm Orange', onClick: () => handleAction('theme', 'warm-orange') },
              { type: 'separator' },
              { label: 'Browse Themes...', onClick: () => handleAction('browseThemes') },
              { label: 'Create Custom Theme...', onClick: () => handleAction('createTheme') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Moon}
              label="Dark"
              size="small"
              onClick={() => handleAction('themeMode', 'dark')}
              tooltip="Dark mode"
              isActive={currentTheme.includes('dark')}
            />
            <RibbonButton
              icon={Sun}
              label="Light"
              size="small"
              onClick={() => handleAction('themeMode', 'light')}
              tooltip="Light mode"
              isActive={currentTheme.includes('light')}
            />
            <RibbonButton
              icon={Contrast}
              label="High Contrast"
              size="small"
              onClick={() => handleAction('themeMode', 'high-contrast')}
              tooltip="High contrast mode"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: COLORS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Colors">
        <div className="flex items-center gap-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-studio-text-muted w-14">Background</span>
              <RibbonColorPicker
                icon={Paintbrush}
                color={backgroundColor}
                onChange={(color) => {
                  setBackgroundColor(color);
                  handleAction('backgroundColor', color);
                }}
                tooltip="Background color"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-studio-text-muted w-14">Accent</span>
              <RibbonColorPicker
                icon={Droplets}
                color={accentColor}
                onChange={(color) => {
                  setAccentColor(color);
                  handleAction('accentColor', color);
                }}
                tooltip="Accent color"
              />
            </div>
          </div>
          <RibbonButton
            icon={Sparkles}
            label="Auto"
            size="small"
            onClick={() => handleAction('autoColors')}
            tooltip="Auto-generate color palette"
            gradient
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: TYPOGRAPHY
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Typography">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Type}
            label="Fonts"
            size="large"
            onClick={() => handleAction('openFonts')}
            menuItems={[
              { label: 'Heading: Inter', onClick: () => handleAction('headingFont', 'Inter') },
              {
                label: 'Heading: Montserrat',
                onClick: () => handleAction('headingFont', 'Montserrat'),
              },
              { label: 'Heading: Poppins', onClick: () => handleAction('headingFont', 'Poppins') },
              { type: 'separator' },
              { label: 'Body: Inter', onClick: () => handleAction('bodyFont', 'Inter') },
              { label: 'Body: Open Sans', onClick: () => handleAction('bodyFont', 'Open Sans') },
              { label: 'Body: Lato', onClick: () => handleAction('bodyFont', 'Lato') },
              { type: 'separator' },
              { label: 'Font Settings...', onClick: () => handleAction('fontSettings') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonDropdown
              value="16"
              options={['12', '14', '16', '18', '20', '24']}
              onChange={(size) => handleAction('baseFontSize', size)}
              width={50}
              placeholder="Base"
            />
            <RibbonDropdown
              value="1.5"
              options={['1.0', '1.25', '1.5', '1.75', '2.0']}
              onChange={(spacing) => handleAction('lineHeight', spacing)}
              width={50}
              placeholder="Line"
            />
            <RibbonDropdown
              value="normal"
              options={['tight', 'normal', 'relaxed', 'loose']}
              onChange={(spacing) => handleAction('letterSpacing', spacing)}
              width={70}
              placeholder="Letter"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: PAGE LAYOUT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Page Layout">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={LayoutGrid}
            label="Layout"
            size="large"
            onClick={() => handleAction('openLayout')}
            menuItems={[
              { label: 'Full Width', onClick: () => handleAction('pageLayout', 'full') },
              {
                label: 'Centered (900px)',
                onClick: () => handleAction('pageLayout', 'centered-900'),
              },
              {
                label: 'Centered (1200px)',
                onClick: () => handleAction('pageLayout', 'centered-1200'),
              },
              { label: 'Split (Sidebar)', onClick: () => handleAction('pageLayout', 'split') },
              { type: 'separator' },
              { label: 'Custom Width...', onClick: () => handleAction('customWidth') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Maximize}
              label="Wide"
              size="small"
              onClick={() => handleAction('contentWidth', 'wide')}
              tooltip="Full width content"
            />
            <RibbonButton
              icon={Minimize}
              label="Narrow"
              size="small"
              onClick={() => handleAction('contentWidth', 'narrow')}
              tooltip="Narrow content"
            />
            <RibbonButton
              icon={SlidersHorizontal}
              label="Spacing"
              size="small"
              onClick={() => handleAction('spacingSettings')}
              tooltip="Content spacing"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: BACKGROUNDS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Background">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Image}
            label="Background"
            size="large"
            onClick={() => handleAction('openBackgrounds')}
            menuItems={[
              { label: 'Solid Color', onClick: () => handleAction('background', 'solid') },
              { label: 'Gradient', onClick: () => handleAction('background', 'gradient') },
              { label: 'Image', onClick: () => handleAction('background', 'image') },
              { label: 'Pattern', onClick: () => handleAction('background', 'pattern') },
              { label: 'Video', onClick: () => handleAction('background', 'video') },
              { type: 'separator' },
              { label: 'Remove Background', onClick: () => handleAction('background', 'none') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={GalleryThumbnails}
              label="Gallery"
              size="small"
              onClick={() => handleAction('backgroundGallery')}
              tooltip="Background gallery"
            />
            <RibbonButton
              icon={Sparkles}
              label="Generate"
              size="small"
              gradient
              onClick={() => handleAction('generateBackground')}
              tooltip="AI generate background"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: SHAPES & BORDERS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Shapes">
        <div className="flex items-center gap-0.5">
          <RibbonGallery
            icon={Square}
            label="Shapes"
            columns={4}
            items={[
              { icon: Square, label: 'Square', onClick: () => handleAction('shape', 'square') },
              { icon: Circle, label: 'Circle', onClick: () => handleAction('shape', 'circle') },
              {
                icon: Triangle,
                label: 'Triangle',
                onClick: () => handleAction('shape', 'triangle'),
              },
              { icon: Star, label: 'Star', onClick: () => handleAction('shape', 'star') },
              { icon: Hexagon, label: 'Hexagon', onClick: () => handleAction('shape', 'hexagon') },
              { icon: Frame, label: 'Frame', onClick: () => handleAction('shape', 'frame') },
              {
                icon: PanelLeftDashed,
                label: 'Line',
                onClick: () => handleAction('shape', 'line'),
              },
              {
                icon: PanelRightDashed,
                label: 'Arrow',
                onClick: () => handleAction('shape', 'arrow'),
              },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Frame}
              label="Border"
              size="small"
              onClick={() => handleAction('borderSettings')}
              tooltip="Border settings"
            />
            <RibbonButton
              icon={Box}
              label="Shadow"
              size="small"
              onClick={() => handleAction('shadowSettings')}
              tooltip="Shadow settings"
            />
            <RibbonDropdown
              value="4"
              options={['0', '2', '4', '8', '12', '16', '24']}
              onChange={(radius) => handleAction('borderRadius', radius)}
              width={45}
              placeholder="Radius"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: ALIGNMENT
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Arrange">
        <div className="flex items-center gap-0.5">
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={AlignHorizontalJustifyCenter}
              label="H-Center"
              size="small"
              onClick={() => handleAction('alignHorizontal')}
              tooltip="Center horizontally"
            />
            <RibbonButton
              icon={AlignVerticalJustifyCenter}
              label="V-Center"
              size="small"
              onClick={() => handleAction('alignVertical')}
              tooltip="Center vertically"
            />
            <RibbonButton
              icon={Grid3x3}
              label="Grid"
              size="small"
              onClick={() => handleAction('alignToGrid')}
              tooltip="Align to grid"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Layers}
              label="Front"
              size="small"
              onClick={() => handleAction('bringToFront')}
              tooltip="Bring to front"
            />
            <RibbonButton
              icon={Layers}
              label="Back"
              size="small"
              onClick={() => handleAction('sendToBack')}
              tooltip="Send to back"
            />
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}
