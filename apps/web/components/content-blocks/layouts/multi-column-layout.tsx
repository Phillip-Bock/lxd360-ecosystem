'use client';

import { Bold, Italic, List, ListOrdered, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ColumnData {
  id: number;
  content: string;
  charCount: number;
}

const DEFAULT_CONTENT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.';

export function MultiColumnLayout(): React.JSX.Element {
  const [numColumns, setNumColumns] = useState(2);
  const [columns, setColumns] = useState<ColumnData[]>([
    { id: 1, content: DEFAULT_CONTENT, charCount: 0 },
    { id: 2, content: DEFAULT_CONTENT, charCount: 0 },
  ]);
  const maxChars = 500;
  const prevNumColumnsRef = useRef(numColumns);

  useEffect(() => {
    if (prevNumColumnsRef.current !== numColumns) {
      const newColumns: ColumnData[] = [];
      for (let i = 1; i <= numColumns; i++) {
        newColumns.push({
          id: i,
          content: columns[i - 1]?.content || DEFAULT_CONTENT,
          charCount: columns[i - 1]?.charCount || 0,
        });
      }
      setColumns(newColumns);
      prevNumColumnsRef.current = numColumns;
    }
  }, [numColumns, columns]);

  const updateCharCount = (index: number, element: HTMLDivElement) => {
    const text = element.innerText || '';
    if (text.length > maxChars) {
      element.innerText = text.substring(0, maxChars);
    }
    const newColumns = [...columns];
    newColumns[index].charCount = element.innerText.length;
    setColumns(newColumns);
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl shadow-lg p-10 w-full max-w-[1200px] mx-auto my-5">
      <div className="mb-5 text-center">
        <label
          htmlFor="MultiColumnLayout-input-1"
          className="mr-2.5 font-medium text-lxd-text-light-secondary"
        >
          Number of columns:
        </label>
        {[2, 3, 4].map((num) => (
          <button
            type="button"
            key={num}
            onClick={() => setNumColumns(num)}
            className={`${
              numColumns === num
                ? 'bg-lxd-purple-dark text-lxd-text-light-heading'
                : 'bg-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-dark-surface/80'
            } border-2 border-transparent px-4 py-2 rounded-[20px] cursor-pointer transition-all mr-2`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}>
        {columns.map((column, index) => (
          <div
            key={column.id}
            className="border border-lxd-dark-surface rounded-lg p-4 bg-lxd-dark-surface/30"
          >
            {/* RTE Toolbar */}
            <div className="flex flex-wrap bg-lxd-dark-page border border-lxd-dark-surface rounded-lg p-1.5 mb-2.5">
              <div className="flex">
                <button
                  type="button"
                  title="Bold"
                  className="p-2 cursor-pointer rounded hover:bg-lxd-dark-surface text-lxd-text-light-muted"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Italic"
                  className="p-2 cursor-pointer rounded hover:bg-lxd-dark-surface text-lxd-text-light-muted"
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
              <div className="flex ml-2">
                <button
                  type="button"
                  title="Bulleted List"
                  className="p-2 cursor-pointer rounded hover:bg-lxd-dark-surface text-lxd-text-light-muted"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Numbered List"
                  className="p-2 cursor-pointer rounded hover:bg-lxd-dark-surface text-lxd-text-light-muted"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>
              <div className="flex ml-2">
                <button
                  type="button"
                  title="Re-write with AI"
                  className="p-2 cursor-pointer rounded hover:bg-lxd-dark-surface text-lxd-success"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => updateCharCount(index, e.currentTarget)}
              className="min-h-[100px] p-2.5 outline-hidden leading-relaxed text-lxd-text-light-body focus:ring-2 focus:ring-lxd-blue rounded"
            >
              <p>{column.content}</p>
            </div>
            <div
              className="text-right text-[0.9em] mt-2"
              style={{
                color:
                  column.charCount >= maxChars
                    ? 'var(--color-lxd-error)'
                    : 'var(--color-text-muted)',
              }}
            >
              <span>{column.charCount}</span> / {maxChars}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
