import { useEffect, useMemo, useState } from 'react';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { api } from '../utils/api';

export default function DashboardInstructor() {
  const [lessonCount, setLessonCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [lessonsRes, quizzesRes, analyticsRes] = await Promise.all([
          api.lessons.list(),
          api.quizzes.list(),
          api.quizzes.analytics()
        ]);
        if (!mounted) return;
        setLessonCount(lessonsRes.data.lessons.length);
        setQuizCount(quizzesRes.data.quizzes.length);
        setAnalytics(analyticsRes.data.analytics || []);
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

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar />
      <PrimaryNav variant="dashboard" items={[{ label: 'Home', to: '/' }]} />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar title="Instructor" links={[{ label: 'Overview', active: true }, { label: 'My Lessons', to: '/lesson' }, { label: 'My Quizzes', to: '/quiz' }, { label: 'Analytics', to: '/admin-quiz-attempts' }, { label: 'Logout', to: '/login' }]} />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Dashboard</p>
                <h1 className="text-4xl font-extrabold gradient-text">Instructor Overview</h1>
                <p className="text-gray-600 mt-2">Manage your lessons, quizzes, and track learner performance.</p>
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">My Lessons</p>
                <h3 className="text-3xl font-bold mt-2">{lessonCount}</h3>
                <p className="text-xs text-gray-500 mt-2">Created content</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">My Quizzes</p>
                <h3 className="text-3xl font-bold mt-2">{quizCount}</h3>
                <p className="text-xs text-gray-500 mt-2">Active assessments</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Quiz Pass Rate</p>
                <h3 className="text-3xl font-bold mt-2">{quizStats.passRate}%</h3>
                <p className="text-xs text-gray-500 mt-2">From /quizzes/analytics</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                <p className="text-sm text-gray-500">Total Attempts</p>
                <h3 className="text-3xl font-bold mt-2">{quizStats.attempts}</h3>
                <p className="text-xs text-gray-500 mt-2">From /quizzes</p>
              </div>
            </div>


            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-sm text-gray-500">Completed Quizzes</p>
                <h3 className="text-3xl font-bold mt-2">{quizCount}</h3>
                <p className="text-xs text-gray-500 mt-2">From /quizzes</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-sm text-gray-500">Progress</p>
                <h3 className="text-3xl font-bold mt-2">{Math.round((quizStats.attempts / (quizCount || 1)) * 100)}%</h3>
                <p className="text-xs text-gray-500 mt-2">Based on attempts</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
