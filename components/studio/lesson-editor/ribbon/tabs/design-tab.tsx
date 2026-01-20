'use client';

/**
 * DesignTab - Visual design and theming ribbon tab
 * Contains: Theme, Colors, Typography, Background, Animations, Branding
 */

import {
  Brush,
  Droplets,
  ImageIcon,
  Layout,
  LayoutGrid,
  Moon,
  Palette,
  PanelLeft,
  PanelRight,
  PanelTop,
  Sparkles,
  Sun,
  SwatchBook,
  Type,
  Wand2,
} from 'lucide-react';
import {
  type GalleryItem,
  RibbonButton,
  RibbonColorPicker,
  RibbonCombobox,
  RibbonContent,
  RibbonDropdown,
  RibbonGallery,
  RibbonGroup,
  RibbonSeparator,
  RibbonToggleGroup,
} from '@/components/ribbon';

// Super light blue for icons
const ICON = 'text-sky-400';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type LayoutType = 'single' | 'two-column' | 'sidebar-left' | 'sidebar-right';

export interface DesignTabProps {
  // Theme settings
  currentTheme?: string;
  themeMode?: ThemeMode;
  onThemeChange?: (theme: string) => void;
  onThemeModeChange?: (mode: ThemeMode) => void;

  // Color settings
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  onPrimaryColorChange?: (color: string) => void;
  onAccentColorChange?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  onFontFamilyChange?: (font: string) => void;
  onFontSizeChange?: (size: string) => void;
  onLineHeightChange?: (height: string) => void;

  // Layout
  layoutType?: LayoutType;
  contentWidth?: string;
  onLayoutChange?: (layout: LayoutType) => void;
  onContentWidthChange?: (width: string) => void;

  // Background
  onSetBackgroundImage?: () => void;
  onSetBackgroundPattern?: () => void;
  onClearBackground?: () => void;

  // Animations
  animationsEnabled?: boolean;
  transitionSpeed?: 'none' | 'slow' | 'normal' | 'fast';
  onAnimationsToggle?: (enabled: boolean) => void;
  onTransitionSpeedChange?: (speed: string) => void;

  // Branding
  onApplyBranding?: () => void;
  onResetToDefault?: () => void;
}

const _THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'modern', label: 'Modern' },
  { value: 'playful', label: 'Playful' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'custom', label: 'Custom' },
];

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'opensans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'sourcesans', label: 'Source Sans Pro' },
];

const FONT_SIZE_OPTIONS = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

const LINE_HEIGHT_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' },
];

const CONTENT_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow (600px)' },
  { value: 'normal', label: 'Normal (800px)' },
  { value: 'wide', label: 'Wide (1000px)' },
  { value: 'full', label: 'Full Width' },
];

const TRANSITION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

const themeGalleryItems: GalleryItem[] = [
  { id: 'default', label: 'Default', preview: <SwatchBook className={`h-5 w-5 ${ICON}`} /> },
  { id: 'corporate', label: 'Corporate', preview: <Layout className={`h-5 w-5 ${ICON}`} /> },
  { id: 'modern', label: 'Modern', preview: <Sparkles className={`h-5 w-5 ${ICON}`} /> },
  { id: 'playful', label: 'Playful', preview: <Brush className={`h-5 w-5 ${ICON}`} /> },
  { id: 'minimal', label: 'Minimal', preview: <PanelTop className={`h-5 w-5 ${ICON}`} /> },
];

