import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { uiStore } from '../data/uiStore';
import { api } from '../utils/api';

export default function DashboardAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalUsers?: number; totalLessons?: number; totalQuizzes?: number } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [usersRes, lessonsRes, quizzesRes, analyticsRes, statsRes] = await Promise.all([
          api.admin.users(),
          api.lessons.list(),
          api.quizzes.list(),
          api.quizzes.analytics(),
          api.admin.statistics()
        ]);
        if (!mounted) return;
        setUsers(usersRes.data.users || []);
        setLessons(lessonsRes.data.lessons || []);
        setQuizzes(quizzesRes.data.quizzes || []);
        setAnalytics(analyticsRes.data.analytics || []);
        setStats({
          totalUsers: statsRes.data.statistics.totalUsers,
          totalLessons: lessonsRes.data.lessons.length,
          totalQuizzes: quizzesRes.data.quizzes.length
        });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load admin dashboard data.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const passRate = useMemo(() => {
    if (!analytics.length) return 0;
    const totalAttempts = analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);
    if (!totalAttempts) return 0;
    const totalPassed = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
    return Math.round((totalPassed / totalAttempts) * 100);
  }, [analytics]);

  const userRows = users.slice(0, 6).map((item) => ({
    name: item.name || '—',
    email: item.email || '—',
    role: item.role || '—'
  }));

  const lessonRows = lessons.slice(0, 6).map((item) => ({
    title: item.title || '—',
    module: item.category || 'General',
    status: item.isPublished === false ? 'Draft' : 'Published'
  }));

  const quizRows = quizzes.slice(0, 6).map((item) => ({
    title: item.title || '—',
    module: item.lesson?.title || item.lesson || 'Lesson',
    status: item.isActive === false ? 'Paused' : 'Active'
  }));

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Lessons', to: '/lesson' },
          { label: 'Quiz', to: '/quiz' }
        ]}
      />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar
            title="Admin"
            links={[
              { label: 'Overview', active: true },
              { label: 'Manage Users', to: '/admin/users' },
              { label: 'Manage Lessons', to: '/admin/lessons' },
              { label: 'Manage Quizzes', to: '/admin/quizzes' },
              { label: 'Quiz Attempts', to: '/admin/quiz-attempts' },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Dashboard</p>
                <h1 className="text-4xl font-extrabold gradient-text">Admin Overview</h1>
                <p className="text-gray-600 mt-2">Manage users, lessons, quizzes, and platform performance.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/lesson-create" className="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300">
                  Create Lesson
                </Link>
                <Link
                  to="/quiz-create"
                  className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Create Quiz
                </Link>
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.totalUsers ?? users.length}</h3>
                <p className="text-xs text-gray-500 mt-2">{uiStore.admin.notes.users}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Total Lessons</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.totalLessons ?? lessons.length}</h3>
                <p className="text-xs text-gray-500 mt-2">{uiStore.admin.notes.lessons}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Total Quizzes</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.totalQuizzes ?? quizzes.length}</h3>
                <p className="text-xs text-gray-500 mt-2">{uiStore.admin.notes.quizzes}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Quiz Pass Rate</p>
                <h3 className="text-3xl font-bold mt-2">{passRate}%</h3>
                <p className="text-xs text-gray-500 mt-2">{uiStore.admin.notes.passRate}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Recent Admin Actions</h3>
                <div className="grid gap-3 text-sm">
                  {uiStore.admin.actions.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-gray-500">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Pending Actions</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {uiStore.admin.pending.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Users (GET /admin/users)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Role</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {userRows.map((row) => (
                        <tr key={`${row.name}-${row.email}`}>
                          <td className="py-2">{row.name}</td>
                          <td className="py-2">{row.email}</td>
                          <td className="py-2">{row.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Lessons (GET /lessons)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-2">Title</th>
                        <th className="py-2">Module</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {lessonRows.map((row) => (
                        <tr key={`${row.title}-${row.module}`}>
                          <td className="py-2">{row.title}</td>
                          <td className="py-2">{row.module}</td>
                          <td className="py-2">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Quizzes (GET /quizzes)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-2">Title</th>
                        <th className="py-2">Module</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {quizRows.map((row) => (
                        <tr key={`${row.title}-${row.module}`}>
                          <td className="py-2">{row.title}</td>
                          <td className="py-2">{row.module}</td>
                          <td className="py-2">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
