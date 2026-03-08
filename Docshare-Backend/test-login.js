// Test login flow to debug OTP issues
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function testLoginFlow() {
  console.log('🔍 Testing Login Flow Debug...\n');
  
  try {
    // Check if user exists
    const user = await User.findOne({ email: 'shubham.modi.cg@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found in database');
      console.log('💡 You need to register first with this email');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('📊 User details:', {
      id: user._id,
      name: user.name,
      role: user.role,
      status: user.status,
      mfaEnabled: user.mfaEnabled
    });
    
    // Test password verification
    const testPassword = 'testpassword123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    console.log('🔐 Password match:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
    
    if (!isMatch) {
      console.log('💡 Try with your actual password');
      return;
    }
    
    // Test OTP generation and email sending
    const generateOTP = require('./utils/otpGenerator');
    const { sendEmailWithRetry } = require('./config/mailer');
    
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log('\n🔧 Testing OTP Process...');
    console.log('🔑 Generated OTP:', otp);
    console.log('⏰ OTP Expiry:', otpExpiry.toISOString());
    
    // Save OTP to database
    await User.updateOne({ _id: user._id }, { $set: { otpSecret: otp, otpExpiry } });
    console.log('✅ OTP saved to database');
    
    // Test email sending
    console.log('\n📧 Sending OTP email...');
    try {
      const result = await sendEmailWithRetry({
        from: `DocShare <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
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
      
      console.log('✅ Email sent successfully!');
      console.log('📬 Message ID:', result.data?.id);
      console.log('📧 Sent to:', user.email);
      console.log('🔑 OTP for testing:', otp);
      
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      console.error('🔧 Full error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testLoginFlow().then(() => process.exit(0));
