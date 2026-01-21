'use client';

export const dynamic = 'force-dynamic';

import { Database, Globe, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Admin Settings page - Platform-wide configuration
 */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform-wide settings</p>
      </div>

      {/* General Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">General</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="platformName"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Platform Name
            </label>
            <input
              id="platformName"
              type="text"
              defaultValue="INSPIRE LMS"
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
          </div>
          <div>
            <label
              htmlFor="supportEmail"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Support Email
            </label>
            <input
              id="supportEmail"
              type="email"
              defaultValue="support@lxd360.com"
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
          </div>
          <div>
            <label
              htmlFor="defaultTimezone"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Default Timezone
            </label>
            <select
              id="defaultTimezone"
              defaultValue="America/New_York"
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Security</CardTitle>
              <CardDescription>Authentication and access control</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="mfaRequired"
            label="Require MFA"
            description="Require multi-factor authentication for all users"
            defaultChecked
          />
          <SettingToggle
            id="ssoEnabled"
            label="SSO Enabled"
            description="Allow SAML/OIDC single sign-on"
            defaultChecked
          />
          <div>
            <label
              htmlFor="sessionTimeout"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Session Timeout (minutes)
            </label>
            <input
              id="sessionTimeout"
              type="number"
              defaultValue={60}
              min={15}
              max={480}
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
          </div>
          <SettingToggle
            id="ipWhitelist"
            label="IP Whitelist"
            description="Restrict access to approved IP ranges"
            defaultChecked={false}
          />
        </CardContent>
      </Card>

      {/* xAPI/LRS Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">xAPI / LRS</CardTitle>
              <CardDescription>Learning record store configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="lrsEnabled"
            label="LRS Enabled"
            description="Enable xAPI statement collection"
            defaultChecked
          />
          <div>
            <label
              htmlFor="statementRetention"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Statement Retention (days)
            </label>
            <input
              id="statementRetention"
              type="number"
              defaultValue={365}
              min={30}
              max={3650}
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
          </div>
          <SettingToggle
            id="bigQueryExport"
            label="BigQuery Export"
            description="Export statements to BigQuery for analytics"
            defaultChecked
          />
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">AI Features</CardTitle>
              <CardDescription>Adaptive learning and AI configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="adaptiveLearning"
            label="Adaptive Learning"
            description="Enable AI-powered content recommendations"
            defaultChecked
          />
          <SettingToggle
            id="glassBox"
            label="Glass Box AI"
            description="Show AI decision explanations to learners"
            defaultChecked
          />
          <SettingToggle
            id="cognitiveLoad"
            label="Cognitive Load Monitoring"
            description="Track and respond to learner cognitive load"
            defaultChecked
          />
          <div>
            <label htmlFor="aiModel" className="block text-sm font-medium text-brand-primary mb-1">
              AI Model
            </label>
            <select
              id="aiModel"
              defaultValue="gemini-pro"
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary"
            >
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-flash">Gemini Flash</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-lxd-purple hover:bg-lxd-purple/90">Save Settings</Button>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function SettingToggle({ id, label, description, defaultChecked }: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-lxd-dark-bg/50">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-brand-primary cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-lxd-dark-border rounded-full peer peer-checked:bg-lxd-purple transition-colors peer-focus:ring-2 peer-focus:ring-lxd-purple/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}
