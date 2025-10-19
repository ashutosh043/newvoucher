const mongoose = require('mongoose');


const voucherSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  wifiType: { type: String, enum: ['student', 'faculty'], required: true },
  isClaimed: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null }
});


module.exports = mongoose.model('Voucher', voucherSchema);