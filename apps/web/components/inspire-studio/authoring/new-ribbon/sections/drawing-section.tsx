'use client';

import { Circle, MessageSquare, Pen, Square } from 'lucide-react';
import { RibbonButton } from '../ribbon-button';

export function DrawingSection(): React.JSX.Element {
  return (
    <div className="flex gap-0.5">
      <RibbonButton icon={Square} label="Shapes" size="small" />
      <RibbonButton icon={Circle} label="Draw" size="small" />
      <RibbonButton icon={MessageSquare} label="Text Box" size="small" />
      <RibbonButton icon={Pen} label="Arrange" size="small" />
    </div>
  );
}
