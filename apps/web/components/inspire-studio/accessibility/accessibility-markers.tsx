'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { AxeViolation, ViolationImpact } from './types';
import { IMPACT_COLORS } from './types';

interface MarkerPosition {
  id: string;
  violationId: string;
  nodeIndex: number;
  impact: ViolationImpact;
  help: string;
  target: string[];
  rect: DOMRect;
  element: HTMLElement;
}

interface AccessibilityMarkersProps {
  violations: AxeViolation[];
  containerSelector?: string;
  highlightedSelector?: string[] | null;
  onMarkerClick?: (violation: AxeViolation, nodeIndex: number) => void;
  showMarkers?: boolean;
  showOverlay?: boolean;
}

const IMPACT_ICONS: Record<ViolationImpact, typeof AlertCircle> = {
  critical: AlertOctagon,
  serious: AlertTriangle,
  moderate: AlertCircle,
  minor: Info,
};

const IMPACT_OUTLINE_COLORS: Record<ViolationImpact, string> = {
  critical: 'rgba(220, 38, 38, 0.8)',
  serious: 'rgba(234, 88, 12, 0.8)',
  moderate: 'rgba(202, 138, 4, 0.8)',
  minor: 'rgba(37, 99, 235, 0.6)',
};

function MarkerTooltip({
  marker,
  violation,
  onClose,
}: {
  marker: MarkerPosition;
  violation: AxeViolation;
  onClose: () => void;
}): React.JSX.Element {
  const colors = IMPACT_COLORS[marker.impact];
  const Icon = IMPACT_ICONS[marker.impact];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className={cn(
        'absolute z-10001 w-72 p-3 rounded-lg shadow-lg border bg-popover',
        colors.border,
      )}
      style={{
        left: marker.rect.left + marker.rect.width / 2 - 144, // Center tooltip
        top: marker.rect.bottom + 8,
      }}
    >
      <div className="flex items-start gap-2">
        <div className={cn('p-1 rounded-full shrink-0', colors.bg)}>
          <Icon className={cn('w-4 h-4', colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium leading-tight">{marker.help}</h4>
            <button
              type="button"
              onClick={onClose}
              className="p-0.5 rounded hover:bg-accent transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{violation.description}</p>
          <a
            href={violation.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            Learn how to fix
          </a>
        </div>
      </div>

      {/* Tooltip arrow */}
      <div
        className="absolute w-3 h-3 bg-popover border-l border-t rotate-45"
        style={{
          top: -6,
          left: 144 - 6, // Center arrow
          borderColor: 'inherit',
        }}
      />
    </motion.div>
  );
}

function MarkerBadge({
  marker,
  isHighlighted,
  onClick,
  onHover,
}: {
  marker: MarkerPosition;
  isHighlighted: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}): React.JSX.Element {
  const colors = IMPACT_COLORS[marker.impact];
  const Icon = IMPACT_ICONS[marker.impact];

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        'absolute z-10000 p-1 rounded-full shadow-md border-2 transition-all',
        colors.bg,
        colors.border,
        isHighlighted && 'ring-2 ring-offset-2 ring-primary',
      )}
      style={{
        left: marker.rect.right - 12,
        top: marker.rect.top - 12,
      }}
      title={marker.help}
    >
      <Icon className={cn('w-3.5 h-3.5', colors.text)} />
    </motion.button>
  );
}

function ElementOverlay({
  marker,
  isHighlighted,
}: {
  marker: MarkerPosition;
  isHighlighted: boolean;
}): React.JSX.Element {
  const outlineColor = IMPACT_OUTLINE_COLORS[marker.impact];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'absolute pointer-events-none z-9999 rounded-sm',
        isHighlighted && 'ring-2 ring-primary',
      )}
      style={{
        left: marker.rect.left - 2,
        top: marker.rect.top - 2,
        width: marker.rect.width + 4,
        height: marker.rect.height + 4,
        outline: `2px dashed ${outlineColor}`,
        outlineOffset: '2px',
        backgroundColor: isHighlighted ? 'rgba(var(--primary), 0.1)' : 'transparent',
      }}
    />
  );
}

