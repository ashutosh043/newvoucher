// backend/routes/userRoute.js
const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const Voucher = require('../models/voucherSchema');
const { authenticateToken } = require('../middlewares/authMiddleware');

const MAX_VOUCHERS = 3;
const COOLDOWN_MONTHS = 3;

// Detect role from email (strict JIMS patterns)
function getRoleFromEmail(email) {
  email = (email || '').toLowerCase().trim();

  // Students:
  const studentPatternJIMS1 = /^[a-z]+_[a-z]+_[a-z0-9]+@jimsindia\.org$/; // firstname_lastname_course23shift@jimsindia.org
  const studentPatternJIMS2 = /^[a-z]+_jims_[a-z0-9]+@jimsindia\.org$/;   // firstname_jims_course23shift@jimsindia.org

  // Faculty:
  const facultyPattern = /^[a-z]+(\.[a-z]+)?@jimsindia\.org$/;
  // now matches both "firstname.lastname@jimsindia.org" and "firstname@jimsindia.org"

  if (studentPatternJIMS1.test(email) || studentPatternJIMS2.test(email)) return 'student';
  if (facultyPattern.test(email)) return 'faculty';
  return null;
}

async function getRecentAssignedCount(userId) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - COOLDOWN_MONTHS);
  return await Voucher.countDocuments({
    assignedTo: userId,
    assignedAt: { $gte: threeMonthsAgo }
  });
}

// ---------- Get user info (Protected) ----------
router.post('/get-user', authenticateToken, async (req, res) => {
  try {
    const email = (req.user.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ success: false, message: 'Invalid token payload' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recentCount = await getRecentAssignedCount(user._id);
    const remaining = Math.max(0, MAX_VOUCHERS - recentCount);

    return res.json({
      success: true,
      totalVouchersUsed: user.totalVouchersUsed || 0,
      recentAssignedLast3Months: recentCount,
      remainingVouchers: remaining,
      role: user.role
    });
  } catch (err) {
    console.error('GET /get-user error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ---------- Assign Voucher (Protected) ----------
router.post('/assign', authenticateToken, async (req, res) => {
  try {
    const email = (req.user.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ success: false, message: 'Invalid token payload' });

    const derivedRole = getRoleFromEmail(email);
    if (!derivedRole) {
      return res.status(403).json({ success: false, message: 'Only JIMS college IDs are allowed' });
    }

    // Get or create user
    let user = await User.findOne({ email });
    if (!user) {
      // New user → set role from email pattern
      user = new User({
        email,
        role: derivedRole,
        vouchers: [],
        totalVouchersUsed: 0,
        refreshTokens: []
      });
      await user.save();
      console.log(`Auto-created user ${email} with role ${derivedRole}`);
    } else {
      // Existing user → DO NOT reject if frontend sent a different role
      // Keep the DB-stored role
      console.log(`Existing user ${email} logging in with role ${user.role} (derived: ${derivedRole})`);
    }

    // wifiType defaults to role
    let wifiType = (req.body.wifiType || '').toLowerCase().trim();
    if (!wifiType) wifiType = derivedRole;

    // Role-based restrictions
    const allowed = user.role === 'faculty' ? ['student', 'faculty'] : ['student'];
    if (!allowed.includes(wifiType)) {
      return res.status(403).json({ success: false, message: 'Not allowed to claim this WiFi type' });
    }

    // Limit vouchers to MAX_VOUCHERS per COOLDOWN_MONTHS
    const recentCount = await getRecentAssignedCount(user._id);
    if (recentCount >= MAX_VOUCHERS) {
      return res.status(400).json({
        success: false,
        message: `Voucher limit reached. You have ${recentCount} vouchers in the last ${COOLDOWN_MONTHS} months.`
      });
    }

    // Find available voucher
    const voucher = await Voucher.findOne({ wifiType, isClaimed: false });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'No vouchers available' });
    }

    // Assign voucher
    voucher.isClaimed = true;
    voucher.assignedTo = user._id;
    voucher.assignedAt = new Date();
    voucher.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await voucher.save();

    // Update user stats
    user.totalVouchersUsed = (user.totalVouchersUsed || 0) + 1;
    user.vouchers = user.vouchers || [];
    user.vouchers.push(voucher._id);
    await user.save();

    const remaining = Math.max(0, MAX_VOUCHERS - (recentCount + 1));

    return res.json({
      success: true,
      voucher: { code: voucher.code, wifiType: voucher.wifiType },
      remainingVouchers: remaining
    });

  } catch (err) {
    console.error('POST /assign error:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign voucher' });
  }
});

// Protected test route
router.get('/protected-test', authenticateToken, (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: req.user });
});

module.exports = router;