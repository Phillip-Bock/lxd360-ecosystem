'use client';

import type React from 'react';

import { type AccessibilityPreset, useAccessibility } from './accessibility-provider';

// ============================================================================
// SECTION 1: COMPONENT PROPS & TYPES
// ============================================================================

interface AccessibilitySettingsPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;

  /** Callback to close the panel */
  onClose: () => void;

  /** Panel position */
  position?: 'left' | 'right' | 'modal';

  /** Whether to show as compact sidebar */
  compact?: boolean;
}

/**
 * Preset button configuration
 * Each preset addresses a specific neurodiversity need
 */
const PRESET_CONFIGS: {
  id: AccessibilityPreset;
  name: string;
  icon: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'default',
    name: 'Default',
    icon: '⚪',
    description: 'Standard settings',
    color: 'bg-brand-surface hover:bg-gray-200 border-brand-strong',
  },
  {
    id: 'dyslexia',
    name: 'Dyslexia',
    icon: '📖',
    description: 'OpenDyslexic font, screen tint, TTS',
    color: 'bg-amber-100 hover:bg-amber-200 border-amber-400',
  },
  {
    id: 'autism',
    name: 'Autism',
    icon: '🧩',
    description: 'Predictable layouts, sensory-friendly',
    color: 'bg-purple-100 hover:bg-purple-200 border-purple-400',
  },
  {
    id: 'adhd',
    name: 'ADHD',
    icon: '⚡',
    description: 'Focus mode, break reminders',
    color: 'bg-orange-100 hover:bg-orange-200 border-orange-400',
  },
  {
    id: 'hearing-impairment',
    name: 'Hearing',
    icon: '👂',
    description: 'Captions, visual indicators',
    color: 'bg-blue-100 hover:bg-blue-200 border-blue-400',
  },
  {
    id: 'low-vision',
    name: 'Low Vision',
    icon: '👁️',
    description: 'High contrast, large fonts',
    color: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-400',
  },
  {
    id: 'cognitive-ease',
    name: 'Cognitive Ease',
    icon: '🌿',
    description: 'Maximum simplification',
    color: 'bg-green-100 hover:bg-green-200 border-green-400',
  },
];

// ============================================================================
// SECTION 2: REUSABLE UI COMPONENTS
// ============================================================================

/**
 * Toggle Switch Component
 * Accessible toggle with label
 */
interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label
          htmlFor={id}
          className={`
            font-medium text-brand-primary dark:text-brand-primary
            ${disabled ? 'opacity-50' : 'cursor-pointer'}
          `}
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-brand-muted dark:text-lxd-muted">{description}</p>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 focus:outline-hidden 
          focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
          ${checked ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-brand-surface
            transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}

/**
 * Slider Component
 * Accessible range slider with value display
 */
