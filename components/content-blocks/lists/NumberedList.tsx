'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

type NumberedListStyle = '1' | 'A' | 'a' | 'I';

export function NumberedList(): React.JSX.Element {
  const [listStyle, setListStyle] = useState<NumberedListStyle>('1');
  const [items, setItems] = useState([
    'First item in the list.',
    'Second item for demonstration.',
    'Third and final item.',
  ]);

  const handleTextareaChange = (value: string) => {
    const newItems = value.split('\n').filter((line) => line.trim() !== '');
    setItems(newItems.length > 0 ? newItems : ['']);
  };

  const styleOptions: { value: NumberedListStyle; label: string }[] = [
    { value: '1', label: '1, 2, 3' },
    { value: 'A', label: 'A, B, C' },
    { value: 'a', label: 'a, b, c' },
    { value: 'I', label: 'I, II, III' },
  ];

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-2xl shadow-lg p-8 mb-6">
      <div className="mb-4 flex items-center gap-2">
        <label
          htmlFor="NumberedList-input-1"
          className="text-sm font-medium text-lxd-text-light-secondary"
        >
          Style:
        </label>
        <div className="flex gap-1">
          {styleOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setListStyle(option.value)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                listStyle === option.value
                  ? 'bg-lxd-blue text-brand-primary'
                  : 'bg-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-dark-surface/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <Textarea
        value={items.join('\n')}
        onChange={(e) => handleTextareaChange(e.target.value)}
        placeholder="Enter list items, one per line..."
        className="mb-4 min-h-[100px] bg-lxd-dark-surface border-lxd-dark-surface text-lxd-text-light-heading placeholder:text-lxd-text-light-muted"
      />
      <ol
        type={listStyle}
        className="pl-8 space-y-2 text-lxd-text-light-body"
        style={{
          listStyleType:
            listStyle === '1'
              ? 'decimal'
              : listStyle === 'A'
                ? 'upper-alpha'
                : listStyle === 'a'
                  ? 'lower-alpha'
                  : 'upper-roman',
        }}
      >
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default NumberedList;
