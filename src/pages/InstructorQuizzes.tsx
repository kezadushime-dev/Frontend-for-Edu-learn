import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminFormFields } from '../components/AdminFormFields';
import { uiStore } from '../data/uiStore';
import { api } from '../utils/api';

interface Quiz {
  _id: string;
  title: string;
  passingScore: number;
  createdAt: string;
}

export default function InstructorQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [_selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [formData, setFormData] = useState({});

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
    setSelectedQuiz(quiz);
    setFormData(quiz);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.quizzes.create(formData);
      fetchQuizzes();
      setEditMode(false);
    } catch (err) {
      alert('Failed to update quiz');
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Dashboard', to: '/dashboard-manager' },
          { label: 'Lessons', to: '/instructor/lessons' },
          { label: 'Quizzes', to: '/instructor/quizzes', className: 'text-primary font-semibold' }
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
            { label: 'Logout', to: '/login' }
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

          {editMode && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Edit Quiz</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="grid gap-5">
                <AdminFormFields
                  fields={uiStore.forms.quizCreate}
                  values={formData}
                  onChange={(key, value) => setFormData({ ...formData, [key]: value })}
                />
                <div className="flex gap-3">
                  <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md font-semibold">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
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
                            <button onClick={() => handleEdit(quiz)} className="text-green-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(quiz._id)} className="text-red-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
