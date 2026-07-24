const ValidationError = require('../exceptions/ValidationError');

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const authValidators = {
  register: (body) => {
    const errors = [];
    if (!body.fullName || body.fullName.trim().length < 2) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    }
    if (!body.email || !isEmail(body.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!body.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }
    if (errors.length) throw new ValidationError('Validation failed', errors);
    return {
      fullName: body.fullName.trim(),
      email: body.email.trim(),
      password: body.password
    };
  },

  verifyOtp: (body) => {
    const errors = [];
    if (!body.email || !isEmail(body.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!body.otp || String(body.otp).length !== 6) {
      errors.push({ field: 'otp', message: '6-digit OTP is required' });
    }
    if (errors.length) throw new ValidationError('Validation failed', errors);
    return { email: body.email.trim(), otp: String(body.otp) };
  },

  resendOtp: (body) => {
    if (!body.email || !isEmail(body.email)) {
      throw new ValidationError('Validation failed', [{ field: 'email', message: 'Valid email is required' }]);
    }
    return { email: body.email.trim() };
  },

  login: (body) => {
    const errors = [];
    if (!body.email || !isEmail(body.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!body.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }
    if (errors.length) throw new ValidationError('Validation failed', errors);
    return { email: body.email.trim(), password: body.password };
  },

  googleLogin: (body) => {
    if (!body.credential || typeof body.credential !== 'string') {
      throw new ValidationError('Validation failed', [
        { field: 'credential', message: 'Google credential token is required' }
      ]);
    }
    return { credential: body.credential };
  },

  forgotPassword: (body) => {
    if (!body.email || !isEmail(body.email)) {
      throw new ValidationError('Validation failed', [{ field: 'email', message: 'Valid email is required' }]);
    }
    return { email: body.email.trim() };
  },

  resetPassword: (body) => {
    const errors = [];
    if (!body.email || !isEmail(body.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!body.otp || String(body.otp).length !== 6) {
      errors.push({ field: 'otp', message: '6-digit OTP is required' });
    }
    if (!body.newPassword) {
      errors.push({ field: 'newPassword', message: 'New password is required' });
    }
    if (errors.length) throw new ValidationError('Validation failed', errors);
    return {
      email: body.email.trim(),
      otp: String(body.otp),
      newPassword: body.newPassword
    };
  }
};

module.exports = authValidators;
