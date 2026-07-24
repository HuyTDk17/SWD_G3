const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const otpTokenRepository = require('../repositories/otpTokenRepository');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { hashValue } = require('../utils/hashValue');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOtpCode
} = require('../utils/generateToken');
const { ROLES } = require('../constants/roles');
const { USER_STATUS } = require('../constants/userStatus');
const ERROR_CODES = require('../constants/errorCodes');
const ValidationError = require('../exceptions/ValidationError');
const UnauthorizedError = require('../exceptions/UnauthorizedError');
const ForbiddenError = require('../exceptions/ForbiddenError');
const NotFoundError = require('../exceptions/NotFoundError');
const ConflictError = require('../exceptions/ConflictError');
const OtpToken = require('../models/OtpToken');
const emailHelper = require('../utils/emailHelper');
const { OAuth2Client } = require('google-auth-library');
const { OTP_TYPES } = OtpToken;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  avatar: user.avatar,
  avatarAssetId: user.avatarAssetId || null,
  bio: user.bio,
  isEmailVerified: user.isEmailVerified,
  status: user.status
});

const validatePassword = (password) => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new ValidationError('Password does not meet requirements', [
      { field: 'password', message: 'Min 8 chars, 1 uppercase, 1 number, 1 symbol' }
    ]);
  }
};

const createOtpForUser = async (userId, type) => {
  await otpTokenRepository.invalidateByUserAndType(userId, type);
  const code = generateOtpCode();
  await otpTokenRepository.create({
    userId,
    codeHash: hashValue(code),
    type,
    expiresAt: new Date(Date.now() + OTP_TTL_MS)
  });
  return code;
};

const OTP_EMAIL_COPY = {
  [OTP_TYPES.EMAIL_VERIFY]: {
    subject: 'Verify your email - Language Learning',
    heading: 'Confirm your email address',
    intro: 'Use the code below to verify your email and activate your account.'
  },
  [OTP_TYPES.PASSWORD_RESET]: {
    subject: 'Reset your password - Language Learning',
    heading: 'Reset your password',
    intro: 'Use the code below to reset your password. If you did not request this, you can ignore this email.'
  }
};

const sendOtpEmail = async ({ to, fullName, code, type }) => {
  const copy = OTP_EMAIL_COPY[type] || OTP_EMAIL_COPY[OTP_TYPES.EMAIL_VERIFY];
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';

  await emailHelper.sendEmail({
    to,
    subject: copy.subject,
    text: `${greeting} ${copy.intro} Your verification code is ${code}. It expires in 5 minutes.`,
    html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>${copy.heading}</h2>
      <p>${greeting}</p>
      <p>${copy.intro}</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 24px 0;">${code}</p>
      <p style="font-size: 13px; color: #777;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>`
  });
};

