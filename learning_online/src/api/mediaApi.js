import axiosClient from './axiosClient';

const PREFIX = '/api/v1/media';

const mediaApi = {
  getConfig: () => axiosClient.get(`${PREFIX}/config`),
  upload: (formData) => axiosClient.post(`${PREFIX}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  signedUpload: (payload) => axiosClient.post(`${PREFIX}/signed-upload`, payload),
  confirm: (payload) => axiosClient.post(`${PREFIX}/confirm`, payload),
  getById: (id) => axiosClient.get(`${PREFIX}/${id}`),
  delete: (id) => axiosClient.delete(`${PREFIX}/${id}`)
};

export default mediaApi;