export function AccessibilityMarkers({
  violations,
  containerSelector = '#editor-content',
  highlightedSelector,
  onMarkerClick,
  showMarkers = true,
  showOverlay = true,
}: AccessibilityMarkersProps): React.JSX.Element | null {
  const [markers, setMarkers] = useState<MarkerPosition[]>([]);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Calculate marker positions based on violations
  const calculateMarkerPositions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    containerRef.current = container as HTMLElement;
    const newMarkers: MarkerPosition[] = [];

    violations.forEach((violation) => {
      violation.nodes.forEach((node, nodeIndex) => {
        // Try each selector in the target array
        for (const selector of node.target) {
          try {
            const element = document.querySelector(selector) as HTMLElement;
            if (element && container.contains(element)) {
              const rect = element.getBoundingClientRect();

              // Adjust for scroll position
              const adjustedRect = new DOMRect(
                rect.left + window.scrollX,
                rect.top + window.scrollY,
                rect.width,
                rect.height,
              );

              newMarkers.push({
                id: `${violation.id}-${nodeIndex}`,
                violationId: violation.id,
                nodeIndex,
                impact: violation.impact,
                help: violation.help,
                target: node.target,
                rect: adjustedRect,
                element,
              });
              break; // Found the element, no need to try other selectors
            }
          } catch {
            // Silently ignore - invalid CSS selector, skip to next
          }
        }
      });
    });

    setMarkers(newMarkers);
  }, [violations, containerSelector]);

  // Recalculate positions on resize, scroll, or violations change
  useEffect(() => {
    calculateMarkerPositions();

    const handleResize = (): void => {
      requestAnimationFrame(calculateMarkerPositions);
    };

    const handleScroll = (): void => {
      requestAnimationFrame(calculateMarkerPositions);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    // Set up ResizeObserver for the container
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(containerRef.current);
    }

    return (): void => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      resizeObserverRef.current?.disconnect();
    };
  }, [calculateMarkerPositions]);

  const handleMarkerClick = useCallback(
    (marker: MarkerPosition) => {
      const violation = violations.find((v) => v.id === marker.violationId);
      if (violation && onMarkerClick) {
        onMarkerClick(violation, marker.nodeIndex);
      }
      setActiveTooltipId(activeTooltipId === marker.id ? null : marker.id);
    },
    [violations, onMarkerClick, activeTooltipId],
  );

  const isMarkerHighlighted = (marker: MarkerPosition): boolean => {
    return highlightedSelector?.join() === marker.target.join();
  };

  // Render markers using portal to document body
  if (typeof window === 'undefined' || markers.length === 0) {
    return null;
  }

  return createPortal(
    <div className="accessibility-markers-container" aria-hidden="true">
      <AnimatePresence>
        {markers.map((marker) => {
          const isHighlighted = isMarkerHighlighted(marker);
          const isHovered = hoveredMarkerId === marker.id;
          const isActive = activeTooltipId === marker.id;
          const violation = violations.find((v) => v.id === marker.violationId);

          return (
            <div key={marker.id}>
              {/* Element outline overlay */}
              {showOverlay && (isHighlighted || isHovered) && (
                <ElementOverlay marker={marker} isHighlighted={isHighlighted} />
              )}

              {/* Marker badge */}
              {showMarkers && (
                <MarkerBadge
                  marker={marker}
                  isHighlighted={isHighlighted}
                  onClick={() => handleMarkerClick(marker)}
                  onHover={(hovering) => setHoveredMarkerId(hovering ? marker.id : null)}
                />
              )}

              {/* Tooltip */}
              {isActive && violation && (
                <MarkerTooltip
                  marker={marker}
                  violation={violation}
                  onClose={() => setActiveTooltipId(null)}
                />
              )}
            </div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export default AccessibilityMarkers;
