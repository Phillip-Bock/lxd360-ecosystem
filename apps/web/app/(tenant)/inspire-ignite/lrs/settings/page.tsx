'use client';

export const dynamic = 'force-dynamic';

import { Database, Key, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * LRS Settings page - Configure LRS behavior
 */
export default function LRSSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">LRS Settings</h1>
        <p className="text-muted-foreground mt-1">Configure Learning Record Store behavior</p>
      </div>

      {/* API Configuration */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">API Configuration</CardTitle>
              <CardDescription>xAPI endpoint settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="endpoint" className="block text-sm font-medium text-brand-primary mb-1">
              Endpoint URL
            </label>
            <input
              id="endpoint"
              type="text"
              readOnly
              value="https://api.lxd360.com/xapi/statements"
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-muted-foreground"
            />
          </div>
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-brand-primary mb-1">
              xAPI Version
            </label>
            <input
              id="version"
              type="text"
              readOnly
              value="1.0.3"
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-muted-foreground"
            />
          </div>
          <SettingToggle
            id="strictValidation"
            label="Strict Validation"
            description="Reject statements that don't meet INSPIRE schema requirements"
            defaultChecked
          />
        </CardContent>
      </Card>

      {/* Storage Configuration */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Storage</CardTitle>
              <CardDescription>Data storage and retention</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="retention"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Retention Period (days)
            </label>
            <input
              id="retention"
              type="number"
              defaultValue={365}
              min={30}
              max={3650}
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
          </div>
          <SettingToggle
            id="firestoreCache"
            label="Firestore Cache"
            description="Cache recent statements in Firestore for fast queries"
            defaultChecked
          />
          <SettingToggle
            id="bigQueryArchive"
            label="BigQuery Archive"
            description="Archive all statements to BigQuery for analytics"
            defaultChecked
          />
        </CardContent>
      </Card>

      {/* Processing Configuration */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Processing</CardTitle>
              <CardDescription>Statement processing options</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="bktProcessing"
            label="BKT Processing"
            description="Update Bayesian Knowledge Tracing mastery estimates"
            defaultChecked
          />
          <SettingToggle
            id="sm2Processing"
            label="SM-2 Processing"
            description="Update spaced repetition scheduling"
            defaultChecked
          />
          <SettingToggle
            id="cognitiveProcessing"
            label="Cognitive Load Processing"
            description="Analyze cognitive load from behavioral signals"
            defaultChecked
          />
          <div>
            <label
              htmlFor="batchSize"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Batch Size
            </label>
            <input
              id="batchSize"
              type="number"
              defaultValue={100}
              min={10}
              max={1000}
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-lxd-purple" aria-hidden="true" />
            <div>
              <CardTitle className="text-brand-primary">Security</CardTitle>
              <CardDescription>Access control and authentication</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="requireAuth"
            label="Require Authentication"
            description="All API requests must include valid credentials"
            defaultChecked
          />
          <SettingToggle
            id="rateLimiting"
            label="Rate Limiting"
            description="Limit API requests per client"
            defaultChecked
          />
          <div>
            <label
              htmlFor="rateLimit"
              className="block text-sm font-medium text-brand-primary mb-1"
            >
              Rate Limit (requests/minute)
            </label>
            <input
              id="rateLimit"
              type="number"
              defaultValue={1000}
              min={100}
              max={10000}
              className="w-full px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary focus:outline-hidden focus:border-lxd-purple/50"
            />
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