export function DesignTab({
  currentTheme = 'default',
  themeMode = 'light',
  onThemeChange,
  onThemeModeChange,
  primaryColor = '#0072f5',
  accentColor = '#8b5cf6',
  backgroundColor = '#ffffff',
  textColor = '#1a1a2e',
  onPrimaryColorChange,
  onAccentColorChange,
  onBackgroundColorChange,
  onTextColorChange,
  fontFamily = 'inter',
  fontSize = 'base',
  lineHeight = 'normal',
  onFontFamilyChange,
  onFontSizeChange,
  onLineHeightChange,
  layoutType = 'single',
  contentWidth = 'normal',
  onLayoutChange,
  onContentWidthChange,
  onSetBackgroundImage,
  onSetBackgroundPattern,
  onClearBackground,
  animationsEnabled = true,
  transitionSpeed = 'normal',
  onAnimationsToggle,
  onTransitionSpeedChange,
  onApplyBranding,
  onResetToDefault,
}: DesignTabProps) {
  const handleLayoutChange = (value: string | string[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    if (val) {
      onLayoutChange?.(val as LayoutType);
    }
  };

  const handleThemeModeChange = (value: string | string[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    if (val) {
      onThemeModeChange?.(val as ThemeMode);
    }
  };

  return (
    <RibbonContent>
      {/* Theme Group */}
      <RibbonGroup label="Theme">
        <div className="flex items-center gap-1">
          <RibbonGallery
            items={themeGalleryItems}
            onSelect={onThemeChange || (() => {})}
            value={currentTheme}
            columns={3}
            label="Themes"
          />
          <div className="flex flex-col gap-0.5 ml-1">
            <RibbonToggleGroup
              type="single"
              value={themeMode}
              onValueChange={handleThemeModeChange}
              items={[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
              ]}
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Colors Group */}
      <RibbonGroup label="Colors">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <RibbonColorPicker
                value={primaryColor}
                onSelect={onPrimaryColorChange || (() => {})}
                icon={Palette}
                label="Primary"
              />
              <span className="text-[10px] text-gray-500 w-14">Primary</span>
            </div>
            <div className="flex items-center gap-1">
              <RibbonColorPicker
                value={accentColor}
                onSelect={onAccentColorChange || (() => {})}
                icon={Droplets}
                label="Accent"
              />
              <span className="text-[10px] text-gray-500 w-14">Accent</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <RibbonColorPicker
                value={backgroundColor}
                onSelect={onBackgroundColorChange || (() => {})}
                icon={PanelTop}
                label="Background"
              />
              <span className="text-[10px] text-gray-500 w-14">Bg</span>
            </div>
            <div className="flex items-center gap-1">
              <RibbonColorPicker
                value={textColor}
                onSelect={onTextColorChange || (() => {})}
                icon={Type}
                label="Text"
              />
              <span className="text-[10px] text-gray-500 w-14">Text</span>
            </div>
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Typography Group */}
      <RibbonGroup label="Typography">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Type className={`h-4 w-4 ${ICON}`} />
            <RibbonCombobox
              options={FONT_OPTIONS}
              value={fontFamily}
              onSelect={onFontFamilyChange || (() => {})}
              placeholder="Font"
              width={100}
            />
          </div>
          <div className="flex items-center gap-1">
            <RibbonDropdown
              options={FONT_SIZE_OPTIONS}
              value={fontSize}
              onValueChange={onFontSizeChange}
              placeholder="Size"
            />
            <RibbonDropdown
              options={LINE_HEIGHT_OPTIONS}
              value={lineHeight}
              onValueChange={onLineHeightChange}
              placeholder="Line"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Layout Group */}
      <RibbonGroup label="Layout">
        <div className="flex items-center gap-1">
          <RibbonToggleGroup
            type="single"
            value={layoutType}
            onValueChange={handleLayoutChange}
            items={[
              { value: 'single', icon: PanelTop, label: 'Single Column' },
              { value: 'two-column', icon: LayoutGrid, label: 'Two Columns' },
              { value: 'sidebar-left', icon: PanelLeft, label: 'Left Sidebar' },
              { value: 'sidebar-right', icon: PanelRight, label: 'Right Sidebar' },
            ]}
          />
          <RibbonDropdown
            options={CONTENT_WIDTH_OPTIONS}
            value={contentWidth}
            onValueChange={onContentWidthChange}
            placeholder="Width"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Background Group */}
      <RibbonGroup label="Background">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<ImageIcon className={`h-5 w-5 ${ICON}`} />}
            label="Image"
            size="lg"
            onClick={onSetBackgroundImage}
            tooltip="Set background image"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<LayoutGrid className={`h-4 w-4 ${ICON}`} />}
              onClick={onSetBackgroundPattern}
              tooltip="Set pattern"
            />
            <RibbonButton
              icon={<Brush className={`h-4 w-4 ${ICON}`} />}
              onClick={onClearBackground}
              tooltip="Clear background"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Animations Group */}
      <RibbonGroup label="Animations">
        <div className="flex items-center gap-2">
          <RibbonButton
            icon={<Sparkles className={`h-5 w-5 ${ICON}`} />}
            label="Effects"
            size="lg"
            active={animationsEnabled}
            onClick={() => onAnimationsToggle?.(!animationsEnabled)}
            tooltip={animationsEnabled ? 'Disable animations' : 'Enable animations'}
          />
          <RibbonDropdown
            options={TRANSITION_OPTIONS}
            value={transitionSpeed}
            onValueChange={onTransitionSpeedChange}
            placeholder="Speed"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Branding Group */}
      <RibbonGroup label="Branding">
        <div className="flex items-center gap-1">
          <RibbonButton
            icon={<SwatchBook className={`h-5 w-5 ${ICON}`} />}
            label="Apply Brand"
            size="lg"
            onClick={onApplyBranding}
            tooltip="Apply organization branding"
          />
          <RibbonButton
            icon={<Wand2 className={`h-4 w-4 ${ICON}`} />}
            onClick={onResetToDefault}
            tooltip="Reset to defaults"
          />
        </div>
      </RibbonGroup>
    </RibbonContent>
  );
}
