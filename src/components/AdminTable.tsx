import type { ReactNode } from 'react';

type Column = {
  key: string;
  label: string;
};

type AdminTableProps = {
  columns: Column[];
  rows: Record<string, unknown>[];
  renderActions?: (row: Record<string, unknown>) => ReactNode;
  hideActions?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (id: string) => void;
};

export function AdminTable({ columns, rows, renderActions, hideActions, onEdit, onDelete }: AdminTableProps) {
  const safeRows = Array.isArray(rows) ? rows : [];
  
  return (
    <table className="w-full text-sm text-left">
      <thead className="text-xs uppercase text-gray-500">
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="py-2">
              {col.label}
            </th>
          ))}
          {hideActions ? null : <th className="py-2">Actions</th>}
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {safeRows.map((row, rowIndex) => (
          <tr key={`${rowIndex}-${String(row.id ?? rowIndex)}`}>
            {columns.map((col) => {
              const value = row[col.key as keyof typeof row];
              const text = Array.isArray(value) ? value.join(', ') : value ?? '';
              return (
                <td key={`${rowIndex}-${col.key}`} className="py-2">
                  {String(text)}
                </td>
              );
            })}
            {hideActions ? null : (
              <td className="py-2">
                {renderActions ? (
                  renderActions(row)
                ) : (
                  <>
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="text-primary font-semibold mr-2">
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(String(row.id))} className="text-red-600 font-semibold">
                        Delete
                      </button>
                    )}
                  </>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
