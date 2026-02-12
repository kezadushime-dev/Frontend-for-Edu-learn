import { authService } from '../../features/auth/services/auth.api';
import { adminLessonService } from '../../features/admin/services/adminLesson.api';
import { adminQuizService } from '../../features/admin/services/adminQuiz.api';
import { adminService } from '../../features/admin/services/adminUser.api';
import { instructorLessonService } from '../../features/instructor/services/instructorLesson.api';
import { instructorQuizService } from '../../features/instructor/services/instructorQuiz.api';
import { learnerLessonService } from '../../features/learner/services/learnerLesson.api';
import { learnerQuizService } from '../../features/learner/services/learnerQuiz.api';
import { lessonService } from '../services/lesson.api';
import { quizService } from '../services/quiz.api';
import { ApiError } from '../services/apiBase';

export const api = {
  auth: authService,
  lessons: lessonService,
  quizzes: quizService,
  admin: {
    ...adminService,
    lessons: adminLessonService,
    quizzes: adminQuizService
  },
  instructor: {
    lessons: instructorLessonService,
    quizzes: instructorQuizService
  },
  learner: {
    lessons: learnerLessonService,
    quizzes: learnerQuizService
  }
};

export { ApiError };

