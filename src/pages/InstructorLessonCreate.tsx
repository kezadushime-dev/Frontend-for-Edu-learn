import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { AdminFormFields } from '../components/AdminFormFields';
import { uiStore } from '../data/uiStore';
import { createLesson } from '../services/api';

export default function InstructorLessonCreate() {
  const [formData, setFormData] = useState<{
    title?: string;
    description?: string;
    content?: string;
    category?: string;
  }>({});
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.description || !formData.content || !formData.category) {
        alert('Please fill in all required fields');
        return;
      }
      await createLesson(formData);
      alert('Lesson created successfully!');
      navigate('/instructor/lessons');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create lesson');
    }
  };

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Dashboard', to: '/dashboard-manager' },
          { label: 'Lessons', to: '/instructor/lessons' },
          { label: 'Create Lesson', to: '/instructor/lesson-create', className: 'text-primary font-semibold' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Instructor"
          links={[
            { label: 'Overview', to: '/dashboard-manager' },
            { label: 'Manage Lessons', to: '/instructor/lessons' },
            { label: 'Create Lesson', active: true },
            { label: 'Manage Quizzes', to: '/instructor/quizzes' },
            { label: 'Create Quiz', to: '/instructor/quiz-create' },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="mb-6">
            <p className="text-primary uppercase font-semibold tracking-wider">POST /lessons</p>
            <h1 className="text-3xl font-extrabold">Create Lesson</h1>
            <p className="text-gray-600 mt-2">Form fields match the Lesson model in xmd.md.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 grid gap-5">
            <AdminFormFields
              fields={uiStore.forms.lessonCreate}
              values={formData}
              onChange={(key, value) => setFormData({ ...formData, [key]: value })}
            />
            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md font-semibold">
                Save Lesson
              </button>
              <Link to="/instructor/lessons" className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
