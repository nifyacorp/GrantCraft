#!/usr/bin/env node

/**
 * Verify the GrantCraft backend service
 * This script checks various endpoints to understand the current backend status
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

// Function to check common endpoints
async function checkEndpoints() {
  console.log('=== GrantCraft Backend Verification ===\n');
  
  const endpoints = [
    '/',                          // Root path
    '/api',                       // API root
    '/docs',                      // FastAPI docs
    '/openapi.json',              // FastAPI OpenAPI schema
    '/api/health',                // Common health endpoint
    '/api/v1/health',             // Another common health path
    '/health',                    // Another common health path
    '/api/debug/health',          // Our debug health endpoint
    '/debug/health',              // Alternative debug path
    '/api/debug/ping',            // Our ping endpoint
    '/api/ping',                  // Alternative ping path
    '/ping',                      // Another common ping path
    '/api/auth/login',            // Auth endpoints
    '/api/agent',                 // Agent API
    '/reworkd_platform',          // Based on package name
    '/reworkd-platform',          // Hyphenated variant
    '/api/reworkd_platform',      // API prefix with package name
    '/__docs__',                  // Custom docs path
    '/__health__',                // Custom health path
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
  
  // Additional checks for FastAPI default endpoints with trailing slashes
  const slashEndpoints = ['/docs/', '/api/'];
  for (const endpoint of slashEndpoints) {
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
  
  // Check for specific port configuration
  const ports = [8000, 8080];
  for (const port of ports) {
    try {
      // Try backend URL with a specified port
      const portUrl = BACKEND_URL.replace('.run.app', `.run.app:${port}`);
      const result = await makeRequest(`${portUrl}/`);
      
      console.log(`[Port ${port}] Status: ${result.statusCode}`);
      
      results.push({
        endpoint: `/:${port}`,
        statusCode: result.statusCode,
        success: result.statusCode >= 200 && result.statusCode < 400,
        response: result
      });
    } catch (error) {
      console.error(`Error checking port ${port}:`, error.message);
      results.push({
        endpoint: `/:${port}`,
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
    console.log('No accessible endpoints found');
  }
  
  return results;
}

// Main execution
checkEndpoints().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});