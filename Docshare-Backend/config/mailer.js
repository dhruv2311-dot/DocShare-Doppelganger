const nodemailer = require('nodemailer');

// Enhanced mailer configuration with error handling and logging
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  // Validate environment variables
  if (!emailUser || !emailPass) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in environment variables');
    throw new Error('Email credentials not configured');
  }
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 10000, // 10 seconds connection timeout
    greetingTimeout: 5000,    // 5 seconds greeting timeout
    socketTimeout: 10000,     // 10 seconds socket timeout
    auth: {
      user: emailUser,
      pass: emailPass
    },
    // Add debugging in production
    debug: process.env.NODE_ENV === 'production',
    logger: process.env.NODE_ENV === 'production'
  });
  
  // Verify connection on creation
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Mailer connection failed:', error);
      if (process.env.NODE_ENV === 'production') {
        console.error('🔧 Production Email Debug Info:', {
          user: emailUser,
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          nodeEnv: process.env.NODE_ENV
        });
      }
    } else {
      console.log('✅ Mailer server connection established');
    }
  });
  
  return transporter;
};

// Create and export transporter with error handling
const transporter = createTransporter();

// Enhanced sendMail function with retry logic
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  const retryDelay = 1000; // 1 second initial delay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully on attempt ${attempt} to ${mailOptions.to}`);
      return result;
    } catch (error) {
      console.error(`❌ Email send attempt ${attempt} failed:`, error.message);
      
      // Log detailed error info in production
      if (process.env.NODE_ENV === 'production') {
        console.error('🔧 Production Email Error Details:', {
          to: mailOptions.to,
          from: mailOptions.from,
          subject: mailOptions.subject,
          error: error.message,
          code: error.code,
          command: error.command,
          attempt: attempt,
          maxRetries: maxRetries
        });
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed to send email after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)));
    }
  }
};

module.exports = { transporter, sendEmailWithRetry };

