import axiosClient from "./axiosClient";

export const getQuizzes = (courseId) => {
  return axiosClient.get(`/api/v1/courses/${courseId}/quizzes`);
};

export const getQuizById = (courseId, id) => {
  return axiosClient.get(`/api/v1/courses/${courseId}/quizzes/${id}`);
};

export const createQuiz = (courseId, data) => {
  return axiosClient.post(`/api/v1/courses/${courseId}/quizzes`, data);
};

export const updateQuiz = (courseId, id, data) => {
  return axiosClient.put(`/api/v1/courses/${courseId}/quizzes/${id}`, data);
};

export const deleteQuiz = (courseId, id) => {
  return axiosClient.delete(`/api/v1/courses/${courseId}/quizzes/${id}`);
};

export const startAttempt = (courseId, id) => {
  return axiosClient.post(`/api/v1/courses/${courseId}/quizzes/${id}/attempts`);
};

export const submitAttempt = (courseId, id, attemptId, answers) => {
  return axiosClient.post(`/api/v1/courses/${courseId}/quizzes/${id}/attempts/${attemptId}/submit`, { answers });
};

export const getAttemptResult = (courseId, id, attemptId) => {
  return axiosClient.get(`/api/v1/courses/${courseId}/quizzes/${id}/attempts/${attemptId}`);
};
