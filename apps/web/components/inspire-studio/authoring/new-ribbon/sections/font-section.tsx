'use client';

import { Type } from 'lucide-react';
import { ColorPicker } from '../controls/color-picker';
import { FontSelector } from '../controls/font-selector';
import { FontSizePicker } from '../controls/font-size-picker';
import { FontStyleButtons } from '../controls/font-style-buttons';

export function FontSection(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <FontSelector />
        <FontSizePicker />
      </div>
      <div className="flex items-center gap-1">
        <FontStyleButtons />
        <div className="w-px h-4 bg-border mx-0.5" />
        <ColorPicker icon={Type} label="Text Color" />
      </div>
    </div>
  );
}
