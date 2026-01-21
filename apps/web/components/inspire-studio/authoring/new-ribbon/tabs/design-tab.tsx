'use client';

import { Image, Layout, Palette } from 'lucide-react';
import { RibbonButton } from '../ribbon-button';
import { RibbonGroup } from '../ribbon-group';

export function DesignTab(): React.JSX.Element {
  return (
    <div className="flex items-start gap-1.5">
      <RibbonGroup title="Themes" className="min-w-[320px]">
        <div className="flex gap-1.5">
          {[
            { name: 'Office', colors: ['#2b579a', '#5b9bd5', '#ed7d31'] },
            { name: 'Facet', colors: ['#4472c4', '#ed7d31', '#a5a5a5'] },
            { name: 'Integral', colors: ['#7030a0', '#5b9bd5', '#70ad47'] },
            { name: 'Ion', colors: ['#44546a', '#5b9bd5', '#ffc000'] },
          ].map((theme) => (
            <button
              type="button"
              key={theme.name}
              className="flex flex-col w-16 h-12 rounded border border-border hover:border-primary transition-all hover:shadow-sm overflow-hidden group"
            >
              <div className="flex h-8 w-full">
                {theme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-all"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="h-4 bg-muted flex items-center justify-center">
                <span className="text-[8px] font-medium">{theme.name}</span>
              </div>
            </button>
          ))}
        </div>
      </RibbonGroup>

      <RibbonGroup title="Customize">
        <div className="flex gap-0.5">
          <RibbonButton icon={Palette} label="Colors" size="small" />
          <RibbonButton icon={Layout} label="Size" size="small" />
          <RibbonButton icon={Image} label="Background" size="small" />
        </div>
      </RibbonGroup>
    </div>
  );
}