const issueTokenPair = async (user) => {
  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await refreshTokenRepository.create({
    userId: user._id,
    tokenHash: hashValue(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS)
  });

  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

const authService = {
  async register({ fullName, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('Email already registered', ERROR_CODES.EMAIL_ALREADY_REGISTERED);
    }

    validatePassword(password);
    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: ROLES.STUDENT,
      isEmailVerified: false
    });

    const code = await createOtpForUser(user._id, OTP_TYPES.EMAIL_VERIFY);
    await sendOtpEmail({ to: normalizedEmail, fullName: user.fullName, code, type: OTP_TYPES.EMAIL_VERIFY });

    return {
      userId: user._id,
      message: 'OTP sent to email'
    };
  },

  async verifyOtp({ email, otp }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    const otpRecord = await otpTokenRepository.findActiveByUserAndType(
      user._id,
      OTP_TYPES.EMAIL_VERIFY
    );

    if (!otpRecord) {
      throw new ValidationError('OTP has expired', null, ERROR_CODES.OTP_EXPIRED);
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      throw new ValidationError('Too many attempts, request a new code', null, ERROR_CODES.OTP_ATTEMPTS_EXCEEDED);
    }

    if (hashValue(otp) !== otpRecord.codeHash) {
      await otpTokenRepository.incrementAttempts(otpRecord._id);
      throw new ValidationError('Invalid OTP', null, ERROR_CODES.OTP_INVALID);
    }

    await otpTokenRepository.markUsed(otpRecord._id);
    await userRepository.updateById(user._id, { isEmailVerified: true });

    return { message: 'Email verified successfully' };
  },

  async resendOtp({ email }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    const code = await createOtpForUser(user._id, OTP_TYPES.EMAIL_VERIFY);
    await sendOtpEmail({ to: user.email, fullName: user.fullName, code, type: OTP_TYPES.EMAIL_VERIFY });

    return {
      message: 'OTP resent'
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new ForbiddenError('Account is not active', ERROR_CODES.FORBIDDEN);
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ForbiddenError('Account temporarily locked, try again later', ERROR_CODES.ACCOUNT_LOCKED);
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenError('Please verify your email before logging in', ERROR_CODES.EMAIL_NOT_VERIFIED);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const failedLoginCount = (user.failedLoginCount || 0) + 1;
      const updates = { failedLoginCount };

      if (failedLoginCount >= MAX_LOGIN_ATTEMPTS) {
        updates.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        updates.failedLoginCount = 0;
      }

      await userRepository.updateById(user._id, updates);
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    await userRepository.updateById(user._id, { failedLoginCount: 0, lockUntil: null });
    return issueTokenPair(user);
  },

  async loginWithGoogle({ credential }) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new UnauthorizedError('Google login is not configured', ERROR_CODES.GOOGLE_AUTH_FAILED);
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedError('Invalid Google credential', ERROR_CODES.GOOGLE_AUTH_FAILED);
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedError('Google account has no email', ERROR_CODES.GOOGLE_AUTH_FAILED);
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = await userRepository.findByGoogleId(payload.sub);

    if (!user) {
      user = await userRepository.findByEmail(normalizedEmail);

      if (user) {
        // Existing email/password account signing in with Google for the first time: link it.
        user = await userRepository.updateById(user._id, {
          googleId: payload.sub,
          isEmailVerified: true,
          avatar: user.avatar || payload.picture || null
        });
      } else {
        user = await userRepository.create({
          fullName: payload.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: null,
          googleId: payload.sub,
          role: ROLES.STUDENT,
          isEmailVerified: true,
          avatar: payload.picture || null
        });
      }
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new ForbiddenError('Account is not active', ERROR_CODES.FORBIDDEN);
    }

    return issueTokenPair(user);
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Invalid or expired refresh token', ERROR_CODES.INVALID_REFRESH_TOKEN);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', ERROR_CODES.INVALID_REFRESH_TOKEN);
    }

    const stored = await refreshTokenRepository.findByTokenHash(hashValue(refreshToken));
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token', ERROR_CODES.INVALID_REFRESH_TOKEN);
    }

    await refreshTokenRepository.revokeByTokenHash(hashValue(refreshToken));

    const user = await userRepository.findById(decoded.id);
    if (!user || user.status !== USER_STATUS.ACTIVE) {
      throw new UnauthorizedError('Invalid or expired refresh token', ERROR_CODES.INVALID_REFRESH_TOKEN);
    }

    return issueTokenPair(user);
  },

  async logout(refreshToken) {
    if (refreshToken) {
      await refreshTokenRepository.revokeByTokenHash(hashValue(refreshToken));
    }
    return { message: 'Logged out successfully' };
  },

  async forgotPassword({ email }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset OTP has been sent' };
    }

    const code = await createOtpForUser(user._id, OTP_TYPES.PASSWORD_RESET);
    await sendOtpEmail({ to: user.email, fullName: user.fullName, code, type: OTP_TYPES.PASSWORD_RESET });

    return {
      message: 'If the email exists, a reset OTP has been sent'
    };
  },

  async resetPassword({ email, otp, newPassword }) {
    validatePassword(newPassword);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }

    const otpRecord = await otpTokenRepository.findActiveByUserAndType(
      user._id,
      OTP_TYPES.PASSWORD_RESET
    );

    if (!otpRecord) {
      throw new ValidationError('OTP has expired', null, ERROR_CODES.OTP_EXPIRED);
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      throw new ValidationError('Too many attempts, request a new code', null, ERROR_CODES.OTP_ATTEMPTS_EXCEEDED);
    }

    if (hashValue(otp) !== otpRecord.codeHash) {
      await otpTokenRepository.incrementAttempts(otpRecord._id);
      throw new ValidationError('Invalid OTP', null, ERROR_CODES.OTP_INVALID);
    }

    await otpTokenRepository.markUsed(otpRecord._id);
    const passwordHash = await hashPassword(newPassword);
    await userRepository.updateById(user._id, { passwordHash, failedLoginCount: 0, lockUntil: null });
    await refreshTokenRepository.revokeAllForUser(user._id);

    return { message: 'Password reset successfully' };
  },

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    }
    return sanitizeUser(user);
  }
};

module.exports = authService;
