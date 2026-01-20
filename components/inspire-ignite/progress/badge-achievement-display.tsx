'use client';

import { Award, Star } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function BadgeAchievementDisplay(): React.JSX.Element {
  const [title, setTitle] = useState('Achievement Unlocked!');
  const [badgeName, setBadgeName] = useState('Lesson Master');
  const [description, setDescription] = useState(
    "You've successfully completed this lesson and demonstrated mastery of the concepts.",
  );
  const [points, setPoints] = useState(100);

  return (
    <div className="bg-linear-to-br from-caution via-caution to-block-interactive rounded-xl p-6 shadow-xl border-2 border-block-interactive">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <div className="w-24 h-24 bg-linear-to-br from-block-interactive to-block-interactive rounded-full flex items-center justify-center shadow-lg">
            <Award className="w-14 h-14 text-brand-primary" />
          </div>
          <div className="absolute -top-2 -right-2 bg-lxd-light-card rounded-full p-1 shadow-md">
            <Star className="w-6 h-6 text-block-interactive fill-block-interactive" />
          </div>
        </div>
      </div>
      <h4
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setTitle(e.currentTarget.textContent || '')}
        className="text-center text-block-interactive font-bold text-xl mb-2 outline-hidden focus:ring-2 focus:ring-block-interactive rounded px-2"
      >
        {title}
      </h4>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge className="bg-lxd-light-card text-block-interactive border-2 border-block-interactive text-lg px-4 py-1">
          {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires span with role="textbox" for rich text */}
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setBadgeName(e.currentTarget.textContent || '')}
            role="textbox"
            tabIndex={0}
            aria-label="Badge name"
          >
            {badgeName}
          </span>
        </Badge>
      </div>
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setDescription(e.currentTarget.textContent || '')}
        className="text-center text-block-interactive mb-4 outline-hidden focus:ring-2 focus:ring-block-interactive rounded p-2"
      >
        {description}
      </p>
      <div className="flex items-center justify-center gap-2 bg-lxd-light-card/50 rounded-lg p-3">
        <Star className="w-5 h-5 text-block-interactive fill-block-interactive" />
        <span className="font-bold text-block-interactive">
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-16 text-center bg-transparent border-b-2 border-block-interactive outline-hidden"
          />{' '}
          Points Earned
        </span>
      </div>
    </div>
  );
}
