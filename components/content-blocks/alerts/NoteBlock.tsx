'use client';

import { Pencil } from 'lucide-react';
import { useState } from 'react';

export function NoteBlock(): React.JSX.Element {
  const [content, setContent] = useState('Use this for important, bolded information.');

  return (
    <div className="border-l-[5px] border-lxd-blue bg-lxd-dark-page dark:bg-lxd-dark-page rounded-lg p-5">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-blue font-semibold mb-3">
        <Pencil className="w-5 h-5" />
        Note Block
      </h4>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Note content"
        tabIndex={0}
        onBlur={(e) => setContent(e.currentTarget.textContent || '')}
        className="outline-hidden focus:ring-2 focus:ring-lxd-blue rounded text-lxd-text-light-body"
      >
        <strong className="text-lxd-text-light-heading">Note:</strong> {content}
      </div>
    </div>
  );
}
