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
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create Avatar initials
    const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Client',
      avatar: initials
    });

    res.status(201).json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
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
      } catch(emailErr) {
        console.error('❌ Email sending failed:', emailErr.message);
        // In dev mode, print OTP to console so login still works
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔑 DEV MODE — OTP for ${user.email}: ${otp}`);
        }
      }

      res.status(200).json({ message: 'OTP sent to email', userId: user._id });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (user && user.otpSecret === otp) {
      user.otpSecret = undefined; // Clear OTP
      user.mfaEnabled = true;     // Mark MFA as verified/enabled
      await user.save();

      res.status(200).json({
        ...formatUserResponse(user),
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP
};
