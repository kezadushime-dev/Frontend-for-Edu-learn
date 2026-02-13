import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import {
  AssignmentPanel,
  CalendarWidget,
  StatusBreakdownChart,
  TrendChart,
  type AssignmentItem,
  type TrendPoint
} from '../../../components/dashboard/OverviewWidgets';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';

type LessonItem = {
  _id?: string;
  id?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
};

type QuizItem = {
  _id?: string;
  id?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
};

type AnalyticsItem = {
  attempts?: number;
  passed?: number;
};

const metricDisplay = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k+`;
  return `${value}+`;
};

const recentMonths = (count: number) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString(undefined, { month: 'short' });
    return { key, label };
  });
};

const monthKeyFromDate = (value: unknown) => {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
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

  const quizStats = useMemo(() => {
    if (!analytics.length) return { passRate: 0, attempts: 0, passed: 0 };
    const attempts = analytics.reduce((sum, item) => sum + (item.attempts || 0), 0);
    const passed = analytics.reduce((sum, item) => sum + (item.passed || 0), 0);
    const passRate = attempts ? Math.round((passed / attempts) * 100) : 0;
    return { passRate, attempts, passed };
  }, [analytics]);

  const monthRange = useMemo(() => recentMonths(6), []);
  const trendPoints = useMemo<TrendPoint[]>(() => {
    const lessonMap = new Map<string, number>();
    const quizMap = new Map<string, number>();

    lessons.forEach((lesson) => {
      const key = monthKeyFromDate(lesson.createdAt || lesson.updatedAt);
      if (!key) return;
      lessonMap.set(key, (lessonMap.get(key) || 0) + 1);
    });
    quizzes.forEach((quiz) => {
      const key = monthKeyFromDate(quiz.createdAt || quiz.updatedAt);
      if (!key) return;
      quizMap.set(key, (quizMap.get(key) || 0) + 1);
    });

    return monthRange.map((month) => ({
      label: month.label,
      study: (lessonMap.get(month.key) || 0) * 2,
      test: (quizMap.get(month.key) || 0) * 2
    }));
  }, [lessons, quizzes, monthRange]);

  const publishedLessons = lessons.filter((item) => item.isPublished !== false).length;
  const draftLessons = lessons.filter((item) => item.isPublished === false).length;
  const activeQuizzes = quizzes.filter((item) => item.isActive !== false).length;
  const pausedQuizzes = quizzes.filter((item) => item.isActive === false).length;
  const supportSignals = quizStats.attempts + activeQuizzes;

  const highlightedDays = useMemo(() => {
    const days = new Set<number>();
    lessons.slice(0, 3).forEach((item) => {
      const value = new Date(item.createdAt || item.updatedAt || Date.now()).getDate();
      days.add(value);
    });
    quizzes.slice(0, 3).forEach((item) => {
      const value = new Date(item.createdAt || item.updatedAt || Date.now()).getDate();
      days.add(value);
    });
    return Array.from(days).slice(0, 5);
  }, [lessons, quizzes]);

  const assignmentItems = useMemo<AssignmentItem[]>(() => {
    const dynamicItems: AssignmentItem[] = [
      {
        title: draftLessons ? `Publish ${draftLessons} draft lesson(s)` : 'Validate lesson quality checks',
        dueIn: draftLessons ? '2 days' : '5 days',
        note: 'Ensure each lesson has clear outcomes and assets.'
      },
      {
        title: `${quizzes.filter((item) => item.isActive === false).length} paused quiz(es) need attention`,
        dueIn: '4 days',
        note: 'Update scoring and reactivate assessments.'
      }
    ];

    uiStore.manager.tasks.slice(0, 1).forEach((task) => {
      dynamicItems.push({
        title: task,
        dueIn: '9 days',
        note: 'Manager follow-up milestone.'
      });
    });

    return dynamicItems;
  }, [draftLessons, quizzes]);

  const lessonRows = lessons.slice(0, 8).map((lesson) => ({
    id: lesson._id || lesson.id || '',
    title: lesson.title || 'N/A',
    status: lesson.isPublished === false ? 'Draft' : 'Published'
  }));

  const quizRows = quizzes.slice(0, 8).map((quiz) => ({
    id: quiz._id || quiz.id || '',
    title: quiz.title || 'N/A',
    status: quiz.isActive === false ? 'Paused' : 'Active'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#eef4ff] to-[#f8fbff] text-slate-800">
      <TopBar />
      <section className="pb-16 pt-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[260px_1fr]">
          <Sidebar
            title="Manager Console"
            links={[
              { label: 'Dashboard', active: true },
              { label: 'Lessons', to: '/instructor/lessons' },
              { label: 'Quizzes', to: '/instructor/quizzes' },
              { label: 'Report Requests', to: '/instructor/report-requests' },
              { label: 'Profile Settings', to: '/instructor/profile-settings' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_36px_-20px_rgba(15,23,42,0.45)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Manager Dashboard</p>
                  <h1 className="mt-2 text-4xl font-black text-slate-800">Learning Operations Overview</h1>
                  <p className="mt-2 text-slate-600">Monitor lesson quality, quiz performance, and learner engagement in one place.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/instructor/lesson-create"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Create Lesson
                  </Link>
                  <Link
                    to="/instructor/quiz-create"
                    className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Create Quiz
                  </Link>
                </div>
              </div>

              {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
              {loading ? <p className="mt-4 text-sm text-slate-500">Loading manager insights...</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Completed Courses" value={metricDisplay(publishedLessons)} note="Published learning paths" />
              <StatCard label="Courses in Progress" value={metricDisplay(draftLessons)} note="Draft lessons requiring review" />
              <StatCard label="Quiz Pass Rate" value={`${quizStats.passRate}%`} note="From live assessment analytics" />
              <StatCard label="Community Support" value={metricDisplay(supportSignals)} note="Attempts and active quizzes" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="grid gap-6">
                <TrendChart
                  title="Study vs Test Hours"
                  subtitle="Estimated from lesson creation volume and quiz activity."
                  points={trendPoints}
                />
                <StatusBreakdownChart
                  title="Course and Quiz Status"
                  subtitle="Published/active readiness across manager content."
                  items={[
                    { label: 'Published Lessons', value: publishedLessons, tone: 'emerald' },
                    { label: 'Draft Lessons', value: draftLessons, tone: 'amber' },
                    { label: 'Active Quizzes', value: activeQuizzes, tone: 'blue' },
                    { label: 'Paused Quizzes', value: pausedQuizzes, tone: 'slate' }
                  ]}
                />
              </div>
              <div className="grid gap-6">
                <CalendarWidget highlightedDays={highlightedDays} />
                <AssignmentPanel title="Manager Priorities" items={assignmentItems} />
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="font-bold text-slate-800">Courses</h3>
                  <span className="text-xs font-semibold text-slate-500">{lessons.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Lesson</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lessonRows.length ? (
                        lessonRows.map((lesson, index) => (
                          <tr key={`${lesson.id || lesson.title}-${index}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-700">{lesson.title}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  lesson.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {lesson.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-slate-500">No lessons found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="font-bold text-slate-800">Assessments</h3>
                  <span className="text-xs font-semibold text-slate-500">{quizzes.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Quiz</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quizRows.length ? (
                        quizRows.map((quiz, index) => (
                          <tr key={`${quiz.id || quiz.title}-${index}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-700">{quiz.title}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  quiz.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {quiz.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-slate-500">No quizzes found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <QuickMetric label="Total Lessons" value={String(lessons.length)} />
              <QuickMetric label="Total Quizzes" value={String(quizzes.length)} />
              <QuickMetric label="Total Attempts" value={String(quizStats.attempts)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_26px_-18px_rgba(15,23,42,0.55)]">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-800">{value}</h3>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
