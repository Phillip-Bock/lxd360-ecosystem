'use client';

import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function SuccessBlock(): React.JSX.Element {
  const [content, setContent] = useState(
    'Great for positive reinforcement, tips, or successful outcomes.',
  );

  return (
    <div className="border-l-[5px] border-lxd-success bg-lxd-success/10 rounded-lg p-5">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-success font-semibold mb-3">
        <CheckCircle className="w-5 h-5" />
        Success / Tip Block
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Success content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="text-lxd-text-dark-body dark:text-lxd-text-light-body outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
      >
        {content}
      </div>
    </div>
  );
}
