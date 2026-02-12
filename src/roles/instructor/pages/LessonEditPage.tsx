import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { AdminFormFields } from '../../../shared/components/AdminFormFields';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';

export default function LessonEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const res = await api.lessons.get(id!);
        setLesson(res.data.lesson);
        setFormData(res.data.lesson);
      } catch (err: any) {
        setError(err?.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach((file: any) => formDataObj.append('images', file));
        } else {
          formDataObj.append(key, value as string);
        }
      });
      await api.lessons.update(id!, formDataObj);
      navigate('/instructor/lessons');
    } catch (err: any) {
      setError(err?.message || 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error && !lesson) return <div>{error}</div>;

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
          <div className="mb-6">
            <p className="text-primary uppercase font-semibold tracking-wider">PATCH /lessons/{id}</p>
            <h1 className="text-3xl font-extrabold">Edit Lesson</h1>
            <p className="text-gray-600 mt-2">Update lesson details.</p>
          </div>

          <form className="bg-white rounded-xl shadow-lg p-6 grid gap-5" onSubmit={handleSubmit}>
            <AdminFormFields
              fields={uiStore.forms.lessonCreate}
              values={formData}
              onChange={(key, value) => setFormData({ ...formData, [key]: value })}
            />

            {error ? <p className="text-red-600">{error}</p> : null}

            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md font-semibold disabled:opacity-60" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
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


