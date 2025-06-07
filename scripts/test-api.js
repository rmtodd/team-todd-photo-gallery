#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing API Routes...\n');

  // Test 1: Check if auth endpoint is accessible
  try {
    console.log('1. Testing auth status endpoint...');
    const authResponse = await fetch(`${BASE_URL}/api/auth`);
    const authData = await authResponse.json();
    console.log('✅ Auth status:', authData);
  } catch (error) {
    console.log('❌ Auth status failed:', error.message);
  }

  // Test 2: Check if photos endpoint is accessible
  try {
    console.log('\n2. Testing photos endpoint...');
    const photosResponse = await fetch(`${BASE_URL}/api/photos`);
    const photosData = await photosResponse.json();
    console.log('✅ Photos endpoint:', photosData.photos ? `Found ${photosData.photos.length} photos` : 'No photos found');
  } catch (error) {
    console.log('❌ Photos endpoint failed:', error.message);
  }

  // Test 3: Test authentication with invalid password
  try {
    console.log('\n3. Testing auth with invalid password...');
    const invalidAuthResponse = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'invalid' }),
    });
    const invalidAuthData = await invalidAuthResponse.json();
    console.log('✅ Invalid auth response:', invalidAuthData);
  } catch (error) {
    console.log('❌ Invalid auth test failed:', error.message);
  }

  // Test 4: Test CORS headers
  try {
    console.log('\n4. Testing CORS headers...');
    const corsResponse = await fetch(`${BASE_URL}/api/auth`, {
      method: 'OPTIONS',
    });
    const corsHeaders = corsResponse.headers.get('Access-Control-Allow-Origin');
    console.log('✅ CORS headers:', corsHeaders ? 'Present' : 'Missing');
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }

  console.log('\n🎉 API testing complete!');
}

// Run the test
testAPI().catch(console.error); 