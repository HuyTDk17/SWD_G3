import * as quizApi from '../api/quizApi';

const getErrorMessage = (error) => {
  return error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Something went wrong';
};

const quizService = {
  async getQuizzes(courseId) {
    const response = await quizApi.getQuizzes(courseId);
    return response.data.data;
  },

  async getQuizById(courseId, id) {
    const response = await quizApi.getQuizById(courseId, id);
    return response.data.data;
  },

  async createQuiz(courseId, data) {
    const response = await quizApi.createQuiz(courseId, data);
    return response.data.data;
  },

  async updateQuiz(courseId, id, data) {
    const response = await quizApi.updateQuiz(courseId, id, data);
    return response.data.data;
  },

  async deleteQuiz(courseId, id) {
    const response = await quizApi.deleteQuiz(courseId, id);
    return response.data;
  },

  async startAttempt(courseId, id) {
    const response = await quizApi.startAttempt(courseId, id);
    return response.data.data;
  },

  async submitAttempt(courseId, id, attemptId, answers) {
    const response = await quizApi.submitAttempt(courseId, id, attemptId, answers);
    return response.data.data;
  },

  async getAttemptResult(courseId, id, attemptId) {
    const response = await quizApi.getAttemptResult(courseId, id, attemptId);
    return response.data.data;
  },

  getErrorMessage
};

export default quizService;
