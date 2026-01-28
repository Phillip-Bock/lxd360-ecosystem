'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Eye,
  FileCheck,
  Globe,
  Info,
  Lock,
  Scale,
  Shield,
  X,
} from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// AI Ethics & Safety Settings
// ============================================================================

export interface AISettings {
  // Content Safety
  contentModeration: {
    enabled: boolean;
    strictness: 'low' | 'medium' | 'high' | 'maximum';
    filterProfanity: boolean;
    filterViolence: boolean;
    filterSexualContent: boolean;
    filterHateSpeech: boolean;
  };

  // Source Restrictions
  sourceRestrictions: {
    enabled: boolean;
    allowedDomains: string[];
    requireAcademicSources: boolean;
    requirePeerReviewed: boolean;
    blockSocialMedia: boolean;
    maxSourceAge: number; // years
  };

  // Citation & Attribution
  citations: {
    enabled: boolean;
    format: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
    requireSources: boolean;
    autoGenerateBibliography: boolean;
  };

  // Bias & Fairness
  biasDetection: {
    enabled: boolean;
    checkGenderBias: boolean;
    checkRacialBias: boolean;
    checkAgeBias: boolean;
    checkCulturalBias: boolean;
  };

  // Accessibility
  accessibility: {
    enabled: boolean;
    wcagLevel: 'A' | 'AA' | 'AAA';
    generateAltText: boolean;
    generateTranscripts: boolean;
    checkReadability: boolean;
    targetReadingLevel: string;
  };

  // Data Privacy
  dataPrivacy: {
    gdprCompliant: boolean;
    ferpaCompliant: boolean;
    anonymizeData: boolean;
    dataRetentionDays: number;
    allowDataSharing: boolean;
  };

  // Content Generation Limits
  generationLimits: {
    maxContentLength: number;
    requireHumanReview: boolean;
    allowFullAutomation: boolean;
    aiDisclosureRequired: boolean;
  };
}

