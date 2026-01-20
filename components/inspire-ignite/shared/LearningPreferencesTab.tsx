'use client';

import { Download, GraduationCap, Play, Target } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const LearningPreferencesTab: React.FC = () => {
  const [preferences, setPreferences] = useState({
    videoAutoplay: true,
    playbackSpeed: '1.0',
    videoQuality: 'auto',
    smartReminders: true,
    offlineDownload: false,
    learningGoals: [] as string[],
  });

  const learningGoalOptions = [
    'Career Advancement',
    'Skill Development',
    'Certification',
    'Personal Interest',
    'Academic Requirements',
    'Team Training',
  ];

  const toggleLearningGoal = (goal: string): void => {
    setPreferences({
      ...preferences,
      learningGoals: preferences.learningGoals.includes(goal)
        ? preferences.learningGoals.filter((g) => g !== goal)
        : [...preferences.learningGoals, goal],
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-lxd-text-dark-heading flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          Learning Preferences
        </h2>
        <p className="text-lxd-text-dark-body mt-1">
          Customize your learning experience and content preferences
        </p>
      </div>

      {/* Video Settings */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Play className="w-5 h-5" />
          Video Settings
        </h3>
        <div className="space-y-6">
          <label
            htmlFor="LearningPreferencesTab-input-1"
            className="flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-lxd-text-dark-heading">Autoplay Videos</div>
              <div className="text-sm text-lxd-text-dark-muted">
                Automatically start playing videos when you open a lesson
              </div>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                id="LearningPreferencesTab-input-1"
                type="checkbox"
                checked={preferences.videoAutoplay}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    videoAutoplay: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-lxd-light-surface peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-lxd-light-card after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </div>
          </label>

          <div>
            <label
              htmlFor="LearningPreferencesTab-input-2"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Default Playback Speed
            </label>
            <select
              value={preferences.playbackSpeed}
              onChange={(e) => setPreferences({ ...preferences, playbackSpeed: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="0.5">0.5x (Slower)</option>
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="1.75">1.75x</option>
              <option value="2.0">2.0x (Faster)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="LearningPreferencesTab-input-3"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Default Video Quality
            </label>
            <select
              value={preferences.videoQuality}
              onChange={(e) => setPreferences({ ...preferences, videoQuality: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="480p">480p (Standard)</option>
              <option value="720p">720p (HD)</option>
              <option value="1080p">1080p (Full HD)</option>
            </select>
            <p className="text-sm text-lxd-text-dark-muted mt-2">
              Auto quality adjusts based on your internet connection
            </p>
          </div>
        </div>
      </div>

      {/* Learning Goals */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Learning Goals
        </h3>
        <p className="text-sm text-lxd-text-dark-body mb-4">
          Select your learning objectives to get personalized recommendations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {learningGoalOptions.map((goal) => (
            <label
              key={goal}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                preferences.learningGoals.includes(goal)
                  ? 'border-brand-primary bg-blue-50'
                  : 'border-lxd-light-border hover:border-lxd-light-border'
              }`}
            >
              <input
                type="checkbox"
                checked={preferences.learningGoals.includes(goal)}
                onChange={() => toggleLearningGoal(goal)}
                className="text-brand-blue focus:ring-brand-primary rounded"
              />
              <span className="font-medium text-lxd-text-dark-heading">{goal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Smart Reminders */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4">Smart Reminders</h3>
        <label
          htmlFor="LearningPreferencesTab-input-4"
          className="flex items-center justify-between"
        >
          <div>
            <div className="font-medium text-lxd-text-dark-heading">Enable Smart Reminders</div>
            <div className="text-sm text-lxd-text-dark-muted">
              Get personalized reminders based on your learning schedule and goals
            </div>
          </div>
          <div className="relative inline-block w-12 h-6">
            <input
              id="LearningPreferencesTab-input-4"
              type="checkbox"
              checked={preferences.smartReminders}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  smartReminders: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-lxd-light-surface peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-lxd-light-card after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </div>
        </label>
      </div>

      {/* Offline Content */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Offline Content
        </h3>
        <label
          htmlFor="LearningPreferencesTab-input-5"
          className="flex items-center justify-between"
        >
          <div>
            <div className="font-medium text-lxd-text-dark-heading">Allow Offline Downloads</div>
            <div className="text-sm text-lxd-text-dark-muted">
              Download course content for offline viewing
            </div>
          </div>
          <div className="relative inline-block w-12 h-6">
            <input
              id="LearningPreferencesTab-input-5"
              type="checkbox"
              checked={preferences.offlineDownload}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  offlineDownload: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-lxd-light-surface peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-lxd-light-card after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </div>
        </label>
      </div>

      {/* Save Button */}
      <div className="border-t border-lxd-light-border pt-6 flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
