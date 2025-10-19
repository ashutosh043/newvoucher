const jwt = require('jsonwebtoken');

/**
 * Creates a JWT Access Token with a short expiration.
 * @param {Object} payload - Data to encode in the token (e.g. user info).
 * @returns {string} Signed JWT Access Token.
 */
const createAccessToken = (payload) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXP || '15m', // default to 15 minutes
  });
};

/**
 * Creates a JWT Refresh Token with a longer expiration.
 * @param {Object} payload - Data to encode in the token.
 * @returns {string} Signed JWT Refresh Token.
 */
const createRefreshToken = (payload) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXP || '7d', // default to 7 days
  });
};

module.exports = { createAccessToken, createRefreshToken };