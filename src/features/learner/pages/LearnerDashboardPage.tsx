import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';
import { readJson } from '../../../shared/utils/storage';

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
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessonCount, setLessonCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  const quizState = getQuizState();
  const completedQuizzes = Object.keys(quizState.completedQuizzes || {}).length;
  const scores = Object.values(quizState.scores || {}).filter((value) => typeof value === 'number');
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [lessonsRes, quizzesRes, userRes] = await Promise.all([
          api.lessons.list(),
          api.quizzes.list(),
          api.auth.me()
        ]);

        if (isMounted) {
          setLessons(lessonsRes.data.lessons || []);
          setQuizzes(quizzesRes.data.quizzes || []);
          setUserData(userRes.data.user || null);
          setLessonCount(lessonsRes.data.lessons.length);
          setQuizCount(quizzesRes.data.quizzes.length);
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
                  <StatCard title="Quiz Average" value={`${avg}%`} note="From local quiz submissions" />
                  <StatCard title="Quizzes Completed" value={completedQuizzes} note="Tracked locally" />
                  <StatCard title="My Progress" value={`${progressPercentage}%`} note={`${completedLessonsCount} of ${totalLessons} lessons completed`} noteColor="text-green-600" />
                  <StatCard title="Success Rate" value={`${successRate}%`} note="Overall completion" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Latest Lessons</h3>
                    <div className="space-y-4">
                      {lessons.slice(0, 4).map((lesson) => (
                        <div key={lesson._id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <div>
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-gray-400">{lesson.category}</p>
                          </div>
                          <Link to={`/lesson/${lesson._id}`} className="text-primary text-sm font-semibold hover:underline">Start</Link>
                        </div>
                      ))}
                      {lessons.length === 0 ? <p className="text-sm text-gray-500">No lessons available.</p> : null}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Upcoming Quizzes</h3>
                    <div className="space-y-4">
                      {quizzes.slice(0, 4).map((quiz) => (
                        <div key={quiz._id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <span className="text-sm font-medium">{quiz.title}</span>
                          <Link to={`/quiz/${quiz._id}`} className="bg-blue-50 text-primary px-3 py-1 rounded text-xs font-bold hover:bg-primary hover:text-white transition">Take Quiz</Link>
                        </div>
                      ))}
                      {quizzes.length === 0 ? <p className="text-sm text-gray-500">No quizzes available.</p> : null}
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
                    <p className="text-sm text-gray-500">Next Step</p>
                    <h3 className="text-xl font-bold mt-2">Continue a lesson or take a quiz</h3>
                    <p className="text-xs text-gray-500 mt-2">Your report card updates from live quiz analytics.</p>
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



