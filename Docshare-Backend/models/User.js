const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Administrator', 'Partner', 'Client'], 
    default: 'Client' 
  },
  mfaEnabled: { type: Boolean, default: false },
  otpSecret: { type: String },
  otpExpiry: { type: Date },   // OTP expiry timestamp
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinedAt: { type: Date, default: Date.now },
  avatar: { type: String, default: 'User' },
  filesCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);
