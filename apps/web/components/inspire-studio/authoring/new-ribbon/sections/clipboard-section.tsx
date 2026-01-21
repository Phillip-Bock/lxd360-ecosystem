'use client';

import { Clipboard, Copy, Scissors } from 'lucide-react';
import { RibbonButton } from '../ribbon-button';

export function ClipboardSection(): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col">
        <RibbonButton icon={Clipboard} label="Paste" size="medium" />
      </div>
      <div className="flex flex-col gap-0.5">
        <RibbonButton icon={Scissors} label="Cut" size="small" />
        <RibbonButton icon={Copy} label="Copy" size="small" />
      </div>
    </div>
  );
}
