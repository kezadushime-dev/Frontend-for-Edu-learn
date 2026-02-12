import { withPaths, type AppRoute } from '../../app/route.types';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import InstructorLessonCreatePage from './pages/InstructorLessonCreatePage';
import InstructorLessonsPage from './pages/InstructorLessonsPage';
import InstructorQuizCreatePage from './pages/InstructorQuizCreatePage';
import InstructorQuizzesPage from './pages/InstructorQuizzesPage';
import LessonEditPage from './pages/LessonEditPage';
import LessonViewPage from './pages/LessonViewPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import QuizEditPage from './pages/QuizEditPage';

export const instructorRoutes: AppRoute[] = [
  ...withPaths(ManagerDashboardPage, '/dashboard-manager'),
  ...withPaths(InstructorDashboardPage, '/dashboard-instructor'),
  ...withPaths(InstructorLessonsPage, '/instructor/lessons'),
  ...withPaths(LessonViewPage, '/instructor/lessons/:id'),
  ...withPaths(InstructorLessonCreatePage, '/instructor/lesson-create'),
  ...withPaths(LessonEditPage, '/instructor/lesson-edit/:id', '/lesson-edit/:id'),
  ...withPaths(InstructorQuizzesPage, '/instructor/quizzes'),
  ...withPaths(InstructorQuizCreatePage, '/instructor/quiz-create'),
  ...withPaths(QuizEditPage, '/instructor/quiz-edit/:id', '/quiz-edit/:id')
];
