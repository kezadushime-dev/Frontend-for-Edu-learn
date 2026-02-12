import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { api } from '../utils/api';

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const res = await api.lessons.get(id!);
        setLesson(res.data.lesson);
      } catch (err: any) {
        setError(err?.message || 'Failed to load lesson.');
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!lesson) return <div>Lesson not found.</div>;

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar />
      <PrimaryNav variant="dashboard" items={[{ label: 'Home', to: '/' }]} />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar title="Manager" links={[
            { label: 'Overview', to: '/dashboard-manager' },
            { label: 'Manage Lessons', to: '/instructor/lessons' },
            { label: 'Create Lesson', to: '/instructor/lesson-create' },
            { label: 'Manage Quizzes', to: '/instructor/quizzes' },
            { label: 'Create Quiz', to: '/instructor/quiz-create' },
            { label: 'Logout', to: '/login' }
          ]} />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Lesson View</p>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3 gradient-text">{lesson.title}</h1>
                <p className="text-gray-600 mt-3">Viewing lesson details.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/dashboard-manager" className="border-2 border-primary text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover-lift">
                  Back to Dashboard
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full">
                  {lesson.category || 'General'}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3">{lesson.title}</h2>
              <p className="text-gray-600 mb-4">{lesson.description}</p>

              {Array.isArray(lesson.images) && lesson.images.length ? (
                <img src={lesson.images[0]} alt={lesson.title} className="w-full h-56 object-cover rounded-lg mb-4" />
              ) : null}

              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {lesson.content}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
