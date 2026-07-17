import axiosClient from "./axiosClient";

export const getCourses = () => {
  return axiosClient.get("/course/courses");
};

export const getCourseById = (id) => {
  return axiosClient.get(`/course/courses/${id}`);
};

export const createCourse = (data) => {
  return axiosClient.post("/course/courses", data);
};

export const updateCourse = (id, data) => {
  return axiosClient.put(`/course/courses/${id}`, data);
};

export const deleteCourse = (id) => {
  return axiosClient.delete(`/course/courses/${id}`);
};