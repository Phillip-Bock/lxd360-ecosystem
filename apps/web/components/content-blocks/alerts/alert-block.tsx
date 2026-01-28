'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

export function AlertBlock(): React.JSX.Element {
  const [content, setContent] = useState(
    'For time-sensitive or urgent notifications that require attention.',
  );

  return (
    <div className="border-2 border-lxd-blue bg-lxd-blue/10 rounded-lg p-5 animate-pulse">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-blue font-semibold mb-3">
        <Bell className="w-5 h-5" />
        Alert
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Alert content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="outline-hidden focus:ring-2 focus:ring-lxd-blue rounded text-lxd-text-dark-body dark:text-lxd-text-light-body"
      >
        {content}
      </div>
    </div>
  );
}
