import type { ReactNode } from 'react';

export interface ContentBlock {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
}

/**
 * Content Block Definition for authoring sidebar
 */
export interface ContentBlockDefinition {
  id: string;
  name: string;
  type: string;
  category: string;
  icon: ReactNode | string;
  description: string;
  color: string;
  badge?: string;
}

// Stub data - will be populated when INSPIRE Studio features are implemented
export const contentBlocksData: ContentBlockDefinition[] = [
  {
    id: 'text',
    name: 'Text Block',
    type: 'text',
    category: 'Content',
    icon: 'FileText',
    description: 'Rich text content block',
    color: 'bg-blue-100',
  },
  {
    id: 'image',
    name: 'Image',
    type: 'image',
    category: 'Media',
    icon: 'Image',
    description: 'Image content block',
    color: 'bg-green-100',
  },
  {
    id: 'video',
    name: 'Video',
    type: 'video',
    category: 'Media',
    icon: 'Video',
    description: 'Video content block',
    color: 'bg-purple-100',
  },
  {
    id: 'quiz',
    name: 'Quiz',
    type: 'quiz',
    category: 'Assessment',
    icon: 'HelpCircle',
    description: 'Quiz assessment block',
    color: 'bg-yellow-100',
  },
  {
    id: 'hotspot',
    name: 'Hotspot',
    type: 'hotspot',
    category: 'Interactive',
    icon: 'MousePointer',
    description: 'Interactive hotspot block',
    color: 'bg-red-100',
  },
];

export default contentBlocksData;
