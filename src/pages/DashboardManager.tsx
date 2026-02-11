import { useEffect, useMemo, useState } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { uiStore } from '../data/uiStore';
import { getQuizAnalytics, getLessons, getQuizzes, deleteLesson, deleteQuiz } from '../services/api';
=======
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminTable } from '../components/AdminTable';
import { uiStore } from '../data/uiStore';
import { api } from '../utils/api';
import { getQuizAnalytics } from '../services/api';
>>>>>>> admin

export default function DashboardManager() {
  const [lessonCount, setLessonCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
<<<<<<< HEAD
  const [stats, setStats] = useState<{ learners?: number } | null>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [lessonsData, quizzesData, analyticsRes] = await Promise.all([
        getLessons().catch(() => []),
        getQuizzes().catch(() => []),
        getQuizAnalytics().catch(() => [])
      ]);
      setLessons(lessonsData);
      setQuizzes(quizzesData);
      setLessonCount(lessonsData.length);
      setQuizCount(quizzesData.length);
      setAnalytics(Array.isArray(analyticsRes) ? analyticsRes : []);
      setStats({ learners: 0 });
    } catch (err: any) {
      setError(err?.message || 'Failed to load manager dashboard data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteLesson = async (id: string) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await deleteLesson(id);
        loadData();
      } catch (err) {
        alert('Failed to delete lesson');
      }
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (window.confirm('Delete this quiz?')) {
      try {
        await deleteQuiz(id);
        loadData();
      } catch (err) {
        alert('Failed to delete quiz');
      }
    }
  };

=======
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [stats, setStats] = useState<{ learners?: number } | null>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [lessonsRes, quizzesRes, analyticsRes] = await Promise.all([
          api.lessons.list().catch(() => ({ data: { lessons: [] } })),
          api.quizzes.list().catch(() => ({ data: { quizzes: [] } })),
          getQuizAnalytics().catch(() => [])
        ]);
        if (!mounted) return;
        setLessons(lessonsRes.data.lessons || []);
        setLessonCount(lessonsRes.data.lessons.length);
        setQuizzes(quizzesRes.data.quizzes || []);
        setQuizCount(quizzesRes.data.quizzes.length);
        setAnalytics(Array.isArray(analyticsRes) ? analyticsRes : []);
        setStats({ learners: 0 });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load manager dashboard data.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

>>>>>>> admin
  const quizStats = useMemo(() => {
    if (!analytics.length) return { passRate: 0, attempts: 0 };
    const totalAttempts = analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);
    if (!totalAttempts) return { passRate: 0, attempts: 0 };
    const totalPassed = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
    return { passRate: Math.round((totalPassed / totalAttempts) * 100), attempts: totalAttempts };
  }, [analytics]);

  const learnerCount = stats?.learners || 0;
  const activeCohorts = Math.max(1, Math.ceil(learnerCount / 5));

<<<<<<< HEAD
=======
  // Define custom columns for manager dashboard
  const lessonColumns = [
    { key: 'title', label: 'Lesson Title' },
    { key: 'category', label: 'Category' },
    { key: 'createdBy', label: 'Instructor' },
    { key: 'createdAt', label: 'Date Created' }
  ];

  const quizColumns = [
    { key: 'title', label: 'Quiz Title' },
    { key: 'questions', label: 'Questions' },
    { key: 'passingScore', label: 'Pass Score' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date Created' }
  ];

  const lessonRows = lessons.map((lesson) => {
    const createdAt = lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : '—';

    return {
      title: lesson.title || '—',
      category: lesson.category || '—',
      createdBy: lesson.instructor?.name || lesson.createdBy?.name || lesson.createdBy || '—',
      createdAt
    };
  });

  const quizRows = quizzes.map((quiz) => {
    const createdAt = quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : '—';
    const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;

    return {
      title: quiz.title || '—',
      questions: questionCount,
      passingScore: quiz.passingScore ? `${quiz.passingScore}%` : '—',
      status: quiz.isActive ? '✓ Active' : '✗ Inactive',
      createdAt
    };
  });

>>>>>>> admin
  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar />
      <PrimaryNav variant="dashboard" items={[{ label: 'Home', to: '/' }]} />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar title="Manager" links={[
            { label: 'Overview', active: true },
            { label: 'Manage Lessons', to: '/instructor/lessons' },
            { label: 'Create Lesson', to: '/instructor/lesson-create' },
            { label: 'Manage Quizzes', to: '/instructor/quizzes' },
            { label: 'Create Quiz', to: '/instructor/quiz-create' },
            { label: 'Logout', to: '/login' }
          ]} />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Dashboard</p>
                <h1 className="text-4xl font-extrabold gradient-text">Manager Overview</h1>
                <p className="text-gray-600 mt-2">Track cohorts, learner progress, and lesson quality.</p>
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}

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

<<<<<<< HEAD
            <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">📘 Lessons</h3>
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
                      lessons.map((lesson) => (
                        <tr key={lesson._id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">{lesson.title}</td>
                          <td className="px-4 py-3">{lesson.category}</td>
                          <td className="px-4 py-3">{lesson.createdBy || lesson.instructor?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{new Date(lesson.createdAt || lesson.updatedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Link to={`/lesson/${lesson._id}`} className="text-blue-600 hover:underline">View</Link>
                              <Link to={`/instructor/lessons`} className="text-green-600 hover:underline">Edit</Link>
                              <button onClick={() => handleDeleteLesson(lesson._id)} className="text-red-600 hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">📝 Quizzes</h3>
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
                      quizzes.map((quiz) => (
                        <tr key={quiz._id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">{quiz.title}</td>
                          <td className="px-4 py-3">{quiz.passingScore}%</td>
                          <td className="px-4 py-3">{new Date(quiz.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Link to={`/quiz/${quiz._id}`} className="text-blue-600 hover:underline">View</Link>
                              <Link to={`/instructor/quizzes`} className="text-green-600 hover:underline">Edit</Link>
                              <button onClick={() => handleDeleteQuiz(quiz._id)} className="text-red-600 hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
=======
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold gradient-text">Manage Lessons</h3>
                <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full font-semibold">{lessons.length} Total</span>
              </div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <AdminTable columns={lessonColumns} rows={lessonRows} hideActions maxRows={5} />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold gradient-text">Manage Quizzes</h3>
                <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full font-semibold">{quizzes.length} Total</span>
              </div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <AdminTable columns={quizColumns} rows={quizRows} hideActions maxRows={5} />
>>>>>>> admin
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
