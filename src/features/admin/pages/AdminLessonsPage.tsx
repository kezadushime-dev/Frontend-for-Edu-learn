import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { LessonCard } from '../../../components/ContentCard';
import { api } from '../../../shared/utils/api';
import { useToast } from '../../../shared/hooks/useToast';

type LessonRow = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  createdBy?: string;
  instructor?: { name?: string };
  isPublished?: boolean;
  images?: string[];
};

export default function AdminLessonsPage() {
  const navigate = useNavigate();
  const toast = useToast();
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
        const message = err instanceof Error ? err.message : 'Failed to load lessons.';
        setError(message);
        toast.error(message);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const deleteLesson = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    if (saving === id) return;

    setSaving(id);
    try {
      await api.lessons.delete(id);
      setLessons((prev) => prev.filter((lesson) => String(lesson._id || lesson.id) !== id));
      toast.success('Lesson deleted.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete lesson.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving('');
    }
  };

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
          { label: 'Certificates', to: '/admin/report-requests' }
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
            { label: 'Certificate Requests', to: '/admin/report-requests' },
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

          {lessons.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => {
                const id = String(lesson._id || lesson.id || '');
                return (
                  <LessonCard
                    key={id}
                    id={id}
                    title={lesson.title || 'Untitled Lesson'}
                    description={lesson.description}
                    category={lesson.category || 'General'}
                    createdBy={lesson.createdBy}
                    instructor={lesson.instructor as { name: string } | undefined}
                    isPublished={lesson.isPublished}
                    images={lesson.images}
                    viewLink={`/lesson/${id}`}
                    onEdit={() => navigate(`/lesson-edit/${id}`)}
                    onDelete={(targetId) => deleteLesson(targetId)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="py-12 text-center text-gray-500">No lessons found</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
