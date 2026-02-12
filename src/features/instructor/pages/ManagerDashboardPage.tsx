import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';

type LessonItem = {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  instructor?: { name?: string };
};

type QuizItem = {
  _id?: string;
  id?: string;
  title?: string;
  passingScore?: number;
  createdAt?: string;
};

type AnalyticsItem = {
  attempts?: number;
  passed?: number;
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

export default function ManagerDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [lessonsRes, quizzesRes, analyticsRes] = await Promise.all([
          api.lessons.list(),
          api.quizzes.list(),
          api.quizzes.analytics().catch(() => ({ data: { analytics: [] } }))
        ]);

        if (!mounted) return;
        setLessons((lessonsRes.data.lessons || []) as LessonItem[]);
        setQuizzes((quizzesRes.data.quizzes || []) as QuizItem[]);
        setAnalytics((analyticsRes.data.analytics || []) as AnalyticsItem[]);
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load manager dashboard data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshData = async () => {
    const [lessonsRes, quizzesRes, analyticsRes] = await Promise.all([
      api.lessons.list(),
      api.quizzes.list(),
      api.quizzes.analytics().catch(() => ({ data: { analytics: [] } }))
    ]);

    setLessons((lessonsRes.data.lessons || []) as LessonItem[]);
    setQuizzes((quizzesRes.data.quizzes || []) as QuizItem[]);
    setAnalytics((analyticsRes.data.analytics || []) as AnalyticsItem[]);
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Delete this lesson?')) return;

    try {
      await api.lessons.delete(id);
      await refreshData();
    } catch {
      alert('Failed to delete lesson');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm('Delete this quiz?')) return;

    try {
      await api.quizzes.delete(id);
      await refreshData();
    } catch {
      alert('Failed to delete quiz');
    }
  };

  const quizStats = useMemo(() => {
    if (!analytics.length) return { passRate: 0, attempts: 0 };

    const totalAttempts = analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);
    if (!totalAttempts) return { passRate: 0, attempts: 0 };

    const totalPassed = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
    return { passRate: Math.round((totalPassed / totalAttempts) * 100), attempts: totalAttempts };
  }, [analytics]);

  const lessonCount = lessons.length;
  const quizCount = quizzes.length;
  const learnerCount = 0;
  const activeCohorts = Math.max(1, Math.ceil(learnerCount / 5));

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar />
      <PrimaryNav variant="dashboard" items={[{ label: 'Home', to: '/' }]} />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar
            title="Manager"
            links={[
              { label: 'Overview', active: true },
              { label: 'Manage Lessons', to: '/instructor/lessons' },
              { label: 'Create Lesson', to: '/instructor/lesson-create' },
              { label: 'Manage Quizzes', to: '/instructor/quizzes' },
              { label: 'Create Quiz', to: '/instructor/quiz-create' },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Dashboard</p>
                <h1 className="text-4xl font-extrabold gradient-text">Manager Overview</h1>
                <p className="text-gray-600 mt-2">Track cohorts, learner progress, and lesson quality.</p>
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}
            {loading ? <p className="text-gray-500 text-sm mb-6">Loading dashboard...</p> : null}

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Active Cohorts</p>
                <h3 className="text-3xl font-bold mt-2">{activeCohorts}</h3>
                <p className="text-xs text-gray-500 mt-2">From /admin/statistics</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Lesson Reviews</p>
                <h3 className="text-3xl font-bold mt-2">{lessonCount}</h3>
                <p className="text-xs text-gray-500 mt-2">From /lessons</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Quiz Pass Rate</p>
                <h3 className="text-3xl font-bold mt-2">{quizStats.passRate}%</h3>
                <p className="text-xs text-gray-500 mt-2">From /quizzes/analytics</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Feedback Items</p>
                <h3 className="text-3xl font-bold mt-2">{quizStats.attempts}</h3>
                <p className="text-xs text-gray-500 mt-2">From /quizzes</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Cohort Performance</h3>
                <div className="grid gap-3 text-sm">
                  {uiStore.manager.performance.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-gray-500">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Tasks</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {uiStore.manager.tasks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-sm text-gray-500">Total Quizzes</p>
                <h3 className="text-3xl font-bold mt-2">{quizCount}</h3>
                <p className="text-xs text-gray-500 mt-2">From /quizzes</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-sm text-gray-500">Learners</p>
                <h3 className="text-3xl font-bold mt-2">{learnerCount}</h3>
                <p className="text-xs text-gray-500 mt-2">From /admin/statistics</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Lessons</h3>
                <Link to="/instructor/lesson-create" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold">
                  Create Lesson
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                      <th className="px-4 py-3 text-left font-semibold">Category</th>
                      <th className="px-4 py-3 text-left font-semibold">Created By</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No lessons found</td>
                      </tr>
                    ) : (
                      lessons.map((lesson, index) => {
                        const lessonId = lesson._id || lesson.id || '';
                        return (
                          <tr key={lessonId || String(index)} className="shadow-sm hover:shadow-md">
                            <td className="px-4 py-3">{lesson.title || 'N/A'}</td>
                            <td className="px-4 py-3">{lesson.category || 'N/A'}</td>
                            <td className="px-4 py-3">{lesson.createdBy || lesson.instructor?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{formatDate(lesson.createdAt || lesson.updatedAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Link to={`/lesson/${lessonId}`} className="text-blue-600 hover:underline">View</Link>
                                <Link to={`/instructor/lesson-edit/${lessonId}`} className="text-green-600 hover:underline">Edit</Link>
                                <button onClick={() => handleDeleteLesson(String(lessonId))} className="text-red-600 hover:underline">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Quizzes</h3>
                <Link to="/instructor/quiz-create" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold">
                  Create Quiz
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                      <th className="px-4 py-3 text-left font-semibold">Passing Score</th>
                      <th className="px-4 py-3 text-left font-semibold">Created</th>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No quizzes found</td>
                      </tr>
                    ) : (
                      quizzes.map((quiz, index) => {
                        const quizId = quiz._id || quiz.id || '';
                        return (
                          <tr key={quizId || String(index)} className="shadow-sm hover:shadow-md">
                            <td className="px-4 py-3">{quiz.title || 'N/A'}</td>
                            <td className="px-4 py-3">{quiz.passingScore ?? 0}%</td>
                            <td className="px-4 py-3">{formatDate(quiz.createdAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Link to={`/quiz/${quizId}`} className="text-blue-600 hover:underline">View</Link>
                                <Link to={`/instructor/quiz-edit/${quizId}`} className="text-green-600 hover:underline">Edit</Link>
                                <button onClick={() => handleDeleteQuiz(String(quizId))} className="text-red-600 hover:underline">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
