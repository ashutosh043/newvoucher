// backend/routes/voucherRoutes.js
const express = require('express');
const router = express.Router();
const Voucher = require('../models/voucherSchema');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

/**
 * GET /api/voucher/public
 * Return a small list of unclaimed vouchers (for debugging / limited public view)
 */
router.get('/public', async (req, res) => {
  try {
    const vouchers = await Voucher.find({ isClaimed: false })
      .select('code wifiType assignedAt')
      .limit(100);
    return res.json({ success: true, vouchers });
  } catch (err) {
    console.error('GET /public error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch vouchers' });
  }
});

/**
 * POST /api/voucher/upload
 * Admin-only: upload CSV text
 * body:
 *  - csvData: string (either plain codes one-per-line or CSV lines like "code,wifiType")
 *  - wifiType: optional 'student'|'faculty' (if provided, applied to every code)
 */
// authenticateToken, authorizeAdmin
router.post('/upload', async (req, res) => {
  try {
    const { csvData, wifiType: providedWifiType } = req.body;
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ success: false, message: 'csvData is required' });
    }

    const lines = csvData
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    // If there's a header like "code,wifiType" ignore it
    if (lines.length > 0 && /^code[,;]/i.test(lines[0])) {
      lines.shift();
    }

    const toInsert = [];
    const codes = [];

    for (const line of lines) {
      // Support "CODE" or "CODE,TYPE"
      const parts = line.split(',').map(p => p.trim()).filter(Boolean);
      let code = parts[0];
      if (!code) continue;

      // prefer providedWifiType if present, else parse from CSV per-row, or default to 'student'
      let wifiType = providedWifiType ? providedWifiType.toLowerCase().trim() : (parts[1] || '').toLowerCase().trim();
      if (!wifiType) wifiType = 'student';

      if (!['student', 'faculty'].includes(wifiType)) {
        // skip invalid type rows
        console.warn(`Skipping row with invalid wifiType: ${line}`);
        continue;
      }

      code = code.toString();
      codes.push(code);
      toInsert.push({
        code: code,
        wifiType,
        isClaimed: false,
        assignedTo: null,
        assignedAt: null,
        expiresAt: null
      });
    }

    if (toInsert.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid voucher codes found in CSV' });
    }

    // Remove any that already exist
    const existing = await Voucher.find({ code: { $in: codes } }, 'code');
    const existingSet = new Set(existing.map(e => e.code));

    const filtered = toInsert.filter(v => !existingSet.has(v.code));
    if (filtered.length === 0) {
      return res.status(400).json({ success: false, message: 'All vouchers already exist' });
    }

    await Voucher.insertMany(filtered, { ordered: false });

    return res.json({ success: true, message: `${filtered.length} Vouchers Uploaded Successfully` });
  } catch (err) {
    console.error('POST /upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
});

/**
 * GET /api/voucher/all
 * Admin-only: return all vouchers (with assigned user email if populated)
 */
router.get('/all', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const vouchers = await Voucher.find().populate('assignedTo', 'email role');
    return res.json({ success: true, vouchers });
  } catch (err) {
    console.error('GET /all error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch vouchers' });
  }
});

module.exports = router;