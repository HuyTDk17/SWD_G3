import * as courseApi from '../api/courseApi';

const getErrorMessage = (error) => {
  return error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Something went wrong';
};

const courseService = {
  async getCourses(params) {
    const response = await courseApi.getCourses(params);
    return {
      items: response.data.data,
      meta: response.data.meta
    };
  },

  async getCourseById(id) {
    const response = await courseApi.getCourseById(id);
    return response.data.data;
  },

  async getCourseBySlug(slug) {
    const response = await courseApi.getCourseBySlug(slug);
    return response.data.data;
  },

  async createCourse(data) {
    const response = await courseApi.createCourse(data);
    return response.data.data;
  },

  async updateCourse(id, data) {
    const response = await courseApi.updateCourse(id, data);
    return response.data.data;
  },

  async deleteCourse(id) {
    const response = await courseApi.deleteCourse(id);
    return response.data;
  },

  async submitCourse(id) {
    const response = await courseApi.submitCourse(id);
    return response.data.data;
  },

  async approveCourse(id) {
    const response = await courseApi.approveCourse(id);
    return response.data.data;
  },

  async rejectCourse(id, rejectionReason) {
    const response = await courseApi.rejectCourse(id, rejectionReason);
    return response.data.data;
  },

  async publishCourse(id) {
    const response = await courseApi.publishCourse(id);
    return response.data.data;
  },

  async archiveCourse(id) {
    const response = await courseApi.archiveCourse(id);
    return response.data.data;
  },

  getErrorMessage
};

export default courseService;
