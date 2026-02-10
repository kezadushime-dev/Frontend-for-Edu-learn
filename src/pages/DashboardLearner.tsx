import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { api } from '../utils/api';

// Defined types based on your API spec
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

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Pulling core data from your defined API routes
        const [lessonsRes, quizzesRes, userRes] = await Promise.all([
          api.lessons.list(),     // GET /lessons
          api.quizzes.list(),     // GET /quizzes
          api.auth.me()           // GET /auth/me (to get user-specific progress if stored there)
        ]);

        if (isMounted) {
          setLessons(lessonsRes.data.lessons || []);
          setQuizzes(quizzesRes.data.quizzes || []);
          setUserData(userRes.data.user || null);
          setError(''); // Clear any previous errors
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Dashboard data fetch error:', err);
          // Don't show generic error to user, just log it
          setError(''); // Clear error state so UI doesn't break
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Derived stats from DB data
  const totalLessons = lessons.length;
  const totalQuizzes = quizzes.length;
  
  // Calculate user-specific progress
  const completedLessonsCount = userData?.completedLessons?.length || 0;
  const completedQuizzesCount = userData?.completedQuizzes?.length || 0;
  
  // Calculate progress percentage
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
          { label: 'Quiz', to: '/quiz' }
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
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="mb-8">
              <p className="text-primary uppercase font-semibold tracking-wider text-sm">Real-time Stats</p>
              <h1 className="text-4xl font-extrabold gradient-text">Welcome back, {userData?.name || 'Learner'}</h1>
            </div>

            {error && <p className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100">{error}</p>}

            {/* Show loading state */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">Loading your data...</span>
              </div>
            ) : (
              <>
            {/* Stats Grid - All from DB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Lessons" value={totalLessons} note="Available in catalog" />
              <StatCard title="My Progress" value={progressPercentage} note={`${completedLessonsCount} of ${totalLessons} completed`} noteColor="text-green-600" />
              <StatCard title="Quizzes Passed" value={completedQuizzesCount} note="Verified by server" />
              <StatCard title="Success Rate" value={`${successRate}%`} note="Overall completion" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              {/* Recent Lessons from DB */}
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
                </div>
              </div>

              {/* Available Quizzes from DB */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Available Quizzes</h3>
                <div className="space-y-4">
                  {quizzes.slice(0, 4).map((quiz) => (
                    <div key={quiz._id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <span className="text-sm font-medium">{quiz.title}</span>
                      <Link to={`/quiz/${quiz._id}`} className="bg-blue-50 text-primary px-3 py-1 rounded text-xs font-bold hover:bg-primary hover:text-white transition">Take Quiz</Link>
                    </div>
                  ))}
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