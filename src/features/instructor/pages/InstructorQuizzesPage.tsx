import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { QuizCard } from '../../../components/ContentCard';
import { api } from '../../../shared/utils/api';

interface Quiz {
  _id: string;
  title: string;
  passingScore: number;
  isActive?: boolean;
  createdAt: string;
}

export default function InstructorQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuizzes = async () => {
    try {
      const res = await api.quizzes.list();
      setQuizzes(res.data.quizzes);
    } catch (err) {
      setError('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleEdit = (quiz: any) => {
    if (quiz?._id) {
      navigate(`/instructor/quiz-edit/${quiz._id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete quiz?')) {
      try {
        await api.quizzes.delete(id);
        fetchQuizzes();
      } catch (err) {
        alert('Failed to delete quiz');
      }
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Dashboard', to: '/dashboard-manager' },
          { label: 'Lessons', to: '/instructor/lessons' },
          { label: 'Quizzes', to: '/instructor/quizzes', className: 'text-primary font-semibold' },
          { label: 'Report Requests', to: '/instructor/report-requests' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Instructor"
          links={[
            { label: 'Overview', to: '/dashboard-manager' },
            { label: 'Manage Lessons', to: '/instructor/lessons' },
            { label: 'Create Lesson', to: '/instructor/lesson-create' },
            { label: 'Manage Quizzes', active: true },
            { label: 'Create Quiz', to: '/instructor/quiz-create' },
            { label: 'Report Requests', to: '/instructor/report-requests' },
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/quizzes</p>
              <h1 className="text-3xl font-extrabold">Quizzes</h1>
            </div>
            <Link to="/instructor/quiz-create" className="bg-primary text-white px-4 py-2 rounded-md font-semibold">
              Create Quiz
            </Link>
          </div>

          {quizzes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  id={quiz._id}
                  title={quiz.title}
                  passingScore={quiz.passingScore}
                  isActive={quiz.isActive}
                  createdAt={quiz.createdAt}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : !loading ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="py-12 text-center text-gray-500">No quizzes found</div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
