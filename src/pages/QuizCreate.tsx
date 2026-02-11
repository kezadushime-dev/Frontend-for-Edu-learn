<<<<<<< HEAD
﻿import { FormEvent, useState } from 'react';
=======
﻿import { useState } from 'react';
>>>>>>> admin
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../components/LayoutPieces';
import { Sidebar } from '../components/Sidebars';
import { api } from '../utils/api';

type QuestionForm = {
  questionText: string;
  options: string;
  correctOptionIndex: string;
  points: string;
};

export default function QuizCreate() {
  const navigate = useNavigate();
  const [lessonId, setLessonId] = useState('');
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [isActive, setIsActive] = useState('true');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { questionText: '', options: '', correctOptionIndex: '0', points: '1' }
  ]);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  const updateQuestion = (index: number, key: keyof QuestionForm, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [key]: value } : q)));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { questionText: '', options: '', correctOptionIndex: '0', points: '1' }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

<<<<<<< HEAD
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
=======
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
>>>>>>> admin
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        lesson: lessonId,
        title,
        passingScore: Number(passingScore),
        isActive: isActive === 'true',
        questions: questions.map((q) => ({
          questionText: q.questionText,
          options: q.options.split(',').map((opt) => opt.trim()).filter(Boolean),
          correctOptionIndex: Number(q.correctOptionIndex),
          points: Number(q.points)
        }))
      };
      await api.quizzes.create(payload);
      setMessage({ text: 'Quiz created successfully.', type: 'success' });
      window.setTimeout(() => navigate('/admin/quizzes'), 600);
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to create quiz.', type: 'error' });
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
          { label: 'Quizzes', to: '/admin/quizzes' },
          { label: 'Create Quiz', to: '/quiz-create', className: 'text-primary font-semibold' }
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
            <p className="text-primary uppercase font-semibold tracking-wider">POST /quizzes</p>
            <h1 className="text-3xl font-extrabold">Create Quiz</h1>
            <p className="text-gray-600 mt-2">Fields match the Quiz model.</p>
          </div>

          <form className="bg-white rounded-xl shadow-lg p-6 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Lesson ID</label>
                <input
                  type="text"
                  value={lessonId}
                  onChange={(event) => setLessonId(event.target.value)}
                  placeholder="Lesson ID"
                  required
                  className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Quiz title"
                    required
                    className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Passing Score</label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(event) => setPassingScore(event.target.value)}
                    placeholder="70"
                    className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Is Active</label>
                <select
                  value={isActive}
                  onChange={(event) => setIsActive(event.target.value)}
                  className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Questions</h3>
                <button type="button" onClick={addQuestion} className="text-primary font-semibold">
                  Add Question
                </button>
              </div>
              <div className="grid gap-4">
                {questions.map((question, index) => (
                  <div key={`q-${index}`} className="border border-gray-200 rounded-lg p-4 grid gap-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Question {index + 1}</p>
                      {questions.length > 1 ? (
                        <button type="button" className="text-red-600 text-sm" onClick={() => removeQuestion(index)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Question Text</label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(event) => updateQuestion(index, 'questionText', event.target.value)}
                        placeholder="Question"
                        required
                        className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Options (comma-separated)</label>
                      <input
                        type="text"
                        value={question.options}
                        onChange={(event) => updateQuestion(index, 'options', event.target.value)}
                        placeholder="A,B,C,D"
                        required
                        className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Correct Option Index</label>
                        <input
                          type="number"
                          value={question.correctOptionIndex}
                          onChange={(event) => updateQuestion(index, 'correctOptionIndex', event.target.value)}
                          placeholder="0"
                          className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(event) => updateQuestion(index, 'points', event.target.value)}
                          placeholder="1"
                          className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {message ? (
              <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
            ) : null}

            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md font-semibold disabled:opacity-60" disabled={loading}>
                {loading ? 'Saving...' : 'Save Quiz'}
              </button>
              <Link to="/admin/quizzes" className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
