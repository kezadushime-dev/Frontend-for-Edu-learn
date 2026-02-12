import { withPaths, type AppRoute } from '../../app/route.types';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLessonsPage from './pages/AdminLessonsPage';
import AdminLessonViewPage from './pages/AdminLessonViewPage';
import AdminQuizAttemptsPage from './pages/AdminQuizAttemptsPage';
import AdminQuizzesPage from './pages/AdminQuizzesPage';
import AdminQuizViewPage from './pages/AdminQuizViewPage';
import AdminReportRequestsPage from './pages/AdminReportRequestsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import LessonCreatePage from './pages/LessonCreatePage';
import QuizCreatePage from './pages/QuizCreatePage';

export const adminRoutes: AppRoute[] = [
  ...withPaths(AdminDashboardPage, '/dashboard-admin'),
  ...withPaths(AdminUsersPage, '/admin-users', '/admin/users'),
  ...withPaths(AdminLessonsPage, '/admin-lessons', '/admin/lessons'),
  ...withPaths(AdminLessonViewPage, '/admin-lessons/:id', '/admin/lessons/:id'),
  ...withPaths(AdminQuizzesPage, '/admin-quizzes', '/admin/quizzes'),
  ...withPaths(AdminQuizViewPage, '/admin-quizzes/:id', '/admin/quizzes/:id'),
  ...withPaths(AdminQuizAttemptsPage, '/admin-quiz-attempts', '/admin/quiz-attempts'),
  ...withPaths(AdminReportRequestsPage, '/admin-report-requests', '/admin/report-requests'),
  ...withPaths(LessonCreatePage, '/lesson-create', '/admin/lesson-create'),
  ...withPaths(QuizCreatePage, '/quiz-create', '/admin/quiz-create')
];
