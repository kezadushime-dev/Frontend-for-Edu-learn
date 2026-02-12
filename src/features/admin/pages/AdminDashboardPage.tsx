import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { api } from '../../../shared/utils/api';

export default function DashboardAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalUsers?: number; totalLessons?: number; totalQuizzes?: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'learner' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Load analytics first to avoid ObjectId casting error with "analytics" as ID
        const analyticsRes = await api.quizzes.analytics();
        
        const [usersRes, lessonsRes, quizzesRes, statsRes] = await Promise.all([
          api.admin.users(),
          api.lessons.list(),
          api.quizzes.list(),
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
        // If analytics fails, continue without it
        if (err?.message?.includes('analytics')) {
          console.warn('Analytics endpoint failed, loading without analytics data');
          try {
            const [usersRes, lessonsRes, quizzesRes, statsRes] = await Promise.all([
              api.admin.users(),
              api.lessons.list(),
              api.quizzes.list(),
              api.admin.statistics()
            ]);
            
            if (!mounted) return;
            setUsers(usersRes.data.users || []);
            setLessons(lessonsRes.data.lessons || []);
            setQuizzes(quizzesRes.data.quizzes || []);
            setAnalytics([]);
            setStats({
              totalUsers: statsRes.data.statistics.totalUsers,
              totalLessons: lessonsRes.data.lessons.length,
              totalQuizzes: quizzesRes.data.quizzes.length
            });
          } catch (fallbackErr: any) {
            if (!mounted) return;
            setError(fallbackErr?.message || 'Failed to load admin dashboard data.');
          }
        } else {
          setError(err?.message || 'Failed to load admin dashboard data.');
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUser = await api.admin.createUser(formData);
      setUsers([...users, (newUser as any).data.user]);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'learner' });
    } catch (err: any) {
      setError(err?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

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
              { label: 'Manage Users', to: '/admin-users' },
              { label: 'Manage Lessons', to: '/admin-lessons' },
              { label: 'Manage Quizzes', to: '/admin-quizzes' },
              { label: 'Quiz Attempts', to: '/admin-quiz-attempts' },
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
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300"
                >
                  Create User
                </button>
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
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Total Lessons</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.totalLessons ?? lessons.length}</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Total Quizzes</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.totalQuizzes ?? quizzes.length}</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Quiz Pass Rate</p>
                <h3 className="text-3xl font-bold mt-2">{passRate}%</h3>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Users</h3>
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
                      {userRows.map((row, idx) => (
                        <tr
                          key={`${row.name}-${row.email}`}
                          onClick={() => handleViewUser(users[idx])}
                          className="cursor-pointer hover:bg-gray-100 transition-colors"
                        >
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
                <h3 className="text-xl font-bold mb-4">Lessons</h3>
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
                <h3 className="text-xl font-bold mb-4">Quizzes</h3>
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="grid gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="User name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-md font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">User Details</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                <p className="text-lg">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <p className="text-lg">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                <p className="text-lg capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">ID</label>
                <p className="text-sm text-gray-600 break-all">{selectedUser._id || selectedUser.id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all mt-4"
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



