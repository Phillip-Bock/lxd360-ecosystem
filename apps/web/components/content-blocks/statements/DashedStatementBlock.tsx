'use client';

import { Megaphone } from 'lucide-react';
import { useState } from 'react';

export function DashedStatementBlock(): React.JSX.Element {
  const [content, setContent] = useState('A variation for important announcements.');

  return (
    <div className="border-2 border-dashed border-lxd-blue bg-lxd-dark-page rounded-lg p-[18px]">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-blue font-semibold mb-3">
        <Megaphone className="w-5 h-5" />
        Announcement
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Announcement content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="outline-hidden focus:ring-2 focus:ring-lxd-blue rounded text-lxd-text-light-body"
      >
        {content}
      </div>
    </div>
  );
}
