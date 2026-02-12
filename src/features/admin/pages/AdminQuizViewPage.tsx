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

export default function AdminQuizView() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setError('Missing quiz id.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.quizzes.get(id);
        if (!mounted) return;
        setQuiz(res.data.quiz || null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load quiz details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const questionCount = Array.isArray(quiz?.questions) ? quiz.questions.length : 0;

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
              <p className="text-primary uppercase font-semibold tracking-wider">/quizzes/{id}</p>
              <h1 className="text-3xl font-extrabold">{quiz?.title || 'Quiz Details'}</h1>
            </div>
            <Link to="/admin-quizzes" className="border border-primary text-primary px-4 py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition-colors">
              Back to Quizzes
            </Link>
          </div>

          {error ? <p className="text-red-600 text-sm mb-4">{error}</p> : null}

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Loading quiz details...</p>
            </div>
          ) : quiz ? (
            <div className="grid gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Overview</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Title</p>
                    <p className="font-semibold">{quiz.title || 'â€”'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lesson</p>
                    <p className="font-semibold">{quiz.lesson?.title || quiz.lesson || 'â€”'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Passing Score</p>
                    <p className="font-semibold">{quiz.passingScore ?? 'â€”'}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold">{quiz.isActive === false ? 'Inactive' : 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Questions</p>
                    <p className="font-semibold">{questionCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="font-semibold">{quiz.createdBy?.name || quiz.createdBy?.email || quiz.createdBy || 'â€”'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-semibold">{formatDate(quiz.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Updated</p>
                    <p className="font-semibold">{formatDate(quiz.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Questions</h2>
                {questionCount ? (
                  <div className="space-y-4">
                    {quiz.questions.map((question: any, index: number) => (
                      <div key={`${question.questionText || 'question'}-${index}`} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-semibold mb-2">
                          {index + 1}. {question.questionText || 'Untitled question'}
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {Array.isArray(question.options) && question.options.length ? (
                            question.options.map((option: string, optIndex: number) => (
                              <li key={`${option}-${optIndex}`} className={optIndex === question.correctOptionIndex ? 'font-semibold text-green-700' : ''}>
                                {option}
                              </li>
                            ))
                          ) : (
                            <li>No options.</li>
                          )}
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">
                          Correct option index: {question.correctOptionIndex ?? 'â€”'} | Points: {question.points ?? 1}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No questions available for this quiz.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Quiz not found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


