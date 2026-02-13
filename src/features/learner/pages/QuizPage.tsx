import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { uiStore } from '../../../shared/data/uiStore';
import { api } from '../../../shared/utils/api';
import { readJson, writeJson } from '../../../shared/utils/storage';

type QuizState = {
  completedQuizzes: Record<string, boolean>;
  scores: Record<string, number>;
};

type QuizQuestion = {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  image?: string;
  imageUrl?: string;
  imageURL?: string;
  questionImage?: string;
  media?: { url?: string };
  imageData?: { url?: string };
  optionImages?: string[];
  optionImageUrls?: string[];
  optionMedia?: Array<string | { url?: string }>;
};

type ActiveQuiz = {
  id: string;
  title: string;
  lessonId: string;
  lessonTitle: string;
  passingScore: number;
  questions: QuizQuestion[];
};

type RequestStatus = 'idle' | 'PENDING' | 'APPROVED' | 'REJECTED';

const storageKey = 'edulearn_quizzes';
const initialState: QuizState = { completedQuizzes: {}, scores: {} };

const getImageUrl = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested = record.url;
    if (typeof nested === 'string') return nested.trim();
  }
  return '';
};

const resolveQuestionImage = (question: QuizQuestion): string => {
  return (
    getImageUrl(question.image) ||
    getImageUrl(question.imageUrl) ||
    getImageUrl(question.imageURL) ||
    getImageUrl(question.questionImage) ||
    getImageUrl(question.media) ||
    getImageUrl(question.imageData)
  );
};

const resolveOptionImage = (question: QuizQuestion, optionIndex: number): string => {
  const sources: unknown[] = [
    Array.isArray(question.optionImages) ? question.optionImages[optionIndex] : null,
    Array.isArray(question.optionImageUrls) ? question.optionImageUrls[optionIndex] : null,
    Array.isArray(question.optionMedia) ? question.optionMedia[optionIndex] : null
  ];

  for (const source of sources) {
    const url = getImageUrl(source);
    if (url) return url;
  }

  return '';
};

const createActiveQuiz = (quiz: any): ActiveQuiz => ({
  id: String(quiz._id || quiz.id || ''),
  title: quiz.title || 'Untitled Quiz',
  lessonId: String(quiz.lesson?._id || quiz.lesson?.id || quiz._id || quiz.id || ''),
  lessonTitle: quiz.lesson?.title || quiz.lesson?.name || 'Lesson',
  passingScore: Number(quiz.passingScore || 0),
  questions: Array.isArray(quiz.questions) ? quiz.questions : []
});

