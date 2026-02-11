import type { ReactNode } from 'react';
import { useState } from 'react';

type Column = {
  key: string;
  label: string;
};

type AdminTableProps = {
  columns: Column[];
  rows: Record<string, unknown>[];
  renderActions?: (row: Record<string, unknown>) => ReactNode;
  hideActions?: boolean;
  maxRows?: number;
};

export function AdminTable({ columns, rows, renderActions, hideActions, maxRows = 5 }: AdminTableProps) {
  const [showAll, setShowAll] = useState(false);
  const displayRows = showAll ? rows : rows.slice(0, maxRows);
  const hasMore = rows.length > maxRows;

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatCellValue = (value: unknown, key: string) => {
    const text = Array.isArray(value) ? value.join(', ') : value ?? '—';
    const strValue = String(text);

    // Status badge styling
    if (key === 'status') {
      if (strValue.includes('Active')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            {strValue}
          </span>
        );
      } else if (strValue.includes('Inactive')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {strValue}
          </span>
        );
      }
    }

    return truncateText(strValue);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-primary/20">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              {hideActions ? null : <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hideActions ? 0 : 1)} className="px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              displayRows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${String(row.id ?? rowIndex)}`} className="hover:bg-blue-50/50 transition-colors duration-150">
                  {columns.map((col) => {
                    const value = row[col.key as keyof typeof row];
                    const displayValue = formatCellValue(value, col.key);
                    const fullText = Array.isArray(value) ? value.join(', ') : String(value ?? '—');
                    return (
                      <td key={`${rowIndex}-${col.key}`} className="px-6 py-4 text-gray-700 whitespace-nowrap" title={fullText}>
                        {displayValue}
                      </td>
                    );
                  })}
                  {hideActions ? null : (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderActions ? (
                        renderActions(row)
                      ) : (
                        <div className="flex gap-3">
                          <button className="text-primary hover:text-blue-700 font-semibold text-xs transition-colors">View</button>
                          <button className="text-primary hover:text-blue-700 font-semibold text-xs transition-colors">Edit</button>
                          <button className="text-red-600 hover:text-red-800 font-semibold text-xs transition-colors">Delete</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="mt-4 text-center border-t border-gray-100 pt-4 bg-gray-50/50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {showAll ? 'Show Less' : `View More (${rows.length - maxRows} more)`}
          </button>
        </div>
      )}
    </div>
  );
}
