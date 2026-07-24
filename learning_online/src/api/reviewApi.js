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

export const updateReview = (reviewId, data) => {
  return axiosClient.patch(`/api/v1/reviews/${reviewId}`, data);
};

export const deleteReview = (reviewId) => {
  return axiosClient.delete(`/api/v1/reviews/${reviewId}`);
};

export const flagReview = (reviewId, reason) => {
  return axiosClient.post(`/api/v1/reviews/${reviewId}/flag`, { reason });
};

export const getFlaggedReviews = () => {
  return axiosClient.get("/api/v1/reviews/flagged");
};
