// Create new test user and test login
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createTestUser() {
  console.log('👤 Creating New Test User...\n');
  
  try {
    // Check if test user exists
    const existingUser = await User.findOne({ email: 'testuser@example.com' });
    if (existingUser) {
      console.log('📝 Test user already exists, deleting...');
      await User.deleteOne({ email: 'testuser@example.com' });
      console.log('✅ Old test user deleted');
    }
    
    // Create new test user
    const hashedPassword = await bcrypt.hash('testpassword123', 8);
    
    const newUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: hashedPassword,
      role: 'Client'
    });
    
    console.log('✅ New test user created:');
    console.log('📧 Email:', newUser.email);
    console.log('🔑 Password: testpassword123');
    console.log('👤 Name:', newUser.name);
    
    // Test login immediately
    console.log('\n🔐 Testing Login...');
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Login Status:', loginResponse.status);
    console.log('📋 Login Response:', loginData);
    
    if (loginResponse.status === 200) {
      console.log('\n🎉 SUCCESS! OTP sent to testuser@example.com');
      console.log('📧 Check the email for OTP');
      console.log('🔑 Also check server console for OTP fallback');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run test
createTestUser().then(() => process.exit(0));
