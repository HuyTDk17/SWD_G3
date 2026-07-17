const crypto = require('crypto');

const hashValue = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = { hashValue, generateRandomToken };
