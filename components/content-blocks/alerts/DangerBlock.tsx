'use client';

import { Skull } from 'lucide-react';
import { useState } from 'react';

export function DangerBlock(): React.JSX.Element {
  const [content, setContent] = useState(
    'Reserved for critical information where there is a risk of severe problems.',
  );

  return (
    <div className="border-2 border-lxd-error bg-red-950 rounded-lg p-5 animate-pulse">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-error font-semibold mb-3">
        <Skull className="w-5 h-5" />
        Danger Block
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Danger content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="outline-hidden focus:ring-2 focus:ring-lxd-error rounded text-red-200"
      >
        {content}
      </div>
    </div>
  );
}
