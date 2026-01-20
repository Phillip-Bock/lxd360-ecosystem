'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  BarChart2,
  BookOpen,
  Check,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  List,
  Palette,
  Plus,
  Puzzle,
  Settings,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useOutlineStore } from '@/store/outline-store';
import type { AuthorDisplayMode, BankOption, CourseTheme, ExportFormat } from '@/types/outline';
import { TitleBackgroundModal } from './title-background-modal';

const THEME_OPTIONS: { value: CourseTheme; label: string; colors: string }[] = [
  { value: 'neural-dark', label: 'Neural Dark', colors: 'bg-slate-900 text-cyan-400' },
  { value: 'neural-light', label: 'Neural Light', colors: 'bg-slate-100 text-cyan-600' },
  { value: 'corporate-blue', label: 'Corporate Blue', colors: 'bg-blue-900 text-blue-200' },
  { value: 'warm-earth', label: 'Warm Earth', colors: 'bg-amber-900 text-amber-200' },
  { value: 'vibrant-tech', label: 'Vibrant Tech', colors: 'bg-purple-900 text-purple-300' },
];

const EXPORT_FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'scorm-1.2', label: 'SCORM 1.2' },
  { value: 'scorm-2004', label: 'SCORM 2004' },
  { value: 'xapi', label: 'xAPI' },
  { value: 'cmi5', label: 'cmi5' },
  { value: 'html5', label: 'HTML5' },
  { value: 'pdf', label: 'PDF' },
];

const AUTHOR_DISPLAY_OPTIONS: { value: AuthorDisplayMode; label: string }[] = [
  { value: 'avatar', label: 'With Avatar' },
  { value: 'name-only', label: 'Name Only' },
  { value: 'none', label: 'No Author' },
];

const DESCRIPTION_MAX_LENGTH = 500;

// Mock bank data - in production this would come from an API
const MOCK_BANKS: BankOption[] = [
  {
    id: 'bank-1',
    name: 'Compliance Questions',
    description: 'Annual compliance training questions',
    itemCount: 25,
    category: 'Compliance',
  },
  {
    id: 'bank-2',
    name: 'Safety Assessment',
    description: 'Workplace safety scenarios',
    itemCount: 40,
    category: 'Safety',
  },
  {
    id: 'bank-3',
    name: 'Leadership Skills',
    description: 'Leadership competency questions',
    itemCount: 30,
    category: 'Leadership',
  },
  {
    id: 'bank-4',
    name: 'Technical Knowledge',
    description: 'Technical skill assessments',
    itemCount: 50,
    category: 'Technical',
  },
];

// Static button style - medium-light blue with rounded corners and shadow
const staticButtonClass =
  'flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-blue-400/30 rounded-lg shadow-md cursor-pointer';

