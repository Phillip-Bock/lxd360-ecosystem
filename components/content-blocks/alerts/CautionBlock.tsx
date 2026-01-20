'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function CautionBlock(): React.JSX.Element {
  const [content, setContent] = useState('Use this block to warn users about potential issues.');

  return (
    <div className="border-l-[5px] border-lxd-warning bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-warning font-semibold mb-3">
        <AlertTriangle className="w-5 h-5" />
        Caution
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Caution content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="outline-hidden focus:ring-2 focus:ring-lxd-blue rounded text-lxd-text-dark-body dark:text-lxd-text-light-body"
      >
        {content}
      </div>
    </div>
  );
}
