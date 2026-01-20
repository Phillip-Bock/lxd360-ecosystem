'use client';

import {
  Eye,
  Grid3x3,
  Layers,
  Layout,
  Maximize,
  Monitor,
  Ruler,
  Smartphone,
  Square,
  Tablet,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { RibbonButton } from '../ribbon-button';
import { RibbonGroup } from '../ribbon-group';

export function ViewTab(): React.JSX.Element {
  return (
    <div className="flex items-start gap-1.5">
      <RibbonGroup title="Workspace">
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Layout} label="Story View" size="small" />
          <RibbonButton icon={Square} label="Slide View" size="small" />
          <RibbonButton icon={Layout} label="Outline View" size="small" />
          <RibbonButton icon={Layers} label="Master Slide View" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Panes">
        <div className="grid grid-cols-2 gap-0.5">
          <RibbonButton icon={Layout} label="Slides Panel" size="small" />
          <RibbonButton icon={Layout} label="Timeline" size="small" />
          <RibbonButton icon={Layout} label="Properties" size="small" />
          <RibbonButton icon={Layers} label="Layers" size="small" />
          <RibbonButton icon={Layout} label="Triggers" size="small" />
          <RibbonButton icon={Layout} label="States" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Preview">
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Eye} label="Preview from Start" size="small" />
          <RibbonButton icon={Eye} label="Preview Current" size="small" />
          <RibbonButton icon={Monitor} label="Desktop Preview" size="small" />
          <RibbonButton icon={Tablet} label="Tablet Preview" size="small" />
          <RibbonButton icon={Smartphone} label="Mobile Preview" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Display">
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-0.5">
            <RibbonButton icon={ZoomIn} label="Zoom In" size="small" />
            <RibbonButton icon={ZoomOut} label="Zoom Out" size="small" />
          </div>
          <RibbonButton icon={Maximize} label="Fit to Window" size="small" />
          <RibbonButton icon={Eye} label="Actual Size" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Guides & Grids">
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Ruler} label="Rulers" size="small" />
          <RibbonButton icon={Grid3x3} label="Grid" size="small" />
          <RibbonButton icon={Ruler} label="Guides" size="small" />
          <RibbonButton icon={Grid3x3} label="Snap to Grid" size="small" />
        </div>
      </RibbonGroup>
    </div>
  );
}
