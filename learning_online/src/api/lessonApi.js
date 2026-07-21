import axiosClient from "./axiosClient";

export const getLessons = (courseId) => {
  return axiosClient.get(`/api/v1/courses/${courseId}/lessons`);
};

export const getLessonById = (courseId, id) => {
  return axiosClient.get(`/api/v1/courses/${courseId}/lessons/${id}`);
};

export const createLesson = (courseId, data) => {
  return axiosClient.post(`/api/v1/courses/${courseId}/lessons`, data);
};

export const updateLesson = (courseId, id, data) => {
  return axiosClient.put(`/api/v1/courses/${courseId}/lessons/${id}`, data);
};

export const deleteLesson = (courseId, id) => {
  return axiosClient.delete(`/api/v1/courses/${courseId}/lessons/${id}`);
};

export const reorderLessons = (courseId, lessonIds) => {
  return axiosClient.post(`/api/v1/courses/${courseId}/lessons/reorder`, { lessonIds });
};

export const completeLesson = (courseId, id) => {
  return axiosClient.post(`/api/v1/courses/${courseId}/lessons/${id}/complete`);
};
