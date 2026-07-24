const jwt = require('jsonwebtoken');
const { generateRandomToken } = require('./hashValue');

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

const generateAccessToken = (payload) => {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

const generateOtpCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOtpCode,
  generateRandomToken
};
