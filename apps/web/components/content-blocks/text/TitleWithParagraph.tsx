'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Sparkles,
  Strikethrough,
  Underline,
  Video,
} from 'lucide-react';
import { useRef, useState } from 'react';

export function TitleWithParagraph(): React.JSX.Element {
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [paraCharCount, setParaCharCount] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLDivElement>(null);
  const maxTitleChars = 100;
  const maxParaChars = 5000;

  const updateTitleCharCount = () => {
    if (!titleRef.current) return;
    const text = titleRef.current.innerText || '';
    if (text.length > maxTitleChars) {
      titleRef.current.innerText = text.substring(0, maxTitleChars);
    }
    setTitleCharCount(titleRef.current.innerText.length);
  };

  const updateParaCharCount = () => {
    if (!paraRef.current) return;
    const text = paraRef.current.innerText || '';
    if (text.length > maxParaChars) {
      paraRef.current.innerText = text.substring(0, maxParaChars);
    }
    setParaCharCount(paraRef.current.innerText.length);
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl shadow-lg p-10 w-full">
      <h1
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateTitleCharCount}
        className="text-[2.5em] font-bold text-lxd-text-light-heading m-0 mb-5 p-2.5 outline-hidden border-2 border-transparent transition-[border-color] duration-300 focus:border-lxd-blue"
      >
        Title with a Paragraph Below
      </h1>
      <div
        className="text-right text-sm mt-2"
        style={{
          color:
            titleCharCount >= maxTitleChars ? 'var(--color-lxd-error)' : 'var(--color-text-muted)',
        }}
      >
        <span>{titleCharCount}</span> / {maxTitleChars}
      </div>

      <hr className="border-none border-t border-lxd-dark-surface my-6" />

      {/* RTE Toolbar */}
      <div className="flex flex-wrap bg-lxd-dark-surface/50 border border-lxd-dark-surface rounded-lg p-1.5 mb-2.5">
        <div className="flex mr-2.5 pr-2.5 border-r border-lxd-dark-surface">
          <button
            type="button"
            title="Bold"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Underline"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Strikethrough"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>
        <div className="flex mr-2.5 pr-2.5 border-r border-lxd-dark-surface">
          <select
            title="Headings"
            className="bg-transparent text-lxd-text-light-secondary p-2 cursor-pointer rounded hover:bg-lxd-blue/20"
          >
            <option className="bg-lxd-dark-page">Paragraph</option>
            <option className="bg-lxd-dark-page">H1</option>
            <option className="bg-lxd-dark-page">H2</option>
            <option className="bg-lxd-dark-page">H3</option>
          </select>
        </div>
        <div className="flex mr-2.5 pr-2.5 border-r border-lxd-dark-surface">
          <button
            type="button"
            title="Align Left"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Center"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Right"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex mr-2.5 pr-2.5 border-r border-lxd-dark-surface">
          <button
            type="button"
            title="Bulleted List"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
        <div className="flex mr-2.5 pr-2.5 border-r border-lxd-dark-surface">
          <button
            type="button"
            title="Insert Link"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Insert Image"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Insert Video"
            className="p-2 text-lxd-text-light-secondary rounded hover:bg-lxd-blue/20 transition-colors"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
        <div className="flex">
          <button
            type="button"
            title="Re-write with AI"
            className="p-2 text-lxd-success rounded hover:bg-lxd-success/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={paraRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateParaCharCount}
        className="min-h-[150px] p-4 border border-lxd-dark-surface rounded-lg text-lxd-text-light-body outline-hidden leading-relaxed focus:border-lxd-blue focus:shadow-[0_0_0_3px_rgba(0,86,184,0.1)]"
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus
          tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.
        </p>
      </div>
      <div
        className="text-right text-sm mt-2"
        style={{
          color:
            paraCharCount >= maxParaChars ? 'var(--color-lxd-error)' : 'var(--color-text-muted)',
        }}
      >
        <span>{paraCharCount}</span> / {maxParaChars}
      </div>
    </div>
  );
}
