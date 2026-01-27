'use client';

export const dynamic = 'force-dynamic';

import { Bell, Database, Key, Mail, Save, Settings, Shield } from 'lucide-react';

export default function SystemSettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">System Settings</h1>
          <p className="text-brand-secondary mt-1">
            Configure global system preferences and settings
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-primary-hover transition-colors"
        >
          <Save className="w-5 h-5" aria-hidden="true" />
          Save All Changes
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-brand-surface rounded-xl p-6 shadow-sm border border-brand-default">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-brand-secondary" aria-hidden="true" />
          <h2 className="text-xl font-bold text-brand-primary">General Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="platform-name"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Platform Name
            </label>
            <input
              id="platform-name"
              type="text"
              defaultValue="LXP360"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="support-email"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                Support Email
              </label>
              <input
                id="support-email"
                type="email"
                defaultValue="Customer_Support@lxd360.com"
                className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>

            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                defaultValue="Administration@lxd360.com"
                className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="default-language"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Default Language
            </label>
            <select
              id="default-language"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="time-zone"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Time Zone
            </label>
            <select
              id="time-zone"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <option>UTC (Coordinated Universal Time)</option>
              <option>EST (Eastern Standard Time)</option>
              <option>CST (Central Standard Time)</option>
              <option>PST (Pacific Standard Time)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-brand-surface rounded-xl p-6 shadow-sm border border-brand-default">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-brand-secondary" aria-hidden="true" />
          <h2 className="text-xl font-bold text-brand-primary">Email Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="smtp-server"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              SMTP Server
            </label>
            <input
              id="smtp-server"
              type="text"
              defaultValue="smtp.sendgrid.net"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="smtp-port"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                SMTP Port
              </label>
              <input
                id="smtp-port"
                type="number"
                defaultValue="587"
                className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>

            <div>
              <label
                htmlFor="encryption"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                Encryption
              </label>
              <select
                id="encryption"
                className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              >
                <option>TLS</option>
                <option>SSL</option>
                <option>None</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="from-email"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              From Email Address
            </label>
            <input
              id="from-email"
              type="email"
              defaultValue="noreply@lxp360.com"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div>
            <label
              htmlFor="from-name"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              From Name
            </label>
            <input
              id="from-name"
              type="text"
              defaultValue="LXP360 Platform"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-brand-surface text-brand-secondary rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Send Test Email
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-brand-surface rounded-xl p-6 shadow-sm border border-brand-default">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-brand-secondary" aria-hidden="true" />
          <h2 className="text-xl font-bold text-brand-primary">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="require-2fa-label">
                Require Two-Factor Authentication
              </p>
              <p className="text-sm text-brand-secondary mt-1">
                Force all system admins to use 2FA
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked
                aria-labelledby="require-2fa-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="password-complexity-label">
                Password Complexity Requirements
              </p>
              <p className="text-sm text-brand-secondary mt-1">Enforce strong password rules</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked
                aria-labelledby="password-complexity-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div>
            <label
              htmlFor="session-timeout"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Session Timeout (minutes)
            </label>
            <input
              id="session-timeout"
              type="number"
              defaultValue="30"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div>
            <label
              htmlFor="max-login-attempts"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Max Login Attempts
            </label>
            <input
              id="max-login-attempts"
              type="number"
              defaultValue="5"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div>
            <label
              htmlFor="lockout-duration"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Account Lockout Duration (minutes)
            </label>
            <input
              id="lockout-duration"
              type="number"
              defaultValue="15"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-brand-surface rounded-xl p-6 shadow-sm border border-brand-default">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-brand-secondary" aria-hidden="true" />
          <h2 className="text-xl font-bold text-brand-primary">Database Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Database settings are managed through environment variables.
              Changes require system restart.
            </p>
          </div>

          <div>
            <label
              htmlFor="database-type"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Database Type
            </label>
            <input
              id="database-type"
              type="text"
              value="PostgreSQL 15.3"
              disabled
              className="w-full px-4 py-2 border border-brand-strong rounded-lg bg-brand-page text-brand-muted"
            />
          </div>

          <div>
            <label
              htmlFor="connection-pool-size"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Connection Pool Size
            </label>
            <input
              id="connection-pool-size"
              type="number"
              defaultValue="20"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="auto-backups-label">
                Automatic Backups
              </p>
              <p className="text-sm text-brand-secondary mt-1">Daily automated database backups</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked
                aria-labelledby="auto-backups-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div>
            <label
              htmlFor="backup-retention"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Backup Retention (days)
            </label>
            <input
              id="backup-retention"
              type="number"
              defaultValue="30"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-brand-success text-brand-primary rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Run Manual Backup Now
          </button>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-brand-surface rounded-xl p-6 shadow-sm border border-brand-default">
        <div className="flex items-center gap-2 mb-6">
          <Key className="w-5 h-5 text-brand-secondary" aria-hidden="true" />
          <h2 className="text-xl font-bold text-brand-primary">API Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="enable-public-api-label">
                Enable Public API
              </p>
              <p className="text-sm text-brand-secondary mt-1">Allow external API access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked
                aria-labelledby="enable-public-api-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div>
            <label
              htmlFor="rate-limit"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Rate Limit (requests per minute)
            </label>
            <input
              id="rate-limit"
              type="number"
              defaultValue="100"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div>
            <label
              htmlFor="api-version"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              API Version
            </label>
            <select
              id="api-version"
              className="w-full px-4 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <option>v3 (Current)</option>
              <option>v2 (Legacy)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="require-api-key-label">
                Require API Key Authentication
              </p>
              <p className="text-sm text-brand-secondary mt-1">
                All requests must include valid API key
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked
                aria-labelledby="require-api-key-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-brand-surface rounded-xl p-6 shadow-sm border border-brand-default">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-brand-secondary" aria-hidden="true" />
          <h2 className="text-xl font-bold text-brand-primary">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="system-alerts-label">
                System Alert Emails
              </p>
              <p className="text-sm text-brand-secondary mt-1">
                Receive emails for critical system alerts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked
                aria-labelledby="system-alerts-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="tenant-activity-label">
                Tenant Activity Notifications
              </p>
              <p className="text-sm text-brand-secondary mt-1">
                Get notified of significant tenant events
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked
                aria-labelledby="tenant-activity-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-brand-page rounded-lg">
            <div>
              <p className="font-medium text-brand-primary" id="performance-reports-label">
                Performance Reports
              </p>
              <p className="text-sm text-brand-secondary mt-1">
                Weekly system performance summaries
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                aria-labelledby="performance-reports-label"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-brand-surface after:border-brand-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
