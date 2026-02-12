import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { AdminFormFields } from '../../../shared/components/AdminFormFields';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';

interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  createdBy?: string;
  instructor?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export default function InstructorLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [formData, setFormData] = useState({});

  const fetchLessons = async () => {
    try {
      const res = await api.lessons.list();
      setLessons(res.data.lessons || []);
    } catch (err) {
      setError('Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleEdit = (lesson: any) => {
    setSelectedLesson(lesson);
    setFormData(lesson);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.lessons.delete(selectedLesson._id || selectedLesson.id);
      alert('Lesson updated successfully!');
      fetchLessons();
      setEditMode(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update lesson');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete lesson?')) {
      try {
        await api.lessons.delete(id);
        alert('Lesson deleted successfully!');
        fetchLessons();
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Failed to delete lesson');
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
          { label: 'Lessons', to: '/instructor/lessons', className: 'text-primary font-semibold' },
          { label: 'Quizzes', to: '/instructor/quizzes' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Instructor"
          links={[
            { label: 'Overview', to: '/dashboard-manager' },
            { label: 'Manage Lessons', active: true },
            { label: 'Create Lesson', to: '/instructor/lesson-create' },
            { label: 'Manage Quizzes', to: '/instructor/quizzes' },
            { label: 'Create Quiz', to: '/instructor/quiz-create' },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">/lessons</p>
              <h1 className="text-3xl font-extrabold">Lessons</h1>
            </div>
            <Link to="/instructor/lesson-create" className="bg-primary text-white px-4 py-2 rounded-md font-semibold">
              Create Lesson
            </Link>
          </div>

          {editMode && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Edit Lesson</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="grid gap-5">
                <AdminFormFields
                  fields={uiStore.forms.lessonCreate}
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
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Created By</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No lessons found</td>
                    </tr>
                  ) : (
                    lessons.map((lesson) => (
                      <tr key={lesson._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{lesson.title}</td>
                        <td className="px-4 py-3">{lesson.category}</td>
                        <td className="px-4 py-3">{lesson.createdBy || lesson.instructor?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{new Date(lesson.createdAt || lesson.updatedAt || Date.now()).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(lesson)} className="text-green-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(lesson._id || lesson.id || '')} className="text-red-600 hover:underline">Delete</button>
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


