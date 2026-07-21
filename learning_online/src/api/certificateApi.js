import axiosClient from "./axiosClient";

export const getMyCertificates = () => {
  return axiosClient.get("/api/v1/certificates/my");
};

export const verifyCertificate = (code) => {
  return axiosClient.get(`/api/v1/certificates/verify/${code}`);
};
