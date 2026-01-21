'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';

export function SummaryBox(): React.JSX.Element {
  const [title, setTitle] = useState('Lesson Summary');
  const [content, setContent] = useState(
    'This section provides a concise overview of the main points covered in this lesson. Use this space to reinforce key concepts and help learners consolidate their understanding.',
  );

  return (
    <div className="border-2 border-lxd-secondary bg-linear-to-br from-brand-accent-muted to-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-lxd-secondary">
        <div className="bg-lxd-secondary rounded-lg p-2">
          <FileText className="w-6 h-6 text-brand-primary" />
        </div>
        <h4
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setTitle(e.currentTarget.textContent || '')}
          className="mt-0 text-brand-primary-hover font-bold text-xl outline-hidden focus:ring-2 focus:ring-lxd-secondary rounded px-2"
        >
          {title}
        </h4>
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        role="textbox"
        tabIndex={0}
        aria-label="Summary content"
        className="text-lxd-text-dark-body leading-relaxed outline-hidden focus:ring-2 focus:ring-lxd-secondary rounded p-2"
      >
        {content}
      </div>
    </div>
  );
}
