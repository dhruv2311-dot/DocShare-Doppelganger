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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if user is active
      if (user.status === 'inactive') {
        return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
      }

      // Generate OTP
      const otp = generateOTP();
      user.otpSecret = otp;
      await user.save();

      // Send Email
      try {
        await transporter.sendMail({
          from: `"DocShare" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'DocShare Login OTP',
          text: `Your OTP for DocShare login is: ${otp}. It is valid for 10 minutes.`
        });
        console.log(`✅ OTP email sent to ${user.email}`);
      } catch (emailErr) {
        console.error('❌ Email sending failed:', emailErr.message);
        return res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
      }

      res.status(200).json({
        message: 'OTP sent to your email.',
        userId: user._id
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please log in again.' });
    }

    if (user.otpSecret === String(otp)) {
      user.otpSecret = undefined; // Clear OTP after use
      user.mfaEnabled = true;
      await user.save();

      res.status(200).json({
        ...formatUserResponse(user),
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid or expired OTP. Please try again.' });
    }
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
