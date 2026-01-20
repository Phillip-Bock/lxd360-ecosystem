import { AlertTriangle, X } from 'lucide-react';

interface VersionRevertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  versionNumber: number;
  versionDate: string;
}

export const VersionRevertModal = ({
  isOpen,
  onClose,
  onConfirm,
  versionNumber,
  versionDate,
}: VersionRevertModalProps): React.JSX.Element | null => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-revert-modal-title"
    >
      <div className="bg-brand-surface rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-brand-default px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h2 id="version-revert-modal-title" className="text-xl font-bold text-brand-primary">
              Revert to Previous Version
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-brand-surface rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-brand-muted" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-brand-secondary mb-4">
            Are you sure you want to revert to{' '}
            <span className="font-semibold">Version {versionNumber}</span>?
          </p>
          <div className="bg-brand-page rounded-lg p-4 mb-6 border border-brand-default">
            <div className="text-sm text-brand-secondary mb-1">Version Details:</div>
            <div className="font-medium text-brand-primary">Version {versionNumber}</div>
            <div className="text-sm text-brand-muted">{versionDate}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              <span className="font-semibold">Warning:</span> This action will replace your current
              lesson content with the selected version. Any unsaved changes will be lost.
            </p>
          </div>
        </div>

        <div className="border-t border-brand-default px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-brand-surface border border-brand-strong text-brand-secondary rounded-lg font-medium hover:bg-brand-page transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-brand-primary rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Revert to Version {versionNumber}
          </button>
        </div>
      </div>
    </div>
  );
};
