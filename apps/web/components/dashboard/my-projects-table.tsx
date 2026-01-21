'use client';

import { Folder, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ProjectStatus = 'Draft' | 'Review' | 'Published';

interface Project {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  status: ProjectStatus;
  seatTime: {
    minutes: number;
    wordCount: number;
    videoMinutes: number;
  };
  a11y: {
    score: number;
    issues: number;
  };
  size: {
    mb: number;
    maxMb: number;
  };
  clt: {
    score: number;
    max: number;
  };
  versions: {
    count: number;
    lastUpdated: string;
  };
  readability: {
    score: number;
    level: 'Easy' | 'Moderate' | 'Difficult';
  };
}

// Mock data matching the screenshot
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Customer Service Excellence',
    type: 'Course',
    updatedAt: '1 week ago',
    status: 'Draft',
    seatTime: { minutes: 29, wordCount: 2100, videoMinutes: 12 },
    a11y: { score: 91, issues: 15 },
    size: { mb: 45.2, maxMb: 200 },
    clt: { score: 4.5, max: 10 },
    versions: { count: 3, lastUpdated: '1 week ago' },
    readability: { score: 7.1, level: 'Moderate' },
  },
  {
    id: '2',
    name: 'Employee Satisfaction',
    type: 'Survey',
    updatedAt: '5 days ago',
    status: 'Draft',
    seatTime: { minutes: 22, wordCount: 450, videoMinutes: 0 },
    a11y: { score: 98, issues: 0 },
    size: { mb: 5.2, maxMb: 200 },
    clt: { score: 3.2, max: 10 },
    versions: { count: 2, lastUpdated: '5 days ago' },
    readability: { score: 5.2, level: 'Easy' },
  },
  {
    id: '3',
    name: 'Leadership Foundations',
    type: 'Course',
    updatedAt: '3 days ago',
    status: 'Review',
    seatTime: { minutes: 99, wordCount: 6800, videoMinutes: 45 },
    a11y: { score: 78, issues: 35 },
    size: { mb: 156.8, maxMb: 200 },
    clt: { score: 7.8, max: 10 },
    versions: { count: 8, lastUpdated: '3 days ago' },
    readability: { score: 10.4, level: 'Difficult' },
  },
  {
    id: '4',
    name: 'Onboarding 2024',
    type: 'Course',
    updatedAt: '2 hours ago',
    status: 'Draft',
    seatTime: { minutes: 51, wordCount: 4250, videoMinutes: 18 },
    a11y: { score: 87, issues: 25 },
    size: { mb: 78.5, maxMb: 200 },
    clt: { score: 6.4, max: 10 },
    versions: { count: 5, lastUpdated: '2:30 PM' },
    readability: { score: 8.2, level: 'Moderate' },
  },
  {
    id: '5',
    name: 'Product Training Module',
    type: 'Course',
    updatedAt: '1 week ago',
    status: 'Review',
    seatTime: { minutes: 79, wordCount: 5200, videoMinutes: 35 },
    a11y: { score: 85, issues: 25 },
    size: { mb: 98.7, maxMb: 200 },
    clt: { score: 6.9, max: 10 },
    versions: { count: 7, lastUpdated: '1 week ago' },
    readability: { score: 9.1, level: 'Moderate' },
  },
  {
    id: '6',
    name: 'Q4 Knowledge Check',
    type: 'Assessment',
    updatedAt: '2 days ago',
    status: 'Published',
    seatTime: { minutes: 19, wordCount: 800, videoMinutes: 0 },
    a11y: { score: 96, issues: 0 },
    size: { mb: 12.5, maxMb: 200 },
    clt: { score: 5.8, max: 10 },
    versions: { count: 4, lastUpdated: '2 days ago' },
    readability: { score: 6.8, level: 'Easy' },
  },
];

const statusColors: Record<ProjectStatus, { bg: string; text: string }> = {
  Draft: { bg: 'bg-blue-500', text: 'text-white' },
  Review: { bg: 'bg-orange-500', text: 'text-white' },
  Published: { bg: 'bg-green-500', text: 'text-white' },
};

function getA11yColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
}

function getCltColor(score: number): string {
  if (score <= 4) return 'text-green-400';
  if (score <= 7) return 'text-yellow-400';
  return 'text-red-400';
}

