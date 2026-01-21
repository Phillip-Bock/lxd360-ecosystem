'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

export function ParagraphWithImage(): React.JSX.Element {
  const [layout, setLayout] = useState<'left' | 'center' | 'right'>('center');
  const [charCount, setCharCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const paraRef = useRef<HTMLDivElement>(null);
  const maxChars = 500;

  const updateCharCount = () => {
    if (!paraRef.current) return;
    const text = paraRef.current.innerText || '';
    if (text.length > maxChars) {
      paraRef.current.innerText = text.substring(0, maxChars);
    }
    setCharCount(paraRef.current.innerText.length);
  };

  const layoutOptions: { value: 'left' | 'center' | 'right'; label: string }[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl shadow-lg p-10 w-full max-w-[900px] mx-auto my-5">
      <div className="text-center mb-5">
        <span className="mr-2.5 text-lxd-text-light-secondary">Image Position:</span>
        {layoutOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => setLayout(option.value)}
            className={`${
              layout === option.value
                ? 'bg-lxd-purple-dark text-lxd-text-light-heading'
                : 'bg-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-dark-surface/80'
            } border-2 border-transparent px-4 py-2 rounded-[20px] cursor-pointer transition-all mr-2`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className={`flex flex-wrap gap-5 ${
          layout === 'center' ? 'flex-col' : layout === 'right' ? 'flex-row-reverse' : 'flex-row'
        } items-start`}
      >
        <div
          className={`relative cursor-grab ${layout === 'center' ? 'w-full mb-5' : 'w-[40%]'}`}
          draggable
        >
          <button
            type="button"
            className="relative w-full aspect-square border-0 bg-transparent p-0 cursor-zoom-in"
            onClick={() => setShowModal(true)}
            aria-label="Open image preview"
          >
            <Image
              src="/professional-learning-image.jpg"
              alt="Content Image"
              fill
              className="rounded-lg shadow-lg object-cover border border-lxd-dark-surface"
            />
          </button>
        </div>
        <div className={`flex-1 ${layout === 'center' ? 'w-full' : 'min-w-[300px]'}`}>
          <div
            ref={paraRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateCharCount}
            className="min-h-[100px] p-2.5 outline-hidden leading-relaxed border border-lxd-dark-surface rounded-lg focus:border-lxd-blue text-lxd-text-light-body bg-lxd-dark-page"
          >
            <p>
              Drag the image to re-order! Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias
              excepturi sint occaecati cupiditate non provident.
            </p>
          </div>
          <div
            className="text-right text-[0.9em] mt-2"
            style={{
              color: charCount >= maxChars ? 'var(--color-lxd-error)' : 'var(--color-text-muted)',
            }}
          >
            <span>{charCount}</span> / {maxChars}
          </div>
        </div>
      </div>

      {showModal && (
        <button
          type="button"
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 border-none cursor-pointer"
          onClick={() => setShowModal(false)}
          aria-label="Close image preview"
        >
          <div className="relative max-w-[90%] max-h-[90%]">
            <Image
              src="/professional-learning-image.jpg"
              alt="Zoomed Image"
              width={800}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </button>
      )}
    </div>
  );
}
