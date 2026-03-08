// Complete registration and login flow test
require('dotenv').config();
const bcrypt = require('bcrypt');

async function testCompleteFlow() {
  console.log('🚀 Testing Complete Registration & Login Flow...\n');
  
  try {
    // Step 1: Test Registration
    console.log('📝 Step 1: Testing Registration...');
    
    const registrationResponse = await fetch('http://localhost:4000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'shubham.modi.cg@gmail.com',
        password: 'testpassword123',
        role: 'Client'
      })
    });
    
    const registrationData = await registrationResponse.json();
    console.log('📊 Registration Response:', registrationResponse.status);
    console.log('📋 Registration Data:', registrationData);
    
    if (registrationResponse.status === 201) {
      console.log('✅ Registration successful!');
    } else if (registrationResponse.status === 400 && registrationData.message.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding to login...');
    } else {
      console.log('❌ Registration failed:', registrationData.message);
      return;
    }
    
    // Wait a moment before login
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Test Login
    console.log('\n🔐 Step 2: Testing Login...');
    
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'shubham.modi.cg@gmail.com',
        password: 'testpassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Login Response:', loginResponse.status);
    console.log('📋 Login Data:', loginData);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful! OTP should be sent to email.');
      console.log('👤 User ID:', loginData.userId);
      console.log('📧 Check your email for OTP!');
      
      // Step 3: Wait for email and then test OTP verification
      console.log('\n⏳ Step 3: Waiting for you to check email...');
      console.log('💡 Once you receive the OTP, we can test verification.');
      console.log('🔑 The OTP should also appear in server console logs.');
      
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testCompleteFlow();
