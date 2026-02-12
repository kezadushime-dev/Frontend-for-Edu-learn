import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { AdminTable } from '../../../components/AdminTable';
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
};

export default function AdminQuizzesPage() {
  const toast = useToast();
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.quizzes.list();
        if (!mounted) return;
        setQuizzes((res.data.quizzes || []) as QuizRow[]);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load quizzes.';
        setError(message);
        toast.error(message);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const deleteQuiz = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    setSaving(id);
    try {
      await api.quizzes.delete(id);
      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== id));
      toast.success('Quiz deleted.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete quiz.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving('');
    }
  };

  const rows = quizzes.map((quiz) => ({
    ...quiz,
    _id: quiz._id || quiz.id,
    lesson: typeof quiz.lesson === 'string' ? quiz.lesson : quiz.lesson?.title || '—',
    createdBy:
      typeof quiz.createdBy === 'string'
        ? quiz.createdBy
        : quiz.createdBy?.name || quiz.createdBy?.email || '—',
    questions: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
    status: quiz.isActive === false ? 'Inactive' : 'Active'
  }));

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
          { label: 'Attempts', to: '/admin-quiz-attempts' }
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
            { label: 'Quiz Attempts', to: '/admin-quiz-attempts' },
            { label: 'Logout', to: '/login' }
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

          <div className="bg-white rounded-xl shadow-lg p-6">
            <AdminTable
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'lesson', label: 'Lesson' },
                { key: 'questions', label: 'Questions' },
                { key: 'passingScore', label: 'Passing Score' },
                { key: 'status', label: 'Status' }
              ]}
              rows={rows}
              renderActions={(row) => {
                const id = String(row._id || row.id || '');
                return (
                  <div className="flex items-center gap-3">
                    <Link to={`/admin/quizzes/${id}`} className="text-primary font-semibold text-sm hover:underline">
                      View
                    </Link>
                    <Link to={`/quiz-edit/${id}`} className="text-blue-600 font-semibold text-sm hover:underline">
                      Edit
                    </Link>
                    <button
                      className="text-red-600 font-semibold text-sm"
                      onClick={() => deleteQuiz(id)}
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

