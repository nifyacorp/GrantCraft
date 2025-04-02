#!/usr/bin/env node

/**
 * GrantCraft Backend Check
 * 
 * This script checks if the backend service is running and what endpoints are available.
 */

const https = require('https');

// Backend URL
const BACKEND_URL = 'https://grantcraft-backend-320165158819.us-central1.run.app';

// Function to make a GET request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Try to parse as JSON if possible
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          // If not JSON, use the raw data
          parsedData = { raw: data.substring(0, 500) };
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData,
          rawData: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to check a specific endpoint
async function checkEndpoint(path) {
  const url = `${BACKEND_URL}${path}`;
  console.log(`Checking: ${url}`);
  
  try {
    const response = await makeRequest(url);
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
      console.log(`Redirect to: ${response.headers.location}`);
    } else {
      console.log('Error response:', response.data);
    }
    
    return {
      path,
      success: response.statusCode >= 200 && response.statusCode < 300,
      statusCode: response.statusCode,
      data: response.data
    };
  } catch (error) {
    console.error(`Error checking ${path}:`, error.message);
    return {
      path,
      success: false,
      error: error.message
    };
  }
}

// Main function to check multiple endpoints
async function checkBackend() {
  console.log('=== GrantCraft Backend Check ===\n');
  
  // List of paths to check
  const paths = [
    '/',                      // Root path
    '/api',                   // API root
    '/api/health',            // Standard health endpoint
    '/docs',                  // API docs (FastAPI provides this)
    '/openapi.json',          // OpenAPI schema (FastAPI provides this)
    '/api/debug/health',      // Our debug health endpoint
    '/api/debug/ping',        // Our ping endpoint
  ];
  
  const results = [];
  
  // Check each endpoint
  for (const path of paths) {
    const result = await checkEndpoint(path);
    results.push(result);
    console.log('-------------------------------------------');
  }
  
  // Summary
  console.log('\n=== Summary ===');
  const successes = results.filter(r => r.success).length;
  console.log(`${successes} of ${results.length} endpoints accessible`);
  
  // List available endpoints
  if (successes > 0) {
    console.log('\nAvailable endpoints:');
    results.filter(r => r.success).forEach(r => {
      console.log(`- ${r.path}`);
    });
  }
  
  // Next steps based on what's available
  if (results.some(r => r.path === '/docs' && r.success)) {
    console.log('\nAPI docs are available at:');
    console.log(`${BACKEND_URL}/docs`);
    console.log('You can explore the API there.');
  }
  
  return results;
}

// Run the check
checkBackend().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});