import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminTable } from '../components/AdminTable';
import { AdminFormFields } from '../components/AdminFormFields';
import { uiStore } from '../data/uiStore';
import { getQuizzes, updateQuiz, deleteQuiz } from '../services/api';

export default function InstructorQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [formData, setFormData] = useState({});

  const getInstructorId = () => {
    const userStr = localStorage.getItem('edulearn_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user._id || user.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const instructorId = getInstructorId();

  const fetchQuizzes = async () => {
    try {
      const data = await getQuizzes(instructorId || undefined);
      setQuizzes(data);
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
      await updateQuiz(selectedQuiz.id, formData);
      fetchQuizzes();
      setEditMode(false);
    } catch (err) {
      alert('Failed to update quiz');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete quiz?')) {
      try {
        await deleteQuiz(id);
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
            <AdminTable
              columns={uiStore.models.quizzes}
              rows={quizzes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
