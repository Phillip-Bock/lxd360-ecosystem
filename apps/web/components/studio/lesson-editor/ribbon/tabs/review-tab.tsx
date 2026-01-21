'use client';

/**
 * ReviewTab - Quality assurance and preview ribbon tab
 * Contains: Preview, Accessibility, Spell Check, Comments, Version History
 */

import {
  Accessibility,
  AlertCircle,
  BookOpen,
  CheckCircle,
  CheckSquare,
  ExternalLink,
  Eye,
  FileCheck,
  FileQuestion,
  History,
  ListChecks,
  MessageCircle,
  MessageSquare,
  Monitor,
  PlayCircle,
  RefreshCw,
  Scale,
  Share2,
  Smartphone,
  SpellCheck,
  Tablet,
  TestTube,
  UserCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  RibbonButton,
  RibbonContent,
  RibbonDropdown,
  RibbonGroup,
  RibbonSeparator,
  RibbonToggleGroup,
} from '@/components/ribbon';

// Super light blue for icons
const ICON = 'text-sky-400';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type ReviewStatus = 'draft' | 'review' | 'approved' | 'published';

export interface ReviewTabProps {
  // Preview
  previewDevice?: PreviewDevice;
  onPreviewDeviceChange?: (device: PreviewDevice) => void;
  onPreviewInEditor?: () => void;
  onPreviewNewTab?: () => void;
  onPreviewFullscreen?: () => void;
  onTestLearner?: () => void;

  // Accessibility
  accessibilityScore?: number;
  onRunAccessibilityCheck?: () => void;
  onViewAccessibilityReport?: () => void;
  onAutoFixAccessibility?: () => void;

  // Spell check & grammar
  onRunSpellCheck?: () => void;
  onRunGrammarCheck?: () => void;
  spellingErrors?: number;
  grammarErrors?: number;

  // Readability
  readabilityScore?: number;
  readabilityLevel?: string;
  onCheckReadability?: () => void;
  onImproveReadability?: () => void;

  // Comments & collaboration
  commentsCount?: number;
  onToggleComments?: () => void;
  onAddComment?: () => void;
  onResolveAll?: () => void;

  // Version history
  onViewHistory?: () => void;
  onCompareVersions?: () => void;
  onRestoreVersion?: () => void;
  lastModified?: Date | null;

  // Review workflow
  reviewStatus?: ReviewStatus;
  onSubmitForReview?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestChanges?: () => void;

  // Share & export
  onSharePreview?: () => void;
  onExportForReview?: () => void;

  // Quality checks
  onRunAllChecks?: () => void;
  qualityScore?: number;
}

const REVIEW_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
];

