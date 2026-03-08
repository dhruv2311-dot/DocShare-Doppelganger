const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/otpGenerator');
const transporter = require('../config/mailer');

const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    filesCount: user.filesCount,
    joinedAt: user.joinedAt,
    avatar: user.avatar,
    mfaEnabled: user.mfaEnabled
  };
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    // ── Input validation ──────────────────────────────────────────
    if (!name || !email || !password) {
      console.log('Register validation failed - missing fields. Body:', JSON.stringify(req.body));
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const allowedRoles = ['Administrator', 'Partner', 'Client'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
    }
    // ─────────────────────────────────────────────────────────────

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    // Create Avatar initials from name
    const initials = name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'Client',
      avatar: initials
    });

    res.status(201).json(formatUserResponse(user));
  } catch (error) {
    console.error('Register error:', error.message);
    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error. Please try again.', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Input validation ──────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // ─────────────────────────────────────────────────────────────

    // .lean() gives a plain JS object — faster than a full Mongoose document
    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    // ── STEP 1: Save OTP to DB (fast ~50ms) ──────────────────────────────
    await User.updateOne(
      { _id: user._id },
      { $set: { otpSecret: otp, otpExpiry } }
    );

    // ── STEP 2: Respond IMMEDIATELY — don't wait for email ───────────────
    res.status(200).json({ message: 'OTP sent to your email.', userId: user._id });

    // ── STEP 3: Send email in background (fire-and-forget) ───────────────
    // This runs AFTER the response is already sent to the client.
    transporter.sendMail({
      from: `"DocShare" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your DocShare Login OTP',
      text: `Your OTP for DocShare login is: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#0F172A">DocShare Login Code</h2>
          <p style="color:#475569">Use the code below to complete your sign-in:</p>
          <div style="background:#F1F5F9;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#C9A227;font-family:monospace">${otp}</span>
          </div>
          <p style="color:#94A3B8;font-size:13px">Valid for 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `
    }).then(() => {
      console.log(`✅ OTP email sent to ${user.email}`);
    }).catch((emailErr) => {
      console.error('❌ Email sending failed:', emailErr.message);
      // Fallback: log OTP so login still works during email outages
      console.log(`🔑 OTP fallback for ${user.email}: ${otp}`);
    });
    // ─────────────────────────────────────────────────────────────────────
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.', error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // ── Input validation ──────────────────────────────────────────
    if (!userId || !otp) {
      return res.status(400).json({ message: 'userId and otp are required.' });
    }
    // ─────────────────────────────────────────────────────────────

    // Verify OTP first with a lean read, then do a single targeted update
    const existing = await User.findById(userId).select('otpSecret otpExpiry status').lean();

    if (!existing) {
      return res.status(404).json({ message: 'User not found. Please log in again.' });
    }

    // Check OTP expiry
    if (existing.otpExpiry && new Date() > new Date(existing.otpExpiry)) {
      return res.status(401).json({ message: 'OTP has expired. Please login again to get a new code.' });
    }

    if (existing.otpSecret !== String(otp)) {
      return res.status(401).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Atomically clear OTP fields and set mfaEnabled, return updated doc
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { otpSecret: 1, otpExpiry: 1 }, $set: { mfaEnabled: true } },
      { new: true, lean: true }
    );

    res.status(200).json({
      ...formatUserResponse(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('OTP error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP
};
