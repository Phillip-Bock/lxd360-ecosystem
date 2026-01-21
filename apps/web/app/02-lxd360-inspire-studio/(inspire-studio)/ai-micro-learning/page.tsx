'use client';

export const dynamic = 'force-dynamic';

import {
  BookOpen,
  ClipboardCheck,
  Edit3,
  Eye,
  FileText,
  GripVertical,
  Plus,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AssessmentModal } from '../components/AssessmentModal';

type ContentItemType = 'module' | 'lesson' | 'assessment';
type LearningType = 'course' | 'microlearning';

interface ContentItem {
  id: string;
  type: ContentItemType;
  title: string;
  description?: string;
  assessmentType?: 'create' | 'questionBank';
  hasContent?: boolean;
}

export default function AIMicroLearning() {
  const router = useRouter();
  const [learningType, setLearningType] = useState<LearningType>('microlearning');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('3-5 minutes');

  const addModule = () => {
    const newModule: ContentItem = {
      id: `module-${Date.now()}`,
      type: 'module',
      title: '',
      description: '',
    };
    setContentItems([...contentItems, newModule]);
  };

  const addLesson = () => {
    const newLesson: ContentItem = {
      id: `lesson-${Date.now()}`,
      type: 'lesson',
      title: '',
      hasContent: false,
    };
    setContentItems([...contentItems, newLesson]);
  };

  const openAssessmentModal = () => {
    setAssessmentModalOpen(true);
  };

  const handleAssessmentOption = (option: 'create' | 'questionBank') => {
    const newAssessment: ContentItem = {
      id: `assessment-${Date.now()}`,
      type: 'assessment',
      title: '',
      assessmentType: option,
    };
    setContentItems([...contentItems, newAssessment]);
  };

  const updateItem = (id: string, updates: Partial<ContentItem>) => {
    setContentItems(contentItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteItem = (id: string) => {
    setContentItems(contentItems.filter((item) => item.id !== id));
  };

  const toggleLessonContent = (id: string) => {
    void id;
    router.push('/dashboard/lxd/author');
  };

  const getItemIcon = (type: ContentItemType) => {
    switch (type) {
      case 'module':
        return <BookOpen className="w-5 h-5 text-brand-blue" />;
      case 'lesson':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'assessment':
        return <ClipboardCheck className="w-5 h-5 text-green-600" />;
    }
  };

  const getItemColor = (type: ContentItemType) => {
    switch (type) {
      case 'module':
        return 'border-blue-200 bg-blue-50';
      case 'lesson':
        return 'border-orange-200 bg-orange-50';
      case 'assessment':
        return 'border-green-200 bg-green-50';
    }
  };

  const getItemLabel = (type: ContentItemType, index: number) => {
    const typeCounts = contentItems.slice(0, index + 1).filter((item) => item.type === type).length;
    switch (type) {
      case 'module':
        return `Module ${typeCounts}`;
      case 'lesson':
        return `Lesson ${typeCounts}`;
      case 'assessment':
        return `Assessment ${typeCounts}`;
    }
  };

  const isMicrolearning = learningType === 'microlearning';

  return (
    <div className="min-h-screen bg-brand-page -m-6 lg:-m-8">
      <header className="bg-brand-surface border-b border-brand-default sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="mr-4">
              <h2 className="text-sm font-semibold text-brand-primary">
                AI Micro-Learning Storyboard
              </h2>
              <p className="text-xs text-brand-muted">Create courses or micro-learning modules</p>
            </div>

            <div className="flex items-center gap-2 bg-brand-page rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLearningType('microlearning')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isMicrolearning
                    ? 'bg-orange-600 text-brand-primary'
                    : 'text-brand-secondary hover:text-brand-primary'
                }`}
              >
                Micro-Learning
              </button>
              <button
                type="button"
                onClick={() => setLearningType('course')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  !isMicrolearning
                    ? 'bg-brand-primary text-brand-primary'
                    : 'text-brand-secondary hover:text-brand-primary'
                }`}
              >
                Full Course
              </button>
            </div>

            {!isMicrolearning && (
              <button
                type="button"
                onClick={addModule}
                className="px-4 py-2 bg-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-primary-hover transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Module
              </button>
            )}
            <button
              type="button"
              onClick={addLesson}
              className="px-4 py-2 bg-orange-600 text-brand-primary rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Lesson
            </button>
            <button
              type="button"
              onClick={openAssessmentModal}
              className="px-4 py-2 bg-brand-success text-brand-primary rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Assessment
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/lxd/player-editor')}
              className="px-4 py-2 bg-brand-secondary text-brand-primary rounded-lg font-medium hover:bg-brand-secondary-hover transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Player
            </button>
          </div>

          <div className="flex items-center gap-4">
            {contentItems.length > 0 && (
              <div className="flex items-center gap-4 px-4 py-2 bg-brand-page rounded-lg text-xs text-brand-secondary">
                {!isMicrolearning && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-brand-blue" />
                    <span className="font-medium">
                      {contentItems.filter((i) => i.type === 'module').length}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-orange-600" />
                  <span className="font-medium">
                    {contentItems.filter((i) => i.type === 'lesson').length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ClipboardCheck className="w-3 h-3 text-green-600" />
                  <span className="font-medium">
                    {contentItems.filter((i) => i.type === 'assessment').length}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-primary-hover transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-brand-surface border border-brand-strong text-brand-secondary rounded-lg font-medium hover:bg-brand-page transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="bg-brand-surface rounded-xl shadow-sm border border-brand-default p-8">
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                {isMicrolearning ? 'Module Title' : 'Course Title'}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${isMicrolearning ? 'module' : 'course'} title...`}
                className="w-full px-4 py-3 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                {isMicrolearning ? 'Learning Objective' : 'Course Description'}
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isMicrolearning
                    ? 'What should learners be able to do after completing this module?'
                    : 'Describe your course objectives and outcomes...'
                }
                rows={isMicrolearning ? 3 : 4}
                className="w-full px-4 py-3 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {isMicrolearning && (
              <div className="mb-8">
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-brand-secondary mb-2"
                >
                  Duration
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option>2-3 minutes</option>
                  <option>3-5 minutes</option>
                  <option>5-7 minutes</option>
                </select>
              </div>
            )}

            {contentItems.length === 0 ? (
              <div className="border-t border-brand-default pt-8">
                <div className="text-center py-12 text-brand-muted">
                  {isMicrolearning ? (
                    <FileText className="w-12 h-12 mx-auto mb-3 text-brand-muted" />
                  ) : (
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-brand-muted" />
                  )}
                  <p className="font-medium">No content added yet</p>
                  <p className="text-sm mt-1">
                    {isMicrolearning
                      ? 'Add lessons or assessments to build your micro-learning module'
                      : 'Add modules, lessons, or assessments to structure your course'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-t border-brand-default pt-8">
                <h2 className="text-xl font-bold text-brand-primary mb-6">
                  {isMicrolearning ? 'Content Outline' : 'Course Outline'}
                </h2>
                <div className="space-y-4">
                  {contentItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`border-2 rounded-xl p-5 ${getItemColor(item.type)} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 shrink-0">
                          <GripVertical className="w-4 h-4 text-brand-muted cursor-move" />
                          <div className="w-10 h-10 rounded-lg bg-brand-surface shadow-sm flex items-center justify-center">
                            {getItemIcon(item.type)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <label
                              htmlFor={`${item.id}-title`}
                              className="text-xs font-semibold text-brand-secondary uppercase tracking-wide"
                            >
                              {getItemLabel(item.type, index)}
                            </label>
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors group"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-brand-muted group-hover:text-red-600" />
                            </button>
                          </div>

                          <input
                            id={`${item.id}-title`}
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItem(item.id, { title: e.target.value })}
                            placeholder={`Enter ${item.type} title...`}
                            className="w-full px-4 py-2.5 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent mb-3 bg-brand-surface"
                          />

                          {item.type === 'module' && (
                            <textarea
                              value={item.description || ''}
                              onChange={(e) => updateItem(item.id, { description: e.target.value })}
                              placeholder="Module description (optional)..."
                              rows={2}
                              className="w-full px-4 py-2.5 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-brand-surface"
                            />
                          )}

                          {item.type === 'lesson' && (
                            <button
                              type="button"
                              onClick={() => toggleLessonContent(item.id)}
                              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-brand-success text-brand-primary hover:bg-green-700"
                            >
                              <Edit3 className="w-4 h-4" />
                              {item.hasContent ? 'Edit Lesson Content' : 'Add Lesson Content'}
                            </button>
                          )}

                          {item.type === 'assessment' && item.assessmentType && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-brand-surface rounded-lg border border-brand-strong">
                              <span className="text-xs font-medium text-brand-secondary">
                                Type:
                              </span>
                              <span className="text-sm font-semibold text-brand-primary">
                                {item.assessmentType === 'create'
                                  ? 'Custom Assessment'
                                  : 'Question Bank'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AssessmentModal
        isOpen={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        onSelectOption={handleAssessmentOption}
      />
    </div>
  );
}
