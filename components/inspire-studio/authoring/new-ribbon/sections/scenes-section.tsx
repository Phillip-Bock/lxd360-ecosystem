'use client';

import { Copy, Edit, Lock, Plus, Trash2 } from 'lucide-react';
import { RibbonButton } from '../ribbon-button';

export function ScenesSection(): React.JSX.Element {
  return (
    <div className="flex gap-0.5">
      <RibbonButton icon={Plus} label="New Scene" size="small" />
      <RibbonButton icon={Copy} label="Duplicate" size="small" />
      <RibbonButton icon={Trash2} label="Delete" size="small" />
      <RibbonButton icon={Edit} label="Rename" size="small" />
      <RibbonButton icon={Lock} label="Lock" size="small" />
    </div>
  );
}
