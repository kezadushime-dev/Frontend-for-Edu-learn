import { useEffect, useState } from 'react';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminTable } from '../components/AdminTable';
import { api } from '../utils/api';

const analyticsColumns = [
  { key: 'title', label: 'Quiz' },
  { key: 'attempts', label: 'Attempts' },
  { key: 'passed', label: 'Passed' },
  { key: 'averageScore', label: 'Average Score' }
];

export default function AdminQuizAttempts() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.quizzes.analytics();
        if (!mounted) return;
        setAnalytics(res.data.analytics || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load quiz analytics.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="admin"
        items={[
          { label: 'Dashboard', to: '/dashboard-admin' },
          { label: 'Users', to: '/admin/users' },
          { label: 'Lessons', to: '/admin/lessons' },
          { label: 'Quizzes', to: '/admin/quizzes' },
          { label: 'Attempts', to: '/admin/quiz-attempts', className: 'text-primary font-semibold' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Admin"
          links={[
            { label: 'Overview', to: '/dashboard-admin' },
            { label: 'Manage Users', to: '/admin/users' },
            { label: 'Manage Lessons', to: '/admin/lessons' },
            { label: 'Manage Quizzes', to: '/admin/quizzes' },
            { label: 'Quiz Attempts', active: true },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/quizzes/analytics</p>
              <h1 className="text-3xl font-extrabold">Quiz Attempts</h1>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-md font-semibold">Export</button>
          </div>

          {error ? <p className="text-red-600 text-sm mb-4">{error}</p> : null}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <AdminTable columns={analyticsColumns} rows={analytics} hideActions />
          </div>
        </div>
      </section>
    </div>
  );
}
