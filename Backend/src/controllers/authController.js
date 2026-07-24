const authService = require('../services/authService');
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest
} = require('../utils/authCookies');

const sendAuthResponse = (res, result, statusCode = 200) => {
  if (result.refreshToken) {
    setRefreshTokenCookie(res, result.refreshToken);
  }

  res.status(statusCode).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user,
      message: result.message,
      userId: result.userId
    }
  });
};

const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.validated);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const result = await authService.verifyOtp(req.validated);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async resendOtp(req, res, next) {
    try {
      const result = await authService.resendOtp(req.validated);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.validated);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  },

  async googleLogin(req, res, next) {
    try {
      const result = await authService.loginWithGoogle(req.validated);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = getRefreshTokenFromRequest(req);
      const result = await authService.refresh(refreshToken);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = getRefreshTokenFromRequest(req);
      const result = await authService.logout(refreshToken);
      clearRefreshTokenCookie(res);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.validated);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.validated);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
