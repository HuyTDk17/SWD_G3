import axiosClient from "./axiosClient";

export const getAuditLogs = (page = 1, limit = 20) => {
  return axiosClient.get(`/api/v1/admin/audit-logs?page=${page}&limit=${limit}`);
};

export const getConfigs = () => {
  return axiosClient.get("/api/v1/admin/config");
};

export const updateConfig = (key, value) => {
  return axiosClient.patch("/api/v1/admin/config", { key, value });
};
