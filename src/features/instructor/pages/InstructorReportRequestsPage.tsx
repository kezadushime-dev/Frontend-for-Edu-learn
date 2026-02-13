import { useEffect, useMemo, useState } from 'react';
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

export default function InstructorReportRequestsPage() {
  const [rows, setRows] = useState<ReportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [lastSynced, setLastSynced] = useState<string>('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (!active) return;
        const data = await api.reports.listRequests({ status: filter });
        if (!active) return;
        setRows(sortByDate(data));
        setError('');
        setLastSynced(new Date().toLocaleTimeString());
      } catch (loadError: unknown) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load report requests.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 12000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [filter]);

  const applyDecision = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionId(requestId);
    setError('');
    try {
      const updated = await api.reports.decideRequest(requestId, status);
      const nowIso = new Date().toISOString();
      setRows((previous) =>
        sortByDate(
          previous.map((item) => {
            if (item.id !== requestId) return item;

            return {
              ...item,
              status: updated.status === 'PENDING' ? status : updated.status,
              approvedBy: updated.approvedBy ?? item.approvedBy,
              approvedByName: updated.approvedByName ?? item.approvedByName,
              approvedByRole: updated.approvedByRole ?? item.approvedByRole,
              updatedAt: updated.updatedAt || nowIso,
              createdAt: updated.createdAt || item.createdAt
            };
          })
        )
      );
      setLastSynced(new Date().toLocaleTimeString());
    } catch (actionError: unknown) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to update request status.');
    } finally {
      setActionId('');
    }
  };

  const statusSummary = useMemo(() => {
    const pending = rows.filter((row) => row.status === 'PENDING').length;
    const approved = rows.filter((row) => row.status === 'APPROVED').length;
    const rejected = rows.filter((row) => row.status === 'REJECTED').length;
    return { pending, approved, rejected };
  }, [rows]);

  return (
    <div className="bg-[#f5f8ff] text-slate-800 min-h-screen">
      <TopBar />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Dashboard', to: '/dashboard-manager' },
          { label: 'Lessons', to: '/instructor/lessons' },
          { label: 'Quizzes', to: '/instructor/quizzes' },
          { label: 'Report Requests', to: '/instructor/report-requests' }
        ]}
      />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar
            title="Instructor"
            links={[
              { label: 'Overview', to: '/dashboard-manager' },
              { label: 'Manage Lessons', to: '/instructor/lessons' },
              { label: 'Manage Quizzes', to: '/instructor/quizzes' },
              { label: 'Report Requests', active: true },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Instructor Review</p>
                <h1 className="text-4xl font-extrabold gradient-text">Report Download Requests</h1>
                <p className="text-gray-600 mt-2">Approve or reject learner report downloads. Changes sync across Admin and Instructor.</p>
              </div>

              <div className="flex items-center gap-3">
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
                <button
                  onClick={() => setFilter((current) => current)}
                  className="px-4 py-2 rounded-md border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition"
                >
                  Auto Sync: 12s
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <SummaryCard label="Pending" value={statusSummary.pending} color="text-amber-700" />
              <SummaryCard label="Approved" value={statusSummary.approved} color="text-emerald-700" />
              <SummaryCard label="Rejected" value={statusSummary.rejected} color="text-rose-700" />
            </div>

            {loading ? <p className="text-sm text-gray-500 mb-4">Loading requests...</p> : null}
            {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
            {lastSynced ? <p className="text-xs text-gray-500 mb-4">Last synced at {lastSynced}</p> : null}

            <ReportRequestTable
              rows={rows}
              actionLoadingId={actionId}
              onApprove={(requestId) => applyDecision(requestId, 'APPROVED')}
              onReject={(requestId) => applyDecision(requestId, 'REJECTED')}
            />
          </div>
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
