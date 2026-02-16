import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { QuizCard } from '../../../components/ContentCard';
import { api } from '../../../shared/utils/api';
import { useToast } from '../../../shared/hooks/useToast';

type QuizRow = {
  _id?: string;
  id?: string;
  title?: string;
  lesson?: { title?: string } | string;
  createdBy?: { name?: string; email?: string } | string;
  questions?: unknown[];
  passingScore?: number;
  isActive?: boolean;
  createdAt?: string;
};

export default function AdminQuizzesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.quizzes.list();
        if (!mounted) return;
        setQuizzes((res.data.quizzes || []) as QuizRow[]);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load quizzes.';
        setError(message);
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const deleteQuiz = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    if (saving === id) return;

    setSaving(id);
    try {
      await api.quizzes.delete(id);
      setQuizzes((prev) => prev.filter((quiz) => String(quiz._id || quiz.id) !== id));
      toast.success('Quiz deleted.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete quiz.';
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
          { label: 'Lessons', to: '/admin-lessons' },
          { label: 'Quizzes', to: '/admin-quizzes', className: 'text-primary font-semibold' },
          { label: 'Certificates', to: '/admin/report-requests' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Admin"
          links={[
            { label: 'Overview', to: '/dashboard-admin' },
            { label: 'Manage Users', to: '/admin-users' },
            { label: 'Manage Lessons', to: '/admin-lessons' },
            { label: 'Manage Quizzes', active: true },
            { label: 'Certificate Requests', to: '/admin/report-requests' },
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/admin/quizzes</p>
              <h1 className="text-3xl font-extrabold">Quizzes</h1>
            </div>
            <Link to="/quiz-create" className="bg-primary text-white px-4 py-2 rounded-md font-semibold">
              Create Quiz
            </Link>
          </div>

          {error ? <p className="text-red-600 text-sm mb-4">{error}</p> : null}

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600 text-sm">Loading quizzes...</p>
            </div>
          ) : quizzes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => {
                const id = String(quiz._id || quiz.id || '');
                const lessonTitle = typeof quiz.lesson === 'string' ? quiz.lesson : quiz.lesson?.title || 'Lesson';
                return (
                  <QuizCard
                    key={id}
                    id={id}
                    title={quiz.title || 'Untitled Quiz'}
                    passingScore={quiz.passingScore}
                    isActive={quiz.isActive}
                    createdAt={quiz.createdAt}
                    lessonTitle={lessonTitle}
                    questions={Array.isArray(quiz.questions) ? quiz.questions : []}
                    viewLink={`/admin/quizzes/${id}`}
                    onEdit={() => navigate(`/quiz-edit/${id}`)}
                    onDelete={(targetId) => deleteQuiz(targetId)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="py-12 text-center text-gray-500">No quizzes found</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
