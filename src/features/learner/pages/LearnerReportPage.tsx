import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import ReportStatusBadge from '../../../components/ReportStatusBadge';
import { getUser, type AuthUser } from '../../auth/utils/auth.storage';
import {
  buildFeedbackComment,
  buildSubjectRows,
  calculateOverallAverage,
  formatReportDate,
  getPerformanceLevel,
  getSchoolYearLabel
} from '../../../shared/report/report.utils';
import type { ReportRequest } from '../../../shared/types/report';
import { api } from '../../../shared/utils/api';

type QuizListItem = {
  _id?: string;
  id?: string;
  title?: string;
  lesson?: {
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
  };
};

const getClassLevel = (user: AuthUser | null): string => {
  if (!user) return 'Digital Learning Level 1';
  const raw = user as AuthUser & { classLevel?: string; level?: string };
  return raw.classLevel || raw.level || 'Digital Learning Level 1';
};

const deriveCourseFromQuizzes = (quizzes: QuizListItem[]): { courseId: string; courseName: string; subjects: string[] } => {
  const subjects = Array.from(
    new Set(
      quizzes
        .map((item) => item.lesson?.title || item.lesson?.name || item.title || '')
        .map((subject) => subject.trim())
        .filter(Boolean)
    )
  );

  const firstQuiz = quizzes[0];
  return {
    courseId: firstQuiz?.lesson?._id || firstQuiz?.lesson?.id || 'general-course',
    courseName: firstQuiz?.lesson?.title || firstQuiz?.lesson?.name || 'General Course',
    subjects
  };
};