function getReadabilityColor(level: string): string {
  switch (level) {
    case 'Easy':
      return 'text-green-400';
    case 'Moderate':
      return 'text-yellow-400';
    case 'Difficult':
      return 'text-red-400';
    default:
      return 'text-white';
  }
}

export default function MyProjectsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredProjects = mockProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => (
    <span className="ml-1 text-white/50">
      {sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--inspire-widget-bg)',
        borderColor: 'var(--inspire-widget-border)',
        boxShadow: 'var(--inspire-card-shadow)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--inspire-card-border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-white" />
          <h3 className="font-medium text-white">My Projects</h3>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--inspire-input-bg)',
            borderColor: 'var(--inspire-input-border)',
          }}
        >
          <Search className="w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--inspire-card-border-subtle)' }}>
              <th
                className="text-left px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('name')}
              >
                Project <SortIcon column="name" />
              </th>
              <th
                className="text-center px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon column="status" />
              </th>
              <th
                className="text-center px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('seatTime')}
              >
                Seat Time <SortIcon column="seatTime" />
              </th>
              <th
                className="text-center px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('a11y')}
              >
                A11y <SortIcon column="a11y" />
              </th>
              <th
                className="text-center px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('size')}
              >
                Size <SortIcon column="size" />
              </th>
              <th
                className="text-center px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('clt')}
              >
                CLT <SortIcon column="clt" />
              </th>
              <th
                className="text-center px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('versions')}
              >
                Versions <SortIcon column="versions" />
              </th>
              <th
                className="text-center px-4 py-2 text-xs font-medium text-white/70 cursor-pointer hover:text-white"
                onClick={() => handleSort('readability')}
              >
                Readability <SortIcon column="readability" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr
                key={project.id}
                className="border-b hover:bg-white/5 transition-colors"
                style={{ borderColor: 'var(--inspire-card-border-subtle)' }}
              >
                {/* Project Name */}
                <td className="px-4 py-3">
                  <Link
                    href={`/inspire-studio/project/${project.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Folder className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {project.type} · {project.updatedAt}
                      </p>
                    </div>
                  </Link>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded text-xs font-medium',
                      statusColors[project.status].bg,
                      statusColors[project.status].text,
                    )}
                  >
                    {project.status}
                  </span>
                </td>

                {/* Seat Time */}
                <td className="px-4 py-3 text-center">
                  <p className="text-cyan-400 font-medium">{project.seatTime.minutes}m</p>
                  <p className="text-xs text-white/50">
                    {project.seatTime.wordCount.toLocaleString()}w / {project.seatTime.videoMinutes}
                    m vid
                  </p>
                </td>

                {/* A11y */}
                <td className="px-4 py-3 text-center">
                  <p className={cn('font-medium', getA11yColor(project.a11y.score))}>
                    {project.a11y.score}%
                  </p>
                  {project.a11y.issues > 0 && (
                    <p className="text-xs text-white/50">{project.a11y.issues}</p>
                  )}
                </td>

                {/* Size */}
                <td className="px-4 py-3">
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-white/70">
                      {project.size.mb.toFixed(1)}MB
                      <span className="text-white/40 ml-1">/{project.size.maxMb}MB</span>
                    </p>
                    <div className="w-16 h-1.5 rounded-full bg-white/10 mt-1">
                      <div
                        className="h-full rounded-full bg-green-400"
                        style={{ width: `${(project.size.mb / project.size.maxMb) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* CLT */}
                <td className="px-4 py-3 text-center">
                  <p className={cn('font-medium', getCltColor(project.clt.score))}>
                    {project.clt.score.toFixed(1)}
                  </p>
                  <p className="text-xs text-white/50">/{project.clt.max}</p>
                </td>

                {/* Versions */}
                <td className="px-4 py-3 text-center">
                  <p className="text-white">{project.versions.count}</p>
                  <p className="text-xs text-white/50">{project.versions.lastUpdated}</p>
                </td>

                {/* Readability */}
                <td className="px-4 py-3 text-center">
                  <p className="text-white">{project.readability.score.toFixed(1)}</p>
                  <p
                    className={cn(
                      'text-xs font-medium',
                      getReadabilityColor(project.readability.level),
                    )}
                  >
                    {project.readability.level}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
