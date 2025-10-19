const Voucher = require('../models/voucherSchema');
const User = require('../models/userSchema');

const MAX_VOUCHERS = 3;
const COOLDOWN_PERIOD_MONTHS = 3;
const VOUCHER_VALIDITY_MINUTES = 3;

function generateCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

async function getActiveVoucherCount(userId) {
  const now = new Date();
  const count = await Voucher.countDocuments({
    assignedTo: userId,
    expiresAt: { $gt: now },
  });
  return count;
}

async function getCooldownVouchers(userId) {
  const cooldownStart = new Date();
  cooldownStart.setMonth(cooldownStart.getMonth() - COOLDOWN_PERIOD_MONTHS);

  return await Voucher.find({
    assignedTo: userId,
    assignedAt: { $gte: cooldownStart },
  }).sort({ assignedAt: -1 });
}

// ----- Main Voucher Assignment Function -----
exports.assignNewVoucher = async (email, selectedRole, requestedForRole) => {
  // 1. Check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    // Auto-Create User if not exists
    user = new User({
      email,
      role: selectedRole,  // From OTP verification (student/teacher)
      vouchers: [],
      totalVouchersUsed: 0
    });
    await user.save();
  }

  // 2. Role Protection — Prevent Students from accessing Faculty WiFi
  if (user.role !== requestedForRole) {
    throw new Error(`Access Denied: You are registered as a ${user.role}, not allowed to access ${requestedForRole} WiFi`);
  }

  // 3. Check Cooldown & Limit
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - COOLDOWN_PERIOD_MONTHS);

  const recentVouchers = await Voucher.find({
    assignedTo: user._id,
    assignedAt: { $gte: threeMonthsAgo }
  });

  if (recentVouchers.length >= MAX_VOUCHERS) {
    throw new Error(`Limit reached: You already generated ${MAX_VOUCHERS} vouchers in the last ${COOLDOWN_PERIOD_MONTHS} months.`);
  }

  // 4. Assign New Voucher
  const expiresAt = new Date(now.getTime() + VOUCHER_VALIDITY_MINUTES * 60000);

  const newVoucher = new Voucher({
    code: generateCode(),
    expiresAt,
    assignedTo: user._id,
    assignedAt: now,
    status: 'assigned'
  });

  await newVoucher.save();

  // Update User Info
  user.vouchers.push(newVoucher._id);
  user.totalVouchersUsed += 1;
  await user.save();

  return newVoucher;
};

// Remaining Voucher Count
exports.getRemainingVoucherCount = async (userId) => {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - COOLDOWN_PERIOD_MONTHS);

  const recentVouchers = await Voucher.find({
    assignedTo: userId,
    assignedAt: { $gte: threeMonthsAgo }
  });

  return MAX_VOUCHERS - recentVouchers.length;
};

// Get All Vouchers (Admin)
exports.getAllVouchers = async () => {
  return await Voucher.find().populate('assignedTo', 'email role');
};

// Get Vouchers for a User
exports.getUserVouchers = async (userId) => {
  return await Voucher.find({ assignedTo: userId }).sort({ assignedAt: -1 });
};

// Get Active (Not Expired) Vouchers of a User
exports.getActiveUserVouchers = async (userId) => {
  const now = new Date();
  return await Voucher.find({
    assignedTo: userId,
    expiresAt: { $gt: now },
  }).sort({ assignedAt: -1 });
};