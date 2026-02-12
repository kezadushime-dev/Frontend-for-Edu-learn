import { withPaths, type AppRoute } from '../../app/route.types';
import LearnerDashboardPage from './pages/LearnerDashboardPage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import LearnerReportPage from './pages/LearnerReportPage';

export const learnerRoutes: AppRoute[] = [
  ...withPaths(LearnerDashboardPage, '/dashboard-learner', '/learner/dashboard'),
  ...withPaths(LessonPage, '/lesson', '/lesson/:id', '/learner/lessons', '/learner/lessons/:id'),
  ...withPaths(QuizPage, '/quiz', '/quiz/:id', '/learner/quizzes', '/learner/quizzes/:id'),
  ...withPaths(LearnerReportPage, '/report-card', '/learner/report-card')
];
