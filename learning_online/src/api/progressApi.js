import axiosClient from "./axiosClient";

export const getProgress = (courseId) => {
  return axiosClient.get(`/api/v1/courses/${courseId}/progress`);
};
