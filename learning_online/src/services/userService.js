import userApi from '../api/userApi';
import authService from './authService';

const unwrap = (response) => response.data.data;

const userService = {
  getMe: async () => unwrap(await userApi.getMe()),
  updateMe: async (payload) => unwrap(await userApi.updateMe(payload)),
  setAvatar: async (assetId) => unwrap(await userApi.setAvatar(assetId)),
  submitTeacherApplication: async (payload) => unwrap(await userApi.submitTeacherApplication(payload)),
  getMyTeacherApplication: async () => unwrap(await userApi.getMyTeacherApplication()),
  listTeacherApplications: async (params = {}) => {
    const response = await userApi.listTeacherApplications(params);
    return { items: response.data.data, meta: response.data.meta };
  },
  reviewTeacherApplication: async (id, payload) => (
    unwrap(await userApi.reviewTeacherApplication(id, payload))
  ),
  listUsers: async (params = {}) => {
    const response = await userApi.listUsers(params);
    return { items: response.data.data, meta: response.data.meta };
  },
  updateUserStatus: async (id, status) => unwrap(await userApi.updateUserStatus(id, status)),
  updateUserRole: async (id, role) => unwrap(await userApi.updateUserRole(id, role)),
  getErrorMessage: authService.getErrorMessage
};

export default userService;
