const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/database');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  storeRefreshToken,
  removeRefreshToken 
} = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Login user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await db('users')
      .where({ email: email.toLowerCase(), active: true })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Return tokens and user info
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        agencyId: user.agency_id
      }
    });

    logger.info(`User logged in: ${user.email}`);
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await removeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if token exists in database
    const tokenRecord = await db('refresh_tokens')
      .where({ token: refreshToken })
      .where('expires_at', '>', new Date())
      .first();

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Refresh token expired or not found' });
    }

    // Get user
    const user = await db('users')
      .where({ id: decoded.userId, active: true })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Request password reset
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await db('users')
      .where({ email: email.toLowerCase(), active: true })
      .first();

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await db('users')
      .where({ id: user.id })
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires
      });

    // TODO: Send email with reset link
    // For now, just log it
    logger.info(`Password reset requested for ${email}. Token: ${resetToken}`);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password
 */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find user by reset token
    const user = await db('users')
      .where({ reset_token: token })
      .where('reset_token_expires', '>', new Date())
      .first();

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await db('users')
      .where({ id: user.id })
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null
      });

    logger.info(`Password reset for user ${user.email}`);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword
};
