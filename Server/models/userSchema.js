const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student','faculty','admin'], required: true, default: 'student' },
  vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }],
  totalVouchersUsed: { type: Number, default: 0 },
  refreshTokens: [refreshTokenSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);