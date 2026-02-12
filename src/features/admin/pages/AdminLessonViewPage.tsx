import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { api } from '../../../shared/utils/api';

const formatDate = (value?: string) => {
  if (!value) return 'â€”';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function AdminLessonView() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setError('Missing lesson id.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.lessons.get(id);
        if (!mounted) return;
        setLesson(res.data.lesson || null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load lesson details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

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
              <p className="text-primary uppercase font-semibold tracking-wider">/lessons/{id}</p>
              <h1 className="text-3xl font-extrabold">{lesson?.title || 'Lesson Details'}</h1>
            </div>
            <Link to="/admin-lessons" className="border border-primary text-primary px-4 py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition-colors">
              Back to Lessons
            </Link>
          </div>

          {error ? <p className="text-red-600 text-sm mb-4">{error}</p> : null}

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Loading lesson details...</p>
            </div>
          ) : lesson ? (
            <div className="grid gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Overview</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Title</p>
                    <p className="font-semibold">{lesson.title || 'â€”'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-semibold">{lesson.category || 'â€”'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="font-semibold">{lesson.instructor?.name || lesson.createdBy || 'â€”'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold">{lesson.isPublished === false ? 'Draft' : 'Published'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-semibold">{formatDate(lesson.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Updated</p>
                    <p className="font-semibold">{formatDate(lesson.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{lesson.description || 'No description available.'}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Content</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{lesson.content || 'No content available.'}</p>
              </div>

              {Array.isArray(lesson.images) && lesson.images.length ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Images</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lesson.images.map((image: string, idx: number) => (
                      <img key={`${image}-${idx}`} src={image} alt={`lesson-${idx + 1}`} className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Lesson not found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


