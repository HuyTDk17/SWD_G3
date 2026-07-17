import axiosClient from "./axiosClient";

export const enrollCourse = (data) => {
  return axiosClient.post("/enrollments/enroll", data);
};

// Đổi sang /student/:studentId để tránh conflict với route động
export const getEnrolledCourses = (studentId) => {
  return axiosClient.get(`/enrollments/student/${studentId}`);
};

export const unenrollCourse = (enrollmentId) => {
  return axiosClient.delete(`/enrollments/${enrollmentId}`);
};

export const togglePin = (enrollmentId) => {
  return axiosClient.patch(`/enrollments/${enrollmentId}/pin`);
};