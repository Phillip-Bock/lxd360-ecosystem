'use client';

import { motion } from 'framer-motion';
import { Calendar, Download, Eye, FileText, HardDrive, RefreshCw } from 'lucide-react';

interface ReportCardProps {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'completion' | 'engagement' | 'performance';
  dateRange: string;
  generatedDate: string;
  fileSize: string;
  onGenerate: (id: string) => void;
  onDownload: (id: string) => void;
  onPreview: (id: string) => void;
}

const typeColors = {
  activity: {
    bg: 'bg-(--blue-dark-100)',
    border: 'border-(--blue-dark-300)',
    badge: 'bg-(--blue-dark-600) text-brand-primary',
  },
  completion: {
    bg: 'bg-(--success-100)',
    border: 'border-(--success-300)',
    badge: 'bg-(--success-700) text-brand-primary',
  },
  engagement: {
    bg: 'bg-(--purple-100)',
    border: 'border-(--purple-300)',
    badge: 'bg-(--purple-700) text-brand-primary',
  },
  performance: {
    bg: 'bg-(--warning-100)',
    border: 'border-(--warning-300)',
    badge: 'bg-(--warning-700) text-brand-primary',
  },
};

export function ReportCard({
  id,
  title,
  description,
  type,
  dateRange,
  generatedDate,
  fileSize,
  onGenerate,
  onDownload,
  onPreview,
}: ReportCardProps): React.JSX.Element {
  const colors = typeColors[type];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-card border-[1.5px] rounded-[10px] p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-[10px] ${colors.bg} flex items-center justify-center`}>
            <FileText className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors.badge}`}
            >
              {type}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{dateRange}</span>
        </div>
        <div className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          <span>{generatedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3" />
          <span>{fileSize}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPreview(id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-[8px] text-sm font-medium transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => onGenerate(id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-[8px] text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
        <button
          type="button"
          onClick={() => onDownload(id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-(--primary) text-brand-primary hover:bg-(--primary)/90 rounded-[8px] text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </motion.div>
  );
}
