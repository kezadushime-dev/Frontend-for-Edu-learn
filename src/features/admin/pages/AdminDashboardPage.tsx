import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import {
  AssignmentPanel,
  CalendarWidget,
  StatusBreakdownChart,
  TrendChart,
  type AssignmentItem,
  type TrendPoint
} from '../../../components/dashboard/OverviewWidgets';
import { api } from '../../../shared/utils/api';

type AnalyticsItem = {
  attempts?: number;
  passed?: number;
};

type DashboardStats = {
  totalUsers?: number;
  totalLessons?: number;
  totalQuizzes?: number;
};

const metricDisplay = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k+`;
  return `${value}+`;
};

const recentMonths = (count: number) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString(undefined, { month: 'short' });
    return { key, label };
  });
};

const monthKeyFromDate = (value: unknown) => {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
};

const roleBadgeClass = (role: string) => {
  const lower = role.toLowerCase();
  if (lower === 'admin') return 'bg-rose-100 text-rose-700';
  if (lower === 'instructor') return 'bg-blue-100 text-blue-700';
  return 'bg-emerald-100 text-emerald-700';
};

export default function DashboardAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'learner' });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const analyticsRes = await api.quizzes.analytics().catch(() => ({ data: { analytics: [] } }));
        const [usersRes, lessonsRes, quizzesRes, statsRes] = await Promise.all([
          api.admin.users(),
          api.lessons.list(),
          api.quizzes.list(),
          api.admin.statistics()
        ]);

        if (!mounted) return;
        const nextUsers = usersRes.data.users || [];
        const nextLessons = lessonsRes.data.lessons || [];
        const nextQuizzes = quizzesRes.data.quizzes || [];

        setUsers(nextUsers);
        setLessons(nextLessons);
        setQuizzes(nextQuizzes);
        setAnalytics((analyticsRes.data.analytics || []) as AnalyticsItem[]);
        setStats({
          totalUsers: statsRes.data.statistics?.totalUsers ?? nextUsers.length,
          totalLessons: nextLessons.length,
          totalQuizzes: nextQuizzes.length
        });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load admin dashboard data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const newUser = await api.admin.createUser(formData);
      const created = (newUser as any).data?.user;
      if (created) setUsers((previous) => [...previous, created]);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'learner' });
    } catch (err: any) {
      setError(err?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const passRate = useMemo(() => {
    if (!analytics.length) return 0;
    const attempts = analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);
    if (!attempts) return 0;
    const passed = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
    return Math.round((passed / attempts) * 100);
  }, [analytics]);

  const monthRange = useMemo(() => recentMonths(6), []);

  const trendPoints = useMemo<TrendPoint[]>(() => {
    const lessonMap = new Map<string, number>();
    const quizMap = new Map<string, number>();

    lessons.forEach((lesson) => {
      const key = monthKeyFromDate(lesson.createdAt || lesson.updatedAt);
      if (!key) return;
      lessonMap.set(key, (lessonMap.get(key) || 0) + 1);
    });
    quizzes.forEach((quiz) => {
      const key = monthKeyFromDate(quiz.createdAt || quiz.updatedAt);
      if (!key) return;
      quizMap.set(key, (quizMap.get(key) || 0) + 1);
    });

    return monthRange.map((month) => ({
      label: month.label,
      study: (lessonMap.get(month.key) || 0) * 2,
      test: (quizMap.get(month.key) || 0) * 2
    }));
  }, [lessons, quizzes, monthRange]);

  const publishedLessons = lessons.filter((item) => item.isPublished !== false).length;
  const draftLessons = lessons.filter((item) => item.isPublished === false).length;
  const activeQuizzes = quizzes.filter((item) => item.isActive !== false).length;
  const pausedQuizzes = quizzes.filter((item) => item.isActive === false).length;
  const earnedCertificates = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
  const supportCount = users.length + analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);

  const highlightedDays = useMemo(() => {
    const days = new Set<number>();
    lessons.slice(0, 3).forEach((item) => {
      const value = new Date(item.createdAt || item.updatedAt || Date.now()).getDate();
      days.add(value);
    });
    quizzes.slice(0, 3).forEach((item) => {
      const value = new Date(item.createdAt || item.updatedAt || Date.now()).getDate();
      days.add(value);
    });
    return Array.from(days).slice(0, 5);
  }, [lessons, quizzes]);

  const assignmentItems = useMemo<AssignmentItem[]>(
    () => [
      {
        title: draftLessons ? `Publish ${draftLessons} draft lesson(s)` : 'Audit published lessons',
        dueIn: draftLessons ? '2 days' : '5 days',
        note: 'Keep course catalog up to date.'
      },
      {
        title: `${quizzes.filter((item) => item.isActive === false).length} paused quiz(es) require review`,
        dueIn: '4 days',
        note: 'Reactivate quizzes with updated questions.'
      },
      {
        title: `${users.filter((item) => item.role === 'learner').length} learner profile(s) pending role checks`,
        dueIn: '7 days',
        note: 'Validate cohort assignments and permissions.'
      }
    ],
    [draftLessons, quizzes, users]
  );

  const userRows = users.slice(0, 8).map((item) => ({
    id: item._id || item.id,
    name: item.name || 'N/A',
    role: item.role || 'N/A',
    source: item
  }));

  const lessonRows = lessons.slice(0, 8).map((item) => ({
    id: item._id || item.id,
    title: item.title || 'N/A',
    status: item.isPublished === false ? 'Draft' : 'Published'
  }));

  const quizRows = quizzes.slice(0, 8).map((item) => ({
    id: item._id || item.id,
    title: item.title || 'N/A',
    status: item.isActive === false ? 'Paused' : 'Active'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#eef4ff] to-[#f8fbff] text-slate-800">
      <TopBar />

      <section className="pb-16 pt-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[260px_1fr]">
          <Sidebar
            title="Admin Console"
            links={[
              { label: 'Dashboard', active: true },
              { label: 'Users', to: '/admin-users' },
              { label: 'Lessons', to: '/admin-lessons' },
              { label: 'Quizzes', to: '/admin-quizzes' },
              { label: 'Report Requests', to: '/admin-report-requests' },
              { label: 'Quiz Analytics', to: '/admin-quiz-attempts' },
              { label: 'Profile Settings', to: '/admin/profile-settings' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Admin Dashboard</p>
                  <h1 className="mt-2 text-4xl font-black text-slate-800">LMS Command Center</h1>
                  <p className="mt-2 text-slate-600">Track platform outcomes, engagement trends, and critical operational tasks.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Create User
                  </button>
                  <Link
                    to="/lesson-create"
                    className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Create Lesson
                  </Link>
                  <Link
                    to="/quiz-create"
                    className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Create Quiz
                  </Link>
                </div>
              </div>

              {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
              {loading ? <p className="mt-4 text-sm text-slate-500">Loading dashboard data...</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Completed Courses" value={metricDisplay(publishedLessons)} note="Published lesson catalog" />
              <StatCard label="Earned Certificates" value={metricDisplay(earnedCertificates)} note="Derived from passed quiz attempts" />
              <StatCard label="Courses in Progress" value={metricDisplay(draftLessons)} note="Draft lessons pending release" />
              <StatCard label="Community Support" value={metricDisplay(supportCount)} note="Users and quiz activity signals" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="grid gap-6">
                <TrendChart
                  title="Study vs Test Hours"
                  subtitle="Hours are estimated from monthly lesson and quiz activity."
                  points={trendPoints}
                />
                <StatusBreakdownChart
                  title="Course and Quiz Status"
                  subtitle="Operational snapshot of all published and active content."
                  items={[
                    { label: 'Published Lessons', value: publishedLessons, tone: 'emerald' },
                    { label: 'Draft Lessons', value: draftLessons, tone: 'amber' },
                    { label: 'Active Quizzes', value: activeQuizzes, tone: 'blue' },
                    { label: 'Paused Quizzes', value: pausedQuizzes, tone: 'slate' }
                  ]}
                />
              </div>
              <div className="grid gap-6">
                <CalendarWidget highlightedDays={highlightedDays} />
                <AssignmentPanel title="Operational Deadlines" items={assignmentItems} />
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="font-bold text-slate-800">Users</h3>
                  <span className="text-xs font-semibold text-slate-500">{stats?.totalUsers ?? users.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userRows.length ? (
                        userRows.map((row, index) => (
                          <tr
                            key={`${row.id || row.name}-${index}`}
                            onClick={() => {
                              setSelectedUser(row.source);
                              setShowViewModal(true);
                            }}
                            className="cursor-pointer hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 font-medium text-slate-700">{row.name}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleBadgeClass(row.role)}`}>
                                {row.role}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-slate-500">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="font-bold text-slate-800">Courses</h3>
                  <span className="text-xs font-semibold text-slate-500">{stats?.totalLessons ?? lessons.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Lesson</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lessonRows.length ? (
                        lessonRows.map((row, index) => (
                          <tr key={`${row.id || row.title}-${index}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-700">{row.title}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  row.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-slate-500">No courses found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="font-bold text-slate-800">Assessments</h3>
                  <span className="text-xs font-semibold text-slate-500">{stats?.totalQuizzes ?? quizzes.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Quiz</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quizRows.length ? (
                        quizRows.map((row, index) => (
                          <tr key={`${row.id || row.title}-${index}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-700">{row.title}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  row.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-slate-500">No assessments found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <QuickMetric label="Total Users" value={String(stats?.totalUsers ?? users.length)} />
              <QuickMetric label="Total Lessons" value={String(stats?.totalLessons ?? lessons.length)} />
              <QuickMetric label="Quiz Pass Rate" value={`${passRate}%`} />
            </div>
          </div>
        </div>
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-slate-800">Create New User</h2>
            <form onSubmit={handleCreateUser} className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="User name"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Role</label>
                <select
                  value={formData.role}
                  onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2 font-semibold transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-slate-800">User Details</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Name</label>
                <p className="text-lg text-slate-800">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Email</label>
                <p className="text-lg text-slate-800">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Role</label>
                <p className="text-lg capitalize text-slate-800">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">ID</label>
                <p className="break-all text-sm text-slate-600">{selectedUser._id || selectedUser.id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="mt-4 w-full rounded-xl bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_26px_-18px_rgba(15,23,42,0.55)]">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-800">{value}</h3>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