export function OutlineSidebar() {
  const {
    outline,
    selectedModuleId,
    setTheme,
    setTitle,
    setTitleAlignment,
    setDescription,
    setExportFormat,
    setAuthorDisplayMode,
    setAuthorName,
    addModule,
    addLesson,
    addCheckOnLearning,
    openBankSelector,
    closeBankSelector,
    isBankSelectorOpen,
    bankSelectorType,
    addAssessment,
    addQuestionBank,
    addSurvey,
    addSurveyBank,
    isObjectivesModalOpen,
    openObjectivesModal,
    closeObjectivesModal,
    addObjective,
    updateObjective,
    removeObjective,
    openTitleSettings,
  } = useOutlineStore();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [editingObjectiveText, setEditingObjectiveText] = useState('');

  // Use selected module if available, otherwise fall back to first module
  const targetModuleId = selectedModuleId || outline.modules[0]?.id || null;

  const handleAddModule = () => {
    addModule();
  };

  const handleAddLesson = () => {
    const moduleId = targetModuleId ?? addModule();
    addLesson(moduleId);
  };

  const handleAddCheckOnLearning = () => {
    const moduleId = targetModuleId ?? addModule();
    addCheckOnLearning(moduleId);
  };

  const handleBankSelect = (bank: BankOption) => {
    switch (bankSelectorType) {
      case 'assessment':
        addAssessment(targetModuleId, bank.id);
        break;
      case 'question-bank':
        addQuestionBank(targetModuleId, bank.id, bank.name, bank.itemCount);
        break;
      case 'survey':
        addSurvey(targetModuleId, bank.id);
        break;
      case 'survey-bank':
        addSurveyBank(targetModuleId, bank.id, bank.name, bank.itemCount);
        break;
    }
    closeBankSelector();
  };

  const handleAddObjective = () => {
    if (newObjectiveText.trim()) {
      addObjective(newObjectiveText.trim());
      setNewObjectiveText('');
    }
  };

  const handleUpdateObjective = (id: string) => {
    if (editingObjectiveText.trim()) {
      updateObjective(id, editingObjectiveText.trim());
    }
    setEditingObjectiveId(null);
    setEditingObjectiveText('');
  };

  const startEditingObjective = (id: string, text: string) => {
    setEditingObjectiveId(id);
    setEditingObjectiveText(text);
  };

  return (
    <aside className="w-80 shrink-0 bg-(--inspire-sidebar-bg) border-r border-(--inspire-sidebar-border) h-full flex flex-col overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-purple-900/50 [&::-webkit-scrollbar-thumb]:bg-blue-400/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-400/80">
        {/* Header Section */}
        <div className="p-4 space-y-4">
          {/* Theme Selector */}
          <div>
            <button
              type="button"
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className={staticButtonClass}
            >
              <Palette className="w-5 h-5 text-(--neural-cyan)" />
              <span className="text-white">Theme</span>
              <span className="ml-auto text-xs text-white">
                {THEME_OPTIONS.find((t) => t.value === outline.theme)?.label}
              </span>
            </button>
            {isThemeOpen && (
              <div className="mt-2 p-2 bg-(--inspire-widget-bg) rounded-lg space-y-1">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    type="button"
                    key={theme.value}
                    onClick={() => {
                      setTheme(theme.value);
                      setIsThemeOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md ${
                      outline.theme === theme.value
                        ? 'bg-(--neural-cyan)/20 text-(--neural-cyan)'
                        : 'text-white'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded ${theme.colors}`} />
                    {theme.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Format with Switches */}
          <fieldset>
            <legend className="block text-xs font-medium text-white mb-2">Export Format</legend>
            <div className="flex flex-col gap-1">
              {EXPORT_FORMAT_OPTIONS.map((format) => (
                <div
                  key={format.value}
                  className="flex items-center justify-between px-3 py-1.5 bg-blue-400/30 rounded-lg shadow-md"
                >
                  <span className="text-xs font-medium text-white">{format.label}</span>
                  <Switch
                    checked={outline.exportFormat === format.value}
                    onCheckedChange={() => setExportFormat(format.value)}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    aria-label={`${format.label} export format`}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Author Display with Switches */}
          <fieldset>
            <legend className="block text-xs font-medium text-white mb-2">Author Display</legend>
            <div className="flex flex-col gap-1">
              {AUTHOR_DISPLAY_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center justify-between px-3 py-1.5 bg-blue-400/30 rounded-lg shadow-md"
                >
                  <span className="text-xs font-medium text-white">{option.label}</span>
                  <Switch
                    checked={outline.authorDisplayMode === option.value}
                    onCheckedChange={() => setAuthorDisplayMode(option.value)}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    aria-label={`${option.label} author display mode`}
                  />
                </div>
              ))}
            </div>
            {/* Author Name Input (shown when not 'none') */}
            {outline.authorDisplayMode !== 'none' && (
              <input
                type="text"
                value={outline.authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author name..."
                aria-label="Author name"
                className="mt-2 w-full px-3 py-1.5 text-xs text-gray-900 bg-[#f5f5f5] border border-gray-300 rounded focus:outline-hidden focus:ring-1 focus:ring-(--neural-cyan) placeholder:text-gray-400"
              />
            )}
          </fieldset>

          {/* Course Title with Alignment and Settings */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="course-title-input" className="text-xs font-medium text-white">
                Course Title
              </label>
              <div className="flex items-center gap-1">
                {/* Alignment buttons */}
                <button
                  type="button"
                  onClick={() => setTitleAlignment('left')}
                  className={cn(
                    'p-1 rounded',
                    outline.titleAlignment === 'left'
                      ? 'bg-(--neural-cyan) text-white'
                      : 'text-white',
                  )}
                  aria-label="Align title left"
                  aria-pressed={outline.titleAlignment === 'left'}
                >
                  <AlignLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setTitleAlignment('center')}
                  className={cn(
                    'p-1 rounded',
                    outline.titleAlignment === 'center'
                      ? 'bg-(--neural-cyan) text-white'
                      : 'text-white',
                  )}
                  aria-label="Align title center"
                  aria-pressed={outline.titleAlignment === 'center'}
                >
                  <AlignCenter className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setTitleAlignment('right')}
                  className={cn(
                    'p-1 rounded',
                    outline.titleAlignment === 'right'
                      ? 'bg-(--neural-cyan) text-white'
                      : 'text-white',
                  )}
                  aria-label="Align title right"
                  aria-pressed={outline.titleAlignment === 'right'}
                >
                  <AlignRight className="w-4 h-4" aria-hidden="true" />
                </button>
                {/* Settings gear */}
                <button
                  type="button"
                  onClick={openTitleSettings}
                  className="p-1 rounded text-white"
                  aria-label="Title settings"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <input
              id="course-title-input"
              type="text"
              value={outline.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title..."
              className="w-full px-3 py-2 text-lg font-bold text-gray-900 bg-[#f5f5f5] border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-(--neural-cyan) focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Course Description */}
          <div>
            <label
              htmlFor="course-description-input"
              className="block text-xs font-medium text-white mb-1"
            >
              Course Description
            </label>
            <textarea
              id="course-description-input"
              value={outline.description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description..."
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-[#f5f5f5] border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-(--neural-cyan) focus:border-transparent placeholder:text-gray-400 resize-none"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  outline.description.length >= DESCRIPTION_MAX_LENGTH
                    ? 'text-red-400'
                    : 'text-white'
                }`}
              >
                {outline.description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Course Objectives */}
          <div>
            <button type="button" onClick={openObjectivesModal} className={staticButtonClass}>
              <List className="w-5 h-5 text-(--neural-cyan)" />
              <span className="text-white">Course Objectives</span>
              <span className="ml-auto text-xs text-white">{outline.objectives.length}</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-(--inspire-sidebar-border)" />

        {/* Add Buttons */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-medium text-white uppercase tracking-wider">Add Content</p>

          {/* Add Module */}
          <button type="button" onClick={handleAddModule} className={staticButtonClass}>
            <BookOpen className="w-5 h-5 text-white" />
            <span className="text-white">Module</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-white">
              <Plus className="w-3 h-3" /> Add
            </span>
          </button>

          {/* Add Lesson */}
          <button type="button" onClick={handleAddLesson} className={staticButtonClass}>
            <FileText className="w-5 h-5 text-white" />
            <span className="text-white">Lesson</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-white">
              <Plus className="w-3 h-3" /> Add
            </span>
          </button>

          {/* Scenario Builder - links to builder */}
          <Link href="/inspire-studio/scenario-builder" className={staticButtonClass}>
            <Puzzle className="w-5 h-5 text-white" />
            <span className="text-white">Scenario Builder</span>
            <ArrowRight className="ml-auto w-4 h-4 text-white" />
          </Link>

          {/* Check on Learning */}
          <button type="button" onClick={handleAddCheckOnLearning} className={staticButtonClass}>
            <HelpCircle className="w-5 h-5 text-white" />
            <span className="text-white">Check On Learning</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-white">
              <Plus className="w-3 h-3" /> Add
            </span>
          </button>

          {/* Divider */}
          <hr className="border-(--inspire-sidebar-border) my-2" />

          {/* Assessment */}
          <button
            type="button"
            onClick={() => openBankSelector('assessment')}
            className={staticButtonClass}
          >
            <GraduationCap className="w-5 h-5 text-white" />
            <span className="text-white">Assessment</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-white">
              <Plus className="w-3 h-3" /> Add
            </span>
          </button>

          {/* Surveys */}
          <button
            type="button"
            onClick={() => openBankSelector('survey')}
            className={staticButtonClass}
          >
            <BarChart2 className="w-5 h-5 text-white" />
            <span className="text-white">Surveys</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-white">
              <Plus className="w-3 h-3" /> Add
            </span>
          </button>

          {/* Divider */}
          <hr className="border-(--inspire-sidebar-border) my-2" />

          {/* Question Builder - links to builder */}
          <Link href="/inspire-studio/question-builder" className={staticButtonClass}>
            <ClipboardList className="w-5 h-5 text-white" />
            <span className="text-white">Question Builder</span>
            <ArrowRight className="ml-auto w-4 h-4 text-white" />
          </Link>

          {/* Survey Builder - links to builder */}
          <Link href="/inspire-studio/survey-builder" className={staticButtonClass}>
            <ClipboardList className="w-5 h-5 text-white" />
            <span className="text-white">Survey Builder</span>
            <ArrowRight className="ml-auto w-4 h-4 text-white" />
          </Link>
        </div>
      </div>

      {/* Bank Selector Modal */}
      {isBankSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg bg-(--inspire-sidebar-bg) border border-(--inspire-card-border) rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-(--inspire-card-border)">
              <h2 className="text-lg font-semibold text-white">
                Select{' '}
                {bankSelectorType === 'assessment'
                  ? 'Assessment'
                  : bankSelectorType === 'question-bank'
                    ? 'Question Bank'
                    : bankSelectorType === 'survey'
                      ? 'Survey'
                      : 'Survey Bank'}
              </h2>
              <button type="button" onClick={closeBankSelector} className="p-1 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {MOCK_BANKS.map((bank) => (
                <button
                  type="button"
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className="flex flex-col gap-1 w-full p-3 text-left bg-(--inspire-widget-bg) rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{bank.name}</span>
                    <span className="text-xs text-white">{bank.itemCount} items</span>
                  </div>
                  <span className="text-sm text-white">{bank.description}</span>
                  <span className="text-xs text-(--neural-cyan)">{bank.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Objectives Modal */}
      {isObjectivesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg bg-(--inspire-sidebar-bg) border border-(--inspire-card-border) rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-(--inspire-card-border)">
              <h2 className="text-lg font-semibold text-white">Course Objectives</h2>
              <button type="button" onClick={closeObjectivesModal} className="p-1 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Existing Objectives */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {outline.objectives.length === 0 ? (
                  <p className="text-sm text-white text-center py-4">
                    No objectives yet. Add your first objective below.
                  </p>
                ) : (
                  outline.objectives.map((obj, index) => (
                    <div
                      key={obj.id}
                      className="flex items-start gap-2 p-2 bg-(--inspire-widget-bg) rounded-lg"
                    >
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center text-xs font-medium text-(--neural-cyan) bg-(--neural-cyan)/20 rounded-full">
                        {index + 1}
                      </span>
                      {editingObjectiveId === obj.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingObjectiveText}
                            onChange={(e) => setEditingObjectiveText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateObjective(obj.id);
                              if (e.key === 'Escape') {
                                setEditingObjectiveId(null);
                                setEditingObjectiveText('');
                              }
                            }}
                            className="flex-1 px-2 py-1 text-sm text-gray-900 bg-[#f5f5f5] border border-gray-300 rounded focus:outline-hidden focus:ring-2 focus:ring-(--neural-cyan)"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateObjective(obj.id)}
                            className="p-1 text-(--neural-cyan)"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="flex-1 text-sm text-white cursor-pointer text-left"
                            onClick={() => startEditingObjective(obj.id, obj.text)}
                            aria-label={`Edit objective: ${obj.text}`}
                          >
                            {obj.text}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeObjective(obj.id)}
                            className="p-1 text-white"
                            aria-label={`Remove objective: ${obj.text}`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New Objective */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjectiveText}
                  onChange={(e) => setNewObjectiveText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddObjective();
                  }}
                  placeholder="Add a new objective..."
                  className="flex-1 px-3 py-2 text-sm text-gray-900 bg-[#f5f5f5] border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-(--neural-cyan) placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  disabled={!newObjectiveText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-(--neural-cyan) rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Background Settings Modal */}
      <TitleBackgroundModal />
    </aside>
  );
}
