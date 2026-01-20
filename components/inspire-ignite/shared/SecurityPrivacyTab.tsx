'use client';

import {
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
  Globe,
  Key,
  Lock,
  LogOut,
  Monitor,
  Shield,
  Smartphone,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const SecurityPrivacyTab: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const activeSessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'San Francisco, CA',
      lastActive: '1 hour ago',
      current: false,
    },
    {
      id: '3',
      device: 'Firefox on MacOS',
      location: 'New York, NY',
      lastActive: '2 days ago',
      current: false,
    },
  ];

  const connectedAccounts = [
    { provider: 'Google', connected: true, email: 'user@gmail.com' },
    { provider: 'Microsoft', connected: false, email: null },
    { provider: 'GitHub', connected: true, email: 'user@github.com' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-lxd-text-dark-heading flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security & Privacy
        </h2>
        <p className="text-lxd-text-dark-body mt-1">
          Manage your security settings and privacy preferences
        </p>
      </div>

      {/* Password Management */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="SecurityPrivacyTab-input-1"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className="w-full px-4 py-2 pr-10 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lxd-text-light-muted hover:text-lxd-text-dark-body"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="SecurityPrivacyTab-input-2"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="w-full px-4 py-2 pr-10 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lxd-text-light-muted hover:text-lxd-text-dark-body"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="SecurityPrivacyTab-input-3"
              className="block text-sm font-medium text-lxd-text-dark-body mb-2"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Two-Factor Authentication
        </h3>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lxd-text-dark-body mb-2">
              Add an extra layer of security to your account
            </p>
            <p className="text-sm text-lxd-text-dark-muted">
              {twoFactorEnabled
                ? 'Two-factor authentication is currently enabled'
                : 'Enable 2FA to protect your account'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              twoFactorEnabled
                ? 'bg-brand-error hover:bg-red-700 text-brand-primary'
                : 'bg-brand-primary hover:bg-brand-primary-hover text-brand-primary'
            }`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
          </button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Connected Accounts
        </h3>
        <div className="space-y-3">
          {connectedAccounts.map((account) => (
            <div
              key={account.provider}
              className="flex items-center justify-between p-4 border border-lxd-light-border rounded-lg"
            >
              <div>
                <div className="font-medium text-lxd-text-dark-heading">{account.provider}</div>
                {account.connected && (
                  <div className="text-sm text-lxd-text-dark-muted">{account.email}</div>
                )}
              </div>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  account.connected
                    ? 'text-red-600 hover:bg-red-50 border border-red-200'
                    : 'bg-brand-primary hover:bg-brand-primary-hover text-brand-primary'
                }`}
              >
                {account.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-lxd-text-dark-heading flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </h3>
          <button
            type="button"
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Log Out All Others
          </button>
        </div>
        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between p-4 border border-lxd-light-border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-lxd-text-dark-heading">{session.device}</div>
                  {session.current && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-lxd-text-dark-muted mt-1">{session.location}</div>
                <div className="text-xs text-lxd-text-light-muted mt-1">
                  Last active: {session.lastActive}
                </div>
              </div>
              {!session.current && (
                <button type="button" className="text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Profile Visibility */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Profile Visibility
        </h3>
        <div>
          <label
            htmlFor="SecurityPrivacyTab-input-4"
            className="block text-sm font-medium text-lxd-text-dark-body mb-2"
          >
            Who can see your profile?
          </label>
          <select className="w-full px-4 py-2 border border-lxd-light-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            <option value="everyone">Everyone</option>
            <option value="connections">Connections Only</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="border border-lxd-light-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-lxd-text-dark-heading mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 border border-lxd-light-border rounded-lg hover:bg-lxd-light-card transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-lxd-text-dark-body" />
              <div className="text-left">
                <div className="font-medium text-lxd-text-dark-heading">Download Your Data</div>
                <div className="text-sm text-lxd-text-dark-muted">
                  Request a copy of your personal data
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium text-red-900">Delete Account</div>
                <div className="text-sm text-red-600">
                  Permanently delete your account and all data
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-lxd-light-card rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Delete Account</h3>
            </div>
            <p className="text-lxd-text-dark-body mb-4">
              Are you sure you want to delete your account? This action cannot be undone. All your
              data, courses, and progress will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-lxd-light-border rounded-lg hover:bg-lxd-light-card transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-brand-error text-brand-primary rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
