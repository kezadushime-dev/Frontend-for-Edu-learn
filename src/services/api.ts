import axios from 'axios';

const API_BASE_URL = 'https://backend-for-edulearn.onrender.com/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('edulearn_token');
  if (token) {
    // Remove quotes if token is stored as JSON string
    const cleanToken = token.replace(/^"|"$/g, '');
    return { Authorization: `Bearer ${cleanToken}` };
  }
  return {};
};

// Lessons
export const getLessons = async (instructorId?: string) => {
  const url = instructorId ? `${API_BASE_URL}/lessons?instructor=${instructorId}` : `${API_BASE_URL}/lessons`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data.data?.lessons || [];
};

export const getLessonByName = async (name: string) => {
  const lessons = await getLessons();
  return lessons.find((l: any) => l.title.toLowerCase().includes(name.toLowerCase()));
};

export const getLesson = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/lessons/${id}`, { headers: getAuthHeaders() });
  return response.data.data?.lesson || response.data;
};

export const createLesson = async (lessonData: any) => {
  const formData = new FormData();
  formData.append('title', lessonData.title || '');
  formData.append('description', lessonData.description || '');
  formData.append('content', lessonData.content || '');
  formData.append('category', lessonData.category || '');
  if (lessonData.order) formData.append('order', lessonData.order);
  
  if (lessonData.images) {
    if (Array.isArray(lessonData.images)) {
      lessonData.images.forEach((img: any) => {
        if (img instanceof File) {
          formData.append('images', img);
        }
      });
    } else if (lessonData.images instanceof FileList) {
      Array.from(lessonData.images as FileList).forEach((file) => {
        formData.append('images', file);
      });
    }
  }
  
  const response = await axios.post(`${API_BASE_URL}/lessons`, formData, { 
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } 
  });
  return response.data.data?.lesson || response.data;
};

export const updateLesson = async (lessonId: string, lessonData: any) => {
  const formData = new FormData();
  if (lessonData.title) formData.append('title', lessonData.title);
  if (lessonData.description) formData.append('description', lessonData.description);
  if (lessonData.content) formData.append('content', lessonData.content);
  if (lessonData.category) formData.append('category', lessonData.category);
  if (lessonData.order !== undefined) formData.append('order', lessonData.order);
  
  if (lessonData.images) {
    if (Array.isArray(lessonData.images)) {
      lessonData.images.forEach((img: any) => {
        if (img instanceof File) {
          formData.append('images', img);
        }
      });
    } else if (lessonData.images instanceof FileList) {
      Array.from(lessonData.images as FileList).forEach((file) => {
        formData.append('images', file);
      });
    }
  }
  
  const response = await axios.patch(`${API_BASE_URL}/lessons/${lessonId}`, formData, { 
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } 
  });
  return response.data.data?.lesson || response.data;
};

export const deleteLesson = async (lessonId: string) => {
  await axios.delete(`${API_BASE_URL}/lessons/${lessonId}`, { headers: getAuthHeaders() });
};

// Quizzes
export const getQuizzes = async (instructorId?: string) => {
  const url = instructorId ? `${API_BASE_URL}/quizzes?instructor=${instructorId}` : `${API_BASE_URL}/quizzes`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data.data?.quizzes || [];
};

export const createQuiz = async (quizData: any) => {
  const response = await axios.post(`${API_BASE_URL}/quizzes`, quizData, { 
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } 
  });
  return response.data.data?.quiz || response.data;
};

export const updateQuiz = async (quizId: string, quizData: any) => {
  const response = await axios.patch(`${API_BASE_URL}/quizzes/${quizId}`, quizData, { 
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } 
  });
  return response.data.data?.quiz || response.data;
};

export const deleteQuiz = async (quizId: string) => {
  await axios.delete(`${API_BASE_URL}/quizzes/${quizId}`, { headers: getAuthHeaders() });
};

// Analytics
export const getQuizAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/quizzes/analytics`, { headers: getAuthHeaders() });
    return response.data.data?.analytics || [];
  } catch (err) {
    console.error('Analytics error:', err);
    return [];
  }
};
