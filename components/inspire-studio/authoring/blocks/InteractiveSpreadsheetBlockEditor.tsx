import { Calculator, Eye, Lock, Plus, Table, Trash2, Unlock } from 'lucide-react';
import { useState } from 'react';
import type {
  InteractiveSpreadsheetBlock,
  SpreadsheetCell,
} from '@/lib/inspire-studio/types/contentBlocks';

interface InteractiveSpreadsheetBlockEditorProps {
  block: InteractiveSpreadsheetBlock;
  onChange: (content: InteractiveSpreadsheetBlock['content']) => void;
}

export const InteractiveSpreadsheetBlockEditor = ({
  block,
  onChange,
}: InteractiveSpreadsheetBlockEditorProps): React.JSX.Element => {
  const defaultGrid: SpreadsheetCell[][] = Array(5)
    .fill(null)
    .map(() =>
      Array(5)
        .fill(null)
        .map(() => ({
          value: '',
          type: 'text' as const,
          isEditable: true,
          validationFormula: '',
        })),
    );

  const [grid, setGrid] = useState<SpreadsheetCell[][]>(block.content.grid || defaultGrid);
  const [rows, setRows] = useState(block.content.rows || 5);
  const [cols, setCols] = useState(block.content.cols || 5);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (
    updatedGrid: SpreadsheetCell[][],
    updatedRows: number,
    updatedCols: number,
  ): void => {
    setGrid(updatedGrid);
    setRows(updatedRows);
    setCols(updatedCols);
    onChange({
      ...block.content,
      grid: updatedGrid,
      rows: updatedRows,
      cols: updatedCols,
    });
  };

  const updateCell = (row: number, col: number, updates: Partial<SpreadsheetCell>): void => {
    const newGrid = grid.map((r, rowIdx) =>
      r.map((cell, colIdx) => (rowIdx === row && colIdx === col ? { ...cell, ...updates } : cell)),
    );
    updateContent(newGrid, rows, cols);
  };

  const addRow = (): void => {
    const newRow = Array(cols)
      .fill(null)
      .map(() => ({
        value: '',
        type: 'text' as const,
        isEditable: true,
        validationFormula: '',
      }));
    updateContent([...grid, newRow], rows + 1, cols);
  };

  const deleteRow = (rowIndex: number): void => {
    if (rows <= 1) return;
    const newGrid = grid.filter((_, idx) => idx !== rowIndex);
    updateContent(newGrid, rows - 1, cols);
    if (selectedCell && selectedCell.row === rowIndex) {
      setSelectedCell(null);
    }
  };

  const addColumn = (): void => {
    const newGrid = grid.map((row) => [
      ...row,
      { value: '', type: 'text' as const, isEditable: true, validationFormula: '' },
    ]);
    updateContent(newGrid, rows, cols + 1);
  };

  const deleteColumn = (colIndex: number): void => {
    if (cols <= 1) return;
    const newGrid = grid.map((row) => row.filter((_, idx) => idx !== colIndex));
    updateContent(newGrid, rows, cols - 1);
    if (selectedCell && selectedCell.col === colIndex) {
      setSelectedCell(null);
    }
  };

  const getColumnLabel = (index: number): string => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  const getCellColor = (cell: SpreadsheetCell): string => {
    if (!cell.isEditable) return 'bg-brand-surface text-brand-secondary';
    if (cell.type === 'formula') return 'bg-purple-50 border-purple-300';
    if (cell.type === 'number') return 'bg-blue-50 border-blue-300';
    return 'bg-brand-surface border-brand-strong';
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-brand-secondary mb-2">
          <Table className="w-4 h-4 inline mr-1" aria-hidden="true" />
          <span>Spreadsheet Exercise Title</span>
          <input
            type="text"
            value={block.content.title}
            onChange={(e) => onChange({ ...block.content, title: e.target.value })}
            className="mt-2 w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="e.g., Budget Calculator, Sales Analysis"
          />
        </label>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-brand-secondary mb-2">
          <span>Instructions</span>
          <textarea
            value={block.content.instructions}
            onChange={(e) => onChange({ ...block.content, instructions: e.target.value })}
            rows={2}
            className="mt-2 w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Explain what calculations learners should complete..."
          />
        </label>
      </div>

      {/* Grid Controls */}
      <div className="flex items-center justify-between border-t border-brand-default pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-secondary border border-brand-strong rounded-lg hover:bg-brand-page"
          >
            <Plus className="w-3 h-3" />
            Add Row
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-secondary border border-brand-strong rounded-lg hover:bg-brand-page"
          >
            <Plus className="w-3 h-3" />
            Add Column
          </button>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-brand-secondary flex items-center gap-1">
            <Table className="w-3 h-3" />
            {rows} × {cols}
          </span>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-blue hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <Eye className="w-3 h-3" />
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="border border-brand-strong rounded-lg overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-12 bg-brand-surface border border-brand-strong text-xs font-medium text-brand-secondary p-1"></th>
              {Array.from({ length: cols }).map((_, colIdx) => (
                <th
                  key={colIdx}
                  className="bg-brand-surface border border-brand-strong text-xs font-medium text-brand-secondary p-1 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{getColumnLabel(colIdx)}</span>
                    {cols > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteColumn(colIdx)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="bg-brand-surface border border-brand-strong text-xs font-medium text-brand-secondary p-1 text-center relative group">
                  <div className="flex items-center justify-between px-1">
                    <span className="flex-1">{rowIdx + 1}</span>
                    {rows > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteRow(rowIdx)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className={`border border-brand-strong p-0 cursor-pointer transition-all ${
                      selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                        ? 'ring-2 ring-brand-primary'
                        : ''
                    }`}
                  >
                    <div className={`relative h-10 ${getCellColor(cell)}`}>
                      <input
                        type="text"
                        value={cell.value}
                        onChange={(e) => updateCell(rowIdx, colIdx, { value: e.target.value })}
                        onFocus={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                        readOnly={showPreview && !cell.isEditable}
                        className="w-full h-full px-2 text-xs bg-transparent border-none focus:outline-hidden"
                        placeholder={showPreview && !cell.isEditable ? '' : '-'}
                        aria-label={`Cell ${getColumnLabel(colIdx)}${rowIdx + 1}`}
                      />
                      {!cell.isEditable && (
                        <Lock className="absolute top-1 right-1 w-3 h-3 text-brand-muted" />
                      )}
                      {cell.type === 'formula' && (
                        <Calculator className="absolute top-1 right-1 w-3 h-3 text-purple-600" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cell Editor */}
      {selectedCell && !showPreview && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-brand-primary">
              Cell {getColumnLabel(selectedCell.col)}
              {selectedCell.row + 1}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="text-brand-secondary hover:text-brand-secondary text-xs"
            >
              Close
            </button>
          </div>

          {/* Cell Type */}
          <div>
            <label className="block text-xs font-medium text-brand-secondary mb-1">
              <span>Cell Type</span>
              <select
                value={grid[selectedCell.row][selectedCell.col].type}
                onChange={(e) =>
                  updateCell(selectedCell.row, selectedCell.col, {
                    type: e.target.value as SpreadsheetCell['type'],
                  })
                }
                className="mt-1 w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="formula">Formula</option>
                <option value="readonly">Read-Only</option>
              </select>
            </label>
          </div>

          {/* Cell Value */}
          <div>
            <label className="block text-xs font-medium text-brand-secondary mb-1">
              <span>Cell Value</span>
              <input
                type="text"
                value={grid[selectedCell.row][selectedCell.col].value}
                onChange={(e) =>
                  updateCell(selectedCell.row, selectedCell.col, {
                    value: e.target.value,
                  })
                }
                className="mt-1 w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                placeholder={
                  grid[selectedCell.row][selectedCell.col].type === 'formula'
                    ? '=SUM(A1:A5)'
                    : 'Cell content'
                }
              />
            </label>
            {grid[selectedCell.row][selectedCell.col].type === 'formula' && (
              <p className="text-xs text-brand-muted mt-1">
                Examples: =SUM(A1:A5), =AVERAGE(B1:B10), =A1+B1
              </p>
            )}
          </div>

          {/* Editable Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={grid[selectedCell.row][selectedCell.col].isEditable}
                onChange={(e) =>
                  updateCell(selectedCell.row, selectedCell.col, {
                    isEditable: e.target.checked,
                  })
                }
                className="w-4 h-4 text-brand-blue rounded"
              />
              <span className="text-sm text-brand-secondary flex items-center gap-2">
                {grid[selectedCell.row][selectedCell.col].isEditable ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Learners can edit this cell
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Cell is locked (read-only for learners)
                  </>
                )}
              </span>
            </label>
          </div>

          {/* Validation Formula */}
          {grid[selectedCell.row][selectedCell.col].isEditable && (
            <div>
              <label className="block text-xs font-medium text-brand-secondary mb-1">
                <span>Validation Formula (optional)</span>
                <input
                  type="text"
                  value={grid[selectedCell.row][selectedCell.col].validationFormula || ''}
                  onChange={(e) =>
                    updateCell(selectedCell.row, selectedCell.col, {
                      validationFormula: e.target.value,
                    })
                  }
                  className="mt-1 w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  placeholder="=A1+B1=C1 (checks if learner's answer is correct)"
                />
              </label>
              <p className="text-xs text-brand-muted mt-1">
                Enter a formula that should evaluate to TRUE for correct answers
              </p>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Spreadsheet tip:</strong> Lock cells (make them read-only) to create templates.
          Use formulas in locked cells for calculations. Learners can fill in editable cells.
          Supported formulas: SUM, AVERAGE, MIN, MAX, COUNT, basic operators (+, -, *, /).
        </p>
      </div>
    </div>
  );
};
