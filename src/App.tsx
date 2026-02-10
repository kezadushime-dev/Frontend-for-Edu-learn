import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardLearner from './pages/DashboardLearner';
// import DashboardLearnerIntegrated from './pages/DashboardInstructor';
import DashboardInstructor from './pages/DashboardInstructor';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import AdminUsers from './pages/AdminUsers';
import AdminLessons from './pages/AdminLessons';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminQuizAttempts from './pages/AdminQuizAttempts';
import LessonCreate from './pages/LessonCreate';
import QuizCreate from './pages/QuizCreate';
import { useLucide } from './utils/useLucide';


function App() {
  useLucide();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="home" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="dashboard-admin" element={<DashboardAdmin />} />
      <Route path="dashboard-learner" element={<DashboardLearner />} />
      <Route path="dashboard-instructor" element={<DashboardInstructor />} />

      <Route path="lesson" element={<Lesson />} />
      <Route path="quiz" element={<Quiz />} />

      <Route path="admin-users" element={<AdminUsers />} />
      <Route path="admin-lessons" element={<AdminLessons />} />
      <Route path="admin-quizzes" element={<AdminQuizzes />} />
      <Route path="admin-quiz-attempts" element={<AdminQuizAttempts />} />

      <Route path="lesson-create" element={<LessonCreate />} />
      <Route path="quiz-create" element={<QuizCreate />} />
 
      

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
