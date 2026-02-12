import type { ReportRequestStatus } from '../shared/types/report';

type ReportStatusBadgeProps = {
  status: ReportRequestStatus;
};

const badgeClasses: Record<ReportRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  REJECTED: 'bg-rose-100 text-rose-800 border border-rose-300'
};

export default function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[status]}`}>
      {status}
    </span>
  );
}
