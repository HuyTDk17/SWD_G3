import axiosClient from './axiosClient';

const PREFIX = '/api/v1/users';

const userApi = {
  getMe: () => axiosClient.get(`${PREFIX}/me`),
  updateMe: (payload) => axiosClient.patch(`${PREFIX}/me`, payload),
  setAvatar: (assetId) => axiosClient.patch(`${PREFIX}/me/avatar`, { assetId }),
  submitTeacherApplication: (payload) => axiosClient.post(`${PREFIX}/teacher-application`, payload),
  getMyTeacherApplication: () => axiosClient.get(`${PREFIX}/teacher-application`),
  listTeacherApplications: (params) => axiosClient.get(`${PREFIX}/teacher-applications`, { params }),
  reviewTeacherApplication: (id, payload) => (
    axiosClient.patch(`${PREFIX}/teacher-applications/${id}/review`, payload)
  ),
  listUsers: (params) => axiosClient.get(PREFIX, { params }),
  updateUserStatus: (id, status) => axiosClient.patch(`${PREFIX}/${id}/status`, { status }),
  updateUserRole: (id, role) => axiosClient.patch(`${PREFIX}/${id}/role`, { role })
};

export default userApi;
