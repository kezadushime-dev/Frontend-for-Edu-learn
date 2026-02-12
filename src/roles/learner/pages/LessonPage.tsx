import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { api } from '../../../shared/utils/api';
import { readJson, writeJson } from '../../../shared/utils/storage';

type LessonProgress = Record<string, boolean>;

const storageKey = 'edulearn_lessons_v2';

export default function Lesson() {
  const { id } = useParams<{ id?: string }>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [progress, setProgress] = useState<LessonProgress>(() => readJson(storageKey, {}));
  const [error, setError] = useState('');

  useEffect(() => {
    writeJson(storageKey, progress);
  }, [progress]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.lessons.list();
        if (!mounted) return;
        const items = res.data.lessons || [];
        setLessons(items);
        if (id) {
          setSelectedLessonId(id);
        } else if (items.length && !selectedLessonId) {
          setSelectedLessonId(items[0]._id);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load lessons.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    lessons.forEach((lesson) => set.add(lesson.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    if (selectedCategory === 'All') return lessons;
    return lessons.filter((lesson) => (lesson.category || 'General') === selectedCategory);
  }, [lessons, selectedCategory]);

  const lesson = filteredLessons.find((item) => item._id === selectedLessonId) || filteredLessons[0];

  useEffect(() => {
    if (lesson && lesson._id !== selectedLessonId) {
      setSelectedLessonId(lesson._id);
    }
  }, [lesson, selectedLessonId]);

  const markComplete = () => {
    if (!lesson) return;
    setProgress((prev) => ({ ...prev, [lesson._id]: true }));
  };

  const completedCount = Object.keys(progress).filter((key) => progress[key]).length;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
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
              { label: 'Overview', to: '/dashboard-learner' },
              { label: 'My Lessons', active: true },
              { label: 'My Quizzes', to: '/quiz' },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div className="animate-fadeInUp">
           
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Lessons</p>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3 gradient-text">Lessons</h1>
                <p className="text-gray-600 mt-3">Explore interactive lessons and track your learning progress.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/quiz" className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift">
                  Go to Quizzes
                </Link>
                <Link
                  to="/dashboard-learner"
                  className="border-2 border-primary text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover-lift"
                >
                  My Progress
                </Link>
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <p className="text-sm text-gray-500 mb-3">Categories</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedCategory(item)}
                    className={
                      item === selectedCategory
                        ? 'border-2 border-primary text-primary rounded-lg px-4 py-3 font-semibold text-left'
                        : 'border border-gray-200 rounded-lg px-4 py-3 text-gray-600 text-left hover:border-primary hover:text-primary transition'
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-[300px_1fr] gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold mb-4">Lessons</h3>
                <div className="grid gap-3 text-sm">
                  {filteredLessons.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => setSelectedLessonId(item._id)}
                      className={
                        item._id === lesson?._id
                          ? 'border-2 border-primary text-primary rounded-lg px-4 py-3 font-semibold text-left'
                          : 'border border-gray-200 rounded-lg px-4 py-3 text-gray-600 text-left hover:border-primary hover:text-primary transition'
                      }
                    >
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.category || 'General'}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                {lesson ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full">
                        {lesson.category || 'General'}
                      </span>
                      <span className="text-sm text-gray-500">{progress[lesson._id] ? 'Completed' : 'In progress'}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{lesson.title}</h2>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>

                    {Array.isArray(lesson.images) && lesson.images.length ? (
                      <img src={lesson.images[0]} alt={lesson.title} className="w-full h-56 object-cover rounded-lg mb-4" />
                    ) : null}

                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                      {lesson.content}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        id="mark-complete"
                        onClick={markComplete}
                        className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300"
                      >
                        {progress[lesson._id] ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No lesson selected.</p>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold mb-4">Course Progress</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <p className="text-sm text-gray-600">{percent}% complete</p>
                <div className="mt-4 text-xs text-gray-500">Complete lessons to unlock quizzes.</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold mb-4">Next Lessons</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {filteredLessons.slice(0, 3).map((item) => (
                    <li key={item._id} className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-gray-400">{progress[item._id] ? 'Done' : 'Locked'}</span>
                    </li>
                  ))}
                </ul>
                <button
                  id="continue-btn"
                  onClick={() => {
                    const idx = filteredLessons.findIndex((item) => item._id === lesson?._id);
                    const next = filteredLessons[idx + 1];
                    if (next) setSelectedLessonId(next._id);
                  }}
                  className="mt-6 w-full py-3 rounded-md font-semibold transition border-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


