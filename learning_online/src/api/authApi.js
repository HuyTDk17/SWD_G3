import axiosClient from './axiosClient';
import { AUTH_API_PREFIX } from '../config/env';

const authApi = {
  register(payload) {
    return axiosClient.post(`${AUTH_API_PREFIX}/register`, payload);
  },

  verifyOtp(payload) {
    return axiosClient.post(`${AUTH_API_PREFIX}/verify-otp`, payload);
  },

  resendOtp(payload) {
    return axiosClient.post(`${AUTH_API_PREFIX}/resend-otp`, payload);
  },

  login(payload) {
    return axiosClient.post(`${AUTH_API_PREFIX}/login`, payload);
  },

  googleLogin(credential) {
    return axiosClient.post(`${AUTH_API_PREFIX}/google`, { credential });
  },

  refresh() {
    return axiosClient.post(`${AUTH_API_PREFIX}/refresh`);
  },

  logout() {
    return axiosClient.post(`${AUTH_API_PREFIX}/logout`);
  },

  forgotPassword(payload) {
    return axiosClient.post(`${AUTH_API_PREFIX}/forgot-password`, payload);
  },

  resetPassword(payload) {
    return axiosClient.post(`${AUTH_API_PREFIX}/reset-password`, payload);
  },

  getMe() {
    return axiosClient.get(`${AUTH_API_PREFIX}/me`);
  }
};

export default authApi;
