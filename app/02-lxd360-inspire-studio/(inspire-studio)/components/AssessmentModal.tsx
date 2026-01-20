'use client';

import { ClipboardCheck, Database, X } from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'create' | 'questionBank') => void;
}

export function AssessmentModal({ isOpen, onClose, onSelectOption }: AssessmentModalProps) {
  if (!isOpen) return null;

  const handleSelect = (option: 'create' | 'questionBank') => {
    onSelectOption(option);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close modal"
      />
      <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Add Assessment</h2>
        <p className="text-sm text-gray-600 mb-6">Choose how you want to create your assessment</p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSelect('create')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <ClipboardCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Custom Assessment</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Build a new assessment from scratch with your own questions
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('questionBank')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Use Question Bank</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select questions from your existing question library
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
