'use client';

import { Accessibility, Calendar, Clock, Globe, Palette, Settings } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const AccountSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'system',
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    fontSize: 16,
    dyslexiaFriendlyFont: false,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-lxd-text-dark-heading flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Account Settings
        </h2>
        <p className="text-lxd-text-dark-body mt-1">
          Customize your account preferences and display settings
        </p>
      </div>

      {/* Language & Region */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Language & Region
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="AccountSettingsTab-input-1"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="AccountSettingsTab-input-2"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="America/Los_Angeles">Pacific Time (PT) - UTC-8</option>
              <option value="America/Denver">Mountain Time (MT) - UTC-7</option>
              <option value="America/Chicago">Central Time (CT) - UTC-6</option>
              <option value="America/New_York">Eastern Time (ET) - UTC-5</option>
              <option value="Europe/London">London (GMT) - UTC+0</option>
              <option value="Europe/Paris">Paris (CET) - UTC+1</option>
            </select>
            <p className="text-sm text-lxd-text-dark-muted mt-2">Auto-detected from your browser</p>
          </div>
        </div>
      </div>

      {/* Date & Time Format */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Date & Time Format
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="AccountSettingsTab-input-3"
              className="block text-sm font-medium text-lxd-text-dark-body mb-3"
            >
              Date Format
            </label>
            <div className="space-y-2">
              <label
                htmlFor="AccountSettingsTab-input-4"
                className="flex items-center gap-3 p-3 border border-lxd-light-border rounded-lg cursor-pointer hover:bg-lxd-light-card"
              >
                <input
                  id="AccountSettingsTab-input-4"
                  type="radio"
                  name="dateFormat"
                  value="MM/DD/YYYY"
                  checked={settings.dateFormat === 'MM/DD/YYYY'}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="text-brand-blue focus:ring-brand-primary"
                />
                <div>
                  <div className="font-medium">MM/DD/YYYY</div>
                  <div className="text-sm text-lxd-text-dark-muted">12/31/2024 (US Format)</div>
                </div>
              </label>
              <label
                htmlFor="AccountSettingsTab-input-5"
                className="flex items-center gap-3 p-3 border border-lxd-light-border rounded-lg cursor-pointer hover:bg-lxd-light-card"
              >
                <input
                  id="AccountSettingsTab-input-5"
                  type="radio"
                  name="dateFormat"
                  value="DD/MM/YYYY"
                  checked={settings.dateFormat === 'DD/MM/YYYY'}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="text-brand-blue focus:ring-brand-primary"
                />
                <div>
                  <div className="font-medium">DD/MM/YYYY</div>
                  <div className="text-sm text-lxd-text-dark-muted">31/12/2024 (International)</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="AccountSettingsTab-input-6"
              className="block text-sm font-medium text-lxd-text-dark-body mb-3"
            >
              Time Format
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, timeFormat: '12h' })}
                className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                  settings.timeFormat === '12h'
                    ? 'border-brand-primary bg-blue-50 text-blue-700'
                    : 'border-lxd-light-border hover:border-lxd-light-border'
                }`}
              >
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <div className="font-medium">12-hour</div>
                <div className="text-sm text-lxd-text-dark-muted">2:30 PM</div>
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, timeFormat: '24h' })}
                className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                  settings.timeFormat === '24h'
                    ? 'border-brand-primary bg-blue-50 text-blue-700'
                    : 'border-lxd-light-border hover:border-lxd-light-border'
                }`}
              >
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <div className="font-medium">24-hour</div>
                <div className="text-sm text-lxd-text-dark-muted">14:30</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Appearance
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSettings({ ...settings, theme: 'light' })}
            className={`p-4 border-2 rounded-lg transition-all ${
              settings.theme === 'light'
                ? 'border-brand-primary bg-blue-50'
                : 'border-lxd-light-border hover:border-lxd-light-border'
            }`}
          >
            <div className="w-full h-12 bg-lxd-light-card border border-lxd-light-border rounded mb-2"></div>
            <div className="font-medium">Light</div>
          </button>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, theme: 'dark' })}
            className={`p-4 border-2 rounded-lg transition-all ${
              settings.theme === 'dark'
                ? 'border-brand-primary bg-blue-50'
                : 'border-lxd-light-border hover:border-lxd-light-border'
            }`}
          >
            <div className="w-full h-12 bg-lxd-dark-card border border-lxd-dark-border rounded mb-2"></div>
            <div className="font-medium">Dark</div>
          </button>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, theme: 'system' })}
            className={`p-4 border-2 rounded-lg transition-all ${
              settings.theme === 'system'
                ? 'border-brand-primary bg-blue-50'
                : 'border-lxd-light-border hover:border-lxd-light-border'
            }`}
          >
            <div className="w-full h-12 bg-linear-to-r from-white to-lxd-dark-card border border-lxd-light-border rounded mb-2"></div>
            <div className="font-medium">System</div>
          </button>
        </div>
      </div>

      {/* Accessibility */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Accessibility className="w-5 h-5" />
          Accessibility
        </h3>
        <div className="space-y-4">
          <label htmlFor="AccountSettingsTab-input-7" className="flex items-start gap-3">
            <input
              id="AccountSettingsTab-input-7"
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => setSettings({ ...settings, highContrast: e.target.checked })}
              className="mt-1 text-brand-blue focus:ring-brand-primary rounded"
            />
            <div>
              <div className="font-medium text-lxd-text-dark-heading">High Contrast</div>
              <div className="text-sm text-lxd-text-dark-muted">
                Increase contrast for better visibility
              </div>
            </div>
          </label>

          <label htmlFor="AccountSettingsTab-input-8" className="flex items-start gap-3">
            <input
              id="AccountSettingsTab-input-8"
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })}
              className="mt-1 text-brand-blue focus:ring-brand-primary rounded"
            />
            <div>
              <div className="font-medium text-lxd-text-dark-heading">Reduced Motion</div>
              <div className="text-sm text-lxd-text-dark-muted">
                Minimize animations and transitions
              </div>
            </div>
          </label>

          <label htmlFor="AccountSettingsTab-input-9" className="flex items-start gap-3">
            <input
              id="AccountSettingsTab-input-9"
              type="checkbox"
              checked={settings.screenReaderOptimized}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  screenReaderOptimized: e.target.checked,
                })
              }
              className="mt-1 text-brand-blue focus:ring-brand-primary rounded"
            />
            <div>
              <div className="font-medium text-lxd-text-dark-heading">
                Screen Reader Optimization
              </div>
              <div className="text-sm text-lxd-text-dark-muted">
                Enhanced support for screen readers
              </div>
            </div>
          </label>

          <label htmlFor="AccountSettingsTab-input-10" className="flex items-start gap-3">
            <input
              id="AccountSettingsTab-input-10"
              type="checkbox"
              checked={settings.dyslexiaFriendlyFont}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  dyslexiaFriendlyFont: e.target.checked,
                })
              }
              className="mt-1 text-brand-blue focus:ring-brand-primary rounded"
            />
            <div>
              <div className="font-medium text-lxd-text-dark-heading">Dyslexia-Friendly Font</div>
              <div className="text-sm text-lxd-text-dark-muted">
                Use OpenDyslexic font for easier reading
              </div>
            </div>
          </label>

          <div>
            <label
              htmlFor="AccountSettingsTab-input-11"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.fontSize}
              onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-lxd-light-surface rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-lxd-text-dark-muted mt-1">
              <span>12px</span>
              <span>18px</span>
              <span>24px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-lxd-light-border pt-6 flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
