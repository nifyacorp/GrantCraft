#!/usr/bin/env node

/**
 * Verify the GrantCraft backend service with corrected paths
 * This script checks the backend using the paths found in the actual codebase
 */

const https = require('https');
const url = require('url');

// Backend URL
const BACKEND_URL = 'https://grantcraft-backend-320165158819.us-central1.run.app';

// Function to make a GET request
function makeRequest(targetUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000 // 10 second timeout
    };
    
    console.log(`Making ${requestOptions.method} request to ${targetUrl}`);
    
    const req = https.request(requestOptions, (res) => {
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
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

// Function to check endpoints with the correct paths based on code analysis
async function checkEndpoints() {
  console.log('=== GrantCraft Backend Verification (With Corrected Paths) ===\n');
  
  // Correct paths based on code examination
  const endpoints = [
    '/api/docs',                        // FastAPI docs (correct path)
    '/api/redoc',                       // FastAPI ReDoc (correct path)
    '/api/openapi.json',                // OpenAPI Schema (correct path)
    '/api/monitoring/health',           // Likely health endpoint
    '/api/monitoring/debug/health',     // Our debug health endpoint with correct prefix
    '/api/monitoring/debug/ping',       // Our ping endpoint with correct prefix
    '/api/health',                      // Common health endpoint location
    '/api/metadata',                    // From router.py
    '/api/monitoring',                  // Base monitoring path
    '/api/agent',                       // From router.py
    '/api/models',                      // From router.py
    '/api/auth/login',                  // Auth endpoint
  ];
  
  const results = [];
  
  // Check each endpoint
  for (const endpoint of endpoints) {
    try {
      const endpointUrl = `${BACKEND_URL}${endpoint}`;
      const result = await makeRequest(endpointUrl);
      
      console.log(`[${endpoint}] Status: ${result.statusCode}`);
      
      // If we get a non-404 response, log more details
      if (result.statusCode !== 404) {
        if (result.statusCode >= 200 && result.statusCode < 300) {
          console.log('Success response:', JSON.stringify(result.data, null, 2).substring(0, 500));
        } else if (result.statusCode >= 300 && result.statusCode < 400) {
          console.log(`Redirect to: ${result.headers.location}`);
        } else {
          console.log('Error response:', JSON.stringify(result.data, null, 2).substring(0, 500));
        }
      }
      
      results.push({
        endpoint,
        statusCode: result.statusCode,
        success: result.statusCode >= 200 && result.statusCode < 400,
        response: result
      });
    } catch (error) {
      console.error(`Error checking ${endpoint}:`, error.message);
      results.push({
        endpoint,
        success: false,
        error: error.message
      });
    }
    
    console.log('-------------------------------------------');
  }
  
  // Try some alternate formatting
  const altEndpoints = [
    '/api/monitoring/debug-health',     // With hyphen instead of slash
    '/api/monitoring/debug_health',     // With underscore
    '/api/monitoring/healthcheck',      // Common alternative
    '/api/',                            // Just API root with trailing slash
  ];
  
  for (const endpoint of altEndpoints) {
    try {
      const endpointUrl = `${BACKEND_URL}${endpoint}`;
      const result = await makeRequest(endpointUrl);
      
      console.log(`[${endpoint}] Status: ${result.statusCode}`);
      
      if (result.statusCode !== 404) {
        if (result.statusCode >= 200 && result.statusCode < 300) {
          console.log('Success response:', JSON.stringify(result.data, null, 2).substring(0, 500));
        } else if (result.statusCode >= 300 && result.statusCode < 400) {
          console.log(`Redirect to: ${result.headers.location}`);
        } else {
          console.log('Error response:', JSON.stringify(result.data, null, 2).substring(0, 500));
        }
      }
      
      results.push({
        endpoint,
        statusCode: result.statusCode,
        success: result.statusCode >= 200 && result.statusCode < 400,
        response: result
      });
    } catch (error) {
      console.error(`Error checking ${endpoint}:`, error.message);
      results.push({
        endpoint,
        success: false,
        error: error.message
      });
    }
    
    console.log('-------------------------------------------');
  }
  
  // Check HTTP header info (server, content-type, etc.)
  const headerResults = results.filter(r => r.response?.headers);
  
  if (headerResults.length > 0) {
    console.log('\n=== HTTP Headers Analysis ===');
    const uniqueHeaders = new Set();
    
    headerResults.forEach(result => {
      const headers = result.response.headers;
      Object.keys(headers).forEach(key => {
        uniqueHeaders.add(`${key}: ${headers[key]}`);
      });
    });
    
    if (uniqueHeaders.size > 0) {
      console.log('Observed HTTP headers:');
      uniqueHeaders.forEach(header => console.log(`  ${header}`));
    }
  }
  
  // Summary
  console.log('\n=== Summary ===');
  const successResults = results.filter(r => r.success);
  
  if (successResults.length > 0) {
    console.log('Accessible endpoints:');
    successResults.forEach(r => {
      console.log(`  ${r.endpoint} - Status: ${r.statusCode}`);
    });
  } else {
    console.log('No accessible endpoints found, even with corrected paths');
    
    // Analyze response codes
    const responseCounts = {};
    results.forEach(r => {
      const status = r.statusCode || 'error';
      responseCounts[status] = (responseCounts[status] || 0) + 1;
    });
    
    console.log('\nResponse code distribution:');
    Object.entries(responseCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} endpoints`);
    });
  }
  
  return results;
}

// Main execution
checkEndpoints().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});