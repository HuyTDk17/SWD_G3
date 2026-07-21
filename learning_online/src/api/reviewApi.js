import axiosClient from "./axiosClient";

export const getCourseReviews = (courseId) => {
  return axiosClient.get(`/api/v1/courses/${courseId}/reviews`);
};

export const submitReview = (courseId, data) => {
  return axiosClient.post(`/api/v1/courses/${courseId}/reviews`, data);
};

export const getPendingReviews = () => {
  return axiosClient.get("/api/v1/reviews/pending");
};

export const moderateReview = (reviewId, status) => {
  return axiosClient.post(`/api/v1/reviews/${reviewId}/moderate`, { status });
};
