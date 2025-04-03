// Simple script to test backend connectivity and check CORS headers
const https = require('https');

const BACKEND_URL = 'https://grantcraft-backend-320165158819.us-central1.run.app';
const ENDPOINTS = [
  '/api/agent/tools',
  '/api/debug/health',
  '/api/health',
  '/health'
];

// Function to make a GET request and check response
function checkEndpoint(endpoint) {
  console.log(`Testing endpoint: ${endpoint}`);
  
  const options = {
    method: 'GET',
    headers: {
      'Origin': 'https://grantcraft-frontend-320165158819.us-central1.run.app'
    }
  };
  
  const req = https.request(`${BACKEND_URL}${endpoint}`, options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:');
    Object.keys(res.headers).forEach(key => {
      console.log(`  ${key}: ${res.headers[key]}`);
    });
    
    // Check specifically for CORS headers
    const corsOrigin = res.headers['access-control-allow-origin'];
    if (corsOrigin) {
      console.log(`✅ CORS Origin header found: ${corsOrigin}`);
    } else {
      console.log('❌ No CORS Origin header found');
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(data);
        console.log('Response (parsed):', jsonData);
      } catch (e) {
        // If not JSON, show the raw data (truncated if too long)
        console.log(`Response (${data.length} bytes):`, 
          data.length > 500 ? data.substring(0, 500) + '...' : data);
      }
      console.log('-'.repeat(50));
    });
  });
  
  req.on('error', (error) => {
    console.error(`Error with endpoint ${endpoint}:`, error.message);
    console.log('-'.repeat(50));
  });
  
  req.end();
}

// Also check an OPTIONS request to simulate CORS preflight
function checkOptionsRequest(endpoint) {
  console.log(`Testing OPTIONS request for: ${endpoint}`);
  
  const options = {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://grantcraft-frontend-320165158819.us-central1.run.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type,Authorization'
    }
  };
  
  const req = https.request(`${BACKEND_URL}${endpoint}`, options, (res) => {
    console.log(`OPTIONS Status: ${res.statusCode}`);
    console.log('OPTIONS Headers:');
    Object.keys(res.headers).forEach(key => {
      console.log(`  ${key}: ${res.headers[key]}`);
    });
    
    console.log('-'.repeat(50));
  });
  
  req.on('error', (error) => {
    console.error(`Error with OPTIONS for ${endpoint}:`, error.message);
    console.log('-'.repeat(50));
  });
  
  req.end();
}

// Run the tests
console.log('====== TESTING BACKEND API ENDPOINTS AND CORS ======');
ENDPOINTS.forEach(endpoint => {
  checkEndpoint(endpoint);
  // Also check OPTIONS for this endpoint
  checkOptionsRequest(endpoint);
});