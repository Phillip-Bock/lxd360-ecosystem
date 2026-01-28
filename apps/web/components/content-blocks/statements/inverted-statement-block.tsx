'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

export function InvertedStatementBlock(): React.JSX.Element {
  const [content, setContent] = useState('A high-contrast block for key takeaways.');

  return (
    <div className="border-l-[5px] border-lxd-success bg-lxd-blue text-lxd-text-light-heading rounded-lg p-5">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-text-light-heading font-semibold mb-3">
        <Star className="w-5 h-5 text-lxd-success" />
        Key Takeaway
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Key takeaway content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="outline-hidden focus:ring-2 focus:ring-lxd-success rounded"
      >
        {content}
      </div>
    </div>
  );
}
