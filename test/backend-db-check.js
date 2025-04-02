#!/usr/bin/env node

/**
 * Backend Database Check Script
 * 
 * This script tests the database-related endpoints on the backend API.
 * Run with: node backend-db-check.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://grantcraft-backend-320165158819.us-central1.run.app';
const API_BASE = `${BACKEND_URL}/api`;
const TIMEOUT = 30000; // 30 seconds

// Output directory for reports
const OUTPUT_DIR = path.join(__dirname, 'outputs');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Endpoints to test
const endpoints = [
  { 
    name: 'Health Check', 
    path: '/monitoring/health', 
    description: 'Basic health check that should always work'
  },
  { 
    name: 'Database Connection', 
    path: '/monitoring/database/connection', 
    description: 'Checks if backend can connect to database'
  },
  { 
    name: 'List Tables', 
    path: '/monitoring/database/tables', 
    description: 'Lists all tables in the database'
  },
  { 
    name: 'Required Tables', 
    path: '/monitoring/database/required-tables', 
    description: 'Checks if all required tables exist'
  },
  { 
    name: 'Comprehensive Check', 
    path: '/monitoring/database/check-all', 
    description: 'Full database diagnostic with recommendations'
  }
];

/**
 * Test a single API endpoint
 */
async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing: ${endpoint.name} (${endpoint.description})`);
  console.log(`   URL: ${API_BASE}${endpoint.path}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${API_BASE}${endpoint.path}`, {
      timeout: TIMEOUT,
      validateStatus: () => true // Don't throw error on non-2xx
    });
    const duration = Date.now() - startTime;
    
    // Log basic response info
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Time: ${duration}ms`);
    
    // Save full response to file
    const filename = `${endpoint.path.replace(/\//g, '_')}.json`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
    console.log(`   Response saved to: ${outputPath}`);
    
    // Print summary based on endpoint
    if (endpoint.path === '/monitoring/database/connection') {
      if (response.data.connected) {
        console.log(`   ✅ Connected to database: ${response.data.version}`);
      } else {
        console.log(`   ❌ Database connection failed: ${response.data.message}`);
      }
    } else if (endpoint.path === '/monitoring/database/required-tables') {
      if (response.data.status === 'success') {
        console.log(`   ✅ All required tables exist`);
      } else {
        const missing = response.data.tables.filter(t => !t.exists).map(t => t.table);
        console.log(`   ❌ Missing tables: ${missing.join(', ')}`);
      }
    } else if (endpoint.path === '/monitoring/database/tables') {
      if (response.data.status === 'success') {
        console.log(`   📋 Found ${response.data.count} tables`);
        if (response.data.tables.length > 0) {
          console.log(`   Tables: ${response.data.tables.join(', ')}`);
        }
      } else {
        console.log(`   ❌ Failed to list tables: ${response.data.message}`);
      }
    }
    
    return {
      endpoint: endpoint.name,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
      duration
    };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`   🔴 Backend server not reachable at ${BACKEND_URL}`);
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.log(`   🔴 Request timed out after ${TIMEOUT}ms`);
    }
    
    return {
      endpoint: endpoint.name,
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function to run all tests
 */
async function main() {
  console.log('🔍 Backend Database Check Script');
  console.log('===============================');
  console.log(`Backend URL: ${BACKEND_URL}`);
  
  const results = [];
  
  // Test general health endpoint first
  const healthResult = await testEndpoint(endpoints[0]);
  results.push(healthResult);
  
  // If health check fails, stop testing
  if (!healthResult.success) {
    console.log('\n❌ Health check failed. Backend may not be running.');
    console.log('Stopping further tests.');
    return;
  }
  
  // Test remaining endpoints
  for (let i = 1; i < endpoints.length; i++) {
    const result = await testEndpoint(endpoints[i]);
    results.push(result);
  }
  
  // Generate summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`Total endpoints tested: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  // Save full report
  const report = {
    timestamp: new Date().toISOString(),
    backendUrl: BACKEND_URL,
    summary: {
      total: results.length,
      successful,
      failed
    },
    results
  };
  
  const reportPath = path.join(OUTPUT_DIR, 'backend-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);
  
  // Provide recommendations based on results
  if (results.some(r => r.endpoint === 'Database Connection' && !r.success)) {
    console.log('\n💡 Recommendations:');
    console.log('1. Check if database server is running');
    console.log('2. Verify DATABASE_URL in backend environment');
    console.log('3. Check for network connectivity between backend and database');
  } else if (results.some(r => r.endpoint === 'Required Tables' && 
             r.data && r.data.status !== 'success')) {
    console.log('\n💡 Recommendations:');
    console.log('1. Apply Prisma schema to create missing tables:');
    console.log('   cd next && ./apply-schema.sh');
    console.log('2. Or run Prisma migrations:');
    console.log('   cd next && npx prisma db push');
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});