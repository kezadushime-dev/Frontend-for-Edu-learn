import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import ReportRequestTable from '../../../components/ReportRequestTable';
import type { ReportRequest, ReportRequestStatus } from '../../../shared/types/report';
import { api } from '../../../shared/utils/api';

type FilterStatus = ReportRequestStatus | 'ALL';

const sortByDate = (requests: ReportRequest[]): ReportRequest[] =>
  [...requests].sort((a, b) => {
    const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bDate - aDate;
  });

export default function AdminReportRequestsPage() {
  const queryClient = useQueryClient();
  const [actionId, setActionId] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [actionError, setActionError] = useState('');

  const {
    data: rows = [],
    isLoading: loading,
    error: loadError,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['reports', 'admin', filter],
    queryFn: async () => {
      const data = await api.reports.listAdminRequests({ status: filter });
      return sortByDate(data);
    },
    refetchOnWindowFocus: true,
    refetchInterval: 12000,
    staleTime: 0
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'APPROVED' | 'REJECTED' }) =>
      api.reports.decideRequest(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
      setActionError('');
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'Failed to update request status.');
    }
  });

  const applyDecision = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionId(requestId);
    setActionError('');
    approveMutation.mutate(
      { requestId, status },
      { onSettled: () => setActionId('') }
    );
  };

  const error = actionError || (loadError instanceof Error ? loadError.message : '');
  const lastSynced = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '';

  const statusSummary = useMemo(() => {
    const pending = rows.filter((row) => row.status === 'PENDING').length;
    const approved = rows.filter((row) => row.status === 'APPROVED').length;
    const rejected = rows.filter((row) => row.status === 'REJECTED').length;
    return { pending, approved, rejected };
  }, [rows]);

  return (
    <div className="bg-[#f5f8ff] text-slate-800 min-h-screen">
      <TopBar animated={false} />
      <PrimaryNav
        variant="admin"
        items={[
          { label: 'Dashboard', to: '/dashboard-admin' },
          { label: 'Users', to: '/admin-users' },
          { label: 'Lessons', to: '/admin-lessons' },
          { label: 'Quizzes', to: '/admin-quizzes' },
          { label: 'Certificates', to: '/admin/report-requests', className: 'text-primary font-semibold' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Admin"
          links={[
            { label: 'Overview', to: '/dashboard-admin' },
            { label: 'Manage Users', to: '/admin-users' },
            { label: 'Manage Lessons', to: '/admin-lessons' },
            { label: 'Manage Quizzes', to: '/admin-quizzes' },
            { label: 'Certificate Requests', active: true },
          ]}
        />

        <div className="animate-fadeInUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/admin/report-requests</p>
              <h1 className="text-4xl font-extrabold gradient-text">Certificate Approval Workflow</h1>
              <p className="text-gray-600 mt-2">Administrative approval queue for learner certificate downloads.</p>
            </div>
            <div>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as FilterStatus)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <SummaryCard label="Pending Requests" value={statusSummary.pending} color="text-amber-700" />
            <SummaryCard label="Approved Requests" value={statusSummary.approved} color="text-emerald-700" />
            <SummaryCard label="Rejected Requests" value={statusSummary.rejected} color="text-rose-700" />
          </div>

          {loading ? <p className="text-sm text-gray-500 mb-4">Loading requests...</p> : null}
          {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
          {lastSynced ? <p className="text-xs text-gray-500 mb-4">Last synced at {lastSynced}</p> : null}

          {!loading ? (
            <ReportRequestTable
              rows={rows}
              actionLoadingId={actionId}
              onApprove={(requestId) => applyDecision(requestId, 'APPROVED')}
              onReject={(requestId) => applyDecision(requestId, 'REJECTED')}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
