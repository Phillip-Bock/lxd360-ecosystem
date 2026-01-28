'use client';

import { useState } from 'react';

export function TimelineHorizontal(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('1980s');
  const tabs = [
    {
      id: '1980s',
      title: '1980s',
      heading: 'The Age of Mainframes',
      content:
        'Early corporate e-learning begins with text-based training on large computer systems.',
    },
    {
      id: '1990s',
      title: '1990s',
      heading: 'The Multimedia Revolution',
      content: 'CD-ROMs and the web bring graphics, audio, and video to learning content.',
    },
    {
      id: '2000s',
      title: '2000s',
      heading: 'The Rise of the LMS',
      content:
        'Learning Management Systems become mainstream, standardizing delivery and tracking.',
    },
  ];

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex justify-center border-b-2 border-lxd-dark-surface mb-6">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 border-b-[3px] transition-colors ${
              activeTab === tab.id
                ? 'border-lxd-blue text-lxd-blue font-bold'
                : 'border-transparent text-lxd-text-light-muted hover:text-lxd-blue'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} className={`text-center ${activeTab === tab.id ? 'block' : 'hidden'}`}>
          <h3 className="text-xl font-bold text-lxd-text-light-heading mb-3">{tab.heading}</h3>
          <p className="text-lxd-text-light-secondary leading-relaxed">{tab.content}</p>
        </div>
      ))}
    </div>
  );
}
