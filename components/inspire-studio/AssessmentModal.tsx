'use client';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'create' | 'questionBank') => void;
}

export function AssessmentModal({ isOpen, onClose, onSelectOption }: AssessmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add Assessment</h2>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              onSelectOption('create');
              onClose();
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <div className="font-semibold">Create New Assessment</div>
            <div className="text-sm text-gray-600">Build a custom assessment from scratch</div>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectOption('questionBank');
              onClose();
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <div className="font-semibold">Use Question Bank</div>
            <div className="text-sm text-gray-600">Select from existing question bank</div>
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
