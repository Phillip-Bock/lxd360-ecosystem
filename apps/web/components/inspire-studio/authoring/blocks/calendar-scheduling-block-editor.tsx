import { Bell, Calendar, Clock, ExternalLink, Users } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface SchedulingConfig {
  title: string;
  eventType: 'follow_up' | 'study_session' | 'review' | 'custom';
  allowedProviders: ('google' | 'outlook' | 'ical')[];
  defaultDuration: number;
  requireApproval: boolean;
  sendReminders: boolean;
  reminderMinutes: number;
  instructions: string;
}

type CalendarSchedulingData = SchedulingConfig;

export const CalendarSchedulingBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as CalendarSchedulingData) || {};
  const [config, setConfig] = useState<SchedulingConfig>({
    title: data.title || 'Schedule Your Session',
    eventType: data.eventType || 'follow_up',
    allowedProviders: data.allowedProviders || ['google', 'outlook', 'ical'],
    defaultDuration: data.defaultDuration || 30,
    requireApproval: data.requireApproval ?? false,
    sendReminders: data.sendReminders ?? true,
    reminderMinutes: data.reminderMinutes || 60,
    instructions:
      data.instructions || 'Schedule a follow-up session with your manager or instructor.',
  });

  const handleProviderToggle = (provider: 'google' | 'outlook' | 'ical'): void => {
    const providers = config.allowedProviders.includes(provider)
      ? config.allowedProviders.filter((p) => p !== provider)
      : [...config.allowedProviders, provider];
    const updated = { ...config, allowedProviders: providers };
    setConfig(updated);
    props.onUpdate({ ...props.block, content: updated as Record<string, unknown> });
  };

  const handleChange = (updates: Partial<SchedulingConfig>): void => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    props.onUpdate({ ...props.block, content: updated as Record<string, unknown> });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="scheduling-block-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Block Title
          </label>
          <input
            id="scheduling-block-title"
            type="text"
            value={config.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Schedule Your Session"
          />
        </div>

        {/* Event Type */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Event Type
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange({ eventType: 'follow_up' })}
              className={`p-3 border-2 rounded-lg transition-all ${
                config.eventType === 'follow_up'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <div className="font-medium text-sm">Follow-Up</div>
              <div className="text-xs text-brand-muted">Meet with instructor</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ eventType: 'study_session' })}
              className={`p-3 border-2 rounded-lg transition-all ${
                config.eventType === 'study_session'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Clock className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <div className="font-medium text-sm">Study Session</div>
              <div className="text-xs text-brand-muted">Personal study time</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ eventType: 'review' })}
              className={`p-3 border-2 rounded-lg transition-all ${
                config.eventType === 'review'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <div className="font-medium text-sm">Review</div>
              <div className="text-xs text-brand-muted">Review materials</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ eventType: 'custom' })}
              className={`p-3 border-2 rounded-lg transition-all ${
                config.eventType === 'custom'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Bell className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <div className="font-medium text-sm">Custom</div>
              <div className="text-xs text-brand-muted">User-defined event</div>
            </button>
          </div>
        </fieldset>

        {/* Calendar Providers */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-3">
            Calendar Providers
          </legend>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowedProviders.includes('google')}
                onChange={() => handleProviderToggle('google')}
                className="text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  Google Calendar
                </div>
                <div className="text-sm text-brand-muted">Integrate with Google Calendar</div>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowedProviders.includes('outlook')}
                onChange={() => handleProviderToggle('outlook')}
                className="text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  Outlook Calendar
                </div>
                <div className="text-sm text-brand-muted">Integrate with Microsoft Outlook</div>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowedProviders.includes('ical')}
                onChange={() => handleProviderToggle('ical')}
                className="text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  iCal (Apple Calendar)
                </div>
                <div className="text-sm text-brand-muted">
                  Download .ics file for unknown calendar
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Duration */}
        <div>
          <label
            htmlFor="scheduling-default-duration"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Default Duration: {config.defaultDuration} minutes
          </label>
          <input
            id="scheduling-default-duration"
            type="range"
            min="15"
            max="180"
            step="15"
            value={config.defaultDuration}
            onChange={(e) => handleChange({ defaultDuration: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-brand-muted mt-1">
            <span>15 min</span>
            <span>90 min</span>
            <span>180 min</span>
          </div>
        </div>

        {/* Options */}
        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-3">
            Scheduling Options
          </legend>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.requireApproval}
                onChange={(e) => handleChange({ requireApproval: e.target.checked })}
                className="mt-1 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary">Require Approval</div>
                <div className="text-sm text-brand-muted">
                  Instructor must approve scheduled sessions
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.sendReminders}
                onChange={(e) => handleChange({ sendReminders: e.target.checked })}
                className="mt-1 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  Send Reminders
                </div>
                <div className="text-sm text-brand-muted">
                  Send calendar reminders before events
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Reminder Timing (conditional) */}
        {config.sendReminders && (
          <div>
            <label
              htmlFor="scheduling-reminder-time"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Reminder Time: {config.reminderMinutes} minutes before
            </label>
            <input
              id="scheduling-reminder-time"
              type="range"
              min="15"
              max="1440"
              step="15"
              value={config.reminderMinutes}
              onChange={(e) => handleChange({ reminderMinutes: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-brand-muted mt-1">
              <span>15 min</span>
              <span>12 hours</span>
              <span>24 hours</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div>
          <label
            htmlFor="scheduling-instructions"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Instructions for Learners
          </label>
          <textarea
            id="scheduling-instructions"
            value={config.instructions}
            onChange={(e) => handleChange({ instructions: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Schedule a follow-up session..."
            rows={3}
          />
        </div>

        {/* Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm text-brand-secondary">
              <p className="font-medium text-indigo-900 mb-1">Calendar Integration</p>
              <p>
                Learners can connect their preferred calendar service to schedule events directly.
                Events will be synced bidirectionally, and reminders will be sent according to their
                calendar settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
