import axiosClient from "./axiosClient";

export const getAiQuota = () => {
  return axiosClient.get("/api/v1/ai/quota");
};

export const getAiSessions = () => {
  return axiosClient.get("/api/v1/ai/sessions");
};

export const createAiSession = (type, targetLanguage) => {
  return axiosClient.post("/api/v1/ai/sessions", { type, targetLanguage });
};

export const getAiSession = (id) => {
  return axiosClient.get(`/api/v1/ai/sessions/${id}`);
};

export const sendAiMessage = (id, content) => {
  return axiosClient.post(`/api/v1/ai/sessions/${id}/messages`, { content });
};
