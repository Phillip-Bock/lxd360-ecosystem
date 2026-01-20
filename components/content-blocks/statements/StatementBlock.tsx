'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

export function StatementBlock(): React.JSX.Element {
  const [content, setContent] = useState(
    'This is a standard statement block for general information.',
  );

  return (
    <div className="border-l-[5px] border-lxd-blue bg-lxd-dark-page rounded-lg p-5">
      <h4 className="flex items-center gap-2.5 text-lxd-blue font-semibold mb-3">
        <Info className="w-5 h-5" />
        Statement Block
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Statement content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="text-lxd-text-light-secondary outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2 bg-lxd-dark-surface"
      >
        {content}
      </div>
    </div>
  );
}
