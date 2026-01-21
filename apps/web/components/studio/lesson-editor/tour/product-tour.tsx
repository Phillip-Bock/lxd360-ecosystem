'use client';

/**
 * ProductTour - Step-by-step onboarding for first-time users
 * Highlights UI elements with spotlight effect
 */

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Layers,
  Layout,
  PanelRight,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface ProductTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to INSPIRE Studio',
    description:
      "Let's take a quick tour of the lesson editor. You'll learn how to create engaging, accessible learning content in minutes.",
    icon: <Sparkles className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'canvas',
    title: 'The Canvas',
    description:
      'This is your main workspace. Drag and drop content blocks here to build your lesson. Blocks can be reordered and customized.',
    icon: <Layout className="h-6 w-6" />,
    target: "[data-tour='canvas']",
    position: 'right',
  },
  {
    id: 'ribbon',
    title: 'The Ribbon Toolbar',
    description:
      'Access all tools from the ribbon. Switch between Home, Insert, Design, and other tabs. Context-sensitive tools appear when you select content.',
    icon: <Layers className="h-6 w-6" />,
    target: "[data-tour='ribbon']",
    position: 'bottom',
  },
  {
    id: 'blocks',
    title: 'Content Blocks',
    description:
      'Choose from text, media, quizzes, and interactive blocks. Drag them onto the canvas or click to add at the current position.',
    icon: <Layers className="h-6 w-6" />,
    target: "[data-tour='blocks-sidebar']",
    position: 'right',
  },
  {
    id: 'properties',
    title: 'Properties Panel',
    description:
      'Select any block to see its properties here. Customize appearance, behavior, accessibility settings, and more.',
    icon: <PanelRight className="h-6 w-6" />,
    target: "[data-tour='properties-sidebar']",
    position: 'left',
  },
  {
    id: 'clt',
    title: 'Cognitive Load Analysis',
    description:
      'INSPIRE automatically analyzes your content for cognitive load. The CLT tab shows detailed metrics and suggestions to optimize learning.',
    icon: <Brain className="h-6 w-6" />,
    target: "[data-tour='clt-tab']",
    position: 'bottom',
  },
  {
    id: 'preview',
    title: 'Preview Your Work',
    description:
      'Test your lesson across different devices. Preview mode shows exactly how learners will experience your content.',
    icon: <Play className="h-6 w-6" />,
    target: "[data-tour='preview-button']",
    position: 'bottom',
  },
  {
    id: 'complete',
    title: "You're Ready!",
    description:
      "That's the basics! Explore the editor to discover more features like AI assistance, themes, variables, and accessibility tools.",
    icon: <Check className="h-6 w-6" />,
    position: 'center',
  },
];

const STORAGE_KEY = 'inspire-tour-completed';

/**
 * ProductTour - Interactive onboarding experience
 */
export function ProductTour({ isOpen, onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Find and highlight target element
  useEffect(() => {
    if (!isOpen || !step.target) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setHighlightRect(null);
    }
  }, [isOpen, step.target]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          setHighlightRect(element.getBoundingClientRect());
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [step.target]);

  // handleComplete must be defined before handleNext that uses it
  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onSkip();
  }, [onSkip]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isLastStep, handleComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isFirstStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, handleSkip]);

  if (!isOpen) return null;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!highlightRect || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = 400;
    const tooltipHeight = 200;

    switch (step.position) {
      case 'top':
        return {
          top: highlightRect.top - tooltipHeight - padding,
          left: highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
        };
      case 'bottom':
        return {
          top: highlightRect.bottom + padding,
          left: highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
        };
      case 'left':
        return {
          top: highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2,
          left: highlightRect.left - tooltipWidth - padding,
        };
      case 'right':
        return {
          top: highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2,
          left: highlightRect.right + padding,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 cursor-default border-none"
        onClick={handleSkip}
        aria-label="Skip tour"
        tabIndex={-1}
      />

      {/* Spotlight */}
      {highlightRect && (
        <div
          className="absolute bg-transparent rounded-lg ring-4 ring-primary/50 ring-offset-4 ring-offset-black/0 transition-all duration-300"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          'absolute w-[400px] p-6 rounded-xl',
          'bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10',
          'shadow-2xl shadow-black/50',
          'transition-all duration-200',
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        )}
        style={getTooltipPosition()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">{step.icon}</div>
            <div>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <span className="text-xs text-zinc-500">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-white"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-1 mb-4" />

        {/* Content */}
        <p className="text-sm text-zinc-400 mb-6">{step.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-white"
            onClick={handleSkip}
          >
            Skip tour
          </Button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/10"
                onClick={handlePrevious}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {TOUR_STEPS.map((_, idx) => (
            <button
              type="button"
              key={idx}
              className={cn(
                'h-1.5 rounded-full transition-all',
                idx === currentStep ? 'w-4 bg-primary' : 'w-1.5 bg-zinc-600 hover:bg-zinc-500',
              )}
              onClick={() => setCurrentStep(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if tour should be shown
 */
export function useShouldShowTour(): boolean {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    setShouldShow(!completed);
  }, []);

  return shouldShow;
}

/**
 * Reset tour state (for testing)
 */
export function resetTour(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export default ProductTour;
