import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
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
import { useToast } from '../../../shared/hooks/useToast';

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
  const toast = useToast();
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
        setError(err?.message || 'Failed to load dashboard.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const newUser = await api.admin.createUser(formData);
      const created = (newUser as any).data?.user;
      if (created) setUsers((prev) => [...prev, created]);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'learner' });
      toast.success('User created successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  // Logic Memos
  const passRate = useMemo(() => {
    if (!analytics.length) return 0;
    const attempts = analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);
    if (!attempts) return 0;
    const passed = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
    return Math.round((passed / attempts) * 100);
  }, [analytics]);

  const trendPoints = useMemo<TrendPoint[]>(() => {
    const months = recentMonths(6);
    const lessonMap = new Map<string, number>();
    const quizMap = new Map<string, number>();

    lessons.forEach(l => {
      const k = monthKeyFromDate(l.createdAt || l.updatedAt);
      if (k) lessonMap.set(k, (lessonMap.get(k) || 0) + 1);
    });
    quizzes.forEach(q => {
      const k = monthKeyFromDate(q.createdAt || q.updatedAt);
      if (k) quizMap.set(k, (quizMap.get(k) || 0) + 1);
    });

    return months.map(m => ({
      label: m.label,
      study: (lessonMap.get(m.key) || 0) * 2,
      test: (quizMap.get(m.key) || 0) * 2
    }));
  }, [lessons, quizzes]);

  const publishedLessons = lessons.filter(i => i.isPublished !== false).length;
  const draftLessons = lessons.filter(i => i.isPublished === false).length;
  const activeQuizzes = quizzes.filter(i => i.isActive !== false).length;
  const pausedQuizzes = quizzes.filter(i => i.isActive === false).length;
  const earnedCertificates = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
  const supportCount = users.length + analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);

  return (
    <div className="bg-[#f5f8ff] text-slate-800 min-h-screen">
      <TopBar animated={false} />
      
      <PrimaryNav
        variant="admin"
        items={[
          { label: 'Dashboard', to: '/dashboard-admin', className: 'text-primary font-semibold' },
          { label: 'Users', to: '/admin-users' },
          { label: 'Lessons', to: '/admin-lessons' },
          { label: 'Quizzes', to: '/admin-quizzes' },
          { label: 'Reports', to: '/admin/report-requests' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Admin"
          links={[
            { label: 'Overview', active: true },
            { label: 'Manage Users', to: '/admin-users' },
            { label: 'Manage Lessons', to: '/admin-lessons' },
            { label: 'Manage Quizzes', to: '/admin-quizzes' },
            { label: 'Report Requests', to: '/admin/report-requests' },
          ]}
        />

        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider text-xs">/dashboard-admin</p>
              <h1 className="text-3xl font-extrabold text-slate-900">LMS Command Center</h1>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all shadow-md"
              >
                Create User
              </button>
              <Link to="/lesson-create" className="bg-white border border-slate-200 px-4 py-2 rounded-md font-semibold hover:bg-slate-50 transition-all">
                New Lesson
              </Link>
            </div>
          </div>

          {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</p>}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
            <StatCard label="Completed Courses" value={metricDisplay(publishedLessons)} note="Published catalog" />
            <StatCard label="Earned Certificates" value={metricDisplay(earnedCertificates)} note="Total quiz passes" />
            <StatCard label="Courses in Progress" value={metricDisplay(draftLessons)} note="Drafts pending" />
            <StatCard label="Community Support" value={metricDisplay(supportCount)} note="Active signals" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="space-y-6">
              <TrendChart title="Study vs Test Hours" points={trendPoints} />
              <StatusBreakdownChart 
                title="Operational Snapshot" 
                items={[
                  { label: 'Published', value: publishedLessons, tone: 'emerald' },
                  { label: 'Drafts', value: draftLessons, tone: 'amber' },
                  { label: 'Active Quizzes', value: activeQuizzes, tone: 'blue' }
                ]} 
              />
            </div>
            <div className="space-y-6">
              <CalendarWidget highlightedDays={[1, 5, 12]} />
              <AssignmentPanel title="Deadlines" items={[
                { title: `Publish ${draftLessons} drafts`, dueIn: '2 days', note: 'Course updates.' }
              ]} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickMetric label="Total Users" value={String(stats?.totalUsers ?? users.length)} />
            <QuickMetric label="Total Lessons" value={String(stats?.totalLessons ?? lessons.length)} />
            <QuickMetric label="Quiz Pass Rate" value={`${passRate}%`} />
          </div>
        </div>
      </section>

      {/* Reusable modal structure from AdminUsers */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="grid gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={creating} className="flex-1 bg-primary text-white py-2 rounded-md font-bold disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 border py-2 rounded-md font-bold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents
function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
      <p className="text-[10px] text-slate-500 mt-2 font-medium">{note}</p>
    </div>
  );
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-xl px-4 py-3 shadow-sm">
      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</p>
      <p className="text-lg font-extrabold text-primary">{value}</p>
    </div>
  );
}