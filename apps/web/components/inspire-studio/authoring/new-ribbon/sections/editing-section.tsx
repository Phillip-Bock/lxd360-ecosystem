'use client';

import { Replace, Search } from 'lucide-react';
import { RibbonButton } from '../ribbon-button';

export function EditingSection(): React.JSX.Element {
  return (
    <div className="flex gap-1.5">
      <RibbonButton icon={Search} label="Find" size="small" />
      <RibbonButton icon={Replace} label="Replace" size="small" />
    </div>
  );
}
