/**
 * GrantCraft API Client Utilities
 * 
 * This module provides helper functions for testing the GrantCraft services
 * with proper error handling and response logging.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Base directories
const TEST_DIR = __dirname;
const OUTPUT_DIR = path.join(TEST_DIR, 'outputs');
const LOGS_DIR = path.join(OUTPUT_DIR, 'logs');
const RESPONSES_DIR = path.join(OUTPUT_DIR, 'responses');

// Service URLs
const DEFAULT_FRONTEND_URL = 'https://grantcraft-frontend-320165158819.us-central1.run.app';
const DEFAULT_BACKEND_URL = 'https://grantcraft-backend-320165158819.us-central1.run.app';

// Create directories if they don't exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
if (!fs.existsSync(RESPONSES_DIR)) fs.mkdirSync(RESPONSES_DIR, { recursive: true });

/**
 * Get the base URLs for services
 * @returns {Object} Object containing frontend and backend URLs
 */
function getServiceUrls() {
  return {
    frontend: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
    backend: process.env.BACKEND_URL || DEFAULT_BACKEND_URL
  };
}

/**
 * Make an API request with proper headers
 * @param {Object} options - Request options including url
 * @returns {Promise<Object>} API response
 */
function makeApiRequest(options) {
  return new Promise((resolve, reject) => {
    try {
      // Parse URL if provided directly
      let requestOptions = {};
      let url;
      
      if (options.url) {
        const urlObj = new URL(options.url);
        
        requestOptions = {
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: options.method || 'GET',
          headers: options.headers || {}
        };
        
        url = options.url;
      } else {
        requestOptions = { ...options };
        url = `${requestOptions.protocol || 'https://'}${requestOptions.hostname}${requestOptions.path}`;
      }
      
      // Set content type if not specified
      if (!requestOptions.headers || !requestOptions.headers['Content-Type']) {
        requestOptions.headers = requestOptions.headers || {};
        requestOptions.headers['Content-Type'] = 'application/json';
      }

      // Sanitize path
      if (requestOptions.path && typeof requestOptions.path === 'string') {
        requestOptions.path = requestOptions.path.replace(/\/+/g, '/');
        if (!requestOptions.path.startsWith('/')) {
          requestOptions.path = '/' + requestOptions.path;
        }
      }
      
      console.log(`Making ${requestOptions.method} request to ${url}`);
      
      // Choose http or https based on the URL
      const isHttps = url.startsWith('https://');
      const requester = isHttps ? https : http;
      
      const req = requester.request(requestOptions, (res) => {
        let data = '';
        
        // Set encoding to properly handle text responses
        res.setEncoding('utf8');
        
        res.on('data', (chunk) => { data += chunk; });
        
        res.on('end', () => {
          try {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400) {
              console.log(`Received redirect to: ${res.headers.location}`);
              
              resolve({
                status: res.statusCode,
                headers: res.headers,
                isRedirect: true,
                location: res.headers.location,
                raw: data
              });
              return;
            }
            
            // Try to parse JSON response
            let parsedData = null;
            try {
              parsedData = JSON.parse(data);
            } catch (e) {
              // If not JSON, just return the raw data
              parsedData = { 
                raw: data.substring(0, 500) + (data.length > 500 ? '...' : ''),
                _parseError: e.message
              };
            }
            
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsedData,
              raw: data
            });
          } catch (error) {
            console.error('Error processing response:', error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`Request error: ${error.message}`);
        reject(error);
      });
      
      // Set request timeout
      req.setTimeout(10000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });
      
      if (options.data) {
        const bodyData = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
        req.write(bodyData);
      }
      
      req.end();
    } catch (error) {
      console.error('Error preparing request:', error);
      reject(error);
    }
  });
}

/**
 * Save API response to file
 * @param {Object} response - API response object
 * @param {string} testName - Name of the test (used for the filename)
 */
function saveResponse(response, testName) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filepath = path.join(RESPONSES_DIR, `${testName}_${timestamp}.json`);
    
    // Ensure directory exists
    if (!fs.existsSync(RESPONSES_DIR)) {
      fs.mkdirSync(RESPONSES_DIR, { recursive: true });
    }
    
    // Save response with metadata
    const responseWithMeta = {
      timestamp,
      testName,
      status: response.status,
      headers: response.headers,
      data: response.data,
      raw: response.raw ? response.raw.substring(0, 1000) : null
    };
    
    fs.writeFileSync(filepath, JSON.stringify(responseWithMeta, null, 2));
    console.log(`Response saved to ${filepath}`);
    
    return filepath;
  } catch (error) {
    console.error(`Failed to save response:`, error.message);
    return null;
  }
}

/**
 * Log test results
 * @param {string} testName - Name of the test
 * @param {boolean} success - Whether the test was successful
 * @param {string} details - Test details
 * @param {Object} [response] - Response object
 */
function logTestResult(testName, success, details, response = null) {
  try {
    const timestamp = new Date().toISOString();
    const logFile = path.join(LOGS_DIR, 'test-results.log');
    
    // Ensure directory exists
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    
    let responseDetails = '';
    if (response) {
      responseDetails = `\nStatus: ${response.status}`;
      if (response.data && typeof response.data === 'object') {
        try {
          responseDetails += `\nResponse: ${JSON.stringify(response.data).substring(0, 200)}`;
        } catch (e) {
          responseDetails += '\nResponse: [Error serializing response]';
        }
      }
    }
    
    const content = `
[${timestamp}] Test: ${testName}
Result: ${success ? 'SUCCESS' : 'FAILURE'}
${details}${responseDetails}
--------------------------------------------------
`;
    
    fs.appendFileSync(logFile, content);
    console.log(`Test result logged to ${logFile}`);
    
    // Also print to console
    console.log(`[${testName}] ${success ? 'SUCCESS' : 'FAILURE'}: ${details}`);
    
    return logFile;
  } catch (error) {
    console.error(`Failed to log test result:`, error.message);
    return null;
  }
}

