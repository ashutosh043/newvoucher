// routes/authRoute.js
/**
 * Auth / OTP routes
 * - POST /api/auth/send-otp       -> send OTP email & store OTP in DB
 * - POST /api/auth/verify-otp     -> verify OTP, create user if needed, issue access + refresh tokens
 * - POST /api/auth/refresh-token  -> rotate refresh token, return new access token
 * - POST /api/auth/logout         -> revoke refresh token and clear cookie
 *
 * Improvements:
 * - Uses sendOtp utility to actually send OTP
 * - Uses ADMIN_EMAILS env var (comma separated) for admin accounts
 * - Deletes used OTP after successful verification
 * - Returns sanitized user object (no sensitive fields)
 * - Stores refresh tokens inside user document (rotation + limit)
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const sendOtpToEmail = require('../utils/sendOtp');
const Otp = require('../models/otpSchema');
const User = require('../models/userSchema');
const { createAccessToken, createRefreshToken } = require('../utils/generateToken');

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : ['admin_super@jimsindia.org'];

// ---------- Send OTP ----------
router.post('/send-otp', async (req, res) => {
  const { email, rollNumber } = req.body;

  if (!email || !rollNumber) {
    return res.status(400).json({ success: false, message: 'Email and Roll Number are required' });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await sendOtpToEmail(email, otp);

    await Otp.create({
      email,
      otp,
      rollNumber,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    return res.json({ success: true, message: 'OTP Sent' });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// ---------- Verify OTP (issue tokens) ----------
router.post('/verify-otp', async (req, res) => {
  const { email, otp, role } = req.body;

  if (role && !['student', 'faculty', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role selected' });
  }

  try {
    const otpStr = otp?.toString().trim();
    const validOtp = await Otp.findOne({
      email,
      otp: otpStr,
      expiresAt: { $gt: new Date() }
    });

    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or Expired OTP' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      user = new User({
        email,
        role: isAdmin ? 'admin' : role || 'student',
        vouchers: [],
        totalVouchersUsed: 0,
        refreshTokens: []
      });

      if (validOtp.rollNumber) user.rollNumber = validOtp.rollNumber;
      await user.save();
      console.log(`New user created: ${email} (${user.role})`);
    } else {
      if (role && user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: your account role is ${user.role}`
        });
      }
    }

    // Delete OTP after use
    try {
      await Otp.deleteOne({ _id: validOtp._id });
    } catch (e) {
      console.warn('Failed to delete OTP record:', e);
    }

    // Create tokens
    const payload = { userId: user._id, email: user.email, role: user.role };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Store refresh token in DB
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    if (user.refreshTokens.length > 10) user.refreshTokens.shift();
    await user.save();

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    const safeUser = { _id: user._id, email: user.email, role: user.role };

    return res.status(200).json({ success: true, user: safeUser, accessToken });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// ---------- Refresh token ----------
router.post('/refresh-token', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Unknown user' });

    const found = (user.refreshTokens || []).find(rt => rt.token === token);
    if (!found) return res.status(401).json({ success: false, message: 'Refresh token revoked' });

    // Rotate refresh token
    const newRefreshToken = createRefreshToken({ userId: user._id, email: user.email, role: user.role });

    user.refreshTokens = (user.refreshTokens || []).filter(rt => rt.token !== token);
    user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });
    if (user.refreshTokens.length > 10) user.refreshTokens.shift();
    await user.save();

    const accessToken = createAccessToken({ userId: user._id, email: user.email, role: user.role });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    return res.json({ success: true, accessToken });
  } catch (err) {
    console.error('refresh-token error:', err);
    return res.status(500).json({ success: false, message: 'Refresh failed' });
  }
});

// ---------- Logout ----------
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload.userId);
        if (user) {
          user.refreshTokens = (user.refreshTokens || []).filter(rt => rt.token !== token);
          await user.save();
        }
      } catch (e) {
        // Ignore invalid token
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    

    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

module.exports = router;