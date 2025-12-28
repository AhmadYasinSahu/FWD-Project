const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateResetToken = () => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

const generateEmailVerificationToken = () => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

module.exports = { generateToken, generateResetToken, generateEmailVerificationToken };
