#!/usr/bin/env node

/**
 * GrantCraft Test Runner
 * 
 * Runs tests against the GrantCraft services and generates a report
 */

const apiClient = require('./api-client');
const path = require('path');

// Parse command-line arguments
const args = process.argv.slice(2);
const testArg = args[0]?.toLowerCase();

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
    
  } else if (testArg === 'database') {
    console.log('Testing database connection...');
    const result = await apiClient.testDatabaseConnection();
    
    console.log(`\nResult: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    
    if (!result.success) {
      process.exit(1);
    }
    
  } else if (testArg === 'login') {
    console.log('Testing login functionality...');
    const result = await apiClient.testLogin();
    
    console.log(`\nResult: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    
    if (!result.success) {
      process.exit(1);
    }
    
  } else if (testArg === 'errors') {
    console.log('Checking for errors...');
    const result = await apiClient.checkErrors();
    
    console.log(`\nResult: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    console.log(`Found ${result.errorCount || 0} errors`);
    
    if (!result.success) {
      process.exit(1);
    }
    
  } else {
    console.error(`Unknown test: ${testArg}`);
    console.log('\nAvailable tests:');
    console.log('  all       - Run all tests');
    console.log('  frontend  - Test frontend health');
    console.log('  backend   - Test backend health');
    console.log('  database  - Test database connection');
    console.log('  login     - Test login functionality');
    console.log('  errors    - Check for errors');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});