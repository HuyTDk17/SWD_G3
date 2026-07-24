import axiosClient from "./axiosClient";

export const getPublicConfig = () => {
  return axiosClient.get("/api/v1/config/public");
};
