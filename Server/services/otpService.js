const Otp = require('../models/otpSchema');
const sendOtpToEmail = require('../utils/sendOtp');

const sendOtpService = async (email, rollNumber) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await sendOtpToEmail(email, otp);
  await Otp.create({
    email,
    rollNumber,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  return otp;
};

module.exports = { sendOtpService };