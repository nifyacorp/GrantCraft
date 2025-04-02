#!/usr/bin/env node

/**
 * Database Testing Script
 * 
 * This script tests the database connection and schema by calling the
 * backend monitoring endpoints.
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';
const TIMEOUT = 30000; // 30 seconds

// Log configuration for debugging
console.log(chalk.blue(`🔧 Configuration:`));
console.log(`   API Base URL: ${API_BASE_URL}`);
console.log(`   Timeout: ${TIMEOUT}ms`);

/**
 * Try to determine the backend URL if standard ones don't work
 */
async function findBackendUrl() {
  const possibleUrls = [
    'http://localhost:8000/api',
    'http://localhost:8000',
    'http://localhost:3000/api',
    'http://127.0.0.1:8000/api',
    'http://backend:8000/api',
    'https://grantcraft-backend-320165158819.us-central1.run.app/api',
    'https://grantcraft-backend-320165158819.us-central1.run.app'
  ];
  
  console.log(chalk.yellow('🔍 Trying to find the backend URL...'));
  
  for (const url of possibleUrls) {
    try {
      console.log(chalk.dim(`   Trying ${url}/monitoring/health...`));
      const response = await axios.get(`${url}/monitoring/health`, { 
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(chalk.green(`   Found working backend at: ${url}`));
        return url;
      }
    } catch (err) {
      console.log(chalk.dim(`   ${url} failed: ${err.message}`));
    }
  }
  
  console.log(chalk.red('❌ Could not find working backend URL'));
  return null;
}

/**
 * Main function to test database
 */
async function main() {
  console.log(chalk.blue('🔍 Testing Database Configuration'));
  console.log(chalk.dim('=================================='));
  
  // Try to find working backend URL if specified one doesn't work
  let backendUrl = API_BASE_URL;
  try {
    const response = await axios.get(`${API_BASE_URL}/monitoring/health`, { 
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (response.status !== 200) {
      const foundUrl = await findBackendUrl();
      if (foundUrl) {
        backendUrl = foundUrl;
        console.log(chalk.green(`✅ Using detected backend URL: ${backendUrl}`));
      }
    }
  } catch (err) {
    const foundUrl = await findBackendUrl();
    if (foundUrl) {
      backendUrl = foundUrl;
      console.log(chalk.green(`✅ Using detected backend URL: ${backendUrl}`));
    }
  }

  try {
    // Test database connection
    console.log(chalk.yellow('\n📡 Testing Database Connection...'));
    const connectionResult = await testDatabaseConnection(backendUrl);
    
    if (connectionResult.connected) {
      console.log(chalk.green('✅ Database Connection: SUCCESS'));
      console.log(`   Version: ${connectionResult.version}`);
    } else {
      console.log(chalk.red('❌ Database Connection: FAILED'));
      console.log(`   Error: ${connectionResult.message}`);
      console.log(chalk.yellow('   Trying database health check via API health endpoint to confirm backend is running...'));
      
      try {
        const healthResponse = await axios.get(`${backendUrl}/monitoring/health`, { timeout: 5000 });
        console.log(chalk.green(`   Backend is running, responded with status: ${healthResponse.status}`));
        console.log(chalk.yellow('   The issue is likely with the database connection or monitoring endpoints.'));
      } catch (healthErr) {
        console.log(chalk.red(`   Backend health check also failed: ${healthErr.message}`));
        console.log(chalk.red('   Please ensure the backend is running properly.'));
      }
      process.exit(1);
    }

    // Check required tables
    console.log(chalk.yellow('\n📋 Checking Required Tables...'));
    const tablesResult = await checkRequiredTables(backendUrl);
    
    const allTablesExist = tablesResult.tables && tablesResult.tables.every(t => t.exists);
    
    if (allTablesExist) {
      console.log(chalk.green('✅ Required Tables: ALL PRESENT'));
    } else {
      console.log(chalk.red('❌ Required Tables: SOME MISSING'));
      
      if (tablesResult.tables && tablesResult.tables.length > 0) {
        // Show missing tables
        const missingTables = tablesResult.tables.filter(t => !t.exists);
        console.log(chalk.red(`   Missing Tables: ${missingTables.map(t => t.table).join(', ')}`));
      } else {
        console.log(chalk.red('   Could not retrieve table information'));
      }
      
      // Show recommendations
      if (tablesResult.recommendations && tablesResult.recommendations.length > 0) {
        console.log(chalk.yellow('\n💡 Recommendations:'));
        tablesResult.recommendations.forEach(rec => {
          console.log(`   ${rec}`);
        });
      }
    }

    // Get comprehensive report
    console.log(chalk.yellow('\n📊 Generating Comprehensive Report...'));
    const report = await getComprehensiveReport(backendUrl);
    
    // Save report to file
    const fs = require('fs');
    fs.writeFileSync('database-report.json', JSON.stringify(report, null, 2));
    console.log(chalk.green('✅ Report saved to database-report.json'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error testing database:'));
    console.error(error.message);
    if (error.response) {
      console.error(chalk.dim('Response:', JSON.stringify(error.response.data, null, 2)));
    }
    process.exit(1);
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection(baseUrl = API_BASE_URL) {
  try {
    const url = `${baseUrl}/monitoring/database/connection`;
    console.log(chalk.dim(`   Making request to: ${url}`));
    
    const response = await axios.get(url, {
      timeout: TIMEOUT
    });
    
    console.log(chalk.dim(`   Response status: ${response.status}`));
    console.log(chalk.dim(`   Response data: ${JSON.stringify(response.data, null, 2)}`));
    
    return response.data;
  } catch (error) {
    console.error(chalk.red(`   Connection error: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.dim(`   Response status: ${error.response.status}`));
      console.error(chalk.dim(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`));
    } else if (error.request) {
      console.error(chalk.dim(`   No response received - network issue`));
    }
    
    return {
      connected: false,
      message: error.message,
      status: 'error'
    };
  }
}

/**
 * Check required tables
 */
async function checkRequiredTables(baseUrl = API_BASE_URL) {
  try {
    const url = `${baseUrl}/monitoring/database/required-tables`;
    console.log(chalk.dim(`   Making request to: ${url}`));
    
    const response = await axios.get(url, {
      timeout: TIMEOUT
    });
    
    console.log(chalk.dim(`   Response status: ${response.status}`));
    console.log(chalk.dim(`   Response data: ${JSON.stringify(response.data, null, 2)}`));
    
    // Get recommendations
    if (response.data.status !== 'success') {
      try {
        const recUrl = `${baseUrl}/monitoring/database/check-all`;
        console.log(chalk.dim(`   Getting recommendations from: ${recUrl}`));
        
        const recResponse = await axios.get(recUrl, {
          timeout: TIMEOUT
        });
        response.data.recommendations = recResponse.data.recommendations;
      } catch (recError) {
        console.error(chalk.yellow(`   Could not get recommendations: ${recError.message}`));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(chalk.red(`   Required tables check error: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.dim(`   Response status: ${error.response.status}`));
      console.error(chalk.dim(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`));
    }
    
    return {
      status: 'error',
      message: `Failed to check required tables: ${error.message}`
    };
  }
}

/**
 * Get comprehensive database report
 */
async function getComprehensiveReport(baseUrl = API_BASE_URL) {
  try {
    const url = `${baseUrl}/monitoring/database/check-all`;
    console.log(chalk.dim(`   Making request to: ${url}`));
    
    const response = await axios.get(url, {
      timeout: TIMEOUT
    });
    
    console.log(chalk.dim(`   Response status: ${response.status}`));
    console.log(chalk.dim(`   Response data length: ${JSON.stringify(response.data).length} characters`));
    
    return response.data;
  } catch (error) {
    console.error(chalk.red(`   Comprehensive report error: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.dim(`   Response status: ${error.response.status}`));
      console.error(chalk.dim(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`));
    }
    
    return {
      status: 'error',
      message: `Failed to get comprehensive report: ${error.message}`
    };
  }
}

// Run the main function
main().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});