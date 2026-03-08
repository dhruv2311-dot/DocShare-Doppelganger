# Email Service Debugging Guide

## 🚨 Production Email Issues - Debugging Steps

### 1. Environment Variables Verification
```bash
# Check if environment variables are set correctly
echo "EMAIL_USER: $EMAIL_USER"
echo "EMAIL_PASS: $EMAIL_PASS"  # Should be 16 characters
echo "NODE_ENV: $NODE_ENV"
```

### 2. Gmail App Password Setup
**CRITICAL**: Use App Password, NOT regular Gmail password

1. **Enable 2-Step Verification**:
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for the app
   - Select "Other (Custom name)" → Enter "DocShare Backend"
   - Copy the 16-character password (no spaces)

3. **Test App Password**:
   ```javascript
   // Test script
   const nodemailer = require('nodemailer');
   
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 465,
     secure: true,
     auth: {
       user: 'your_email@gmail.com',
       pass: 'your_16_char_app_password'
     }
   });
   
   transporter.verify().then(console.log).catch(console.error);
   ```

### 3. Common Gmail Issues & Solutions

#### Issue 1: "Authentication failed"
- **Cause**: Using regular password instead of App Password
- **Fix**: Generate new App Password from Google Account settings

#### Issue 2: "Connection timeout"
- **Cause**: Firewall blocking SMTP ports
- **Fix**: Ensure ports 465/587 are open in production environment

#### Issue 3: "Connection refused"
- **Cause**: Network restrictions or DNS issues
- **Fix**: Check network connectivity and DNS resolution

#### Issue 4: Gmail security blocking
- **Cause**: Suspicious activity detected by Google
- **Fix**: 
  - Check Gmail for security alerts
  - Allow less secure apps temporarily for testing
  - Use Google Workspace if available

### 4. Production Environment Checks

#### Network Connectivity Test:
```bash
# Test SMTP connectivity
telnet smtp.gmail.com 465
# Or using openssl
openssl s_client -connect smtp.gmail.com:465
```

#### DNS Resolution:
```bash
nslookup smtp.gmail.com
```

#### Firewall Rules:
```bash
# Check if SMTP ports are open
netstat -an | grep :465
netstat -an | grep :587
```

### 5. Alternative Email Services (Production-Ready)

If Gmail continues to fail, consider these alternatives:

#### SendGrid (Recommended)
```bash
npm install @sendgrid/mail
```
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

#### Mailgun
```bash
npm install mailgun-js
```

#### AWS SES
```bash
npm install aws-sdk
```

### 6. Monitoring & Alerting

#### Email Service Health Check:
```javascript
// Add to your monitoring system
const checkEmailService = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service healthy');
  } catch (error) {
    console.error('❌ Email service down:', error);
    // Send alert to monitoring system
  }
};
```

#### Log Analysis:
- Monitor error logs for email failures
- Track success/failure rates
- Set up alerts for high failure rates

### 7. Quick Production Fix Script

Create a test endpoint to verify email configuration:
```javascript
// Add to your routes for testing
app.post('/test-email', async (req, res) => {
  try {
    const result = await sendEmailWithRetry({
      to: req.body.email || process.env.EMAIL_USER,
      subject: 'Email Service Test',
      text: 'Email service is working correctly!'
    });
    res.json({ success: true, message: 'Test email sent', result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 8. Security Best Practices

1. **Never commit email credentials to git**
2. **Use environment-specific .env files**
3. **Rotate App Passwords regularly**
4. **Monitor for unusual email activity**
5. **Implement rate limiting for email sending**

### 9. Troubleshooting Checklist

- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated (16 characters)
- [ ] Environment variables set correctly
- [ ] SMTP ports open in production
- [ ] DNS resolution working
- [ ] No Gmail security alerts
- [ ] Enhanced error logging implemented
- [ ] Retry mechanism configured
- [ ] Monitoring system in place