export function ReviewTab({
  previewDevice = 'desktop',
  onPreviewDeviceChange,
  onPreviewInEditor,
  onPreviewNewTab,
  onPreviewFullscreen,
  onTestLearner,
  accessibilityScore,
  onRunAccessibilityCheck,
  onViewAccessibilityReport,
  onAutoFixAccessibility,
  onRunSpellCheck,
  onRunGrammarCheck,
  spellingErrors = 0,
  grammarErrors = 0,
  readabilityScore: _readabilityScore,
  readabilityLevel: _readabilityLevel,
  onCheckReadability,
  onImproveReadability: _onImproveReadability,
  commentsCount = 0,
  onToggleComments,
  onAddComment,
  onResolveAll,
  onViewHistory,
  onCompareVersions,
  onRestoreVersion,
  lastModified: _lastModified,
  reviewStatus = 'draft',
  onSubmitForReview,
  onApprove,
  onReject,
  onRequestChanges,
  onSharePreview,
  onExportForReview,
  onRunAllChecks,
  qualityScore,
}: ReviewTabProps) {
  const handleDeviceChange = (value: string | string[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    if (val) {
      onPreviewDeviceChange?.(val as PreviewDevice);
    }
  };

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return 'text-gray-400';
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <RibbonContent>
      {/* Preview Group */}
      <RibbonGroup label="Preview">
        <div className="flex items-center gap-1">
          <RibbonButton
            icon={<Eye className={`h-5 w-5 ${ICON}`} />}
            label="Preview"
            size="lg"
            onClick={onPreviewInEditor}
            tooltip="Preview in editor"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonToggleGroup
              type="single"
              value={previewDevice}
              onValueChange={handleDeviceChange}
              items={[
                { value: 'desktop', icon: Monitor, label: 'Desktop' },
                { value: 'tablet', icon: Tablet, label: 'Tablet' },
                { value: 'mobile', icon: Smartphone, label: 'Mobile' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<ExternalLink className={`h-4 w-4 ${ICON}`} />}
              onClick={onPreviewNewTab}
              tooltip="Preview in new tab"
            />
            <RibbonButton
              icon={<PlayCircle className={`h-4 w-4 ${ICON}`} />}
              onClick={onPreviewFullscreen}
              tooltip="Fullscreen preview"
            />
          </div>
          <RibbonButton
            icon={<TestTube className={`h-4 w-4 ${ICON}`} />}
            onClick={onTestLearner}
            tooltip="Test as learner"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Accessibility Group */}
      <RibbonGroup label="Accessibility">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Accessibility className={`h-5 w-5 ${ICON}`} />}
            label="Check"
            size="lg"
            onClick={onRunAccessibilityCheck}
            tooltip="Run accessibility check"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<FileCheck className={`h-4 w-4 ${ICON}`} />}
              onClick={onViewAccessibilityReport}
              tooltip="View report"
            />
            <RibbonButton
              icon={<Zap className={`h-4 w-4 ${ICON}`} />}
              onClick={onAutoFixAccessibility}
              tooltip="Auto-fix issues"
            />
          </div>
          {accessibilityScore !== undefined && (
            <div className="flex flex-col items-center px-2">
              <span className={`text-lg font-bold ${getScoreColor(accessibilityScore)}`}>
                {accessibilityScore}%
              </span>
              <span className="text-[10px] text-gray-500">Score</span>
            </div>
          )}
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Spell Check Group */}
      <RibbonGroup label="Proofing">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<SpellCheck className={`h-5 w-5 ${ICON}`} />}
            label="Spelling"
            size="lg"
            onClick={onRunSpellCheck}
            tooltip="Check spelling"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<FileQuestion className={`h-4 w-4 ${ICON}`} />}
              onClick={onRunGrammarCheck}
              tooltip="Check grammar"
            />
            <RibbonButton
              icon={<BookOpen className={`h-4 w-4 ${ICON}`} />}
              onClick={onCheckReadability}
              tooltip="Check readability"
            />
          </div>
          {(spellingErrors > 0 || grammarErrors > 0) && (
            <div className="flex flex-col items-center px-2 text-xs">
              {spellingErrors > 0 && (
                <span className="text-red-500">{spellingErrors} spelling</span>
              )}
              {grammarErrors > 0 && <span className="text-amber-500">{grammarErrors} grammar</span>}
            </div>
          )}
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Comments Group */}
      <RibbonGroup label="Comments">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<MessageSquare className={`h-5 w-5 ${ICON}`} />}
            label="Comments"
            size="lg"
            onClick={onToggleComments}
            tooltip="Toggle comments panel"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<MessageCircle className={`h-4 w-4 ${ICON}`} />}
              onClick={onAddComment}
              tooltip="Add comment"
            />
            <RibbonButton
              icon={<CheckSquare className={`h-4 w-4 ${ICON}`} />}
              onClick={onResolveAll}
              tooltip="Resolve all"
            />
          </div>
          {commentsCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {commentsCount}
            </span>
          )}
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Version History Group */}
      <RibbonGroup label="History">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<History className={`h-5 w-5 ${ICON}`} />}
            label="History"
            size="lg"
            onClick={onViewHistory}
            tooltip="View version history"
          />
          <div className="flex flex-col gap-0.5">
            <RibbonButton
              icon={<Scale className={`h-4 w-4 ${ICON}`} />}
              onClick={onCompareVersions}
              tooltip="Compare versions"
            />
            <RibbonButton
              icon={<RefreshCw className={`h-4 w-4 ${ICON}`} />}
              onClick={onRestoreVersion}
              tooltip="Restore version"
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Review Workflow Group */}
      <RibbonGroup label="Workflow">
        <div className="flex items-center gap-1">
          <RibbonDropdown
            options={REVIEW_STATUS_OPTIONS}
            value={reviewStatus}
            onValueChange={() => {}}
            placeholder="Status"
          />
          <div className="flex gap-0.5">
            {reviewStatus === 'draft' && (
              <RibbonButton
                icon={<UserCheck className={`h-4 w-4 ${ICON}`} />}
                onClick={onSubmitForReview}
                tooltip="Submit for review"
              />
            )}
            {reviewStatus === 'review' && (
              <>
                <RibbonButton
                  icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                  onClick={onApprove}
                  tooltip="Approve"
                />
                <RibbonButton
                  icon={<XCircle className="h-4 w-4 text-red-500" />}
                  onClick={onReject}
                  tooltip="Reject"
                />
                <RibbonButton
                  icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
                  onClick={onRequestChanges}
                  tooltip="Request changes"
                />
              </>
            )}
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Share Group */}
      <RibbonGroup label="Share">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            icon={<Share2 className={`h-5 w-5 ${ICON}`} />}
            label="Share"
            size="lg"
            onClick={onSharePreview}
            tooltip="Share preview link"
          />
          <RibbonButton
            icon={<ExternalLink className={`h-4 w-4 ${ICON}`} />}
            onClick={onExportForReview}
            tooltip="Export for review"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Quality Score Group */}
      <RibbonGroup label="Quality">
        <div className="flex items-center gap-2">
          <RibbonButton
            icon={<ListChecks className={`h-5 w-5 ${ICON}`} />}
            label="Run All"
            size="lg"
            onClick={onRunAllChecks}
            tooltip="Run all quality checks"
          />
          {qualityScore !== undefined && (
            <div className="flex flex-col items-center px-2">
              <span className={`text-xl font-bold ${getScoreColor(qualityScore)}`}>
                {qualityScore}
              </span>
              <span className="text-[10px] text-gray-500">Quality</span>
            </div>
          )}
        </div>
      </RibbonGroup>
    </RibbonContent>
  );
}