/**
 * Test the health of a service
 * @param {string} service - Service type ('frontend' or 'backend')
 * @returns {Promise<Object>} Test result
 */
async function testServiceHealth(service) {
  const urls = getServiceUrls();
  let healthUrl;
  
  if (service === 'frontend') {
    healthUrl = `${urls.frontend}/api/debug/health`;
  } else if (service === 'backend') {
    healthUrl = `${urls.backend}/api/debug/health`;
  } else {
    throw new Error(`Unknown service: ${service}`);
  }
  
  const testName = `health_${service}`;
  
  try {
    console.log(`Testing health of ${service} service at ${healthUrl}...`);
    
    const response = await makeApiRequest({ url: healthUrl, method: 'GET' });
    
    const success = response.status === 200 && 
                    response.data && 
                    response.data.status === 'ok';
    
    saveResponse(response, testName);
    
    logTestResult(
      testName,
      success,
      `Testing ${service} service health`,
      response
    );
    
    return {
      success,
      service,
      response
    };
  } catch (error) {
    console.error(`Error testing ${service} health:`, error);
    
    logTestResult(
      testName,
      false,
      `Error testing ${service} service health: ${error.message}`
    );
    
    return {
      success: false,
      service,
      error: error.message
    };
  }
}

/**
 * Test the database connection
 * @param {string} password - Password for the debug endpoint
 * @returns {Promise<Object>} Test result
 */
async function testDatabaseConnection(password = 'GrantCraft2025!Debug') {
  const urls = getServiceUrls();
  const dbTestUrl = `${urls.backend}/api/debug/test/database?password=${password}`;
  const testName = 'database_connection';
  
  try {
    console.log(`Testing database connection...`);
    
    const response = await makeApiRequest({ url: dbTestUrl, method: 'GET' });
    
    const success = response.status === 200 && 
                    response.data && 
                    response.data.connected === true;
    
    saveResponse(response, testName);
    
    logTestResult(
      testName,
      success,
      `Testing database connection${response.data?.version ? `: ${response.data.version}` : ''}`,
      response
    );
    
    return {
      success,
      response
    };
  } catch (error) {
    console.error(`Error testing database connection:`, error);
    
    logTestResult(
      testName,
      false,
      `Error testing database connection: ${error.message}`
    );
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test the login functionality
 * @param {string} username - Test username
 * @param {string} password - Test password
 * @returns {Promise<Object>} Test result
 */
async function testLogin(username = 'test@example.com', password = 'password123') {
  const urls = getServiceUrls();
  const loginTestUrl = `${urls.backend}/api/debug/test/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  const testName = 'login_test';
  
  try {
    console.log(`Testing login functionality...`);
    
    const response = await makeApiRequest({ url: loginTestUrl, method: 'GET' });
    
    const success = response.status === 200 && 
                    response.data && 
                    response.data.status === 'success';
    
    saveResponse(response, testName);
    
    logTestResult(
      testName,
      success,
      `Testing login with username "${username}"`,
      response
    );
    
    return {
      success,
      response
    };
  } catch (error) {
    console.error(`Error testing login:`, error);
    
    logTestResult(
      testName,
      false,
      `Error testing login with username "${username}": ${error.message}`
    );
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check for errors in the backend
 * @param {string} password - Password for the debug endpoint
 * @returns {Promise<Object>} Test result
 */
async function checkErrors(password = 'GrantCraft2025!Debug') {
  const urls = getServiceUrls();
  const errorsUrl = `${urls.backend}/api/debug/errors?password=${password}`;
  const testName = 'check_errors';
  
  try {
    console.log(`Checking for errors...`);
    
    const response = await makeApiRequest({ url: errorsUrl, method: 'GET' });
    
    const success = response.status === 200;
    const errorCount = response.data?.count || 0;
    
    saveResponse(response, testName);
    
    logTestResult(
      testName,
      success,
      `Found ${errorCount} errors`,
      response
    );
    
    return {
      success,
      errorCount,
      response
    };
  } catch (error) {
    console.error(`Error checking for errors:`, error);
    
    logTestResult(
      testName,
      false,
      `Error checking for errors: ${error.message}`
    );
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a test report
 * @param {Array} results - Array of test results
 * @returns {string} Path to the report file
 */
function generateTestReport(results) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportFile = path.join(OUTPUT_DIR, `test-report_${timestamp}.json`);
    
    const report = {
      timestamp,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      results
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`Test report generated at ${reportFile}`);
    
    return reportFile;
  } catch (error) {
    console.error(`Failed to generate test report:`, error.message);
    return null;
  }
}

/**
 * Run all tests
 * @returns {Promise<Object>} Test report
 */
async function runAllTests() {
  console.log('Running all tests...');
  
  const results = [];
  
  try {
    // Test frontend health
    results.push(await testServiceHealth('frontend'));
    
    // Test backend health
    results.push(await testServiceHealth('backend'));
    
    // Test database connection
    results.push(await testDatabaseConnection());
    
    // Test login
    results.push(await testLogin());
    
    // Check for errors
    results.push(await checkErrors());
    
    // Generate report
    const reportFile = generateTestReport(results);
    
    return {
      reportFile,
      results
    };
  } catch (error) {
    console.error('Error running tests:', error);
    return {
      error: error.message,
      results
    };
  }
}

module.exports = {
  makeApiRequest,
  saveResponse,
  logTestResult,
  testServiceHealth,
  testDatabaseConnection,
  testLogin,
  checkErrors,
  runAllTests,
  getServiceUrls
};