import { FileText } from 'lucide-react';
import type { FileBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface FileBlockEditorProps {
  block: FileBlock;
  onChange: (content: FileBlock['content']) => void;
}

export const FileBlockEditor = ({ block, onChange }: FileBlockEditorProps): React.JSX.Element => {
  const url = typeof block.content.url === 'string' ? block.content.url : '';
  const filename = typeof block.content.filename === 'string' ? block.content.filename : '';
  const fileType = typeof block.content.fileType === 'string' ? block.content.fileType : '';
  const size = typeof block.content.size === 'number' ? block.content.size : undefined;

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={`file-url-${block.id}`}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          File URL
        </label>
        <input
          id={`file-url-${block.id}`}
          type="url"
          value={url}
          onChange={(e) => onChange({ ...block.content, url: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="https://example.com/document.pdf"
        />
      </div>
      <div>
        <label
          htmlFor={`file-name-${block.id}`}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Filename
        </label>
        <input
          id={`file-name-${block.id}`}
          type="text"
          value={filename}
          onChange={(e) => onChange({ ...block.content, filename: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="document.pdf"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`file-type-${block.id}`}
            className="block text-sm font-medium text-brand-secondary mb-1"
          >
            File Type
          </label>
          <input
            id={`file-type-${block.id}`}
            type="text"
            value={fileType}
            onChange={(e) => onChange({ ...block.content, fileType: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="PDF, DOC, etc."
          />
        </div>
        <div>
          <label
            htmlFor={`file-size-${block.id}`}
            className="block text-sm font-medium text-brand-secondary mb-1"
          >
            File Size (KB)
          </label>
          <input
            id={`file-size-${block.id}`}
            type="number"
            value={size ?? ''}
            onChange={(e) =>
              onChange({ ...block.content, size: parseInt(e.target.value, 10) || undefined })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="1024"
          />
        </div>
      </div>
      {url && filename && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg border border-brand-default">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-brand-secondary" />
            <div className="flex-1">
              <p className="font-medium text-brand-primary">{filename}</p>
              {fileType && <p className="text-sm text-brand-secondary">{fileType}</p>}
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-hover text-sm font-medium"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
