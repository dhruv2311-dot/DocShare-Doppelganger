const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/otpGenerator');
const { sendEmailWithRetry } = require('../config/mailer');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  filesCount: user.filesCount,
  joinedAt: user.joinedAt,
  avatar: user.avatar,
  mfaEnabled: user.mfaEnabled,
});

// ─── Register ─────────────────────────────────────────────────────────────────

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Invalid email address.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const allowedRoles = ['Administrator', 'Partner', 'Client'];
    if (role && !allowedRoles.includes(role))
      return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });

    // Run duplicate-check and bcrypt hash IN PARALLEL — saves ~200ms
    const normalizedEmail = email.toLowerCase().trim();
    const [userExists, hashedPassword] = await Promise.all([
      User.exists({ email: normalizedEmail }),   // lean existence check (no full doc)
      bcrypt.hash(password, 8),                  // rounds=8 is secure & fast
    ]);

    if (userExists)
      return res.status(400).json({ message: 'An account with this email already exists.' });

    const initials = name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'Client',
      avatar: initials,
    });

    res.status(201).json(formatUserResponse(user));
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === 11000)
      return res.status(400).json({ message: 'An account with this email already exists.' });
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    // Single lean read — only fetch the fields we actually need
    const user = await User
      .findOne({ email: email.toLowerCase().trim() })
      .select('password status _id email name')
      .lean();

    // Always run bcrypt even if user not found — prevents timing-based user enumeration
    const dummyHash = '$2b$08$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
    const isMatch = await bcrypt.compare(password, user?.password ?? dummyHash);

    if (!user || !isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.status === 'inactive')
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 min

    // Single DB write — save OTP inline (no extra round trip)
    await User.updateOne({ _id: user._id }, { $set: { otpSecret: otp, otpExpiry } });

    // ✅ Respond IMMEDIATELY to client — don't block on email
    res.status(200).json({ message: 'OTP sent to your email.', userId: user._id });

    // 📧 Send email in background with retry mechanism — runs AFTER response is sent
    const sendEmail = async () => {
      try {
        await sendEmailWithRetry({
          from: `"DocShare" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Your DocShare Login OTP',
          text: `Your OTP is: ${otp}\n\nValid for 10 minutes. Do not share it.`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
              <h2 style="color:#0F172A;margin-bottom:4px">DocShare Login Code</h2>
              <p style="color:#475569;margin-top:0">Enter this code to complete sign-in:</p>
              <div style="background:#F1F5F9;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
                <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#C9A227;font-family:monospace">${otp}</span>
              </div>
              <p style="color:#94A3B8;font-size:12px">Valid for 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
          `,
        });
        console.log(`✅ OTP sent successfully via email → ${user.email}`);
      } catch (error) {
        console.error('❌ Email sending failed after retries:', error.message);
        
        // In production, you might want to log to a monitoring service
        if (process.env.NODE_ENV === 'production') {
          console.error('🚨 Production Email Service Alert:', {
            timestamp: new Date().toISOString(),
            userEmail: user.email,
            error: error.message,
            otpProvided: otp
          });
        }
      }
    };

    // 🔑 ALWAYS show OTP in console as fallback (for both dev and production)
    console.log(`🔑 OTP CONSOLE FALLBACK [${user.email}]: ${otp}`);
    console.log(`⏰ OTP Valid until: ${otpExpiry.toISOString()}`);
    
    // Fire-and-forget email sending
    sendEmail().catch(err => console.error('Email service error:', err));

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp)
      return res.status(400).json({ message: 'userId and otp are required.' });

    const now = new Date();

    // Single atomic operation: find by id + otp + valid expiry, clear OTP, set mfaEnabled
    // If conditions don't match, findOneAndUpdate returns null → we know OTP is wrong/expired
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        otpSecret: String(otp),
        otpExpiry: { $gt: now },   // must not be expired
      },
      {
        $unset: { otpSecret: 1, otpExpiry: 1 },
        $set:   { mfaEnabled: true },
      },
      { new: true, lean: true }
    );

    if (!user) {
      // Check WHY it failed — better error messages
      const exists = await User.exists({ _id: userId });
      if (!exists)
        return res.status(404).json({ message: 'Session expired. Please log in again.' });

      const hasExpired = await User.exists({ _id: userId, otpExpiry: { $lte: now } });
      if (hasExpired)
        return res.status(401).json({ message: 'OTP has expired. Please log in again.' });

      return res.status(401).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    res.status(200).json({
      ...formatUserResponse(user),
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error('OTP verify error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = { registerUser, loginUser, verifyOTP };
