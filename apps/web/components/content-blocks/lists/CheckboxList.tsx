'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export function CheckboxList(): React.JSX.Element {
  const [items, setItems] = useState([
    { id: '1', text: 'Complete initial setup.', checked: false },
    { id: '2', text: 'Review the documentation.', checked: false },
    { id: '3', text: 'Deploy the final version.', checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const updateText = (id: string, text: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  return (
    <div className="bg-card dark:bg-lxd-dark-page rounded-2xl shadow-lg p-8">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={() => toggleCheck(item.id)}
              className="w-5 h-5 border-lxd-blue data-[state=checked]:bg-lxd-blue"
            />
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateText(item.id, e.target.value)}
              className="flex-1 border-none outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-2 py-1 bg-transparent text-lxd-text-dark-body dark:text-lxd-text-light-heading"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
