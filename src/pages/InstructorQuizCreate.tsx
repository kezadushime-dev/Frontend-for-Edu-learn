import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminFormFields } from '../components/AdminFormFields';
import { uiStore } from '../data/uiStore';
import { createQuiz } from '../services/api';

export default function InstructorQuizCreate() {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuiz(formData);
      navigate('/instructor/quizzes');
    } catch (err) {
      alert('Failed to create quiz');
    }
  };

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Dashboard', to: '/dashboard-manager' },
          { label: 'Quizzes', to: '/instructor/quizzes' },
          { label: 'Create Quiz', to: '/instructor/quiz-create', className: 'text-primary font-semibold' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Instructor"
          links={[
            { label: 'Overview', to: '/dashboard-manager' },
            { label: 'Manage Lessons', to: '/instructor/lessons' },
            { label: 'Create Lesson', to: '/instructor/lesson-create' },
            { label: 'Manage Quizzes', to: '/instructor/quizzes' },
            { label: 'Create Quiz', active: true },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="mb-6">
            <p className="text-primary uppercase font-semibold tracking-wider">POST /quizzes</p>
            <h1 className="text-3xl font-extrabold">Create Quiz</h1>
            <p className="text-gray-600 mt-2">Form fields match the Quiz + Question models in xmd.md.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 grid gap-5">
            <AdminFormFields
              fields={uiStore.forms.quizCreate}
              values={formData}
              onChange={(key, value) => setFormData({ ...formData, [key]: value })}
            />
            <div className="border-t border-gray-200 pt-4">
              <h2 className="font-semibold mb-3">Questions</h2>
              <AdminFormFields
                fields={uiStore.forms.questionCreate}
                values={formData}
                onChange={(key, value) => setFormData({ ...formData, [key]: value })}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md font-semibold">
                Save Quiz
              </button>
              <Link to="/instructor/quizzes" className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
