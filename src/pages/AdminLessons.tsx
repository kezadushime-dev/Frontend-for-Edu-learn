import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminTable } from '../components/AdminTable';
import { api } from '../utils/api';

export default function AdminLessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.lessons.list();
        if (!mounted) return;
        setLessons(res.data.lessons || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load lessons.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = lessons.map((lesson) => ({
    ...lesson,
    createdBy: lesson.instructor?.name || lesson.createdBy || lesson.instructor || '—',
    images: Array.isArray(lesson.images) ? lesson.images : []
  }));

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="admin"
        items={[
          { label: 'Dashboard', to: '/dashboard-admin' },
          { label: 'Users', to: '/admin-users' },
          { label: 'Lessons', to: '/admin-lessons', className: 'text-primary font-semibold' },
          { label: 'Quizzes', to: '/admin-quizzes' },
          { label: 'Attempts', to: '/admin-quiz-attempts' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Admin"
          links={[
            { label: 'Overview', to: '/dashboard-admin' },
            { label: 'Manage Users', to: '/admin-users' },
            { label: 'Manage Lessons', active: true },
            { label: 'Manage Quizzes', to: '/admin-quizzes' },
            { label: 'Quiz Attempts', to: '/admin-quiz-attempts' },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/lessons</p>
              <h1 className="text-3xl font-extrabold">Lessons</h1>
            </div>
            <Link to="/lesson-create" className="bg-primary text-white px-4 py-2 rounded-md font-semibold">
              Create Lesson
            </Link>
          </div>

          {error ? <p className="text-red-600 text-sm mb-4">{error}</p> : null}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <AdminTable 
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category' },
                { key: 'createdBy', label: 'Created By' },
                { key: 'isPublished', label: 'Status' }
              ]} 
              rows={rows}
              renderActions={(row) => {
                const id = String(row._id || row.id || '');
                return (
                  <div className="flex items-center">
                    <Link 
                      to={`/admin-lessons/${id}`}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      View
                    </Link>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
