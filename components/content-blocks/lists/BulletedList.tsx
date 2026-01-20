'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

type BulletStyle = 'disc' | 'square' | 'star' | 'arrow' | 'diamond';

export function BulletedList(): React.JSX.Element {
  const [bulletStyle, setBulletStyle] = useState<BulletStyle>('disc');
  const [items, setItems] = useState([
    'A point about design.',
    'Another important consideration.',
    'A final summary point.',
  ]);

  const getListStyleType = () => {
    switch (bulletStyle) {
      case 'star':
        return "'★ '";
      case 'arrow':
        return "'→ '";
      case 'diamond':
        return "'♦ '";
      case 'square':
        return "'■ '";
      default:
        return 'disc';
    }
  };

  const handleTextareaChange = (value: string) => {
    const newItems = value.split('\n').filter((line) => line.trim() !== '');
    setItems(newItems.length > 0 ? newItems : ['']);
  };

  return (
    <div className="bg-card dark:bg-lxd-dark-page rounded-2xl shadow-lg p-8">
      <div className="mb-4">
        <label
          htmlFor="bullet-style"
          className="mr-2 text-sm font-medium text-lxd-text-dark-secondary dark:text-lxd-text-light-secondary"
        >
          Style:
        </label>
        <select
          id="bullet-style"
          value={bulletStyle}
          onChange={(e) => setBulletStyle(e.target.value as BulletStyle)}
          className="px-3 py-1.5 border border-border dark:border-lxd-dark-surface rounded-md text-sm bg-background dark:bg-lxd-dark-surface text-lxd-text-dark-body dark:text-lxd-text-light-heading"
        >
          <option value="disc">Circle</option>
          <option value="square">Square</option>
          <option value="star">Star</option>
          <option value="arrow">Arrow</option>
          <option value="diamond">Diamond</option>
        </select>
      </div>
      <Textarea
        value={items.join('\n')}
        onChange={(e) => handleTextareaChange(e.target.value)}
        placeholder="Enter list items, one per line..."
        className="mb-4 min-h-[100px] bg-background dark:bg-lxd-dark-surface border-border dark:border-lxd-dark-surface"
      />
      <ul
        className="pl-8 space-y-2 text-lxd-text-dark-body dark:text-lxd-text-light-heading"
        style={{ listStyleType: getListStyleType() }}
      >
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
