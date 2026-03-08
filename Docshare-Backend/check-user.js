// Check user details and help with password reset
require('dotenv').config();
const User = require('./models/User');

async function checkUserAndReset() {
  console.log('🔍 Checking User Details...\n');
  
  try {
    // Find the user
    const user = await User.findOne({ email: 'shubham.modi.cg@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('📊 User details:', {
      id: user._id,
      name: user.name,
      role: user.role,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
      joinedAt: user.joinedAt
    });
    
    // Test with common passwords
    const testPasswords = [
      'testpassword123',
      'password123',
      '123456',
      'shubham123',
      'admin123'
    ];
    
    console.log('\n🔐 Testing common passwords...');
    for (const testPass of testPasswords) {
      const bcrypt = require('bcrypt');
      const isMatch = await bcrypt.compare(testPass, user.password);
      console.log(`"${testPass}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      
      if (isMatch) {
        console.log(`\n🎉 FOUND CORRECT PASSWORD: "${testPass}"`);
        console.log('💡 Use this password for login test');
        
        // Test login with correct password
        console.log('\n🔄 Testing login with correct password...');
        const loginResponse = await fetch('http://localhost:4000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'shubham.modi.cg@gmail.com',
            password: testPass
          })
        });
        
        const loginData = await loginResponse.json();
        console.log('📊 Login Response:', loginResponse.status);
        console.log('📋 Login Data:', loginData);
        
        if (loginResponse.status === 200) {
          console.log('✅ SUCCESS! OTP should be sent to your email!');
          console.log('🔑 Check your email and also look at server console for OTP fallback');
        }
        return;
      }
    }
    
    // If no password matches, offer to reset
    console.log('\n❌ No common passwords matched');
    console.log('💡 Options:');
    console.log('1. Try your actual password that you used during registration');
    console.log('2. I can help you reset the password');
    console.log('3. Create a new user with different email for testing');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run check
checkUserAndReset().then(() => process.exit(0));
