const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection on startup
transporter.verify((error) => {
    if (error) {
        console.error('❌ Mailer connection failed:', error.message);
    } else {
        console.log('✅ Mailer ready — connected to smtp.gmail.com');
    }
});

module.exports = transporter;

