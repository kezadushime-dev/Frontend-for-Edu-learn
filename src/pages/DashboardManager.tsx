import { useEffect, useMemo, useState } from 'react';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { uiStore } from '../data/uiStore';
import { api } from '../utils/api';
import { getQuizAnalytics } from '../services/api';

export default function DashboardManager() {
  const [lessonCount, setLessonCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
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
        setLessonCount(lessonsRes.data.lessons.length);
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

  const quizStats = useMemo(() => {
    if (!analytics.length) return { passRate: 0, attempts: 0 };
    const totalAttempts = analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);
    if (!totalAttempts) return { passRate: 0, attempts: 0 };
    const totalPassed = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
    return { passRate: Math.round((totalPassed / totalAttempts) * 100), attempts: totalAttempts };
  }, [analytics]);

  const learnerCount = stats?.learners || 0;
  const activeCohorts = Math.max(1, Math.ceil(learnerCount / 5));

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
          </div>
        </div>
      </section>
    </div>
  );
}
