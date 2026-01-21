'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Group,
  RotateCw,
} from 'lucide-react';
import { RibbonButton } from '../ribbon-button';

export function ArrangeSection(): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      <RibbonButton icon={ArrowUpCircle} label="Bring Front" size="small" />
      <RibbonButton icon={ArrowDownCircle} label="Send Back" size="small" />
      <RibbonButton icon={AlignLeft} label="Align Left" size="small" />
      <RibbonButton icon={AlignCenter} label="Align Center" size="small" />
      <RibbonButton icon={AlignRight} label="Align Right" size="small" />
      <RibbonButton icon={Group} label="Group" size="small" />
      <RibbonButton icon={Group} label="Ungroup" size="small" />
      <RibbonButton icon={RotateCw} label="Rotate" size="small" />
    </div>
  );
}
