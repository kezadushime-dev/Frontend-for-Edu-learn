import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { api } from '../../../shared/utils/api';
import { useToast } from '../../../shared/hooks/useToast';

export default function InstructorQuizCreate() {
  const toast = useToast();
  const [lessonName, setLessonName] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [isActive, setIsActive] = useState(true);
  const [questionCount, setQuestionCount] = useState(1);
  const [questions, setQuestions] = useState([{
    questionText: '',
    image: '',
    options: [''],
    optionImages: [''],
    correctOptionIndex: 0,
    points: 1
  }]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.lessons.list();
        setLessons(res.data.lessons);
      } catch (err) {
        console.error('Failed to fetch lessons');
      }
    };
    fetchLessons();
  }, []);

  useEffect(() => {
    if (lessonName) {
      const found = lessons.find(l => l.title.toLowerCase().includes(lessonName.toLowerCase()));
      if (found) {
        setLessonId(found._id || found.id);
      }
    }
  }, [lessonName, lessons]);

  const handleQuestionCountChange = (count: number) => {
    setQuestionCount(count);
    const newQuestions = Array.from({ length: count }, (_, i) => 
      questions[i] || {
        questionText: '',
        image: '',
        options: [''],
        optionImages: [''],
        correctOptionIndex: 0,
        points: 1
      }
    );
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    updated[qIndex].optionImages.push('');
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId) {
      toast.error('Please select a valid lesson');
      return;
    }
    try {
      const quizData = {
        lesson: lessonId,
        title,
        questions: questions.map(q => ({
          questionText: q.questionText,
          image: q.image || undefined,
          options: q.options.filter(o => o.trim()),
          optionImages: q.optionImages.filter(o => o.trim()),
          correctOptionIndex: q.correctOptionIndex,
          points: q.points
        })),
        passingScore,
        isActive
      };
      await api.quizzes.create(quizData);
      toast.success('Quiz created successfully!');
      navigate('/instructor/quizzes');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create quiz');
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
            <p className="text-gray-600 mt-2">Choose how many questions to create (1-20)</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Lesson Name</label>
              <input 
                type="text" 
                value={lessonName} 
                onChange={(e) => setLessonName(e.target.value)} 
                className="w-full border rounded-md px-3 py-2" 
                placeholder="Type lesson name..."
                list="lessons-list"
                required 
              />
              <datalist id="lessons-list">
                {lessons.map(lesson => (
                  <option key={lesson._id || lesson.id} value={lesson.title} />
                ))}
              </datalist>
              {lessonId && (
                <p className="text-xs text-green-600 mt-1">âœ“ Lesson found (ID: {lessonId})</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Quiz Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Number of Questions</label>
                <select 
                  value={questionCount} 
                  onChange={(e) => handleQuestionCountChange(Number(e.target.value))} 
                  className="w-full border rounded-md px-3 py-2"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} Question{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Passing Score (%)</label>
                <input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} className="w-full border rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Active</label>
                <select value={isActive.toString()} onChange={(e) => setIsActive(e.target.value === 'true')} className="w-full border rounded-md px-3 py-2">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-bold mb-4">Questions ({questionCount})</h2>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4 mb-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Question {qIndex + 1}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Question Text</label>
                      <input type="text" value={q.questionText} onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)} className="w-full border rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Image URL (optional)</label>
                      <input type="text" value={q.image} onChange={(e) => updateQuestion(qIndex, 'image', e.target.value)} className="w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold">Options</label>
                        <button type="button" onClick={() => addOption(qIndex)} className="text-blue-600 text-sm font-semibold">+ Add Option</button>
                      </div>
                      {q.options.map((opt, oIndex) => (
                        <input key={oIndex} type="text" value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="w-full border rounded-md px-3 py-2 mb-2" required />
                      ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Correct Option Index</label>
                        <input type="number" value={q.correctOptionIndex} onChange={(e) => updateQuestion(qIndex, 'correctOptionIndex', Number(e.target.value))} className="w-full border rounded-md px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Points</label>
                        <input type="number" value={q.points} onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))} className="w-full border rounded-md px-3 py-2" required />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md font-semibold">Save Quiz</button>
              <Link to="/instructor/quizzes" className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold">Cancel</Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}


