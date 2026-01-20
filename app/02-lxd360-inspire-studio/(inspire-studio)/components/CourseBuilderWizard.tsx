'use client';

import { BookOpen, ChevronRight, FileText, Plus, Settings } from 'lucide-react';
import { useState } from 'react';

type WizardStep = 'details' | 'structure' | 'content' | 'settings';

interface CourseDetails {
  title: string;
  description: string;
  category: string;
  level: string;
}

export function CourseBuilderWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [details, setDetails] = useState<CourseDetails>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
  });

  const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Course Details', icon: <FileText className="w-4 h-4" /> },
    { id: 'structure', label: 'Structure', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'content', label: 'Content', icon: <Plus className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 -m-6 lg:-m-8">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Course Builder</h1>
          <p className="text-sm text-gray-600">Create your course step by step</p>
        </div>

        <div className="px-6 pb-4">
          <nav className="flex items-center gap-2" aria-label="Progress">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStep === step.id
                      ? 'bg-blue-100 text-blue-700'
                      : index < currentStepIndex
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {step.icon}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {currentStep === 'details' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={details.title}
                    onChange={(e) => setDetails({ ...details, title: e.target.value })}
                    placeholder="Enter course title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={details.description}
                    onChange={(e) => setDetails({ ...details, description: e.target.value })}
                    placeholder="Describe your course..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      value={details.category}
                      onChange={(e) => setDetails({ ...details, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="compliance">Compliance</option>
                      <option value="leadership">Leadership</option>
                      <option value="technical">Technical Skills</option>
                      <option value="soft-skills">Soft Skills</option>
                      <option value="onboarding">Onboarding</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      id="level"
                      value={details.level}
                      onChange={(e) => setDetails({ ...details, level: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'structure' && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Course Structure</h3>
                <p className="text-gray-600">Define your course modules and lessons here.</p>
              </div>
            )}

            {currentStep === 'content' && (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Add Content</h3>
                <p className="text-gray-600">Add learning content to your course modules.</p>
              </div>
            )}

            {currentStep === 'settings' && (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Course Settings</h3>
                <p className="text-gray-600">
                  Configure course enrollment and completion settings.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => {
                const prevIndex = currentStepIndex - 1;
                if (prevIndex >= 0) setCurrentStep(steps[prevIndex].id);
              }}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < steps.length) setCurrentStep(steps[nextIndex].id);
              }}
              disabled={currentStepIndex === steps.length - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
