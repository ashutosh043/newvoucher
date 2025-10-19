const express = require('express');
const router = express.Router();
const sendOtpToEmail = require('../utils/sendOtp');
const Otp = require('../models/otpSchema');
const User = require('../models/userSchema');
const { createAccessToken, createRefreshToken } = require('../utils/generateToken');

// ---- Send OTP ----
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  console.log('--- Send OTP Request ---');
  console.log('Email:', email);

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Send OTP email
    await sendOtpToEmail(email, otp);
    console.log(`OTP sent to ${email}: ${otp}`);

    // Save OTP in DB with 5 min expiry
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    });

    return res.json({ success: true, message: 'OTP Sent' });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// ---- Verify OTP (issue tokens) ----
// expects { email, otp, role }
router.post('/verify-otp', async (req, res) => {
  const { email, otp, role } = req.body;

  console.log('--- Verify OTP Request ---');
  console.log('Email:', email);
  console.log('OTP (raw):', otp);
  console.log('Role:', role);
  console.log('Current server time:', new Date());

  // Validate role
  if (!['student', 'faculty', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role selected' });
  }

  try {
    const otpStr = otp.toString().trim();

    // Find OTP in DB that matches email, otp and is not expired
    const validOtp = await Otp.findOne({
      email,
      otp: otpStr,
      expiresAt: { $gt: new Date() }
    });

    console.log('Valid OTP from DB:', validOtp);

    if (!validOtp) {
      console.log('OTP invalid or expired');
      return res.status(400).json({ success: false, message: 'Invalid or Expired OTP' });
    }

    // Find existing user or create new one
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        role,
        vouchers: [],
        totalVouchersUsed: 0,
        refreshTokens: []
      });
      await user.save();
      console.log(`New user created with email ${email} and role ${role}`);
    } else {
      // Check role matches
      if (user.role !== role) {
        console.log(`Role mismatch! User role: ${user.role}, Request role: ${role}`);
        return res.status(403).json({ success: false, message: `Access Denied: your account role is ${user.role}` });
      }
    }

    // Delete used OTP so it can't be reused
    await Otp.deleteOne({ _id: validOtp._id });
    console.log('OTP deleted after successful verification');

    // Create JWT tokens
    const payload = { userId: user._id, email: user.email, role: user.role };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Store refresh token in user document
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    if (user.refreshTokens.length > 10) user.refreshTokens.shift();
    await user.save();

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    console.log('Verification successful, tokens created and sent');
    return res.status(200).json({ success: true, user, accessToken });

  } catch (err) {
    console.error('Error in /verify-otp:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;