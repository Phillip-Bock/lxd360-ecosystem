'use client';

import { Copy, Edit, EyeOff, Layout, Plus, Trash2 } from 'lucide-react';
import { RibbonButton } from '../ribbon-button';

export function SlidesSection(): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      <RibbonButton icon={Plus} label="New Slide" size="small" />
      <RibbonButton icon={Copy} label="Duplicate" size="small" />
      <RibbonButton icon={Trash2} label="Delete" size="small" />
      <RibbonButton icon={Edit} label="Rename" size="small" />
      <RibbonButton icon={Layout} label="Layout" size="small" />
      <RibbonButton icon={EyeOff} label="Hide" size="small" />
    </div>
  );
}