const defaultSettings: AISettings = {
  contentModeration: {
    enabled: true,
    strictness: 'high',
    filterProfanity: true,
    filterViolence: true,
    filterSexualContent: true,
    filterHateSpeech: true,
  },
  sourceRestrictions: {
    enabled: true,
    allowedDomains: ['.edu', '.gov', '.org'],
    requireAcademicSources: true,
    requirePeerReviewed: false,
    blockSocialMedia: true,
    maxSourceAge: 5,
  },
  citations: {
    enabled: true,
    format: 'APA',
    requireSources: true,
    autoGenerateBibliography: true,
  },
  biasDetection: {
    enabled: true,
    checkGenderBias: true,
    checkRacialBias: true,
    checkAgeBias: true,
    checkCulturalBias: true,
  },
  accessibility: {
    enabled: true,
    wcagLevel: 'AA',
    generateAltText: true,
    generateTranscripts: true,
    checkReadability: true,
    targetReadingLevel: '8th grade',
  },
  dataPrivacy: {
    gdprCompliant: true,
    ferpaCompliant: true,
    anonymizeData: true,
    dataRetentionDays: 90,
    allowDataSharing: false,
  },
  generationLimits: {
    maxContentLength: 5000,
    requireHumanReview: true,
    allowFullAutomation: false,
    aiDisclosureRequired: true,
  },
};

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export default function AISettingsModal({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
}: AISettingsModalProps): React.JSX.Element | null {
  const [settings, setSettings] = useState<AISettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'safety' | 'sources' | 'ethics' | 'privacy'>('safety');

  const updateSettings = (category: keyof AISettings, field: string, value: unknown): void => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSave = (): void => {
    onSave(settings);
    onClose();
  };

  const resetToDefaults = (): void => {
    setSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-brand-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Ethics & Safety Settings</h2>
                <p className="text-blue-100">Configure responsible AI usage controls</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-brand-surface/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-muted/30">
          <div className="flex gap-1 p-2">
            {[
              { id: 'safety', label: 'Content Safety', icon: Shield },
              { id: 'sources', label: 'Source Control', icon: BookOpen },
              { id: 'ethics', label: 'Ethics & Bias', icon: Scale },
              { id: 'privacy', label: 'Privacy & Data', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          <AnimatePresence mode="wait">
            {activeTab === 'safety' && (
              <motion.div
                key="safety"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-brand-primary p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-brand-blue dark:text-brand-cyan mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Content Moderation</p>
                      <p className="text-muted-foreground">
                        AI-generated content is automatically screened for inappropriate material
                        before presentation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="content-moderation-enabled"
                      className="font-semibold text-foreground"
                    >
                      Enable Content Moderation
                    </label>
                    <input
                      id="content-moderation-enabled"
                      type="checkbox"
                      checked={settings.contentModeration.enabled}
                      onChange={(e) =>
                        updateSettings('contentModeration', 'enabled', e.target.checked)
                      }
                      className="w-5 h-5 rounded"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="content-moderation-strictness"
                      className="block font-semibold text-foreground mb-2"
                    >
                      Strictness Level
                    </label>
                    <select
                      id="content-moderation-strictness"
                      value={settings.contentModeration.strictness}
                      onChange={(e) =>
                        updateSettings('contentModeration', 'strictness', e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background"
                      disabled={!settings.contentModeration.enabled}
                    >
                      <option value="low">Low - Basic filtering</option>
                      <option value="medium">Medium - Standard protection</option>
                      <option value="high">High - Enhanced safety (Recommended)</option>
                      <option value="maximum">Maximum - Strictest controls</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold text-foreground">Filter Categories:</p>
                    {[
                      { key: 'filterProfanity', label: 'Profanity & Offensive Language' },
                      { key: 'filterViolence', label: 'Violence & Graphic Content' },
                      { key: 'filterSexualContent', label: 'Sexual Content' },
                      { key: 'filterHateSpeech', label: 'Hate Speech & Discrimination' },
                    ].map((filter) => (
                      <div
                        key={filter.key}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-foreground">{filter.label}</span>
                        <input
                          type="checkbox"
                          checked={
                            settings.contentModeration[
                              filter.key as keyof typeof settings.contentModeration
                            ] as boolean
                          }
                          onChange={(e) =>
                            updateSettings('contentModeration', filter.key, e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                          disabled={!settings.contentModeration.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sources' && (
              <motion.div
                key="sources"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-brand-success p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-green-600 dark:text-brand-success mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Source Restrictions</p>
                      <p className="text-muted-foreground">
                        Control which sources the AI can reference to ensure academic integrity and
                        credibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="source-restrictions-enabled"
                      className="font-semibold text-foreground"
                    >
                      Enable Source Restrictions
                    </label>
                    <input
                      id="source-restrictions-enabled"
                      type="checkbox"
                      checked={settings.sourceRestrictions.enabled}
                      onChange={(e) =>
                        updateSettings('sourceRestrictions', 'enabled', e.target.checked)
                      }
                      className="w-5 h-5 rounded"
                    />
                  </div>

                  <div>
                    <span className="block font-semibold text-foreground mb-2">
                      Allowed Domains
                    </span>
                    <div className="space-y-2">
                      {['.edu', '.gov', '.org', '.ac.uk'].map((domain) => (
                        <div
                          key={domain}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={settings.sourceRestrictions.allowedDomains.includes(domain)}
                            onChange={(e) => {
                              const current = settings.sourceRestrictions.allowedDomains;
                              updateSettings(
                                'sourceRestrictions',
                                'allowedDomains',
                                e.target.checked
                                  ? [...current, domain]
                                  : current.filter((d) => d !== domain),
                              );
                            }}
                            className="w-5 h-5 rounded"
                            disabled={!settings.sourceRestrictions.enabled}
                          />
                          <span className="font-mono text-foreground">{domain}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'requireAcademicSources',
                        label: 'Require Academic Sources Only',
                        icon: BookOpen,
                      },
                      {
                        key: 'requirePeerReviewed',
                        label: 'Require Peer-Reviewed Publications',
                        icon: FileCheck,
                      },
                      {
                        key: 'blockSocialMedia',
                        label: 'Block Social Media Sources',
                        icon: AlertTriangle,
                      },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.key}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <span className="text-foreground">{option.label}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              settings.sourceRestrictions[
                                option.key as keyof typeof settings.sourceRestrictions
                              ] as boolean
                            }
                            onChange={(e) =>
                              updateSettings('sourceRestrictions', option.key, e.target.checked)
                            }
                            className="w-5 h-5 rounded"
                            disabled={!settings.sourceRestrictions.enabled}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label
                      htmlFor="max-source-age"
                      className="block font-semibold text-foreground mb-2"
                    >
                      Maximum Source Age (years)
                    </label>
                    <input
                      id="max-source-age"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.sourceRestrictions.maxSourceAge}
                      onChange={(e) =>
                        updateSettings(
                          'sourceRestrictions',
                          'maxSourceAge',
                          parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background"
                      disabled={!settings.sourceRestrictions.enabled}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ethics' && (
              <motion.div
                key="ethics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-purple-50 dark:bg-purple-950/20 border-l-4 border-brand-secondary p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 dark:text-brand-purple mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Ethics & Fairness</p>
                      <p className="text-muted-foreground">
                        Automated bias detection and accessibility compliance ensure inclusive,
                        equitable learning content.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bias Detection */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Bias Detection
                  </h3>

                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="bias-detection-enabled"
                      className="font-semibold text-foreground"
                    >
                      Enable Bias Detection
                    </label>
                    <input
                      id="bias-detection-enabled"
                      type="checkbox"
                      checked={settings.biasDetection.enabled}
                      onChange={(e) => updateSettings('biasDetection', 'enabled', e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'checkGenderBias', label: 'Gender Bias Detection' },
                      { key: 'checkRacialBias', label: 'Racial & Ethnic Bias Detection' },
                      { key: 'checkAgeBias', label: 'Age Bias Detection' },
                      { key: 'checkCulturalBias', label: 'Cultural Bias Detection' },
                    ].map((check) => (
                      <div
                        key={check.key}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-foreground">{check.label}</span>
                        <input
                          type="checkbox"
                          checked={
                            settings.biasDetection[
                              check.key as keyof typeof settings.biasDetection
                            ] as boolean
                          }
                          onChange={(e) =>
                            updateSettings('biasDetection', check.key, e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                          disabled={!settings.biasDetection.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Accessibility Compliance
                  </h3>

                  <div>
                    <label
                      htmlFor="wcag-level"
                      className="block font-semibold text-foreground mb-2"
                    >
                      WCAG Compliance Level
                    </label>
                    <select
                      id="wcag-level"
                      value={settings.accessibility.wcagLevel}
                      onChange={(e) => updateSettings('accessibility', 'wcagLevel', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background"
                    >
                      <option value="A">Level A - Minimum</option>
                      <option value="AA">Level AA - Mid Range (Recommended)</option>
                      <option value="AAA">Level AAA - Highest</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'generateAltText', label: 'Auto-Generate Alt Text for Images' },
                      { key: 'generateTranscripts', label: 'Auto-Generate Video Transcripts' },
                      { key: 'checkReadability', label: 'Check Content Readability' },
                    ].map((feature) => (
                      <div
                        key={feature.key}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-foreground">{feature.label}</span>
                        <input
                          type="checkbox"
                          checked={
                            settings.accessibility[
                              feature.key as keyof typeof settings.accessibility
                            ] as boolean
                          }
                          onChange={(e) =>
                            updateSettings('accessibility', feature.key, e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label
                      htmlFor="target-reading-level"
                      className="block font-semibold text-foreground mb-2"
                    >
                      Target Reading Level
                    </label>
                    <select
                      id="target-reading-level"
                      value={settings.accessibility.targetReadingLevel}
                      onChange={(e) =>
                        updateSettings('accessibility', 'targetReadingLevel', e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background"
                    >
                      <option value="5th grade">5th Grade</option>
                      <option value="8th grade">8th Grade</option>
                      <option value="High School">High School</option>
                      <option value="College">College</option>
                    </select>
                  </div>
                </div>

                {/* Citations */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Citations & Attribution
                  </h3>

                  <div>
                    <label
                      htmlFor="citation-format"
                      className="block font-semibold text-foreground mb-2"
                    >
                      Citation Format
                    </label>
                    <select
                      id="citation-format"
                      value={settings.citations.format}
                      onChange={(e) => updateSettings('citations', 'format', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background"
                    >
                      <option value="APA">APA 7th Edition</option>
                      <option value="MLA">MLA 9th Edition</option>
                      <option value="Chicago">Chicago Style</option>
                      <option value="IEEE">IEEE</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'requireSources', label: 'Require Source Citations' },
                      { key: 'autoGenerateBibliography', label: 'Auto-Generate Bibliography' },
                    ].map((option) => (
                      <div
                        key={option.key}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-foreground">{option.label}</span>
                        <input
                          type="checkbox"
                          checked={
                            settings.citations[
                              option.key as keyof typeof settings.citations
                            ] as boolean
                          }
                          onChange={(e) =>
                            updateSettings('citations', option.key, e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-brand-error p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-brand-error mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">
                        Data Privacy & Compliance
                      </p>
                      <p className="text-muted-foreground">
                        Ensure compliance with GDPR, FERPA, and other data protection regulations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground">Regulatory Compliance</h3>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'gdprCompliant',
                        label: 'GDPR Compliant (European Union)',
                        icon: Globe,
                      },
                      {
                        key: 'ferpaCompliant',
                        label: 'FERPA Compliant (US Education)',
                        icon: BookOpen,
                      },
                      { key: 'anonymizeData', label: 'Anonymize User Data', icon: Lock },
                    ].map((compliance) => {
                      const Icon = compliance.icon;
                      return (
                        <div
                          key={compliance.key}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <span className="text-foreground">{compliance.label}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              settings.dataPrivacy[
                                compliance.key as keyof typeof settings.dataPrivacy
                              ] as boolean
                            }
                            onChange={(e) =>
                              updateSettings('dataPrivacy', compliance.key, e.target.checked)
                            }
                            className="w-5 h-5 rounded"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label
                      htmlFor="data-retention-days"
                      className="block font-semibold text-foreground mb-2"
                    >
                      Data Retention Period (days)
                    </label>
                    <input
                      id="data-retention-days"
                      type="number"
                      min="1"
                      max="3650"
                      value={settings.dataPrivacy.dataRetentionDays}
                      onChange={(e) =>
                        updateSettings(
                          'dataPrivacy',
                          'dataRetentionDays',
                          parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatically delete data after this period (90 days recommended)
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="text-foreground font-semibold block">
                        Allow Data Sharing
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Share anonymized data for research
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.dataPrivacy.allowDataSharing}
                      onChange={(e) =>
                        updateSettings('dataPrivacy', 'allowDataSharing', e.target.checked)
                      }
                      className="w-5 h-5 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground">AI Generation Controls</h3>

                  <div>
                    <label
                      htmlFor="max-content-length"
                      className="block font-semibold text-foreground mb-2"
                    >
                      Maximum Content Length (characters)
                    </label>
                    <input
                      id="max-content-length"
                      type="number"
                      min="100"
                      max="50000"
                      step="100"
                      value={settings.generationLimits.maxContentLength}
                      onChange={(e) =>
                        updateSettings(
                          'generationLimits',
                          'maxContentLength',
                          parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background"
                    />
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'requireHumanReview',
                        label: 'Require Human Review Before Publishing',
                      },
                      { key: 'aiDisclosureRequired', label: 'Require AI Disclosure to Learners' },
                      {
                        key: 'allowFullAutomation',
                        label: 'Allow Fully Automated Course Creation',
                      },
                    ].map((limit) => (
                      <div
                        key={limit.key}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-foreground">{limit.label}</span>
                        <input
                          type="checkbox"
                          checked={
                            settings.generationLimits[
                              limit.key as keyof typeof settings.generationLimits
                            ] as boolean
                          }
                          onChange={(e) =>
                            updateSettings('generationLimits', limit.key, e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 bg-muted/30 flex items-center justify-between">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { defaultSettings };
