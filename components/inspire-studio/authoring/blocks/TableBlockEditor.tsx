import { Plus, X } from 'lucide-react';
import type { TableBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface TableBlockEditorProps {
  block: TableBlock;
  onChange: (content: TableBlock['content']) => void;
}

export const TableBlockEditor = ({ block, onChange }: TableBlockEditorProps): React.JSX.Element => {
  const addColumn = (): void => {
    onChange({
      ...block.content,
      headers: [...block.content.headers, ''],
      rows: block.content.rows.map((row) => [...row, '']),
    });
  };

  const removeColumn = (index: number): void => {
    onChange({
      ...block.content,
      headers: block.content.headers.filter((_, i) => i !== index),
      rows: block.content.rows.map((row) => row.filter((_, i) => i !== index)),
    });
  };

  const addRow = (): void => {
    onChange({
      ...block.content,
      rows: [...block.content.rows, new Array(block.content.headers.length).fill('')],
    });
  };

  const removeRow = (index: number): void => {
    onChange({
      ...block.content,
      rows: block.content.rows.filter((_, i) => i !== index),
    });
  };

  const updateHeader = (index: number, value: string): void => {
    const newHeaders = [...block.content.headers];
    newHeaders[index] = value;
    onChange({ ...block.content, headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string): void => {
    const newRows = [...block.content.rows];
    newRows[rowIndex][colIndex] = value;
    onChange({ ...block.content, rows: newRows });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="table-caption"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Table Caption (optional)
        </label>
        <input
          id="table-caption"
          type="text"
          value={typeof block.content.caption === 'string' ? block.content.caption : ''}
          onChange={(e) => onChange({ ...block.content, caption: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Table caption"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-brand-strong">
          <thead>
            <tr className="bg-brand-page">
              {block.content.headers.map((header, index) => (
                <th key={index} className="border border-brand-strong p-2">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      className="flex-1 px-2 py-1 border border-brand-strong rounded text-sm"
                      placeholder={`Header ${index + 1}`}
                    />
                    {block.content.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.content.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-brand-strong p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full px-2 py-1 border border-brand-strong rounded text-sm"
                      placeholder="Cell"
                    />
                  </td>
                ))}
                <td className="border border-brand-strong p-2 bg-brand-page">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Column
        </button>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>
    </div>
  );
};
