'use client';

/**
 * CompletionCertificate - Modal showing course completion certificate
 *
 * Features:
 * - Celebration animation on completion
 * - Certificate preview
 * - Download and share options
 * - Accessible modal with keyboard navigation
 */

import {
  AwardIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  ShareIcon,
  TrophyIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface CertificateData {
  /** Certificate ID */
  id: string;
  /** Learner name */
  learnerName: string;
  /** Course title */
  courseTitle: string;
  /** Organization/tenant name */
  organizationName?: string;
  /** Completion date */
  completedAt: string;
  /** Final score (if applicable) */
  score?: number;
  /** Time spent in minutes */
  timeSpent?: number;
  /** Verification code */
  verificationCode?: string;
  /** Certificate URL for download/sharing */
  certificateUrl?: string;
}

export interface CompletionCertificateProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Certificate data */
  certificate: CertificateData;
  /** Callback when download is clicked */
  onDownload?: (certificate: CertificateData) => void;
  /** Callback when share is clicked */
  onShare?: (certificate: CertificateData) => void;
  /** Custom className for the dialog */
  className?: string;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function CompletionCertificate({
  open,
  onOpenChange,
  certificate,
  onDownload,
  onShare,
  className,
}: CompletionCertificateProps): React.JSX.Element {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      await onDownload?.(certificate);
    } finally {
      setIsDownloading(false);
    }
  }, [certificate, onDownload]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      if (navigator.share && certificate.certificateUrl) {
        await navigator.share({
          title: `Certificate: ${certificate.courseTitle}`,
          text: `I completed ${certificate.courseTitle}!`,
          url: certificate.certificateUrl,
        });
      } else {
        await onShare?.(certificate);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await onShare?.(certificate);
      }
    } finally {
      setIsSharing(false);
    }
  }, [certificate, onShare]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg', className)} showCloseButton={false}>
        {/* Celebration Header */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-xl opacity-50 motion-safe:animate-pulse" />
            <div className="relative bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full p-4">
              <TrophyIcon className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>

        <DialogHeader className="pt-8 text-center border-none pb-0">
          <DialogTitle className="text-2xl flex flex-col items-center gap-2">
            <span className="text-success">Congratulations!</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            You have successfully completed the course
          </DialogDescription>
        </DialogHeader>

        {/* Certificate Preview */}
        <div className="mt-4 p-6 rounded-lg border-2 border-dashed border-border/50 bg-gradient-to-br from-card via-card to-muted/20">
          {/* Certificate Content */}
          <div className="text-center space-y-4">
            {/* Award Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-lxd-primary/10 p-3">
                <AwardIcon className="h-10 w-10 text-lxd-primary" aria-hidden="true" />
              </div>
            </div>

            {/* Certificate Text */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This certifies that</p>
              <p className="text-xl font-bold">{certificate.learnerName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">has completed</p>
              <p className="text-lg font-semibold text-lxd-primary">{certificate.courseTitle}</p>
            </div>

            {certificate.organizationName && (
              <p className="text-sm text-muted-foreground">
                Issued by {certificate.organizationName}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-6 pt-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                <span>{formatDate(certificate.completedAt)}</span>
              </div>

              {certificate.score !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2Icon className="h-4 w-4 text-success" aria-hidden="true" />
                  <span>Score: {certificate.score}%</span>
                </div>
              )}

              {certificate.timeSpent !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ClockIcon className="h-4 w-4" aria-hidden="true" />
                  <span>{formatDuration(certificate.timeSpent)}</span>
                </div>
              )}
            </div>

            {/* Verification Code */}
            {certificate.verificationCode && (
              <div className="pt-4 border-t border-border/50 mt-4">
                <p className="text-xs text-muted-foreground">
                  Verification Code:{' '}
                  <span className="font-mono font-medium">{certificate.verificationCode}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-row gap-2 sm:gap-2 mt-0 border-none bg-transparent">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
            Close
          </Button>

          {onDownload && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              loading={isDownloading}
              className="flex-1"
            >
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Download
            </Button>
          )}

          {(onShare || certificate.certificateUrl) && (
            <Button
              type="button"
              variant="default"
              onClick={handleShare}
              loading={isSharing}
              className="flex-1"
            >
              <ShareIcon className="h-4 w-4" aria-hidden="true" />
              Share
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage certificate modal state
 */
export interface UseCertificateModalReturn {
  isOpen: boolean;
  certificate: CertificateData | null;
  openCertificate: (certificate: CertificateData) => void;
  closeCertificate: () => void;
}

export function useCertificateModal(): UseCertificateModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  const openCertificate = useCallback((cert: CertificateData) => {
    setCertificate(cert);
    setIsOpen(true);
  }, []);

  const closeCertificate = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    certificate,
    openCertificate,
    closeCertificate,
  };
}
