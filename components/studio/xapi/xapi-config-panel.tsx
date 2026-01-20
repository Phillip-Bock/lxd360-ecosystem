'use client';

/**
 * XAPIConfigPanel - Complete xAPI Configuration Panel
 *
 * Unified panel combining all xAPI configuration components:
 * - LRS connection testing
 * - Statement preview with JSON view
 * - Profile selector (xAPI, cmi5, SCORM-to-xAPI)
 * - Custom statement builder UI
 * - Queue status monitoring
 */

import { Activity, Database, FileJson, Settings, TestTube } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { XAPIStatement } from '@/types/xapi';

import { LRSConnectionTester } from './lrs-connection-tester';
import {
  DEFAULT_PROFILE_CONFIG,
  ProfileSelector,
  type XAPIProfileConfig,
} from './profile-selector';
import { QueueStatus } from './queue-status';
import { StatementBuilder } from './statement-builder';
import { StatementPreview } from './statement-preview';

// =============================================================================
// TYPES
// =============================================================================

interface XAPIConfigPanelProps {
  /** LRS endpoint URL */
  lrsEndpoint?: string;
  /** LRS authorization header */
  lrsAuth?: string;
  /** Initial profile configuration */
  initialProfileConfig?: XAPIProfileConfig;
  /** Callback when profile config changes */
  onProfileConfigChange?: (config: XAPIProfileConfig) => void;
  /** Callback when LRS settings change */
  onLRSSettingsChange?: (settings: { endpoint: string; auth: string }) => void;
  /** Callback to send a statement */
  onSendStatement?: (statement: XAPIStatement) => Promise<void>;
  /** Show queue status */
  showQueueStatus?: boolean;
  /** Default tab */
  defaultTab?: 'connection' | 'profile' | 'preview' | 'builder';
  /** Additional class name */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function XAPIConfigPanel({
  lrsEndpoint = '',
  lrsAuth = '',
  initialProfileConfig = DEFAULT_PROFILE_CONFIG,
  onProfileConfigChange,
  onLRSSettingsChange,
  onSendStatement,
  showQueueStatus = true,
  defaultTab = 'connection',
  className,
}: XAPIConfigPanelProps) {
  const [endpoint, setEndpoint] = useState(lrsEndpoint);
  const [auth, setAuth] = useState(lrsAuth);
  const [profileConfig, setProfileConfig] = useState<XAPIProfileConfig>(initialProfileConfig);
  const [testStatements, setTestStatements] = useState<XAPIStatement[]>([]);

  const handleEndpointChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEndpoint = e.target.value;
      setEndpoint(newEndpoint);
      onLRSSettingsChange?.({ endpoint: newEndpoint, auth });
    },
    [auth, onLRSSettingsChange],
  );

  const handleAuthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAuth = e.target.value;
      setAuth(newAuth);
      onLRSSettingsChange?.({ endpoint, auth: newAuth });
    },
    [endpoint, onLRSSettingsChange],
  );

  const handleProfileChange = useCallback(
    (config: XAPIProfileConfig) => {
      setProfileConfig(config);
      onProfileConfigChange?.(config);
    },
    [onProfileConfigChange],
  );

  const handleStatementSend = useCallback(
    async (statement: XAPIStatement) => {
      // Add to test statements for preview
      setTestStatements((prev) => [statement, ...prev.slice(0, 9)]);

      // Send to LRS if handler provided
      if (onSendStatement) {
        await onSendStatement(statement);
      }
    },
    [onSendStatement],
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Queue Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-400" />
          xAPI Configuration
        </h2>

        {showQueueStatus && <QueueStatus variant="compact" showFlushButton />}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start bg-white/5 p-1">
          <TabsTrigger value="connection" className="gap-2">
            <TestTube className="h-4 w-4" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Settings className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <FileJson className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-2">
            <Activity className="h-4 w-4" />
            Builder
          </TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection" className="mt-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
              LRS Connection Settings
            </h3>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="lrs-endpoint" className="text-sm text-zinc-400">
                  LRS Endpoint URL
                </label>
                <input
                  id="lrs-endpoint"
                  type="url"
                  value={endpoint}
                  onChange={handleEndpointChange}
                  placeholder="https://your-lrs.com/xapi"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="lrs-auth" className="text-sm text-zinc-400">
                  Authorization Header
                </label>
                <input
                  id="lrs-auth"
                  type="password"
                  value={auth}
                  onChange={handleAuthChange}
                  placeholder="Basic xxxxxx or Bearer xxxxxx"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-zinc-500">
                  For Basic auth: Base64-encode &quot;username:password&quot;
                </p>
              </div>
            </div>

            <LRSConnectionTester endpoint={endpoint} auth={auth} showDetails />
          </div>

          {/* Quick Tips */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Connection Tips</h4>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Ensure your LRS endpoint ends with /xapi or similar</li>
              <li>• Check CORS settings if you get network errors</li>
              <li>• Most LRS systems require Basic authentication</li>
              <li>• Test connection before publishing content</li>
            </ul>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <ProfileSelector value={profileConfig} onChange={handleProfileChange} />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Statement Preview</h3>
            <p className="text-xs text-zinc-500">
              Preview xAPI statements that will be sent to your LRS. Select sample statements or
              view statements from the builder.
            </p>
          </div>

          <StatementPreview
            statements={testStatements.length > 0 ? testStatements : undefined}
            showRawJson
            showFormatted
          />
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder" className="mt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Custom Statement Builder</h3>
            <p className="text-xs text-zinc-500">
              Build and test custom xAPI statements. Statements can be copied as JSON or sent
              directly to your configured LRS.
            </p>
          </div>

          <StatementBuilder onSend={handleStatementSend} showSendButton={!!endpoint} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default XAPIConfigPanel;
