const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

/**
 * Generate access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    { 
      userId: user.id,
      agencyId: user.agency_id,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { 
      userId: user.id,
      agencyId: user.agency_id
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Store refresh token in database
 */
async function storeRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await db('refresh_tokens').insert({
    user_id: userId,
    token,
    expires_at: expiresAt
  });
}

/**
 * Remove refresh token from database
 */
async function removeRefreshToken(token) {
  await db('refresh_tokens').where({ token }).del();
}

/**
 * Clean expired refresh tokens
 */
async function cleanExpiredTokens() {
  await db('refresh_tokens')
    .where('expires_at', '<', new Date())
    .del();
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  removeRefreshToken,
  cleanExpiredTokens
};
