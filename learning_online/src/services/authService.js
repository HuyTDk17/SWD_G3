import authApi from '../api/authApi';
import { setAccessToken, clearAccessToken } from '../api/axiosClient';

const getErrorMessage = (error) => {
  return error.response?.data?.error?.message || error.message || 'Something went wrong';
};

const authService = {
  async register(payload) {
    const response = await authApi.register(payload);
    return response.data.data;
  },

  async verifyOtp(payload) {
    const response = await authApi.verifyOtp(payload);
    return response.data.data;
  },

  async resendOtp(payload) {
    const response = await authApi.resendOtp(payload);
    return response.data.data;
  },

  async login(payload) {
    const response = await authApi.login(payload);
    const { accessToken, user } = response.data.data;
    setAccessToken(accessToken);
    return { accessToken, user };
  },

  async googleLogin(credential) {
    const response = await authApi.googleLogin(credential);
    const { accessToken, user } = response.data.data;
    setAccessToken(accessToken);
    return { accessToken, user };
  },

  async refresh() {
    const response = await authApi.refresh();
    const { accessToken, user } = response.data.data;
    setAccessToken(accessToken);
    return { accessToken, user };
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      clearAccessToken();
    }
  },

  async forgotPassword(payload) {
    const response = await authApi.forgotPassword(payload);
    return response.data.data;
  },

  async resetPassword(payload) {
    const response = await authApi.resetPassword(payload);
    return response.data.data;
  },

  async getMe() {
    const response = await authApi.getMe();
    return response.data.data;
  },

  getErrorMessage
};

export default authService;
