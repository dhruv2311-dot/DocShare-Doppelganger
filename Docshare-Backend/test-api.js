// Simple API test without database operations
require('dotenv').config();

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints Directly...\n');
  
  try {
    // Test 1: Register new user
    console.log('📝 Testing Registration...');
    const registerResponse = await fetch('http://localhost:4000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Test User',
        email: 'apitest@example.com',
        password: 'testpassword123'
      })
    });
    
    console.log('📊 Registration Status:', registerResponse.status);
    const regData = await registerResponse.json();
    console.log('📋 Registration Response:', regData);
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful!');
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Login with the new user
    console.log('\n🔐 Testing Login...');
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'apitest@example.com',
        password: 'testpassword123'
      })
    });
    
    console.log('📊 Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('📋 Login Response:', loginData);
    
    if (loginResponse.status === 200) {
      console.log('🎉 SUCCESS! OTP should be sent!');
      console.log('📧 Check apitest@example.com for OTP');
      console.log('🔑 Also check server console logs');
    }
    
    // Test 3: Test email debug endpoint
    console.log('\n📧 Testing Email Debug Endpoint...');
    const emailTestResponse = await fetch('http://localhost:4000/debug/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testEmail: 'shubham.modi.cg@gmail.com'
      })
    });
    
    console.log('📊 Email Test Status:', emailTestResponse.status);
    const emailData = await emailTestResponse.json();
    console.log('📋 Email Test Response:', emailData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run test
testAPIEndpoints();
