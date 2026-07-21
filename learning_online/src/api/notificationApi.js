import axiosClient from "./axiosClient";

export const getMyNotifications = () => {
  return axiosClient.get("/api/v1/notifications");
};

export const markAsRead = (id) => {
  return axiosClient.patch(`/api/v1/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return axiosClient.post("/api/v1/notifications/read-all");
};

export const getPreferences = () => {
  return axiosClient.get("/api/v1/notifications/preferences");
};

export const updatePreferences = (data) => {
  return axiosClient.put("/api/v1/notifications/preferences", data);
};
