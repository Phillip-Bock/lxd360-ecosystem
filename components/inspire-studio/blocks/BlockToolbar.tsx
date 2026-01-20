'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Code,
  Copy,
  Eye,
  EyeOff,
  Layers,
  Lock,
  type LucideIcon,
  MoreHorizontal,
  Palette,
  Settings,
  Trash2,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import type { Block } from '@/types/blocks';

/**
 * Props for BlockToolbar
 */
interface BlockToolbarProps {
  block: Block;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onOpenSettings?: () => void;
  onToggleVisibility?: () => void;
  onToggleLock?: () => void;
}

/**
 * BlockToolbar - Floating toolbar for block actions
 */
export function BlockToolbar({
  block,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onOpenSettings,
  onToggleVisibility,
  onToggleLock,
}: BlockToolbarProps): React.JSX.Element {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-0.5 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl px-1 py-1">
        {/* Block type label */}
        <div className="px-2 py-1 text-xs text-studio-text-muted border-r border-studio-surface/30 mr-1">
          {formatBlockType(block.type)}
        </div>

        {/* Move up */}
        {onMoveUp && (
          <ToolbarButton icon={ArrowUp} label="Move up" onClick={onMoveUp} shortcut="⌘↑" />
        )}

        {/* Move down */}
        {onMoveDown && (
          <ToolbarButton icon={ArrowDown} label="Move down" onClick={onMoveDown} shortcut="⌘↓" />
        )}

        <ToolbarDivider />

        {/* Duplicate */}
        {onDuplicate && (
          <ToolbarButton icon={Copy} label="Duplicate" onClick={onDuplicate} shortcut="⌘D" />
        )}

        {/* Delete */}
        {onDelete && (
          <ToolbarButton
            icon={Trash2}
            label="Delete"
            onClick={onDelete}
            shortcut="⌫"
            variant="danger"
          />
        )}

        <ToolbarDivider />

        {/* Settings */}
        <ToolbarButton icon={Settings} label="Settings" onClick={onOpenSettings} />

        {/* More menu */}
        <div className="relative">
          <ToolbarButton
            ref={moreButtonRef}
            icon={MoreHorizontal}
            label="More options"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            active={showMoreMenu}
          />

          {/* More dropdown */}
          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute top-full right-0 mt-1 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl py-1 min-w-[180px] z-50"
              >
                <DropdownItem
                  icon={onToggleVisibility ? (block.conditions?.length ? EyeOff : Eye) : Eye}
                  label={block.conditions?.length ? 'Show conditions' : 'Add conditions'}
                  onClick={() => {
                    onToggleVisibility?.();
                    setShowMoreMenu(false);
                  }}
                />
                <DropdownItem
                  icon={Lock}
                  label="Lock block"
                  onClick={() => {
                    onToggleLock?.();
                    setShowMoreMenu(false);
                  }}
                />
                <DropdownDivider />
                <DropdownItem
                  icon={Palette}
                  label="Edit style"
                  onClick={() => {
                    setShowMoreMenu(false);
                  }}
                />
                <DropdownItem
                  icon={Layers}
                  label="Animation"
                  onClick={() => {
                    setShowMoreMenu(false);
                  }}
                />
                <DropdownDivider />
                <DropdownItem
                  icon={Code}
                  label="View JSON"
                  onClick={() => {
                    setShowMoreMenu(false);
                  }}
                />
                <DropdownItem
                  icon={Copy}
                  label="Copy block ID"
                  onClick={() => {
                    navigator.clipboard.writeText(block.id);
                    setShowMoreMenu(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual toolbar button
 */
interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  shortcut?: string;
  variant?: 'default' | 'danger';
  active?: boolean;
  disabled?: boolean;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ icon: Icon, label, onClick, shortcut, variant = 'default', active, disabled }, ref) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <div className="relative">
        <button
          type="button"
          ref={ref}
          onClick={onClick}
          disabled={disabled}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`
            p-1.5 rounded transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${active ? 'bg-studio-surface' : ''}
            ${
              variant === 'danger'
                ? 'text-studio-text-muted hover:text-brand-error hover:bg-red-400/10'
                : 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50'
            }
          `}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </button>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-studio-surface rounded text-xs text-brand-primary whitespace-nowrap pointer-events-none z-50"
            >
              {label}
              {shortcut && <span className="ml-2 text-studio-text-muted">{shortcut}</span>}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-studio-surface" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

ToolbarButton.displayName = 'ToolbarButton';

/**
 * Toolbar divider
 */
function ToolbarDivider(): React.JSX.Element {
  return <div className="w-px h-4 bg-studio-surface/50 mx-1" />;
}

/**
 * Dropdown menu item
 */
interface DropdownItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  shortcut?: string;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

function DropdownItem({
  icon: Icon,
  label,
  onClick,
  shortcut,
  variant = 'default',
  disabled,
}: DropdownItemProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${
          variant === 'danger'
            ? 'text-brand-error hover:bg-red-400/10'
            : 'text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary'
        }
      `}
    >
      <Icon className="w-4 h-4 text-studio-text-muted" />
      <span className="flex-1">{label}</span>
      {shortcut && <span className="text-xs text-studio-text-muted">{shortcut}</span>}
    </button>
  );
}

/**
 * Dropdown divider
 */
function DropdownDivider(): React.JSX.Element {
  return <div className="h-px bg-studio-surface/30 my-1" />;
}

/**
 * Format block type for display
 */
function formatBlockType(type: string): string {
  // Convert camelCase to Title Case with spaces
  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export default BlockToolbar;
