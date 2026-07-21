import axiosClient from "./axiosClient";

export const getStudentDashboard = () => {
  return axiosClient.get("/api/v1/dashboard/student");
};

export const getTeacherDashboard = () => {
  return axiosClient.get("/api/v1/dashboard/teacher");
};

export const getAdminDashboard = () => {
  return axiosClient.get("/api/v1/dashboard/admin");
};

export const getAdminCSVExportUrl = () => {
  // Return the absolute link or handle via browser download stream
  return `${axiosClient.defaults.baseURL || ""}/api/v1/dashboard/admin/export`;
};
