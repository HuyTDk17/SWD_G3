import * as lessonApi from '../api/lessonApi';

const getErrorMessage = (error) => {
  return error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Something went wrong';
};

const lessonService = {
  async getLessons(courseId) {
    const response = await lessonApi.getLessons(courseId);
    return response.data.data;
  },

  async getLessonById(courseId, id) {
    const response = await lessonApi.getLessonById(courseId, id);
    return response.data.data;
  },

  async createLesson(courseId, data) {
    const response = await lessonApi.createLesson(courseId, data);
    return response.data.data;
  },

  async updateLesson(courseId, id, data) {
    const response = await lessonApi.updateLesson(courseId, id, data);
    return response.data.data;
  },

  async deleteLesson(courseId, id) {
    const response = await lessonApi.deleteLesson(courseId, id);
    return response.data;
  },

  async reorderLessons(courseId, lessonIds) {
    const response = await lessonApi.reorderLessons(courseId, lessonIds);
    return response.data.data;
  },

  async completeLesson(courseId, id) {
    const response = await lessonApi.completeLesson(courseId, id);
    return response.data.data;
  },

  getErrorMessage
};

export default lessonService;
