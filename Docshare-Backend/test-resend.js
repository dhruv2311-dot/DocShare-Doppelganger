// Test script to verify Resend API is working
require('dotenv').config();
const { sendEmailWithRetry, testResendConnection } = require('./config/mailer');

async function testResend() {
  console.log('🧪 Testing Resend API Setup...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ CONFIGURED' : '❌ NOT SET');
  console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');
  
  try {
    // Test connection
    console.log('🔌 Testing Resend API connection...');
    const connectionResult = await testResendConnection();
    console.log('Connection test result:', connectionResult ? '✅ SUCCESS' : '❌ FAILED');
    console.log('');
    
    // Test sending email
    console.log('📧 Testing email sending...');
    const emailResult = await sendEmailWithRetry({
      from: `DocShare Test <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: process.env.RESEND_TEST_EMAIL || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      subject: '🧪 Resend API Test - DocShare Backend',
      text: 'This is a test email to verify Resend API is working correctly with DocShare backend.',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
          <h2 style="color:#0F172A;margin-bottom:4px">🧪 Resend API Test</h2>
          <p style="color:#475569">This is a test email to verify Resend API is working correctly with DocShare backend.</p>
          <div style="background:#F1F5F9;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
            <span style="font-size:24px;font-weight:700;color:#10B981">✅ SUCCESS</span>
          </div>
          <p style="color:#94A3B8;font-size:12px">If you receive this email, Resend API is properly configured!</p>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', emailResult.data?.id);
    console.log('📊 Response:', JSON.stringify(emailResult, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔧 Error details:', error);
  }
}

// Run the test
testResend();
