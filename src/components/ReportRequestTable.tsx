import ReportStatusBadge from './ReportStatusBadge';
import type { ReportRequest } from '../shared/types/report';

type ReportRequestTableProps = {
  rows: ReportRequest[];
  actionLoadingId?: string;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  emptyMessage?: string;
};

const formatDate = (value: string | null): string => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatDateTime = (value: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
};

export default function ReportRequestTable({
  rows,
  actionLoadingId,
  onApprove,
  onReject,
  emptyMessage = 'No report download requests found.'
}: ReportRequestTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
      <table className="w-full text-sm">
        <thead className="bg-blue-50 border-b border-blue-100">
          <tr>
            <th className="px-4 py-3 text-left uppercase text-xs tracking-wider font-bold text-gray-700">Student</th>
            <th className="px-4 py-3 text-left uppercase text-xs tracking-wider font-bold text-gray-700">Course</th>
            <th className="px-4 py-3 text-left uppercase text-xs tracking-wider font-bold text-gray-700">Date</th>
            <th className="px-4 py-3 text-left uppercase text-xs tracking-wider font-bold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left uppercase text-xs tracking-wider font-bold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const isFinal = row.status !== 'PENDING';
              const isWorking = actionLoadingId === row.id;
              const missingId = !row.id;
              return (
                <tr key={row.id || `${row.studentId}-${row.createdAt || row.updatedAt}`} className="border-b border-gray-100">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">{row.studentName}</p>
                    <p className="text-xs text-gray-500">{row.studentId || 'Learner ID unavailable'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">{row.courseName}</p>
                    <p className="text-xs text-gray-500">{row.courseId || 'Course ID unavailable'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{formatDate(row.createdAt)}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <ReportStatusBadge status={row.status} />
                    {row.approvedByName ? (
                      <p className="mt-2 text-xs text-gray-500">
                        By {row.approvedByName}
                        {row.approvedByRole ? ` (${row.approvedByRole})` : ''} on {formatDate(row.updatedAt || row.createdAt)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(row.id)}
                        disabled={isFinal || isWorking || missingId}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isWorking ? 'Working...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => onReject(row.id)}
                        disabled={isFinal || isWorking || missingId}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isWorking ? 'Working...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
