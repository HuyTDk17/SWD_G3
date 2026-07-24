import axiosClient from "./axiosClient";

export const enrollCourse = (courseId) => {
  return axiosClient.post("/api/v1/enrollments/enroll", { courseId });
};

export const getEnrolledCourses = () => {
  return axiosClient.get("/api/v1/enrollments/my");
};

export const unenrollCourse = (enrollmentId) => {
  return axiosClient.delete(`/api/v1/enrollments/${enrollmentId}`);
};

export const togglePin = (enrollmentId) => {
  return axiosClient.patch(`/api/v1/enrollments/${enrollmentId}/pin`);
};

export const joinWaitlist = (courseId) => {
  return axiosClient.post("/api/v1/enrollments/waitlist", { courseId });
};

export const getMyWaitlist = () => {
  return axiosClient.get("/api/v1/enrollments/waitlist/my");
};

export const leaveWaitlist = (waitlistId) => {
  return axiosClient.delete(`/api/v1/enrollments/waitlist/${waitlistId}`);
};