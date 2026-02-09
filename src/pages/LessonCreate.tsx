import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { api } from '../utils/api';

export default function LessonCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState('0');
  const [images, setImages] = useState<FileList | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!images || images.length === 0) {
      setMessage({ text: 'Please upload at least one image.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('content', content);
      if (category) form.append('category', category);
      if (order) form.append('order', order);
      Array.from(images).forEach((file) => form.append('images', file));
      await api.lessons.create(form);
      setMessage({ text: 'Lesson created successfully.', type: 'success' });
      window.setTimeout(() => navigate('/admin/lessons'), 600);
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to create lesson.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="admin"
        items={[
          { label: 'Dashboard', to: '/dashboard-admin' },
          { label: 'Lessons', to: '/admin/lessons' },
          { label: 'Create Lesson', to: '/lesson-create', className: 'text-primary font-semibold' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Admin"
          links={[
            { label: 'Overview', to: '/dashboard-admin' },
            { label: 'Manage Users', to: '/admin/users' },
            { label: 'Manage Lessons', to: '/admin/lessons' },
            { label: 'Manage Quizzes', to: '/admin/quizzes' },
            { label: 'Quiz Attempts', to: '/admin/quiz-attempts' },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="mb-6">
            <p className="text-primary uppercase font-semibold tracking-wider">POST /lessons</p>
            <h1 className="text-3xl font-extrabold">Create Lesson</h1>
            <p className="text-gray-600 mt-2">Fields match the Lesson model.</p>
          </div>

          <form className="bg-white rounded-xl shadow-lg p-6 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Lesson title"
                  required
                  className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Short summary"
                  required
                  className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Content</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Lesson content"
                  required
                  className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Database, Programming, Frontend"
                    className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(event) => setOrder(event.target.value)}
                    placeholder="1"
                    className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Images (upload)</label>
                <input
                  type="file"
                  multiple
                  onChange={(event) => setImages(event.target.files)}
                  className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {message ? (
              <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
            ) : null}

            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md font-semibold disabled:opacity-60" disabled={loading}>
                {loading ? 'Saving...' : 'Save Lesson'}
              </button>
              <Link to="/admin/lessons" className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
