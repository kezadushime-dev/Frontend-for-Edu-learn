import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { AdminTable } from '../../../components/AdminTable';
import { api } from '../../../shared/utils/api';

type LessonRow = {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  createdBy?: string;
  instructor?: { name?: string };
  isPublished?: boolean;
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.lessons.list();
        if (!mounted) return;
        setLessons((res.data.lessons || []) as LessonRow[]);
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load lessons.');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const deleteLesson = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    setSaving(id);
    try {
      await api.lessons.delete(id);
      setLessons((prev) => prev.filter((lesson) => lesson._id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson.');
    } finally {
      setSaving('');
    }
  };

  const rows = lessons.map((lesson) => ({
    ...lesson,
    _id: lesson._id || lesson.id,
    createdBy: lesson.instructor?.name || lesson.createdBy || '—',
    status: lesson.isPublished === false ? 'Draft' : 'Published'
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
          { label: 'Attempts', to: '/admin-quiz-attempts' },
          { label: 'Reports', to: '/admin/report-requests' }
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
            { label: 'Report Requests', to: '/admin/report-requests' },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/admin/lessons</p>
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
                { key: 'status', label: 'Status' }
              ]}
              rows={rows}
              renderActions={(row) => {
                const id = String(row._id || row.id || '');
                return (
                  <div className="flex items-center gap-3">
                    <Link to={`/admin/lessons/${id}`} className="text-primary font-semibold text-sm hover:underline">
                      View
                    </Link>
                    <Link to={`/lesson-edit/${id}`} className="text-blue-600 font-semibold text-sm hover:underline">
                      Edit
                    </Link>
                    <button
                      className="text-red-600 font-semibold text-sm"
                      onClick={() => deleteLesson(id)}
                      disabled={saving === id}
                    >
                      {saving === id ? 'Deleting...' : 'Delete'}
                    </button>
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

