'use client';

/**
 * StatePropertyEditor - Edit visual properties for a single state
 */

import { ArrowLeft, Box, Palette, RotateCcw, Type } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ObjectState, StateProperties } from '@/types/studio/states';

// =============================================================================
// TYPES
// =============================================================================

interface StatePropertyEditorProps {
  state: ObjectState;
  onUpdate: (updates: Partial<ObjectState>) => void;
  onClose: () => void;
}

// =============================================================================
// PROPERTY INPUT COMPONENTS
// =============================================================================

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  placeholder,
}: NumberInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-zinc-400">{label}</Label>
        {unit && <span className="text-[10px] text-zinc-500">{unit}</span>}
      </div>
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? undefined : Number(val));
        }}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="h-8 bg-zinc-900 border-white/10 text-sm"
      />
    </div>
  );
}

interface SliderInputProps {
  label: string;
  value: number | undefined;
  defaultValue: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

function SliderInput({
  label,
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  unit,
  formatValue,
}: SliderInputProps) {
  const displayValue = value ?? defaultValue;
  const formatted = formatValue ? formatValue(displayValue) : displayValue.toString();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-zinc-400">{label}</Label>
        <span className="text-xs text-white">
          {formatted}
          {unit}
        </span>
      </div>
      <Slider
        value={[displayValue]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-1"
      />
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

function ColorInput({ label, value, onChange, placeholder = '#000000' }: ColorInputProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-zinc-400">{label}</Label>
      <div className="flex gap-2">
        <div
          className="w-8 h-8 rounded-md border border-white/10 shrink-0 cursor-pointer"
          style={{ backgroundColor: value || 'transparent' }}
        >
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={placeholder}
          className="h-8 bg-zinc-900 border-white/10 text-sm font-mono flex-1"
        />
      </div>
    </div>
  );
}

// =============================================================================
// STATE PROPERTY EDITOR COMPONENT
// =============================================================================

export function StatePropertyEditor({ state, onUpdate, onClose }: StatePropertyEditorProps) {
  const [activeTab, setActiveTab] = useState<'transform' | 'appearance' | 'typography'>(
    'transform',
  );
  const [stateName, setStateName] = useState(state.name);

  const updateProperty = useCallback(
    <K extends keyof StateProperties>(key: K, value: StateProperties[K]) => {
      const newProperties = { ...state.properties };
      if (value === undefined) {
        delete newProperties[key];
      } else {
        newProperties[key] = value;
      }
      onUpdate({ properties: newProperties });
    },
    [state.properties, onUpdate],
  );

  const handleNameChange = useCallback(() => {
    if (stateName.trim() && stateName !== state.name) {
      onUpdate({ name: stateName.trim() });
    }
  }, [stateName, state.name, onUpdate]);

  const resetProperties = useCallback(() => {
    onUpdate({ properties: {} });
  }, [onUpdate]);

  const props = state.properties;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          onBlur={handleNameChange}
          onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
          className="h-8 bg-transparent border-none text-sm font-medium focus-visible:ring-0 px-0"
        />
        <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={resetProperties}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full justify-start px-4 pt-2 bg-transparent shrink-0">
          <TabsTrigger
            value="transform"
            className="text-xs gap-1 data-[state=active]:bg-primary/20"
          >
            <Box className="h-3 w-3" />
            Transform
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="text-xs gap-1 data-[state=active]:bg-primary/20"
          >
            <Palette className="h-3 w-3" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="typography"
            className="text-xs gap-1 data-[state=active]:bg-primary/20"
          >
            <Type className="h-3 w-3" />
            Typography
          </TabsTrigger>
        </TabsList>

        {/* Transform Tab */}
        <TabsContent value="transform" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-6">
              {/* Position */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">
                  Position
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput
                    label="X"
                    value={props.x}
                    onChange={(v) => updateProperty('x', v)}
                    unit="px"
                    placeholder="0"
                  />
                  <NumberInput
                    label="Y"
                    value={props.y}
                    onChange={(v) => updateProperty('y', v)}
                    unit="px"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Size */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Size</h4>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput
                    label="Width"
                    value={props.width}
                    onChange={(v) => updateProperty('width', v)}
                    min={0}
                    unit="px"
                    placeholder="auto"
                  />
                  <NumberInput
                    label="Height"
                    value={props.height}
                    onChange={(v) => updateProperty('height', v)}
                    min={0}
                    unit="px"
                    placeholder="auto"
                  />
                </div>
              </div>

              {/* Transform */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">
                  Transform
                </h4>
                <SliderInput
                  label="Scale"
                  value={props.scale}
                  defaultValue={1}
                  onChange={(v) => updateProperty('scale', v)}
                  min={0}
                  max={2}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <SliderInput
                  label="Rotation"
                  value={props.rotation}
                  defaultValue={0}
                  onChange={(v) => updateProperty('rotation', v)}
                  min={-180}
                  max={180}
                  step={1}
                  unit="°"
                />
                <div className="grid grid-cols-2 gap-3">
                  <SliderInput
                    label="Scale X"
                    value={props.scaleX}
                    defaultValue={1}
                    onChange={(v) => updateProperty('scaleX', v)}
                    min={0}
                    max={2}
                    step={0.01}
                    formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <SliderInput
                    label="Scale Y"
                    value={props.scaleY}
                    defaultValue={1}
                    onChange={(v) => updateProperty('scaleY', v)}
                    min={0}
                    max={2}
                    step={0.01}
                    formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-6">
              {/* Visibility */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">
                  Visibility
                </h4>
                <SliderInput
                  label="Opacity"
                  value={props.opacity}
                  defaultValue={1}
                  onChange={(v) => updateProperty('opacity', v)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Colors</h4>
                <ColorInput
                  label="Background"
                  value={props.backgroundColor}
                  onChange={(v) => updateProperty('backgroundColor', v)}
                />
                <ColorInput
                  label="Border Color"
                  value={props.borderColor}
                  onChange={(v) => updateProperty('borderColor', v)}
                />
              </div>

              {/* Border */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Border</h4>
                <SliderInput
                  label="Width"
                  value={props.borderWidth}
                  defaultValue={0}
                  onChange={(v) => updateProperty('borderWidth', v)}
                  min={0}
                  max={20}
                  step={1}
                  unit="px"
                />
                <SliderInput
                  label="Radius"
                  value={props.borderRadius}
                  defaultValue={0}
                  onChange={(v) => updateProperty('borderRadius', v)}
                  min={0}
                  max={50}
                  step={1}
                  unit="px"
                />
              </div>

              {/* Effects */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Effects</h4>
                <SliderInput
                  label="Blur"
                  value={props.blur}
                  defaultValue={0}
                  onChange={(v) => updateProperty('blur', v)}
                  min={0}
                  max={20}
                  step={1}
                  unit="px"
                />
                <SliderInput
                  label="Brightness"
                  value={props.brightness}
                  defaultValue={1}
                  onChange={(v) => updateProperty('brightness', v)}
                  min={0}
                  max={2}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <SliderInput
                  label="Contrast"
                  value={props.contrast}
                  defaultValue={1}
                  onChange={(v) => updateProperty('contrast', v)}
                  min={0}
                  max={2}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <SliderInput
                  label="Saturate"
                  value={props.saturate}
                  defaultValue={1}
                  onChange={(v) => updateProperty('saturate', v)}
                  min={0}
                  max={2}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <SliderInput
                  label="Grayscale"
                  value={props.grayscale}
                  defaultValue={0}
                  onChange={(v) => updateProperty('grayscale', v)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-6">
              {/* Font */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Font</h4>
                <NumberInput
                  label="Font Size"
                  value={props.fontSize}
                  onChange={(v) => updateProperty('fontSize', v)}
                  min={8}
                  max={200}
                  unit="px"
                  placeholder="16"
                />
                <NumberInput
                  label="Font Weight"
                  value={typeof props.fontWeight === 'number' ? props.fontWeight : undefined}
                  onChange={(v) => updateProperty('fontWeight', v)}
                  min={100}
                  max={900}
                  step={100}
                  placeholder="400"
                />
                <ColorInput
                  label="Text Color"
                  value={props.color}
                  onChange={(v) => updateProperty('color', v)}
                />
              </div>

              {/* Spacing */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Spacing</h4>
                <SliderInput
                  label="Letter Spacing"
                  value={props.letterSpacing}
                  defaultValue={0}
                  onChange={(v) => updateProperty('letterSpacing', v)}
                  min={-5}
                  max={20}
                  step={0.1}
                  unit="px"
                />
                <SliderInput
                  label="Line Height"
                  value={props.lineHeight}
                  defaultValue={1.5}
                  onChange={(v) => updateProperty('lineHeight', v)}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StatePropertyEditor;
