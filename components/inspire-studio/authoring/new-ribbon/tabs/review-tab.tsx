'use client';

import {
  Accessibility,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Eye,
  FileText,
  Languages,
  MessageSquare,
  Type,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { AccessibilityChecker } from '@/components/inspire-studio/accessibility';
import { RibbonButton } from '../ribbon-button';
import { RibbonGroup } from '../ribbon-group';

interface ReviewTabProps {
  onAccessibilityCheckerToggle?: (isOpen: boolean) => void;
  editorSelector?: string;
}

export function ReviewTab({
  onAccessibilityCheckerToggle,
  editorSelector = '#editor-content',
}: ReviewTabProps): React.JSX.Element {
  const [isAccessibilityCheckerOpen, setIsAccessibilityCheckerOpen] = useState(false);

  const handleAccessibilityCheckerClick = useCallback(() => {
    setIsAccessibilityCheckerOpen((prev) => {
      const newState = !prev;
      onAccessibilityCheckerToggle?.(newState);
      return newState;
    });
  }, [onAccessibilityCheckerToggle]);

  const handleAccessibilityCheckerClose = useCallback(() => {
    setIsAccessibilityCheckerOpen(false);
    onAccessibilityCheckerToggle?.(false);
  }, [onAccessibilityCheckerToggle]);

  return (
    <>
      <div className="flex items-start gap-1.5">
        <RibbonGroup title="Review & Collaborate">
          <div className="flex flex-col gap-0.5">
            <RibbonButton icon={MessageSquare} label="Send to Review" size="small" />
            <RibbonButton icon={FileText} label="Review History" size="small" />
            <RibbonButton icon={CheckCircle} label="Accept/Reject" size="small" />
          </div>
        </RibbonGroup>

        <RibbonGroup title="Commenting">
          <div className="flex flex-col gap-0.5">
            <RibbonButton icon={MessageSquare} label="New Comment" size="small" />
            <RibbonButton icon={XCircle} label="Delete Comment" size="small" />
            <RibbonButton icon={Eye} label="Show Comments" size="small" />
          </div>
        </RibbonGroup>

        <RibbonGroup title="Accessibility">
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Accessibility}
              label="Accessibility Checker"
              size="small"
              onClick={handleAccessibilityCheckerClick}
              variant={isAccessibilityCheckerOpen ? 'primary' : 'default'}
            />
            <RibbonButton icon={Type} label="Alt Text" size="small" />
            <RibbonButton icon={ClipboardCheck} label="Tab Order" size="small" />
            <RibbonButton icon={FileText} label="Accessibility Report" size="small" />
          </div>
        </RibbonGroup>

        <RibbonGroup title="Proofing">
          <div className="flex flex-col gap-0.5">
            <RibbonButton icon={BookOpen} label="Spelling" size="small" />
            <RibbonButton icon={Languages} label="Language" size="small" />
            <RibbonButton icon={BookOpen} label="Thesaurus" size="small" />
          </div>
        </RibbonGroup>

        <RibbonGroup title="Quality">
          <div className="flex flex-col gap-0.5">
            <RibbonButton icon={ClipboardCheck} label="Analyze Content" size="small" />
            <RibbonButton icon={FileText} label="Performance Report" size="small" />
          </div>
        </RibbonGroup>
      </div>

      {/* Accessibility Checker Panel */}
      {isAccessibilityCheckerOpen && (
        <AccessibilityChecker
          selector={editorSelector}
          defaultTags={['wcag2aa', 'section508']}
          onClose={handleAccessibilityCheckerClose}
          position="right"
          defaultOpen={true}
        />
      )}
    </>
  );
}
