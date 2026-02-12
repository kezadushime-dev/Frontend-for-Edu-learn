import { authService } from '../../core/auth/services/auth.api';
import { adminLessonService } from '../../roles/admin/services/adminLesson.api';
import { adminQuizService } from '../../roles/admin/services/adminQuiz.api';
import { adminService } from '../../roles/admin/services/adminUser.api';
import { instructorLessonService } from '../../roles/instructor/services/instructorLesson.api';
import { instructorQuizService } from '../../roles/instructor/services/instructorQuiz.api';
import { learnerLessonService } from '../../roles/learner/services/learnerLesson.api';
import { learnerQuizService } from '../../roles/learner/services/learnerQuiz.api';
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

