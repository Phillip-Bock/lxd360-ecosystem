'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Review Tab Component
 * =============================================================================
 *
 * Review and collaboration tools for content creators.
 * Includes comments, track changes, version history, spell check,
 * accessibility checking, and publishing workflow.
 */

import {
  // Accessibility
  Accessibility,
  AlertTriangle,
  AtSign,
  BookOpen,
  Check,
  // Workflow
  CheckCircle,
  Clock,
  Diff,
  // Track changes
  Eye,
  EyeOff,
  FileCheck,
  FileX,
  GitCompare,
  History,
  Languages,
  Link2,
  Lock,
  // Comments
  MessageSquare,
  Reply,
  RotateCcw,
  Send as SendIcon,
  Share2,
  // Spell check
  SpellCheck,
  // Compare
  SplitSquareHorizontal,
  Type,
  // Collaboration
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  RibbonButton,
  RibbonGroup,
  RibbonSeparator,
  RibbonSplitButton,
  RibbonToggle,
} from '../groups';

interface ReviewTabProps {
  showComments?: boolean;
  trackChanges?: boolean;
  onAction?: (action: string, options?: unknown) => void;
}

export function ReviewTab({ showComments = true, trackChanges = false, onAction }: ReviewTabProps) {
  const [commentsVisible, setCommentsVisible] = useState(showComments);
  const [trackingEnabled, setTrackingEnabled] = useState(trackChanges);

  const handleAction = (action: string, options?: unknown) => {
    onAction?.(action, options);
  };

  return (
    <div className="flex items-stretch gap-1 px-2 py-1 h-[88px]">
      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 1: COMMENTS
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Comments">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={MessageSquare}
            label="New Comment"
            size="large"
            onClick={() => handleAction('newComment')}
            tooltip="Add a comment"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Reply}
              label="Reply"
              size="small"
              onClick={() => handleAction('replyComment')}
              tooltip="Reply to comment"
            />
            <RibbonButton
              icon={AtSign}
              label="Mention"
              size="small"
              onClick={() => handleAction('mentionUser')}
              tooltip="Mention someone"
            />
            <RibbonToggle
              icon={commentsVisible ? Eye : EyeOff}
              isActive={commentsVisible}
              onClick={() => {
                setCommentsVisible(!commentsVisible);
                handleAction('toggleComments', !commentsVisible);
              }}
              tooltip={commentsVisible ? 'Hide comments' : 'Show comments'}
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 2: TRACK CHANGES
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Changes">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={GitCompare}
            label="Track Changes"
            size="large"
            onClick={() => {
              setTrackingEnabled(!trackingEnabled);
              handleAction('toggleTracking', !trackingEnabled);
            }}
            menuItems={[
              {
                label: trackingEnabled ? 'Turn Off Tracking' : 'Turn On Tracking',
                onClick: () => {
                  setTrackingEnabled(!trackingEnabled);
                  handleAction('toggleTracking', !trackingEnabled);
                },
              },
              { type: 'separator' },
              { label: 'Accept All Changes', onClick: () => handleAction('acceptAllChanges') },
              { label: 'Reject All Changes', onClick: () => handleAction('rejectAllChanges') },
              { type: 'separator' },
              { label: 'Show Original', onClick: () => handleAction('showOriginal') },
              { label: 'Show Final', onClick: () => handleAction('showFinal') },
              { label: 'Show Markup', onClick: () => handleAction('showMarkup') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Check}
              label="Accept"
              size="small"
              onClick={() => handleAction('acceptChange')}
              tooltip="Accept change"
            />
            <RibbonButton
              icon={FileX}
              label="Reject"
              size="small"
              onClick={() => handleAction('rejectChange')}
              tooltip="Reject change"
            />
            <RibbonButton
              icon={History}
              label="History"
              size="small"
              onClick={() => handleAction('viewHistory')}
              tooltip="Version history"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 3: PROOFING
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Proofing">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={SpellCheck}
            label="Spelling"
            size="large"
            onClick={() => handleAction('checkSpelling')}
            menuItems={[
              { label: 'Check Spelling', onClick: () => handleAction('checkSpelling') },
              { label: 'Check Grammar', onClick: () => handleAction('checkGrammar') },
              { label: 'Check All', onClick: () => handleAction('checkAll') },
              { type: 'separator' },
              { label: 'Add to Dictionary', onClick: () => handleAction('addToDictionary') },
              { label: 'Ignore All', onClick: () => handleAction('ignoreAll') },
              { type: 'separator' },
              { label: 'Spelling Options...', onClick: () => handleAction('spellingOptions') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={BookOpen}
              label="Thesaurus"
              size="small"
              onClick={() => handleAction('openThesaurus')}
              tooltip="Find synonyms"
            />
            <RibbonButton
              icon={Type}
              label="Readability"
              size="small"
              onClick={() => handleAction('checkReadability')}
              tooltip="Readability stats"
            />
            <RibbonButton
              icon={Languages}
              label="Language"
              size="small"
              onClick={() => handleAction('setLanguage')}
              tooltip="Set proofing language"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 4: ACCESSIBILITY
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Accessibility">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Accessibility}
            label="Check A11y"
            size="large"
            onClick={() => handleAction('checkAccessibility')}
            menuItems={[
              { label: 'Run Full Check', onClick: () => handleAction('checkAccessibility') },
              { label: 'Check Alt Text', onClick: () => handleAction('checkAltText') },
              { label: 'Check Contrast', onClick: () => handleAction('checkContrast') },
              { label: 'Check Headings', onClick: () => handleAction('checkHeadings') },
              { label: 'Check Links', onClick: () => handleAction('checkLinks') },
              { type: 'separator' },
              { label: 'WCAG 2.1 AA Report', onClick: () => handleAction('wcagReport') },
              { label: 'Section 508 Report', onClick: () => handleAction('section508Report') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Check}
              label="Fix Issues"
              size="small"
              onClick={() => handleAction('fixAccessibilityIssues')}
              tooltip="Auto-fix issues"
            />
            <RibbonButton
              icon={AlertTriangle}
              label="Warnings"
              size="small"
              onClick={() => handleAction('showWarnings')}
              tooltip="View warnings"
              badge="3"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 5: COLLABORATION
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Share">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={Share2}
            label="Share"
            size="large"
            onClick={() => handleAction('share')}
            menuItems={[
              { label: 'Share Link', onClick: () => handleAction('shareLink') },
              { label: 'Invite Collaborators', onClick: () => handleAction('inviteCollaborators') },
              { label: 'Request Review', onClick: () => handleAction('requestReview') },
              { type: 'separator' },
              { label: 'Manage Access', onClick: () => handleAction('manageAccess') },
              { label: 'Export for Review', onClick: () => handleAction('exportForReview') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Users}
              label="Collaborators"
              size="small"
              onClick={() => handleAction('viewCollaborators')}
              tooltip="View collaborators"
            />
            <RibbonButton
              icon={Link2}
              label="Copy Link"
              size="small"
              onClick={() => handleAction('copyLink')}
              tooltip="Copy share link"
            />
            <RibbonToggle
              icon={Lock}
              isActive={false}
              onClick={() => handleAction('toggleLock')}
              tooltip="Lock for editing"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 6: WORKFLOW
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Workflow">
        <div className="flex items-center gap-0.5">
          <RibbonSplitButton
            icon={FileCheck}
            label="Submit"
            size="large"
            onClick={() => handleAction('submitForReview')}
            menuItems={[
              { label: 'Submit for Review', onClick: () => handleAction('submitForReview') },
              { label: 'Request Approval', onClick: () => handleAction('requestApproval') },
              { type: 'separator' },
              { label: 'Approve', onClick: () => handleAction('approve') },
              { label: 'Request Changes', onClick: () => handleAction('requestChanges') },
              { label: 'Reject', onClick: () => handleAction('reject') },
              { type: 'separator' },
              { label: 'Publish', onClick: () => handleAction('publish') },
            ]}
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={CheckCircle}
              label="Approve"
              size="small"
              onClick={() => handleAction('approve')}
              tooltip="Approve content"
            />
            <RibbonButton
              icon={Clock}
              label="Status"
              size="small"
              onClick={() => handleAction('viewStatus')}
              tooltip="Workflow status"
            />
            <RibbonButton
              icon={SendIcon}
              label="Publish"
              size="small"
              onClick={() => handleAction('publish')}
              tooltip="Publish content"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* ═══════════════════════════════════════════════════════════════════
          GROUP 7: COMPARE
          ═══════════════════════════════════════════════════════════════════ */}
      <RibbonGroup label="Compare">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={SplitSquareHorizontal}
            label="Compare"
            size="large"
            onClick={() => handleAction('compareVersions')}
            tooltip="Compare versions"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={Diff}
              label="Diff"
              size="small"
              onClick={() => handleAction('showDiff')}
              tooltip="Show differences"
            />
            <RibbonButton
              icon={RotateCcw}
              label="Restore"
              size="small"
              onClick={() => handleAction('restoreVersion')}
              tooltip="Restore version"
            />
          </div>
        </div>
      </RibbonGroup>
    </div>
  );
}
