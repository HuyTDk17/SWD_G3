import axiosClient from "./axiosClient";

export const getCourses = (params) => {
  return axiosClient.get("/api/v1/courses", { params });
};

export const getCourseById = (id) => {
  return axiosClient.get(`/api/v1/courses/${id}`);
};

export const getCourseBySlug = (slug) => {
  return axiosClient.get(`/api/v1/courses/slug/${slug}`);
};

export const createCourse = (data) => {
  return axiosClient.post("/api/v1/courses", data);
};

export const updateCourse = (id, data) => {
  return axiosClient.put(`/api/v1/courses/${id}`, data);
};

export const deleteCourse = (id) => {
  return axiosClient.delete(`/api/v1/courses/${id}`);
};

export const submitCourse = (id) => {
  return axiosClient.post(`/api/v1/courses/${id}/submit`);
};

export const approveCourse = (id) => {
  return axiosClient.post(`/api/v1/courses/${id}/approve`);
};

export const rejectCourse = (id, rejectionReason) => {
  return axiosClient.post(`/api/v1/courses/${id}/reject`, { rejectionReason });
};

export const publishCourse = (id) => {
  return axiosClient.post(`/api/v1/courses/${id}/publish`);
};

export const archiveCourse = (id) => {
  return axiosClient.post(`/api/v1/courses/${id}/archive`);
};