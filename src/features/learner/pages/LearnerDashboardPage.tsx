import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';
import { readJson } from '../../../shared/utils/storage';
import {
  buildSubjectRows,
  calculateOverallAverage,
  formatReportDate,
  getPerformanceLevel
} from '../../../shared/report/report.utils';
import type { ReportRequest } from '../../../shared/types/report';
import ReportStatusBadge from '../../../components/ReportStatusBadge';

const getQuizState = () =>
  readJson<{ completedQuizzes?: Record<string, boolean>; scores?: Record<string, number> }>('edulearn_quizzes', {
    completedQuizzes: {},
    scores: {}
  });

interface Lesson {
  _id: string;
  title: string;
  category: string;
}

interface Quiz {
  _id: string;
  title: string;
  lesson: string;
}

export default function DashboardLearner() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [analytics, setAnalytics] = useState<unknown[]>([]);
  const [reportRequest, setReportRequest] = useState<ReportRequest | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessonCount, setLessonCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  const quizState = getQuizState();
  const completedQuizzes = Object.keys(quizState.completedQuizzes || {}).length;
  const scores = Object.values(quizState.scores || {}).filter((value) => typeof value === 'number');
  const localAverage = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [lessonsRes, quizzesRes, userRes, analyticsRes, learnerRequestRes] = await Promise.all([
          api.lessons.list(),
          api.quizzes.list(),
          api.auth.me(),
          api.quizzes.analytics().catch(() => ({ data: { analytics: [] } })),
          api.reports.getLearnerRequest().catch(() => null)
        ]);

        if (isMounted) {
          setLessons(lessonsRes.data.lessons || []);
          setQuizzes(quizzesRes.data.quizzes || []);
          setUserData(userRes || null);
          setLessonCount(lessonsRes.data.lessons.length);
          setQuizCount(quizzesRes.data.quizzes.length);
          setAnalytics((analyticsRes as { data?: { analytics?: unknown[] } }).data?.analytics || []);
          setReportRequest(learnerRequestRes);
          setError('');
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Dashboard data fetch error:', err);
          setError('');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const syncLearnerRequest = async () => {
      try {
        const next = await api.reports.getLearnerRequest();
        if (!active) return;
        setReportRequest(next);
      } catch {
        // Keep previous value on transient sync errors.
      }
    };

    const interval = window.setInterval(() => {
      void syncLearnerRequest();
    }, 12000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const reportSubjects = useMemo(() => buildSubjectRows(analytics, []), [analytics]);
  const reportAverage = useMemo(() => calculateOverallAverage(reportSubjects), [reportSubjects]);
  const reportLevel = useMemo(() => getPerformanceLevel(reportAverage), [reportAverage]);
  const reportUpdatedAt = reportRequest?.updatedAt || reportRequest?.createdAt || null;
  const reportReadyToDownload = reportRequest?.status === 'APPROVED';

  const totalLessons = lessons.length;
  const totalQuizzes = quizzes.length;
  const completedLessonsCount = userData?.completedLessons?.length || 0;
  const completedQuizzesCount = userData?.completedQuizzes?.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
  const successRate = totalQuizzes > 0 ? Math.round((completedQuizzesCount / totalQuizzes) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-slate-800">
      <TopBar />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Lessons', to: '/lesson' },
          { label: 'Quiz', to: '/quiz' },
          { label: 'Report Card', to: '/learner/report-card' }
        ]}
      />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar
            title="Learner"
            links={[
              { label: 'Overview', active: true },
              { label: 'My Lessons', to: '/lesson' },
              { label: 'My Quizzes', to: '/quiz' },
              { label: 'Report Card', to: '/learner/report-card' },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Dashboard</p>
                <h1 className="text-4xl font-extrabold gradient-text">Welcome back, {userData?.name || 'Learner'}</h1>
                <p className="text-gray-600 mt-2">Continue where you left off and track your live progress.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/lesson" className="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300">
                  Resume Lesson
                </Link>
                <Link
                  to="/quiz"
                  className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Take Quiz
                </Link>
              </div>
            </div>

            {error && <p className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100">{error}</p>}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">Loading your data...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  <StatCard title="Lessons Available" value={lessonCount} note={uiStore.statsNotes.lessons} />
                  <StatCard title="Quiz Average" value={`${reportAverage || localAverage}%`} note="From quiz analytics API" />
                  <StatCard title="Quizzes Completed" value={completedQuizzes} note="Tracked locally" />
                  <StatCard
                    title="My Progress"
                    value={`${progressPercentage}%`}
                    note={`${completedLessonsCount} of ${totalLessons} lessons completed`}
                    noteColor="text-green-600"
                  />
                  <StatCard title="Success Rate" value={`${successRate}%`} note="Overall completion" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Latest Lessons</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lessons.slice(0, 4).map((lesson) => (
                        <LessonCard key={lesson._id} lesson={lesson} />
                      ))}
                      {lessons.length === 0 ? <p className="text-sm text-gray-500 col-span-2">No lessons available.</p> : null}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Upcoming Quizzes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {quizzes.slice(0, 4).map((quiz) => (
                        <QuizCard key={quiz._id} quiz={quiz} />
                      ))}
                      {quizzes.length === 0 ? <p className="text-sm text-gray-500 col-span-2">No quizzes available.</p> : null}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <p className="text-sm text-gray-500">Total Quizzes</p>
                    <h3 className="text-3xl font-bold mt-2">{quizCount}</h3>
                    <p className="text-xs text-gray-500 mt-2">From /quizzes</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Report Card (DB)</p>
                      {reportRequest ? <ReportStatusBadge status={reportRequest.status} /> : <span className="text-xs text-gray-500">No Request Yet</span>}
                    </div>
                    <h3 className="text-xl font-bold mt-2">{reportAverage}% - {reportLevel}</h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {reportUpdatedAt
                        ? `Last request update: ${formatReportDate(reportUpdatedAt)}`
                        : 'No report request found yet. Open Report Card to request download permission.'}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        to="/learner/report-card"
                        className="border border-primary text-primary px-3 py-1 rounded text-xs font-bold hover:bg-primary hover:text-white transition"
                      >
                        Open Report Card
                      </Link>
                      {reportReadyToDownload ? (
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-xs font-semibold">
                          Ready to Download
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, note, noteColor = "text-gray-500" }: { title: string, value: string | number, note: string, noteColor?: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
      <p className={`text-xs mt-2 ${noteColor}`}>{note}</p>
    </div>
  );
}

// Lesson Card Component
function LessonCard({ lesson }: { lesson: Lesson & { description?: string; content?: string; images?: string[] } }) {
  // Generate a placeholder image based on category or use a default
  const placeholderImages = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop'
  ];
  const imageIndex = lesson.title.charCodeAt(0) % placeholderImages.length;
  const imageUrl = lesson.images?.[0] || placeholderImages[imageIndex];
  
  // Estimate reading time based on content length (roughly 200 words per minute)
  const contentLength = lesson.content?.length || 0;
  const estimatedMinutes = Math.max(1, Math.ceil(contentLength / 300));
  const estimatedHours = estimatedMinutes >= 60 ? `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m` : `${estimatedMinutes}m`;

  return (
    <Link to={`/lesson/${lesson._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Image */}
        <div className="h-32 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={lesson.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Category Badge */}
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full mb-2">
            {lesson.category}
          </span>
          
          {/* Title */}
          <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {lesson.title}
          </h4>
          
          {/* Description */}
          {lesson.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
              {lesson.description}
            </p>
          )}
          
          {/* Meta Info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{estimatedHours}</span>
            </div>
            <span className="text-primary text-xs font-semibold group-hover:underline">
              Start →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Quiz Card Component
function QuizCard({ quiz }: { quiz: Quiz & { passingScore?: number; questions?: { length: number }[]; lessonTitle?: string } }) {
  // Generate a placeholder image based on title
  const placeholderImages = [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop'
  ];
  const imageIndex = quiz.title.charCodeAt(0) % placeholderImages.length;
  const imageUrl = placeholderImages[imageIndex];
  
  // Get questions count - handle different possible structures
  const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
  
  // Estimate time based on questions (assume 2 minutes per question)
  const estimatedMinutes = questionsCount * 2;
  const estimatedHours = estimatedMinutes >= 60 ? `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m` : `${estimatedMinutes}m`;

  return (
    <Link to={`/quiz/${quiz._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Image */}
        <div className="h-32 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={quiz.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Category Badge - use lesson title or default */}
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full mb-2">
            {quiz.lessonTitle || quiz.lesson || 'Assessment'}
          </span>
          
          {/* Title */}
          <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {quiz.title}
          </h4>
          
          {/* Quiz Info */}
          <div className="flex gap-3 text-xs text-gray-500 mb-2">
            {questionsCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {questionsCount} Qs
              </span>
            )}
            {quiz.passingScore && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {quiz.passingScore}%
              </span>
            )}
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{estimatedHours}</span>
            </div>
            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold group-hover:bg-blue-700 transition-colors">
              Take Quiz
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}



