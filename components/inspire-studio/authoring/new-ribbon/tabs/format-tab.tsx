'use client';

import { RotateCw, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditor } from '@/lib/inspire-studio/editor-context';
import { RibbonButton } from '../ribbon-button';
import { RibbonGroup } from '../ribbon-group';

export function FormatTab(): React.JSX.Element {
  const { getSelectedShape, updateSelectedShape, dispatch } = useEditor();
  const selectedShape = getSelectedShape();

  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateSelectedShape({ fill: e.target.value });
  };

  const handleStrokeColorChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateSelectedShape({ stroke: e.target.value });
  };

  const handleStrokeWidthChange = (value: number): void => {
    updateSelectedShape({ strokeWidth: value });
  };

  const handleRotation = (degrees: number): void => {
    if (selectedShape) {
      const currentRotation = selectedShape.rotation ?? 0;
      updateSelectedShape({ rotation: (currentRotation + degrees) % 360 });
    }
  };

  const handleDelete = (): void => {
    if (selectedShape) {
      dispatch({ type: 'DELETE_SHAPE', payload: { id: selectedShape.id } });
    }
  };

  if (!selectedShape) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Select a shape to format
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1.5">
      <RibbonGroup title="Fill & Outline">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">Fill:</Label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={selectedShape.fill}
                onChange={handleFillColorChange}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <span className="text-xs text-muted-foreground">{selectedShape.fill}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">Stroke:</Label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={selectedShape.stroke}
                onChange={handleStrokeColorChange}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <span className="text-xs text-muted-foreground">{selectedShape.stroke}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">Width:</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 6].map((width) => (
                <button
                  type="button"
                  key={width}
                  onClick={() => handleStrokeWidthChange(width)}
                  className={`px-2 py-1 text-xs rounded border ${
                    selectedShape.strokeWidth === width
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup title="Size">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">Width:</Label>
            <Input
              type="number"
              value={Math.round(selectedShape.width)}
              onChange={(e) => updateSelectedShape({ width: parseInt(e.target.value, 10) || 20 })}
              className="w-20 h-7 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">Height:</Label>
            <Input
              type="number"
              value={Math.round(selectedShape.height)}
              onChange={(e) => updateSelectedShape({ height: parseInt(e.target.value, 10) || 20 })}
              className="w-20 h-7 text-xs"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup title="Arrange">
        <div className="flex gap-1">
          <RibbonButton
            icon={RotateCw}
            label="Rotate 90°"
            size="small"
            onClick={() => handleRotation(90)}
          />
          <RibbonButton icon={Trash2} label="Delete" size="small" onClick={handleDelete} />
        </div>
      </RibbonGroup>
    </div>
  );
}
