'use client';

/**
 * Theme Builder - Visual editor for learner-facing content themes
 * Cortex + Nexus tier feature
 * Now renders inline within the library layout (not as modal)
 */

import { Code, Download, Eye, Image as ImageIcon, Palette, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BORDER_RADIUS_VALUES,
  type ContentTheme,
  type ContentThemeColors,
  type ContentThemeStyles,
  type CustomFont,
  DEFAULT_CONTENT_THEME,
  FONT_OPTIONS,
  generateThemeCSS,
  SHADOW_VALUES,
} from '@/types/content-theme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  description?: string;
}

function ColorPicker({ value, onChange, label, description }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <Input
        type="text"
        value={value.toUpperCase()}
        onChange={(e) => {
          const val = e.target.value;
          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
            onChange(val);
          }
        }}
        className="w-24 h-8 font-mono text-xs uppercase"
      />
    </div>
  );
}

interface ThemeBuilderProps {
  initialTheme?: ContentTheme;
  onSave: (theme: ContentTheme) => void;
  onClose: () => void;
}

// Accepted font file types
const ACCEPTED_FONT_TYPES = '.woff,.woff2,.ttf,.otf';

export function ThemeBuilder({ initialTheme, onSave }: ThemeBuilderProps) {
  const [theme, setTheme] = useState<ContentTheme>(initialTheme || DEFAULT_CONTENT_THEME);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [isUploadingFont, setIsUploadingFont] = useState(false);
  const fontInputRef = useRef<HTMLInputElement>(null);

  // Update a single color
  const updateColor = useCallback((key: keyof ContentThemeColors, value: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update style property
  const updateStyle = useCallback(
    <K extends keyof ContentThemeStyles>(key: K, value: ContentThemeStyles[K]) => {
      setTheme((prev) => ({
        ...prev,
        styles: { ...prev.styles, [key]: value },
        updatedAt: new Date().toISOString(),
      }));
    },
    [],
  );

  // Update font
  const updateFont = useCallback((fontFamily: string, customFont?: CustomFont) => {
    setTheme((prev) => ({
      ...prev,
      typography: {
        fontFamily,
        customFont,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Handle custom font upload
  const handleFontUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Get file extension
      const ext = file.name.split('.').pop()?.toLowerCase() as 'woff' | 'woff2' | 'ttf' | 'otf';
      if (!['woff', 'woff2', 'ttf', 'otf'].includes(ext)) {
        alert('Please upload a valid font file (.woff, .woff2, .ttf, or .otf)');
        return;
      }

      setIsUploadingFont(true);

      try {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const fontName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

          const newCustomFont: CustomFont = {
            id: `custom-font-${Date.now()}`,
            name: fontName,
            fileName: file.name,
            format: ext,
            dataUrl,
            uploadedAt: new Date().toISOString(),
          };

          setCustomFonts((prev) => [...prev, newCustomFont]);
          // Auto-select the newly uploaded font
          updateFont(`'${fontName}', sans-serif`, newCustomFont);
          setIsUploadingFont(false);
        };

        reader.onerror = () => {
          alert('Failed to read font file');
          setIsUploadingFont(false);
        };

        reader.readAsDataURL(file);
      } catch {
        alert('Failed to upload font');
        setIsUploadingFont(false);
      }

      // Reset input
      if (fontInputRef.current) {
        fontInputRef.current.value = '';
      }
    },
    [updateFont],
  );

  // Remove custom font
  const removeCustomFont = useCallback((fontId: string) => {
    setCustomFonts((prev) => prev.filter((f) => f.id !== fontId));
    // If the removed font was selected, switch back to default
    setTheme((prev) => {
      if (prev.typography.customFont?.id === fontId) {
        return {
          ...prev,
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            customFont: undefined,
          },
        };
      }
      return prev;
    });
  }, []);

  // Toggle code editor
  const handleToggleCodeEditor = useCallback(() => {
    if (!showCodeEditor) {
      setCodeContent(generateThemeCSS(theme));
    }
    setShowCodeEditor(!showCodeEditor);
  }, [showCodeEditor, theme]);

  // Download CSS
  const handleDownloadCSS = useCallback(() => {
    const css = generateThemeCSS(theme);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [theme]);

  // Save theme
  const handleSave = useCallback(() => {
    onSave({
      ...theme,
      id: theme.id || `theme-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    });
  }, [theme, onSave]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setTheme({
      ...DEFAULT_CONTENT_THEME,
      id: theme.id,
      name: theme.name,
      createdAt: theme.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }, [theme.id, theme.name, theme.createdAt]);

  // Generate @font-face style for preview
  const customFontStyles = customFonts
    .map(
      (font) => `
    @font-face {
      font-family: '${font.name}';
      src: url('${font.dataUrl}') format('${font.format === 'ttf' ? 'truetype' : font.format === 'otf' ? 'opentype' : font.format}');
      font-weight: normal;
      font-style: normal;
    }
  `,
    )
    .join('\n');

  return (
    <div className="flex h-full w-full">
      {/* Inject custom font styles */}
      {customFonts.length > 0 && <style dangerouslySetInnerHTML={{ __html: customFontStyles }} />}

      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="h-12 px-4 flex items-center border-b border-gray-200 bg-white">
          <Palette className="w-5 h-5 text-primary mr-2" />
          <span className="font-semibold text-gray-900">Theme Settings</span>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme Name */}
          <div>
            <Label className="text-xs font-medium text-gray-700">Theme Name</Label>
            <Input
              value={theme.name}
              onChange={(e) => setTheme((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1"
              placeholder="My Custom Theme"
            />
          </div>

          {/* Text/Background Colors */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Text & Background
            </h3>
            <div className="space-y-1 bg-white rounded-lg border border-gray-200 p-3">
              <ColorPicker
                value={theme.colors.textDark}
                onChange={(v) => updateColor('textDark', v)}
                label="Text/Background - Dark"
                description="Headings, body text"
              />
              <ColorPicker
                value={theme.colors.textLight}
                onChange={(v) => updateColor('textLight', v)}
                label="Text/Background - Light"
                description="Text on dark backgrounds"
              />
            </div>
          </div>

          {/* Button & Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Buttons & Links
            </h3>
            <div className="space-y-1 bg-white rounded-lg border border-gray-200 p-3">
              <ColorPicker
                value={theme.colors.primaryButton}
                onChange={(v) => updateColor('primaryButton', v)}
                label="Primary Button"
                description="Main call-to-action"
              />
              <ColorPicker
                value={theme.colors.hyperlink}
                onChange={(v) => updateColor('hyperlink', v)}
                label="Hyperlink"
              />
              <ColorPicker
                value={theme.colors.hyperlinkVisited}
                onChange={(v) => updateColor('hyperlinkVisited', v)}
                label="Visited Hyperlink"
              />
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Accent Colors
            </h3>
            <p className="text-xs text-gray-500 mb-2">For charts, highlights, visual interest</p>
            <div className="space-y-1 bg-white rounded-lg border border-gray-200 p-3">
              <ColorPicker
                value={theme.colors.accent2}
                onChange={(v) => updateColor('accent2', v)}
                label="Accent 2"
                description="Orange - warnings"
              />
              <ColorPicker
                value={theme.colors.accent3}
                onChange={(v) => updateColor('accent3', v)}
                label="Accent 3"
                description="Green - success"
              />
              <ColorPicker
                value={theme.colors.accent4}
                onChange={(v) => updateColor('accent4', v)}
                label="Accent 4"
                description="Blue - info"
              />
              <ColorPicker
                value={theme.colors.accent5}
                onChange={(v) => updateColor('accent5', v)}
                label="Accent 5"
                description="Purple - premium"
              />
              <ColorPicker
                value={theme.colors.accent6}
                onChange={(v) => updateColor('accent6', v)}
                label="Accent 6"
                description="Teal - modern"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Border Radius
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(BORDER_RADIUS_VALUES) as ContentThemeStyles['borderRadius'][]).map(
                (radius) => (
                  <button
                    type="button"
                    key={radius}
                    onClick={() => updateStyle('borderRadius', radius)}
                    className={`aspect-square bg-primary/20 border-2 flex items-center justify-center text-[10px] font-medium transition-all ${
                      theme.styles.borderRadius === radius
                        ? 'border-primary bg-primary/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ borderRadius: BORDER_RADIUS_VALUES[radius] }}
                  >
                    {radius === 'none' ? '0' : radius}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Shadow */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Shadow
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(SHADOW_VALUES) as ContentThemeStyles['shadow'][]).map((shadow) => (
                <button
                  type="button"
                  key={shadow}
                  onClick={() => updateStyle('shadow', shadow)}
                  className={`h-12 bg-white border-2 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${
                    theme.styles.shadow === shadow
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ boxShadow: SHADOW_VALUES[shadow] }}
                >
                  {shadow}
                </button>
              ))}
            </div>
          </div>

          {/* Branding */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Branding
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Logo (SVG or PNG recommended)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Max 200x80px, SVG preferred</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Favicon</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Favicon
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">32x32px ICO or PNG</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white space-y-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadCSS} className="flex-1">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Theme
          </Button>
        </div>
      </div>

      {/* Center - Preview or Code Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Preview Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            {showCodeEditor ? (
              <Code className="w-5 h-5 text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-600" />
            )}
            <span className="font-medium text-gray-700">
              {showCodeEditor ? 'Code Editor' : 'Live Preview'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleToggleCodeEditor}>
            {showCodeEditor ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Edit Code
              </>
            )}
          </Button>
        </div>

        {/* Content Area */}
        {showCodeEditor ? (
          <div className="flex-1 overflow-hidden">
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-hidden"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-8 bg-gray-100">
            {/* Live Preview */}
            <div
              className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
              style={{
                fontFamily: theme.typography.fontFamily,
                borderRadius: BORDER_RADIUS_VALUES[theme.styles.borderRadius],
                boxShadow: SHADOW_VALUES[theme.styles.shadow],
              }}
            >
              {/* Preview Header */}
              <div
                className="p-6"
                style={{ backgroundColor: theme.colors.backgroundDark || theme.colors.textDark }}
              >
                <h1 className="text-2xl font-bold" style={{ color: theme.colors.textLight }}>
                  Course Title Preview
                </h1>
                <p className="mt-1 opacity-80" style={{ color: theme.colors.textLight }}>
                  See how your theme looks in real-time
                </p>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                <div>
                  <h2
                    className="text-xl font-semibold mb-2"
                    style={{ color: theme.colors.textDark }}
                  >
                    Welcome to the Module
                  </h2>
                  <p style={{ color: theme.colors.textDark }}>
                    This preview shows how your learner-facing content will appear. The colors,
                    fonts, and styling you choose here will be applied to courses, webinars, and
                    other published content.
                  </p>
                  <p className="mt-2">
                    <span
                      style={{
                        color: theme.colors.hyperlink,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Click here to learn more
                    </span>{' '}
                    or{' '}
                    <span
                      style={{
                        color: theme.colors.hyperlinkVisited,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      revisit the previous lesson
                    </span>
                    .
                  </p>
                </div>

                {/* Button Preview */}
                <div>
                  <button
                    type="button"
                    className="px-6 py-2.5 font-medium transition-colors"
                    style={{
                      backgroundColor: theme.colors.primaryButton,
                      color: theme.colors.primaryButtonText,
                      borderRadius: BORDER_RADIUS_VALUES[theme.styles.borderRadius],
                      boxShadow: SHADOW_VALUES[theme.styles.shadow],
                    }}
                  >
                    Primary Button
                  </button>
                </div>

                {/* Chart Preview */}
                <div>
                  <h3 className="text-lg font-medium mb-3" style={{ color: theme.colors.textDark }}>
                    Data Visualization
                  </h3>
                  <div className="flex items-end gap-3 h-32">
                    <div
                      className="w-12 rounded-t"
                      style={{
                        height: '80%',
                        backgroundColor: theme.colors.accent2,
                        borderRadius: `${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} ${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} 0 0`,
                      }}
                    />
                    <div
                      className="w-12 rounded-t"
                      style={{
                        height: '60%',
                        backgroundColor: theme.colors.accent3,
                        borderRadius: `${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} ${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} 0 0`,
                      }}
                    />
                    <div
                      className="w-12 rounded-t"
                      style={{
                        height: '90%',
                        backgroundColor: theme.colors.accent4,
                        borderRadius: `${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} ${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} 0 0`,
                      }}
                    />
                    <div
                      className="w-12 rounded-t"
                      style={{
                        height: '45%',
                        backgroundColor: theme.colors.accent5,
                        borderRadius: `${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} ${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} 0 0`,
                      }}
                    />
                    <div
                      className="w-12 rounded-t"
                      style={{
                        height: '70%',
                        backgroundColor: theme.colors.accent6,
                        borderRadius: `${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} ${BORDER_RADIUS_VALUES[theme.styles.borderRadius]} 0 0`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Fonts Panel */}
      <div className="w-72 border-l border-gray-200 flex flex-col bg-gray-50">
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
          <span className="font-medium text-gray-700">Fonts</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Custom Font Upload Section */}
          <div className="mb-4 p-3 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4" />
              Upload Custom Font
            </h4>
            <p className="text-[10px] text-gray-500 mb-2">
              .woff2, .woff, .ttf, .otf files accepted
            </p>
            <input
              ref={fontInputRef}
              type="file"
              accept={ACCEPTED_FONT_TYPES}
              onChange={handleFontUpload}
              className="hidden"
              id="font-upload"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fontInputRef.current?.click()}
              disabled={isUploadingFont}
            >
              {isUploadingFont ? (
                'Uploading...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Font File
                </>
              )}
            </Button>
          </div>

          {/* Custom Fonts List */}
          {customFonts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                Your Fonts
              </h4>
              {customFonts.map((font) => (
                <div
                  key={font.id}
                  className={`w-full p-3 text-left rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                    theme.typography.customFont?.id === font.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-white border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => updateFont(`'${font.name}', sans-serif`, font)}
                    className="flex-1 flex items-center gap-3"
                  >
                    <span
                      className="text-2xl font-medium text-gray-400"
                      style={{ fontFamily: `'${font.name}', sans-serif` }}
                    >
                      Aa
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <p
                        className="font-medium text-gray-900 truncate"
                        style={{ fontFamily: `'${font.name}', sans-serif` }}
                      >
                        {font.name}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">Custom ({font.format})</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomFont(font.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove font"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* System Fonts */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
              System Fonts
            </h4>
            {FONT_OPTIONS.map((font) => (
              <button
                type="button"
                key={font.value}
                onClick={() => updateFont(font.value, undefined)}
                className={`w-full p-3 text-left rounded-lg mb-1 transition-colors ${
                  theme.typography.fontFamily === font.value && !theme.typography.customFont
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-white border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl font-medium text-gray-400"
                    style={{ fontFamily: font.value }}
                  >
                    {font.preview}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900" style={{ fontFamily: font.value }}>
                      {font.label}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: font.value }}>
                      {font.label}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeBuilder;
