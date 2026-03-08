const nodemailer = require('nodemailer');

// Test Gmail App Password and SMTP connection
const testGmailConnection = async () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('🧪 Testing Gmail SMTP Connection...');
  console.log('📧 Email User:', emailUser || 'NOT SET');
  console.log('🔑 Password Length:', emailPass ? emailPass.length : 0);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  
  if (!emailUser || !emailPass) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set');
    return false;
  }
  
  // Check if password looks like App Password (16 characters)
  if (emailPass.length !== 16) {
    console.error('❌ EMAIL_PASS does not look like a Gmail App Password (should be 16 characters)');
    console.error('💡 Generate App Password: https://myaccount.google.com/apppasswords');
    return false;
  }
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    debug: true,
    logger: true
  });
  
  try {
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection successful!');
    
    // Test sending an email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: `"DocShare Test" <${emailUser}>`,
      to: emailUser,
      subject: '🧪 Gmail SMTP Test',
      text: 'This is a test to verify Gmail SMTP is working.',
      html: '<p>This is a test to verify Gmail SMTP is working.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Gmail SMTP test failed:', error.message);
    console.error('🔧 Error Code:', error.code);
    console.error('📋 Command:', error.command);
    
    // Provide specific troubleshooting based on error
    if (error.code === 'EAUTH') {
      console.error('🚨 Authentication failed - likely wrong App Password');
      console.error('💡 Solution: Generate new App Password from Google Account settings');
    } else if (error.code === 'ECONNECTION') {
      console.error('🚨 Connection failed - network or firewall issue');
      console.error('💡 Solution: Check if port 465 is open in production environment');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('🚨 Connection timeout - network issue');
      console.error('💡 Solution: Check network connectivity and DNS resolution');
    }
    
    return false;
  }
};

module.exports = testGmailConnection;
