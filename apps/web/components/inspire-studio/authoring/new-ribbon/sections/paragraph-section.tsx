'use client';

import { AlignCenter, AlignJustify, AlignLeft, AlignRight, List, ListOrdered } from 'lucide-react';
import { RibbonButton } from '../ribbon-button';

export function ParagraphSection(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-4 gap-0.5">
        <RibbonButton icon={AlignLeft} label="Left" size="small" />
        <RibbonButton icon={AlignCenter} label="Center" size="small" />
        <RibbonButton icon={AlignRight} label="Right" size="small" />
        <RibbonButton icon={AlignJustify} label="Justify" size="small" />
      </div>
      <div className="flex gap-0.5">
        <RibbonButton icon={List} label="Bullets" size="small" />
        <RibbonButton icon={ListOrdered} label="Numbers" size="small" />
      </div>
    </div>
  );
}
