'use client';

import { AlertCircle, CheckCircle, Info, Lightbulb, Star } from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  info: Info,
  star: Star,
  lightbulb: Lightbulb,
  alert: AlertCircle,
  check: CheckCircle,
};

export function CustomCalloutBlock(): React.JSX.Element {
  const [content, setContent] = useState(
    'This is a callout block where you can change the icon and color.',
  );
  const [title, setTitle] = useState('Custom Title');
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof iconMap>('info');
  const [borderColor, setBorderColor] = useState('var(--brand-primary)'); // LXD Blue

  const Icon = iconMap[selectedIcon];

  const lightenColor = (hex: string, percent: number): string => {
    const num = Number.parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  };

  const bgColor = lightenColor(borderColor, 80);

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg p-5 border-l-[5px] transition-all"
        style={{ borderColor, backgroundColor: bgColor }}
      >
        <h4
          className="mt-0 flex items-center gap-2.5 font-semibold mb-3"
          style={{ color: borderColor }}
        >
          <Icon className="w-5 h-5" />
          {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires span with role="textbox" for rich text */}
          <span
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="Callout title"
            tabIndex={0}
            onBlur={(e): void => setTitle(e.currentTarget.textContent || '')}
            className="outline-hidden focus:ring-2 focus:ring-lxd-blue rounded"
          >
            {title}
          </span>
        </h4>
        {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
        <div
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Callout content"
          tabIndex={0}
          onBlur={(e): void => setContent(e.currentTarget.textContent || '')}
          className="outline-hidden focus:ring-2 focus:ring-lxd-blue rounded text-lxd-text-dark-body"
        >
          {content}
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={selectedIcon}
          onChange={(e): void => setSelectedIcon(e.target.value as keyof typeof iconMap)}
          className="px-3 py-2 border border-border dark:border-lxd-dark-border rounded-md bg-background dark:bg-lxd-dark-surface text-lxd-text-dark-body dark:text-lxd-text-light"
        >
          <option value="info">Info Icon</option>
          <option value="star">Star Icon</option>
          <option value="lightbulb">Lightbulb Icon</option>
          <option value="alert">Alert Icon</option>
          <option value="check">Check Icon</option>
        </select>
        <input
          type="color"
          value={borderColor}
          onChange={(e): void => setBorderColor(e.target.value)}
          className="w-16 h-10 border border-border dark:border-lxd-dark-border rounded-md cursor-pointer"
        />
      </div>
    </div>
  );
}