interface SliderProps {
  id: string;
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

function Slider({
  id,
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  formatValue,
}: SliderProps): React.JSX.Element {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div className="py-3">
      <div className="flex justify-between mb-2">
        <label htmlFor={id} className="font-medium text-brand-primary dark:text-brand-primary">
          {label}
        </label>
        <span className="text-sm font-medium text-brand-blue dark:text-brand-cyan">
          {displayValue}
        </span>
      </div>
      {description && (
        <p className="text-sm text-brand-muted dark:text-lxd-muted mb-2">{description}</p>
      )}
      <input
        type="range"
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="
          w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
          dark:bg-brand-surface-hover accent-blue-600
        "
      />
      <div className="flex justify-between text-xs text-brand-muted mt-1">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

/**
 * Select Dropdown Component
 */
interface SelectProps<T extends string> {
  id: string;
  label: string;
  description?: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

function Select<T extends string>({
  id,
  label,
  description,
  value,
  onChange,
  options,
}: SelectProps<T>): React.JSX.Element {
  return (
    <div className="py-3">
      <label
        htmlFor={id}
        className="block font-medium text-brand-primary dark:text-brand-primary mb-1"
      >
        {label}
      </label>
      {description && (
        <p className="text-sm text-brand-muted dark:text-lxd-muted mb-2">{description}</p>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="
          w-full px-3 py-2 bg-brand-surface dark:bg-brand-surface
          border border-brand-strong dark:border-brand-default rounded-lg
          text-brand-primary dark:text-brand-primary
          focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Color Picker with Opacity Slider
 * For screen tint feature
 */
interface ColorPickerProps {
  label: string;
  description?: string;
  color: string;
  opacity: number;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  presetColors: { name: string; color: string }[];
}

function ColorPicker({
  label,
  description,
  color,
  opacity,
  onColorChange,
  onOpacityChange,
  presetColors,
}: ColorPickerProps): React.JSX.Element {
  return (
    <div className="py-3">
      <span className="block font-medium text-brand-primary dark:text-brand-primary mb-1">
        {label}
      </span>
      {description && (
        <p className="text-sm text-brand-muted dark:text-lxd-muted mb-2">{description}</p>
      )}

      {/* Preset color swatches */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presetColors.map((preset) => (
          <button
            type="button"
            key={preset.name}
            onClick={() => onColorChange(preset.color)}
            className={`
              w-8 h-8 rounded-full border-2 transition-transform
              hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary
              ${color === preset.color ? 'border-brand-primary scale-110' : 'border-brand-strong'}
            `}
            style={{ backgroundColor: preset.color }}
            title={preset.name}
            aria-label={`Select ${preset.name} tint`}
          />
        ))}

        {/* Custom color input */}
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer"
          title="Custom color"
        />
      </div>

      {/* Opacity slider */}
      <Slider
        id="screen-tint-opacity"
        label="Tint Intensity"
        value={opacity * 100}
        onChange={(v) => onOpacityChange(v / 100)}
        min={10}
        max={50}
        unit="%"
      />

      {/* Preview */}
      <div
        className="mt-2 h-12 rounded-lg border border-brand-strong flex items-center justify-center"
        style={{
          backgroundColor: color,
          opacity: opacity,
        }}
      >
        <span className="text-brand-primary font-medium mix-blend-difference">Preview</span>
      </div>
    </div>
  );
}

/**
 * Section Header Component
 */
interface SectionHeaderProps {
  title: string;
  icon: string;
  description?: string;
}

function SectionHeader({ title, icon, description }: SectionHeaderProps): React.JSX.Element {
  return (
    <div className="border-b border-brand-default dark:border-brand-default pb-2 mb-4">
      <h3 className="text-lg font-semibold text-brand-primary dark:text-brand-primary flex items-center gap-2">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-brand-muted dark:text-lxd-muted mt-1">{description}</p>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 3: MAIN PANEL COMPONENT
// ============================================================================

/**
 * Accessibility Settings Panel
 *
 * Comprehensive panel for managing all accessibility features.
 * Changes are applied immediately and persisted to localStorage.
 *
 * @example
 * ```tsx
 * <AccessibilitySettingsPanel
 *   isOpen={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   position="right"
 * />
 * ```
 */
export function AccessibilitySettingsPanel({
  isOpen,
  onClose,
  position = 'right',
}: AccessibilitySettingsPanelProps): React.JSX.Element | null {
  const {
    settings,
    currentPreset,
    applyPreset,
    resetToDefaults,
    toggleHighContrast,
    toggleReducedMotion,
    toggleFocusMode,
    toggleDyslexiaSupport,
    toggleAutismSupport,
    toggleCaptions,
    toggleReadingGuide,
    toggleBionicReading,
    setFontSize,
    setFontFamily,
    setLineHeight,
    setLetterSpacing,
    setScreenTint,
    setColorVisionMode,
    setBreakReminderInterval,
    setTimeExtension,
    setTTSSpeed,
    screenTintOptions,
    breakReminderOptions,
    timeExtensionOptions,
    updateSettings,
  } = useAccessibility();

  // Don't render if not open
  if (!isOpen) return null;

  // Position classes
  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    modal: 'inset-0 flex items-center justify-center',
  };

  // Panel content
  const panelContent = (
    <div
      className={`
        bg-brand-surface dark:bg-brand-page shadow-2xl overflow-hidden
        ${position === 'modal' ? 'rounded-2xl max-w-2xl w-full max-h-[90vh]' : 'w-96 h-full'}
      `}
      role="dialog"
      aria-label="Accessibility Settings"
      aria-modal="true"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-brand-surface dark:bg-brand-page border-b border-brand-default dark:border-brand-default px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary flex items-center gap-2">
            <span aria-hidden="true">♿</span>
            Accessibility Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="
              p-2 text-brand-muted hover:text-brand-secondary
              dark:text-lxd-muted dark:hover:text-brand-primary
              rounded-lg hover:bg-brand-surface dark:hover:bg-brand-surface
              focus:ring-2 focus:ring-brand-primary
            "
            aria-label="Close settings panel"
          >
            ✕
          </button>
        </div>

        {/* Current preset indicator */}
        <p className="text-sm text-brand-muted dark:text-lxd-muted mt-1">
          Current profile: <strong className="capitalize">{currentPreset}</strong>
        </p>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto h-[calc(100%-120px)] px-6 py-4">
        {/* Quick Preset Buttons */}
        <section className="mb-6">
          <SectionHeader
            title="Quick Presets"
            icon="⚡"
            description="Choose a preset that matches your needs"
          />

          <div className="grid grid-cols-2 gap-2">
            {PRESET_CONFIGS.map((preset) => (
              <button
                type="button"
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${preset.color}
                  ${currentPreset === preset.id ? 'ring-2 ring-brand-primary ring-offset-2' : ''}
                  focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
                `}
                aria-pressed={currentPreset === preset.id}
              >
                <span className="text-2xl" aria-hidden="true">
                  {preset.icon}
                </span>
                <span className="block font-medium text-brand-primary mt-1">{preset.name}</span>
                <span className="block text-xs text-brand-secondary mt-0.5">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-6">
          <SectionHeader
            title="Typography"
            icon="🔤"
            description="Adjust text appearance for readability"
          />

          <Select
            id="font-family"
            label="Font Family"
            description="OpenDyslexic and Atkinson are designed for accessibility"
            value={settings.typography.fontFamily}
            onChange={setFontFamily}
            options={[
              { value: 'system', label: 'System Default' },
              { value: 'opendyslexic', label: 'OpenDyslexic (Dyslexia-friendly)' },
              { value: 'atkinson-hyperlegible', label: 'Atkinson Hyperlegible (Low vision)' },
              { value: 'lexie-readable', label: 'Lexie Readable' },
              { value: 'comic-sans', label: 'Comic Sans (Familiar, distinct)' },
            ]}
          />

          <Slider
            id="font-size"
            label="Font Size"
            description="Base font size (everything scales from this)"
            value={settings.typography.fontSize}
            onChange={setFontSize}
            min={12}
            max={28}
            unit="px"
          />

          <Slider
            id="line-height"
            label="Line Height"
            description="Space between lines (1.8-2.0 recommended for dyslexia)"
            value={settings.typography.lineHeight}
            onChange={setLineHeight}
            min={1.2}
            max={2.5}
            step={0.1}
            formatValue={(v) => v.toFixed(1)}
          />

          <Slider
            id="letter-spacing"
            label="Letter Spacing"
            description="Space between letters (0.12em recommended for dyslexia)"
            value={settings.typography.letterSpacing}
            onChange={setLetterSpacing}
            min={0}
            max={0.3}
            step={0.02}
            unit="em"
            formatValue={(v) => `${v.toFixed(2)}em`}
          />
        </section>

        {/* Visual Section */}
        <section className="mb-6">
          <SectionHeader
            title="Visual Accessibility"
            icon="👁️"
            description="Color and contrast adjustments"
          />

          <ToggleSwitch
            id="high-contrast"
            label="High Contrast Mode"
            description="Increase contrast for better visibility"
            checked={settings.highContrast.enabled}
            onChange={toggleHighContrast}
          />

          <Select
            id="color-vision"
            label="Color Vision Assistance"
            description="Adjust colors for color blindness"
            value={settings.colorVision.mode}
            onChange={setColorVisionMode}
            options={[
              { value: 'none', label: 'None' },
              { value: 'protanopia', label: 'Protanopia (Red-weak)' },
              { value: 'deuteranopia', label: 'Deuteranopia (Green-weak)' },
              { value: 'tritanopia', label: 'Tritanopia (Blue-weak)' },
              { value: 'achromatopsia', label: 'Achromatopsia (Grayscale)' },
            ]}
          />

          {/* Screen Tint */}
          <div className="mt-4">
            <ToggleSwitch
              id="screen-tint-enabled"
              label="Screen Tint"
              description="Colored overlay to reduce visual stress"
              checked={settings.dyslexiaSupport.screenTint.enabled}
              onChange={(enabled) => {
                if (enabled) {
                  setScreenTint(
                    settings.dyslexiaSupport.screenTint.color,
                    settings.dyslexiaSupport.screenTint.opacity,
                  );
                } else {
                  updateSettings({
                    dyslexiaSupport: { screenTint: { enabled: false } },
                  });
                }
              }}
            />

            {settings.dyslexiaSupport.screenTint.enabled && (
              <ColorPicker
                label="Tint Color"
                description="Different colors work for different people"
                color={settings.dyslexiaSupport.screenTint.color}
                opacity={settings.dyslexiaSupport.screenTint.opacity}
                onColorChange={(color) =>
                  setScreenTint(color, settings.dyslexiaSupport.screenTint.opacity)
                }
                onOpacityChange={(opacity) =>
                  setScreenTint(settings.dyslexiaSupport.screenTint.color, opacity)
                }
                presetColors={screenTintOptions}
              />
            )}
          </div>
        </section>

        {/* Motion Section */}
        <section className="mb-6">
          <SectionHeader
            title="Motion & Animation"
            icon="🎬"
            description="Control movement and animations"
          />

          <ToggleSwitch
            id="reduce-motion"
            label="Reduce Motion"
            description="Minimize animations and transitions"
            checked={settings.motion.reduceMotion}
            onChange={toggleReducedMotion}
          />

          <ToggleSwitch
            id="disable-autoplay"
            label="Disable Autoplay"
            description="Prevent videos and media from auto-playing"
            checked={settings.motion.disableAutoplay}
            onChange={(v) => updateSettings({ motion: { disableAutoplay: v } })}
          />

          <ToggleSwitch
            id="disable-parallax"
            label="Disable Parallax"
            description="Stop parallax scrolling effects"
            checked={settings.motion.disableParallax}
            onChange={(v) => updateSettings({ motion: { disableParallax: v } })}
          />
        </section>

        {/* Audio Section */}
        <section className="mb-6">
          <SectionHeader
            title="Audio & Captions"
            icon="🔊"
            description="Hearing accessibility features"
          />

          <ToggleSwitch
            id="captions"
            label="Always Show Captions"
            description="Display captions on all video content"
            checked={settings.audio.captionsEnabled}
            onChange={toggleCaptions}
          />

          <ToggleSwitch
            id="visual-audio-indicators"
            label="Visual Audio Indicators"
            description="Show visual cues for audio events"
            checked={settings.audio.visualAudioIndicators}
            onChange={(v) => updateSettings({ audio: { visualAudioIndicators: v } })}
          />

          <ToggleSwitch
            id="audio-descriptions"
            label="Audio Descriptions"
            description="Narrated descriptions of visual content"
            checked={settings.audio.audioDescriptions}
            onChange={(v) => updateSettings({ audio: { audioDescriptions: v } })}
          />
        </section>

        {/* Cognitive Section */}
        <section className="mb-6">
          <SectionHeader
            title="Cognitive Accessibility"
            icon="🧠"
            description="Focus and cognitive load support"
          />

          <ToggleSwitch
            id="focus-mode"
            label="Focus Mode"
            description="Dim non-essential elements to reduce distraction"
            checked={settings.cognitive.focusMode}
            onChange={toggleFocusMode}
          />

          <ToggleSwitch
            id="simplified-interface"
            label="Simplified Interface"
            description="Show fewer options for a cleaner experience"
            checked={settings.cognitive.simplifiedInterface}
            onChange={(v) => updateSettings({ cognitive: { simplifiedInterface: v } })}
          />

          <ToggleSwitch
            id="reading-guide"
            label="Reading Guide"
            description="Show a ruler that follows your reading position"
            checked={settings.cognitive.readingGuide}
            onChange={toggleReadingGuide}
          />

          <Select
            id="break-reminder"
            label="Break Reminders"
            description="Get reminded to take breaks"
            value={String(settings.cognitive.breakReminderInterval)}
            onChange={(v) => setBreakReminderInterval(Number(v))}
            options={breakReminderOptions.map((opt) => ({
              value: String(opt.value),
              label: opt.label,
            }))}
          />

          <Select
            id="time-extension"
            label="Time Extension"
            description="Extra time for timed activities"
            value={String(settings.cognitive.timeExtension)}
            onChange={(v) => setTimeExtension(Number(v))}
            options={timeExtensionOptions.map((opt) => ({
              value: String(opt.value),
              label: opt.label,
            }))}
          />
        </section>

        {/* Dyslexia-Specific Section */}
        <section className="mb-6">
          <SectionHeader
            title="Dyslexia Support"
            icon="📖"
            description="Features designed for dyslexia"
          />

          <ToggleSwitch
            id="dyslexia-support"
            label="Enable Dyslexia Support"
            description="Activates all dyslexia-friendly features"
            checked={settings.dyslexiaSupport.enabled}
            onChange={toggleDyslexiaSupport}
          />

          {settings.dyslexiaSupport.enabled && (
            <>
              <ToggleSwitch
                id="bionic-reading"
                label="Bionic Reading"
                description="Bold first letters to aid word recognition"
                checked={settings.dyslexiaSupport.bionicReading}
                onChange={toggleBionicReading}
              />

              <ToggleSwitch
                id="text-to-speech"
                label="Text-to-Speech"
                description="Read content aloud"
                checked={settings.dyslexiaSupport.textToSpeech}
                onChange={(v) => updateSettings({ dyslexiaSupport: { textToSpeech: v } })}
              />

              {settings.dyslexiaSupport.textToSpeech && (
                <Slider
                  id="tts-speed"
                  label="Reading Speed"
                  description="Words per minute"
                  value={settings.dyslexiaSupport.ttsSpeed}
                  onChange={setTTSSpeed}
                  min={100}
                  max={250}
                  step={10}
                  unit=" WPM"
                />
              )}

              <ToggleSwitch
                id="syllable-highlighting"
                label="Syllable Highlighting"
                description="Break words into syllables visually"
                checked={settings.dyslexiaSupport.syllableHighlighting}
                onChange={(v) => updateSettings({ dyslexiaSupport: { syllableHighlighting: v } })}
              />
            </>
          )}
        </section>

        {/* Autism-Specific Section */}
        <section className="mb-6">
          <SectionHeader
            title="Autism Support"
            icon="🧩"
            description="Features for predictability and sensory comfort"
          />

          <ToggleSwitch
            id="autism-support"
            label="Enable Autism Support"
            description="Activates all autism-friendly features"
            checked={settings.autismSupport.enabled}
            onChange={toggleAutismSupport}
          />

          {settings.autismSupport.enabled && (
            <>
              <ToggleSwitch
                id="predictable-layouts"
                label="Predictable Layouts"
                description="Consistent navigation and structure"
                checked={settings.autismSupport.predictableLayouts}
                onChange={(v) => updateSettings({ autismSupport: { predictableLayouts: v } })}
              />

              <ToggleSwitch
                id="change-warnings"
                label="Change Warnings"
                description="Alert before content or layout changes"
                checked={settings.autismSupport.changeWarnings}
                onChange={(v) => updateSettings({ autismSupport: { changeWarnings: v } })}
              />

              <ToggleSwitch
                id="explicit-instructions"
                label="Explicit Instructions"
                description="Clear, literal language with nothing assumed"
                checked={settings.autismSupport.explicitInstructions}
                onChange={(v) => updateSettings({ autismSupport: { explicitInstructions: v } })}
              />

              <ToggleSwitch
                id="visual-schedules"
                label="Visual Schedules"
                description="Show visual checklists and progress"
                checked={settings.autismSupport.visualSchedules}
                onChange={(v) => updateSettings({ autismSupport: { visualSchedules: v } })}
              />

              <ToggleSwitch
                id="sensory-friendly"
                label="Sensory-Friendly Colors"
                description="Muted color palette to reduce overstimulation"
                checked={settings.autismSupport.sensoryFriendlyColors}
                onChange={(v) => updateSettings({ autismSupport: { sensoryFriendlyColors: v } })}
              />
            </>
          )}
        </section>

        {/* Reset Button */}
        <div className="border-t border-brand-default dark:border-brand-default pt-4 mt-6">
          <button
            type="button"
            onClick={resetToDefaults}
            className="
              w-full py-2 px-4 text-red-600 dark:text-brand-error
              border border-red-300 dark:border-red-600 rounded-lg
              hover:bg-red-50 dark:hover:bg-red-900/20
              focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              transition-colors duration-200
            "
          >
            Reset All to Defaults
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-brand-page dark:bg-brand-surface border-t border-brand-default dark:border-brand-default px-6 py-3">
        <p className="text-xs text-brand-muted dark:text-brand-muted text-center">
          Settings are saved automatically and sync across sessions.
        </p>
      </div>
    </div>
  );

  // Render based on position
  if (position === 'modal') {
    return (
      <div
        role="presentation"
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {panelContent}
      </div>
    );
  }

  return (
    <div
      className={`
        fixed z-50 ${positionClasses[position]}
        transform transition-transform duration-300
      `}
    >
      {panelContent}
    </div>
  );
}

// ============================================================================
// SECTION 4: TRIGGER BUTTON COMPONENT
// ============================================================================

/**
 * Accessibility settings trigger button
 * Can be placed anywhere to open the settings panel
 */
interface AccessibilityTriggerButtonProps {
  onClick: () => void;
  className?: string;
}

export function AccessibilityTriggerButton({
  onClick,
  className = '',
}: AccessibilityTriggerButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-2 rounded-full bg-brand-primary text-brand-primary
        hover:bg-brand-primary-hover focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        shadow-lg transition-all duration-200 hover:scale-105
        ${className}
      `}
      aria-label="Open accessibility settings"
      title="Accessibility Settings"
    >
      <span className="text-xl" aria-hidden="true">
        ♿
      </span>
    </button>
  );
}

// ============================================================================
// END OF ACCESSIBILITY SETTINGS PANEL
// ============================================================================
