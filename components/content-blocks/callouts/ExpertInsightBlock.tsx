'use client';

import { UserCheck } from 'lucide-react';
import { useState } from 'react';

export function ExpertInsightBlock(): React.JSX.Element {
  const [content, setContent] = useState(
    'According to industry experts, micro-interactions in e-learning can boost retention rates by up to 25%.',
  );

  return (
    <div className="border-2 border-dashed border-lxd-purple-dark bg-lxd-dark-page rounded-lg p-[18px]">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-purple font-semibold mb-3">
        <UserCheck className="w-5 h-5" />
        Expert Insight
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Expert insight content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="outline-hidden focus:ring-2 focus:ring-lxd-purple rounded text-lxd-text-light-body"
      >
        {content}
      </div>
    </div>
  );
}
