'use client';

import { Circle, Diamond, Star } from 'lucide-react';
import React from 'react';
import type { DividerBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const DIVIDER_STYLES = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
  gradient: 'bg-linear-to-r from-transparent via-studio-accent to-transparent',
};

const CENTER_ICONS = {
  star: Star,
  circle: Circle,
  diamond: Diamond,
};

/**
 * DividerBlock - Horizontal rule/divider
 */
export function DividerBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<DividerBlockContent>) {
  const content = block.content as DividerBlockContent;

  const style = content.style || 'solid';
  const thickness = content.thickness || 1;
  const color = content.color || 'rgb(30 58 95)'; // studio-surface equivalent

  // Preview mode
  if (!isEditing) {
    return (
      <div className="py-4">
        <div className="relative flex items-center justify-center">
          {/* Line */}
          {style === 'gradient' ? (
            <div
              className="w-full h-px bg-linear-to-r from-transparent via-studio-accent to-transparent"
              style={{ height: thickness }}
            />
          ) : (
            <hr
              className={`w-full ${DIVIDER_STYLES[style]}`}
              style={{
                borderTopWidth: thickness,
                borderColor: color,
              }}
            />
          )}

          {/* Center content */}
          {content.centerContent && (
            <div className="absolute bg-studio-bg px-4">
              {CENTER_ICONS[content.centerContent as keyof typeof CENTER_ICONS] ? (
                React.createElement(
                  CENTER_ICONS[content.centerContent as keyof typeof CENTER_ICONS],
                  { className: 'w-4 h-4 text-studio-text-muted' },
                )
              ) : (
                <span className="text-sm text-studio-text-muted">{content.centerContent}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Style selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-studio-text-muted">Style:</span>
        <div className="flex gap-1">
          {(Object.keys(DIVIDER_STYLES) as Array<keyof typeof DIVIDER_STYLES>).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => onUpdate({ content: { ...content, style: s } })}
              className={`
                px-3 py-1.5 text-xs rounded-lg transition-colors
                ${
                  style === s
                    ? 'bg-studio-accent text-brand-primary'
                    : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
                }
              `}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Thickness */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-studio-text-muted">Thickness:</span>
        <input
          type="range"
          min="1"
          max="10"
          value={thickness}
          onChange={(e) =>
            onUpdate({ content: { ...content, thickness: parseInt(e.target.value, 10) } })
          }
          className="w-32"
        />
        <span className="text-sm text-studio-text w-8">{thickness}px</span>
      </div>

      {/* Color picker */}
      {style !== 'gradient' && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-studio-text-muted">Color:</span>
          <input
            type="color"
            value={color}
            onChange={(e) => onUpdate({ content: { ...content, color: e.target.value } })}
            className="w-10 h-8 rounded cursor-pointer bg-transparent border border-studio-surface/50"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onUpdate({ content: { ...content, color: e.target.value } })}
            className="w-24 px-2 py-1 bg-studio-bg border border-studio-surface/50 rounded text-sm text-studio-text font-mono"
          />
        </div>
      )}

      {/* Center content */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-studio-text-muted">Center:</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onUpdate({ content: { ...content, centerContent: undefined } })}
            className={`
              px-3 py-1.5 text-xs rounded-lg transition-colors
              ${
                !content.centerContent
                  ? 'bg-studio-accent text-brand-primary'
                  : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
              }
            `}
          >
            None
          </button>
          {Object.keys(CENTER_ICONS).map((icon) => {
            const IconComponent = CENTER_ICONS[icon as keyof typeof CENTER_ICONS];
            return (
              <button
                type="button"
                key={icon}
                onClick={() => onUpdate({ content: { ...content, centerContent: icon } })}
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${
                    content.centerContent === icon
                      ? 'bg-studio-accent text-brand-primary'
                      : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="py-4 border border-dashed border-studio-surface/30 rounded-lg">
        <div className="relative flex items-center justify-center">
          {style === 'gradient' ? (
            <div
              className="w-full h-px bg-linear-to-r from-transparent via-studio-accent to-transparent"
              style={{ height: thickness }}
            />
          ) : (
            <hr
              className={`w-full ${DIVIDER_STYLES[style]}`}
              style={{
                borderTopWidth: thickness,
                borderColor: color,
              }}
            />
          )}

          {content.centerContent && (
            <div className="absolute bg-studio-bg px-4">
              {CENTER_ICONS[content.centerContent as keyof typeof CENTER_ICONS] ? (
                React.createElement(
                  CENTER_ICONS[content.centerContent as keyof typeof CENTER_ICONS],
                  { className: 'w-4 h-4 text-studio-text-muted' },
                )
              ) : (
                <span className="text-sm text-studio-text-muted">{content.centerContent}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DividerBlock;