export default function Quiz() {
  const { id: routeQuizId } = useParams<{ id?: string }>();
  const [state, setState] = useState<QuizState>(() => readJson(storageKey, initialState));
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestingReport, setRequestingReport] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<RequestStatus>('idle');
  const [reportMessage, setReportMessage] = useState('');
  const [reportRequestId, setReportRequestId] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    if (!routeQuizId || !quizzes.length) return;
    const target = quizzes.find((item) => (item._id || item.id) === routeQuizId);
    if (!target) return;
    setActiveQuiz(createActiveQuiz(target));
    setAnswers({});
    setResult('');
    setShowFeedback(false);
    setReportStatus('idle');
    setReportMessage('');
    setReportRequestId(undefined);
  }, [quizzes, routeQuizId]);

  const openQuiz = (quiz: ActiveQuiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setResult('');
    setShowFeedback(false);
    setReportStatus('idle');
    setReportMessage('');
    setReportRequestId(undefined);
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setAnswers({});
    setResult('');
    setShowFeedback(false);
    setReportStatus('idle');
    setReportMessage('');
    setReportRequestId(undefined);
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    const hasMissingAnswers = activeQuiz.questions.some((_, idx) => typeof answers[idx] !== 'number');
    if (hasMissingAnswers) {
      setResult('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setReportMessage('');
    try {
      const payload = activeQuiz.questions.map((_, idx) => ({
        selectedOptionIndex: Number(answers[idx])
      }));
      const res = await api.quizzes.submit(activeQuiz.id, payload);
      const resultData = res.data.result || {};
      const score = Number(resultData.score || 0);
      const percent = Math.round(Number(resultData.percentage || 0));
      const passed = Boolean(resultData.passed);
      setResult(`Score: ${score} (${percent}%) - ${passed ? 'Passed' : 'Not Passed'}`);
      setShowFeedback(true);

      const next = {
        completedQuizzes: { ...state.completedQuizzes, [activeQuiz.id]: true },
        scores: { ...state.scores, [activeQuiz.id]: percent }
      };
      setState(next);
      writeJson(storageKey, next);
    } catch (err: any) {
      setResult(err?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const requestReportPermission = async () => {
    if (!activeQuiz) return;

    setRequestingReport(true);
    setReportMessage('');
    try {
      const request = await api.reports.requestDownload({
        quizId: activeQuiz.id,
        quiz: activeQuiz.id,
        quizTitle: activeQuiz.title,
        courseId: activeQuiz.lessonId || activeQuiz.id,
        courseName: activeQuiz.lessonTitle
      });
      const status = (request?.status || 'PENDING') as RequestStatus;
      setReportStatus(status);
      setReportRequestId(request?.id);
      if (status === 'APPROVED') {
        setReportMessage('Report request approved. You can download now.');
      } else if (status === 'REJECTED') {
        setReportMessage('Report request was rejected. Please request again later.');
      } else {
        setReportMessage('Permission request sent. Waiting for approval.');
      }
    } catch (requestError: unknown) {
      const text = requestError instanceof Error ? requestError.message : 'Failed to request report permission.';
      setReportMessage(text);
    } finally {
      setRequestingReport(false);
    }
  };

  const downloadReport = async () => {
    if (!activeQuiz) return;

    setDownloadingReport(true);
    setReportMessage('');
    try {
      const result = await api.reports.downloadApprovedReport({
        requestId: reportRequestId,
        courseId: activeQuiz.lessonId || activeQuiz.id,
        quizId: activeQuiz.id
      });

      if (result.type === 'url') {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        const fileUrl = window.URL.createObjectURL(result.blob);
        const anchor = document.createElement('a');
        anchor.href = fileUrl;
        anchor.download = result.fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(fileUrl);
      }

      setReportMessage('Report downloaded successfully.');
    } catch (downloadError: unknown) {
      const text = downloadError instanceof Error ? downloadError.message : 'Could not download report.';
      setReportMessage(text);
    } finally {
      setDownloadingReport(false);
    }
  };

  const summary = useMemo(() => {
    const total = quizzes.length;
    const completed = quizzes.filter((quiz) => state.completedQuizzes[quiz._id || quiz.id]).length;
    const scores = quizzes
      .map((quiz) => state.scores[quiz._id || quiz.id])
      .filter((value) => typeof value === 'number') as number[];
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const nextQuiz = quizzes.find((quiz) => !state.completedQuizzes[quiz._id || quiz.id]);
    return { completed, avg, next: nextQuiz?.title || 'All Quizzes Complete', total };
  }, [quizzes, state.completedQuizzes, state.scores]);

  return (
    <div className="bg-[#f5f8ff] text-slate-800 min-h-screen">
      <TopBar />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Lessons', to: '/lesson' },
          { label: 'Quiz', to: '/quiz' },
          { label: 'Report Card', to: '/learner/report-card' }
        ]}
      />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar
            title="Learner"
            links={[
              { label: 'Overview', to: '/dashboard-learner' },
              { label: 'My Lessons', to: '/lesson' },
              { label: 'My Quizzes', active: true },
              { label: 'Report Card', to: '/learner/report-card' },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 animate-fadeInUp">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">{uiStore.quiz.eyebrow}</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 gradient-text">Quizzes</h1>
                <p className="text-gray-600 mt-3 max-w-2xl">{uiStore.quiz.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/dashboard-learner" className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift text-center">
                  View Progress
                </Link>
                <Link
                  to="/lesson"
                  className="border-2 border-primary text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover-lift text-center"
                >
                  Go to Lessons
                </Link>
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id || quiz.id}
                  className="p-6 bg-white shadow-lg rounded-xl transition-all duration-500 group glass-effect border border-gray-100 animate-scaleIn hover:shadow-2xl hover-lift"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-100 text-primary rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <i data-lucide="clipboard-check" className="w-6 h-6"></i>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full">
                      {quiz.lesson?.title || 'Lesson'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-all duration-300 break-words">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {quiz.questions?.length || 0} questions - Passing score {quiz.passingScore}%
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
                    onClick={() => openQuiz(createActiveQuiz(quiz))}
                    className="mt-6 w-full py-3 rounded-md font-semibold transition border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    {state.completedQuizzes[quiz._id || quiz.id] ? 'Retake Quiz' : 'Start Quiz'}
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">{activeQuiz.lessonTitle}</p>
                <h3 className="text-xl sm:text-2xl font-bold">{activeQuiz.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Passing score: {activeQuiz.passingScore}%</p>
              </div>
              <button onClick={closeQuiz} className="text-gray-500 hover:text-primary text-sm font-semibold">Close</button>
            </div>

            <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto flex-1">
              {activeQuiz.questions.map((q, idx) => {
                const questionImage = resolveQuestionImage(q);

                return (
                  <div key={`${q.questionText}-${idx}`} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <p className="font-semibold mb-3">{idx + 1}. {q.questionText}</p>

                    {questionImage ? (
                      <img
                        src={questionImage}
                        alt={`Question ${idx + 1}`}
                        className="mb-3 w-full max-h-60 object-contain rounded-md border border-gray-100 bg-gray-50"
                      />
                    ) : null}

                    <div className="grid gap-2">
                      {q.options.map((opt, optIdx) => {
                        const safeOptionImage = resolveOptionImage(q, optIdx);

                        return (
                          <label
                            key={`${opt}-${optIdx}`}
                            className="flex items-start gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm hover:bg-blue-50 transition"
                          >
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={optIdx}
                              className="accent-primary mt-0.5"
                              checked={answers[idx] === optIdx}
                              onChange={() => setAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                            />
                            <span className="flex-1">
                              <span className="block">{opt}</span>
                              {safeOptionImage ? (
                                <img
                                  src={safeOptionImage}
                                  alt={`Option ${optIdx + 1}`}
                                  className="mt-2 max-h-40 rounded-md border border-gray-100 object-contain bg-gray-50"
                                />
                              ) : null}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {showFeedback ? (
                      <p className={`mt-2 text-sm ${answers[idx] === q.correctOptionIndex ? 'text-green-600' : 'text-red-600'}`}>
                        {answers[idx] === q.correctOptionIndex ? 'Correct' : `Incorrect. Correct answer: ${q.options[q.correctOptionIndex]}`}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white space-y-2">
              <p className="text-xs text-gray-500">
                Answered {Object.keys(answers).length} of {activeQuiz.questions.length} questions
              </p>
              <p className="text-sm text-gray-700 min-h-5">{result}</p>
              {reportMessage ? <p className="text-sm text-primary">{reportMessage}</p> : null}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="bg-primary text-white px-5 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={requestReportPermission}
                    disabled={!showFeedback || requestingReport || submitting}
                    className="border border-primary text-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary hover:text-white transition disabled:opacity-60"
                  >
                    {requestingReport ? 'Requesting...' : 'Request Report Permission'}
                  </button>

                  <button
                    onClick={downloadReport}
                    disabled={!showFeedback || downloadingReport || reportStatus !== 'APPROVED'}
                    className="border border-primary text-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary hover:text-white transition disabled:opacity-60"
                  >
                    {downloadingReport ? 'Downloading...' : 'Download Report'}
                  </button>
                </div>
              </div>

              {showFeedback ? (
                <p className="text-xs text-gray-500">
                  Submit first, then request permission to download your report. Download is enabled after approval.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
