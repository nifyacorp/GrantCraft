#!/usr/bin/env node

/**
 * GrantCraft Test Runner
 * 
 * Runs tests against the GrantCraft services and generates a report
 */

const apiClient = require('./api-client');
const path = require('path');
const fs = require('fs');

// Parse command-line arguments
const args = process.argv.slice(2);
const testArg = args[0]?.toLowerCase();

// Output file for API endpoints report
const ENDPOINTS_FILE = path.join(__dirname, 'outputs', 'endpoints.json');

async function main() {
  console.log('=== GrantCraft Service Test Runner ===');
  console.log('');
  
  const urls = apiClient.getServiceUrls();
  console.log(`Frontend URL: ${urls.frontend}`);
  console.log(`Backend URL: ${urls.backend}`);
  console.log('');
  
  if (!testArg || testArg === 'all') {
    console.log('Running all tests...');
    const result = await apiClient.runAllTests();
    
    if (result.error) {
      console.error('Error running tests:', result.error);
      process.exit(1);
    }
    
    // Save API information if available
    if (result.apiInfo) {
      fs.writeFileSync(
        ENDPOINTS_FILE, 
        JSON.stringify(result.apiInfo, null, 2)
      );
      console.log(`\nAPI endpoints information saved to: ${ENDPOINTS_FILE}`);
    }
    
    // Print summary
    const summary = {
      total: result.results.length,
      successful: result.results.filter(r => r.success).length,
      failed: result.results.filter(r => !r.success).length
    };
    
    console.log('\n=== Test Summary ===');
    console.log(`Total tests: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    
    if (result.reportFile) {
      console.log(`\nDetailed report available at: ${result.reportFile}`);
    }
    
    // Return non-zero exit code if any tests failed
    if (summary.failed > 0) {
      process.exit(1);
    }
    
  } else if (testArg === 'frontend') {
    console.log('Testing frontend health...');
    const result = await apiClient.testServiceHealth('frontend');
    
    console.log(`\nResult: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    
    if (!result.success) {
      process.exit(1);
    }
    
  } else if (testArg === 'backend') {
    console.log('Testing backend health...');
    const result = await apiClient.testServiceHealth('backend');
    
    console.log(`\nResult: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    
    if (!result.success) {
      process.exit(1);
    }
    
  } else if (testArg === 'docs') {
    console.log('Fetching API documentation...');
    const result = await apiClient.getApiDocs();
    
    console.log(`\nResult: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    console.log(`API documentation is${result.success ? '' : ' not'} available at: ${urls.backend}/api/docs`);
    
    if (!result.success) {
      process.exit(1);
    }
    
  } else if (testArg === 'schema') {
    console.log('Fetching and analyzing OpenAPI schema...');
    const result = await apiClient.getOpenApiSchema();
    
    console.log(`\nResult: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    
    if (result.success && result.schema) {
      const apiInfo = apiClient.analyzeApiSchema(result.schema);
      
      console.log(`\nAPI Analysis:`);
      console.log(`  Total endpoints: ${apiInfo.endpoints.length}`);
      console.log(`  Endpoints requiring auth: ${apiInfo.authEndpoints.length}`);
      console.log(`  Open endpoints: ${apiInfo.openEndpoints.length}`);
      
      // List open endpoints for testing
      if (apiInfo.openEndpoints.length > 0) {
        console.log(`\nOpen endpoints available for testing:`);
        apiInfo.openEndpoints.forEach(endpoint => {
          console.log(`  ${endpoint.method} ${endpoint.path} - ${endpoint.summary}`);
        });
      }
      
      // Save API information
      fs.writeFileSync(
        ENDPOINTS_FILE, 
        JSON.stringify(apiInfo, null, 2)
      );
      console.log(`\nAPI endpoints information saved to: ${ENDPOINTS_FILE}`);
    }
    
    if (!result.success) {
      process.exit(1);
    }
    
  } else if (testArg === 'endpoint') {
    // Test a specific endpoint provided as the second argument
    const endpoint = args[1];
    const method = (args[2] || 'GET').toUpperCase();
    
    if (!endpoint) {
      console.error('Error: Please provide an endpoint to test');
      console.log('Usage: node run-tests.js endpoint /api/path [METHOD]');
      process.exit(1);
    }
    
    console.log(`Testing endpoint: ${method} ${endpoint}`);
    
    try {
      const fullUrl = `${urls.backend}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      const result = await apiClient.makeApiRequest({ 
        url: fullUrl, 
        method
      });
      
      console.log(`\nStatus: ${result.status}`);
      console.log('Response:', JSON.stringify(result.data, null, 2).substring(0, 500));
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`\nEndpoint test successful`);
      } else {
        console.log(`\nEndpoint returned non-success status: ${result.status}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error testing endpoint:', error.message);
      process.exit(1);
    }
    
  } else {
    console.error(`Unknown test: ${testArg}`);
    console.log('\nAvailable tests:');
    console.log('  all       - Run all tests');
    console.log('  frontend  - Test frontend health');
    console.log('  backend   - Test backend health');
    console.log('  docs      - Test API documentation access');
    console.log('  schema    - Fetch and analyze API schema');
    console.log('  endpoint  - Test a specific endpoint (requires path as second argument)');
    console.log('\nExamples:');
    console.log('  node run-tests.js all');
    console.log('  node run-tests.js endpoint /api/monitoring/health GET');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});