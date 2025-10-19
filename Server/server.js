require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const User = require('./models/userSchema');  // User Schema
const authRoutes = require('./routes/authRoute'); // ✅ For login, refresh, logout
const voucherRoutes = require('./routes/voucherRoutes');  // Voucher Routes (CSV Upload + Get All)
const otpRoutes = require('./routes/sendOtpRoute');
const userRoutes = require('./routes/userRoute');

const app = express();

// Middleware
app.use(cors({
  //  origin: 'http://localhost:5173',
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // ✅ Needed to send/receive cookies
}));

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

// DB Connect and Seeder
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // Admin Auto Seeder
        const existingAdmin = await User.findOne({ email: 'admin_super@jimsindia.org' });
        if (!existingAdmin) {
            const adminUser = new User({
                email: 'admin_super@jimsindia.org',
                role: 'admin',
                vouchers: [],
                totalVouchersUsed: 0
            });
            await adminUser.save();
            console.log('Admin User Created');
        } else {
            console.log('Admin Already Exists');
        }

        console.log('Dummy Users will now be created dynamically on OTP Verification');
    })
    .catch(err => console.error('MongoDB Connection Error', err));

// Routes

app.use('/api/auth', authRoutes);          // ✅ Auth routes: login, refresh, logout
app.use('/api/voucher', voucherRoutes);    // CSV Upload & Get All Vouchers APIs
app.use('/api/otp', otpRoutes);            // OTP Send + Verify
app.use('/api/user', userRoutes);          // User details, protected routes

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));