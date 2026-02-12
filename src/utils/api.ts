import { authService } from '../services/authService';
import { lessonService } from '../services/lessonService';
import { quizService } from '../services/quizService';
import { adminService } from '../services/adminService';
import { ApiError } from '../services/apiBase';

export const api = {
  auth: authService,
  lessons: lessonService,
  quizzes: quizService,
  admin: adminService
};

export { ApiError };
