import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';
import { readJson, writeJson } from '../../../shared/utils/storage';

type QuizState = {
  completedQuizzes: Record<string, boolean>;
  scores: Record<string, number>;
};

type ActiveQuiz = {
  id: string;
  title: string;
  lessonTitle: string;
  passingScore: number;
  questions: { questionText: string; options: string[]; correctOptionIndex: number }[];
};

const storageKey = 'edulearn_quizzes';
const initialState: QuizState = { completedQuizzes: {}, scores: {} };

export default function Quiz() {
  const [state, setState] = useState<QuizState>(() => readJson(storageKey, initialState));
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.quizzes.list();
        if (!mounted) return;
        setQuizzes(res.data.quizzes || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load quizzes. Please log in.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openQuiz = (quiz: ActiveQuiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setResult('');
    setShowFeedback(false);
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      const payload = activeQuiz.questions.map((_, idx) => ({
        selectedOptionIndex: answers[idx] ?? -1
      }));
      const res = await api.quizzes.submit(activeQuiz.id, payload);
      const resultData = res.data.result;
      const percent = Math.round(resultData.percentage);
      setResult(`Score: ${resultData.score} (${percent}%)`);
      setShowFeedback(true);

      const next = {
        completedQuizzes: { ...state.completedQuizzes, [activeQuiz.id]: true },
        scores: { ...state.scores, [activeQuiz.id]: percent }
      };
      setState(next);
      writeJson(storageKey, next);
    } catch (err: any) {
      setResult(err?.message || 'Failed to submit quiz.');
    }
  };

  const summary = useMemo(() => {
    const total = quizzes.length;
    const completed = quizzes.filter((quiz) => state.completedQuizzes[quiz._id]).length;
    const scores = quizzes
      .map((quiz) => state.scores[quiz._id])
      .filter((value) => typeof value === 'number') as number[];
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const nextQuiz = quizzes.find((quiz) => !state.completedQuizzes[quiz._id]);
    return { completed, avg, next: nextQuiz?.title || 'All Quizzes Complete', total };
  }, [quizzes, state.completedQuizzes, state.scores]);

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
              { label: 'My Lessons', to: '/lesson' },
              { label: 'My Quizzes', active: true },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 animate-fadeInUp">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">{uiStore.quiz.eyebrow}</p>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3 gradient-text">Quizzes</h1>
                <p className="text-gray-600 mt-3 max-w-2xl">{uiStore.quiz.description}</p>
              </div>
              <div className="flex gap-3">
                <Link to="/dashboard-learner" className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift">
                  View Progress
                </Link>
                <Link
                  to="/lesson"
                  className="border-2 border-primary text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover-lift"
                >
                  Go to Lessons
                </Link>
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}

            <div className="grid md:grid-cols-3 gap-10">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="p-8 bg-white shadow-lg rounded-xl transition-all duration-500 group glass-effect border border-gray-100 animate-scaleIn hover:shadow-2xl hover-lift"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <i data-lucide="clipboard-check" className="w-6 h-6"></i>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full">
                      {quiz.lesson?.title || 'Lesson'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-all duration-300">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {quiz.questions?.length || 0} questions • Passing score {quiz.passingScore}%
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <i data-lucide="clock" className="w-4 h-4 text-primary"></i> 15 min
                    </span>
                    <span className="flex items-center gap-2">
                      <i data-lucide="sparkles" className="w-4 h-4 text-primary"></i> {quiz.questions?.length || 0} Qs
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      openQuiz({
                        id: quiz._id,
                        title: quiz.title,
                        lessonTitle: quiz.lesson?.title || 'Lesson',
                        passingScore: quiz.passingScore,
                        questions: quiz.questions || []
                      })
                    }
                    className="mt-6 w-full py-3 rounded-md font-semibold transition border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    {state.completedQuizzes[quiz._id] ? 'Retake Quiz' : 'Start Quiz'}
                  </button>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-10 animate-fadeInUp">
              <div className="bg-[#f5f8ff] border border-blue-100 rounded-xl p-6">
                <p className="text-sm uppercase tracking-widest text-primary font-semibold">Progress</p>
                <h4 className="text-xl font-bold mt-2">{summary.completed} of {summary.total} Quizzes</h4>
                <p className="text-gray-600 mt-2">
                  {summary.completed < summary.total
                    ? 'Finish lessons to unlock the next assessment.'
                    : 'All quizzes completed in this track.'}
                </p>
              </div>
              <div className="bg-[#f5f8ff] border border-blue-100 rounded-xl p-6">
                <p className="text-sm uppercase tracking-widest text-primary font-semibold">Average Score</p>
                <h4 className="text-xl font-bold mt-2">{summary.avg}%</h4>
                <p className="text-gray-600 mt-2">Keep a score above the passing threshold.</p>
              </div>
              <div className="bg-[#f5f8ff] border border-blue-100 rounded-xl p-6">
                <p className="text-sm uppercase tracking-widest text-primary font-semibold">Next Step</p>
                <h4 className="text-xl font-bold mt-2">{summary.next}</h4>
                <p className="text-gray-600 mt-2">Return to lessons to unlock more quizzes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeQuiz ? (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">{activeQuiz.lessonTitle}</p>
                <h3 className="text-2xl font-bold">{activeQuiz.title}</h3>
              </div>
              <button onClick={closeQuiz} className="text-gray-500 hover:text-primary">Close</button>
            </div>
            <div className="space-y-6">
              {activeQuiz.questions.map((q, idx) => (
                <div key={`${q.questionText}-${idx}`} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold mb-3">{idx + 1}. {q.questionText}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt, optIdx) => (
                      <label key={`${opt}-${optIdx}`} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`q${idx}`}
                          value={optIdx}
                          className="accent-primary"
                          checked={answers[idx] === optIdx}
                          onChange={() => setAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  {showFeedback ? (
                    <p className={`mt-2 text-sm ${answers[idx] === q.correctOptionIndex ? 'text-green-600' : 'text-red-600'}`}>
                      {answers[idx] === q.correctOptionIndex ? 'Correct' : `Incorrect. Correct answer: ${q.options[q.correctOptionIndex]}`}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">{result}</div>
              <button onClick={submitQuiz} className="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition">
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


