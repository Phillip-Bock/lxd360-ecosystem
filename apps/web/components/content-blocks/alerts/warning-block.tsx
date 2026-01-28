'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function WarningBlock(): React.JSX.Element {
  const [content, setContent] = useState(
    'For more serious warnings where mistakes could have consequences.',
  );

  return (
    <div className="border-l-[5px] border-lxd-error bg-lxd-error/10 rounded-lg p-5">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-error font-semibold mb-3">
        <AlertCircle className="w-5 h-5" />
        Warning Block
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Warning content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="text-lxd-text-dark-body dark:text-lxd-text-light-body outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
      >
        {content}
      </div>
    </div>
  );
}