export default function LearnerReportPage() {
  const [analytics, setAnalytics] = useState<unknown[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [request, setRequest] = useState<ReportRequest | null>(null);
  const [manualComment, setManualComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setMessage('');

        const [analyticsRes, quizzesRes, requestRes, meRes] = await Promise.all([
          api.quizzes.analytics().catch(() => ({ data: { analytics: [] } })),
          api.quizzes.list().catch(() => ({ data: { quizzes: [] } })),
          api.reports.getLearnerRequest().catch(() => null),
          api.auth.me().catch(() => null)
        ]);

        if (!mounted) return;

        const fetchedUser = (meRes as AuthUser | null) || getUser();
        setUser(fetchedUser);
        setAnalytics((analyticsRes as { data?: { analytics?: unknown[] } }).data?.analytics || []);
        setQuizzes((quizzesRes as { data?: { quizzes?: QuizListItem[] } }).data?.quizzes || []);
        setRequest(requestRes);
      } catch (loadError: unknown) {
        if (!mounted) return;
        const text = loadError instanceof Error ? loadError.message : 'Failed to load report data.';
        setError(text);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const { courseId, courseName, subjects: fallbackSubjects } = useMemo(() => deriveCourseFromQuizzes(quizzes), [quizzes]);
  const subjectRows = useMemo(() => buildSubjectRows(analytics, fallbackSubjects), [analytics, fallbackSubjects]);
  const overallAverage = useMemo(() => calculateOverallAverage(subjectRows), [subjectRows]);
  const performanceLevel = useMemo(() => getPerformanceLevel(overallAverage), [overallAverage]);
  const automaticFeedback = useMemo(
    () => buildFeedbackComment(subjectRows, performanceLevel),
    [subjectRows, performanceLevel]
  );
  const finalFeedback = manualComment.trim() || automaticFeedback;
  const hasRequested = Boolean(request && (request.id || request.studentId));
  const status = hasRequested ? request?.status || 'PENDING' : 'PENDING';
  const canDownload = hasRequested && status === 'APPROVED';
  const generatedAt = request?.updatedAt || request?.createdAt || new Date().toISOString();
  const reportId = request?.id || `TEMP-${(user?._id || user?.id || 'LEARNER').slice(-6).toUpperCase()}`;

  const submitRequest = async () => {
    setRequesting(true);
    setError('');
    setMessage('');
    try {
      const updated = await api.reports.requestDownload({
        courseId,
        courseName,
        classLevel: getClassLevel(user)
      });
      setRequest(updated);
      setMessage('Download request submitted. Awaiting approval.');
    } catch (requestError: unknown) {
      const text = requestError instanceof Error ? requestError.message : 'Could not submit request.';
      setError(text);
    } finally {
      setRequesting(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    setError('');
    setMessage('');
    try {
      const result = await api.reports.downloadApprovedReport({ requestId: request?.id, courseId });

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

      setMessage('Report downloaded successfully.');
    } catch (downloadError: unknown) {
      const text = downloadError instanceof Error ? downloadError.message : 'Could not download report.';
      setError(text);
    } finally {
      setDownloading(false);
    }
  };

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
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-8">
          <Sidebar
            title="Learner"
            links={[
              { label: 'Overview', to: '/dashboard-learner' },
              { label: 'My Lessons', to: '/lesson' },
              { label: 'My Quizzes', to: '/quiz' },
              { label: 'Report Card', active: true },
              { label: 'Logout', to: '/login' }
            ]}
          />

          <div className="animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-primary uppercase font-semibold tracking-wider">Report Center</p>
                <h1 className="text-4xl font-extrabold gradient-text">Student Academic Report</h1>
                <p className="text-gray-600 mt-2">Preview your performance and request permission to download the official report.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Status:</span>
                <ReportStatusBadge status={status} />
              </div>
            </div>

            {loading ? <p className="text-gray-500 text-sm mb-6">Loading report data...</p> : null}
            {error ? <p className="text-red-600 text-sm mb-6">{error}</p> : null}
            {message ? <p className="text-green-600 text-sm mb-6">{message}</p> : null}

            <div className="rounded-2xl border border-blue-100 shadow-2xl overflow-hidden bg-white">
              <div className="relative bg-gradient-to-r from-[#0b3d91] via-[#1b5dbf] to-[#d4af37] text-white p-8">
                <div className="absolute top-4 right-6 text-white/70 text-4xl font-black">EDU LEARN</div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <i data-lucide="graduation-cap" className="w-8 h-8"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-wide">EDU LEARN</h2>
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Student Academic Report</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoItem label="Student Full Name" value={user?.name || 'Learner'} />
                  <InfoItem label="Course Name" value={courseName} />
                  <InfoItem label="Class/Level" value={getClassLevel(user)} />
                  <InfoItem label="School Year" value={getSchoolYearLabel()} />
                  <InfoItem label="Report ID" value={reportId} />
                  <InfoItem label="Date Generated" value={formatReportDate(generatedAt)} />
                </section>

                <section>
                  <h3 className="text-lg font-bold text-[#0b3d91] mb-3">Academic Performance</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold uppercase text-xs">Subject</th>
                          <th className="px-3 py-2 text-left font-bold uppercase text-xs">1st Term</th>
                          <th className="px-3 py-2 text-left font-bold uppercase text-xs">2nd Term</th>
                          <th className="px-3 py-2 text-left font-bold uppercase text-xs">3rd Term</th>
                          <th className="px-3 py-2 text-left font-bold uppercase text-xs">Total</th>
                          <th className="px-3 py-2 text-left font-bold uppercase text-xs">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectRows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                              No analytics data available yet.
                            </td>
                          </tr>
                        ) : (
                          subjectRows.map((row) => (
                            <tr key={row.subject} className="border-t border-gray-100">
                              <td className="px-3 py-2 font-medium">{row.subject}</td>
                              <td className="px-3 py-2">{row.firstTerm}</td>
                              <td className="px-3 py-2">{row.secondTerm}</td>
                              <td className="px-3 py-2">{row.thirdTerm}</td>
                              <td className="px-3 py-2 font-semibold">{row.total}</td>
                              <td className="px-3 py-2 font-semibold">{row.grade}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-xs uppercase tracking-wider text-primary font-bold">Performance Summary</p>
                    <p className="mt-2 text-2xl font-black text-[#0b3d91]">{overallAverage}%</p>
                    <p className="mt-1 text-sm text-gray-700">Overall Average Score</p>
                    <p className="mt-3 text-sm font-semibold text-[#0b3d91]">Performance Level: {performanceLevel}</p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-xs uppercase tracking-wider text-[#9a6b00] font-bold">Feedback</p>
                    <textarea
                      value={manualComment}
                      onChange={(event) => setManualComment(event.target.value)}
                      placeholder={automaticFeedback}
                      className="mt-3 w-full min-h-24 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <p className="mt-2 text-xs text-gray-600">Leave blank to use auto-generated feedback.</p>
                  </div>
                </section>

                <section className="rounded-xl border border-gray-200 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Approval Section</p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <InfoItem label="Approved By" value={request?.approvedByName || 'Pending approval'} compact />
                    <InfoItem label="Role" value={request?.approvedByRole || 'N/A'} compact />
                    <InfoItem label="Approval Date" value={formatReportDate(request?.updatedAt || null)} compact />
                  </div>
                  <p className="mt-4 text-sm text-gray-700">{finalFeedback}</p>
                </section>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={submitRequest}
                disabled={requesting || (hasRequested && status !== 'REJECTED')}
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {requesting
                  ? 'Submitting...'
                  : status === 'REJECTED'
                    ? 'Request Download Again'
                    : hasRequested
                      ? 'Request Submitted'
                      : 'Request Download'}
              </button>

              <button
                onClick={downloadReport}
                disabled={!canDownload || downloading}
                className="border-2 border-primary text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading ? 'Preparing...' : 'Download Report'}
              </button>

              <Link
                to="/dashboard-learner"
                className="px-6 py-3 rounded-md font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition text-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={compact ? '' : 'rounded-lg border border-gray-200 p-3'}>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 ${compact ? 'text-sm font-semibold text-gray-800' : 'text-base font-semibold text-gray-800'}`}>
        {value}
      </p>
    </div>
  );
}
