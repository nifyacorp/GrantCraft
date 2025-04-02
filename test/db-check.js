#!/usr/bin/env node

/**
 * GrantCraft Database Check Tool
 * 
 * This script directly checks the database structure to verify tables and schema
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// You'll need to provide the DATABASE_URL as an environment variable
// or specify it directly here
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://reworkd_platform:Platform_DB_Pass_2025!@34.66.109.248:3306/reworkd_platform';

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

// Output directory
const OUTPUT_DIR = path.join(__dirname, 'outputs', 'db');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  try {
    // Simple query to verify connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    return result[0].connected === 1;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
}

/**
 * Get list of tables in the database
 */
async function listTables() {
  try {
    // This works for MySQL
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    return tables;
  } catch (error) {
    console.error('Error listing tables:', error.message);
    return [];
  }
}

/**
 * Get schema definition of a table
 */
async function describeTable(tableName) {
  try {
    // This works for MySQL
    const schema = await prisma.$queryRaw`DESCRIBE ${tableName}`;
    return schema;
  } catch (error) {
    console.error(`Error describing table ${tableName}:`, error.message);
    return [];
  }
}

/**
 * Check if specific tables exist
 */
async function checkRequiredTables() {
  // These are the tables NextAuth.js needs
  const requiredTables = [
    'Account',
    'Session',
    'User',
    'VerificationToken',
    'Agent',
    'AgentTask',
    'Organization',
    'OrganizationUser'
  ];
  
  const tables = await listTables();
  
  // Extract table names - format can differ based on database
  const tableNames = tables.map(table => {
    // For MySQL the property is often in format `Tables_in_dbname`
    const tableName = table[Object.keys(table)[0]];
    return tableName;
  });
  
  const results = requiredTables.map(table => {
    const exists = tableNames.some(name => name.toLowerCase() === table.toLowerCase());
    return {
      table,
      exists
    };
  });
  
  return {
    allTablesExist: results.every(r => r.exists),
    results
  };
}

/**
 * Run the checks and save results
 */
async function runDatabaseChecks() {
  console.log('Running database checks...');
  
  // Check connection
  const connected = await checkDatabaseConnection();
  console.log('Database connection:', connected ? 'OK' : 'FAILED');
  
  if (!connected) {
    return {
      connected,
      message: 'Cannot connect to the database',
      timestamp: new Date().toISOString()
    };
  }
  
  // List tables
  const tables = await listTables();
  const tableNames = tables.map(table => table[Object.keys(table)[0]]);
  console.log('Database tables:', tableNames);
  
  // Check required tables
  const requiredTablesCheck = await checkRequiredTables();
  console.log('Required tables check:', 
    requiredTablesCheck.allTablesExist ? 'All tables exist' : 'Some tables are missing'
  );
  
  // Describe tables (for those that exist)
  const schemas = {};
  for (const tableResult of requiredTablesCheck.results) {
    if (tableResult.exists) {
      schemas[tableResult.table] = await describeTable(tableResult.table);
    }
  }
  
  // Summary
  const result = {
    connected,
    timestamp: new Date().toISOString(),
    allTables: tableNames,
    requiredTables: requiredTablesCheck.results,
    schemas
  };
  
  // Save results
  const filename = `db-check-${new Date().toISOString().replace(/:/g, '-')}.json`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Results saved to ${outputPath}`);
  
  return result;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('GrantCraft Database Check Tool');
    console.log('------------------------------');
    console.log(`Database URL: ${DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    const results = await runDatabaseChecks();
    
    console.log('\nResults Summary:');
    console.log('---------------');
    console.log(`Connection: ${results.connected ? 'Success' : 'Failed'}`);
    
    if (results.requiredTables) {
      console.log('Required Tables:');
      for (const table of results.requiredTables) {
        console.log(`- ${table.table}: ${table.exists ? '✅ Exists' : '❌ Missing'}`);
      }
    }
    
    console.log('\nRecommendations:');
    if (!results.connected) {
      console.log('- Check database credentials and connection string');
      console.log('- Verify database server is running and accessible');
    } else if (results.requiredTables && !results.requiredTables.every(t => t.exists)) {
      console.log('- Run Prisma migrations to create missing tables:');
      console.log('  cd next && npx prisma db push');
      console.log('  or');
      console.log('  cd next && npx prisma migrate deploy');
    } else {
      console.log('- Database structure looks good!');
    }
    
  } catch (error) {
    console.error('Error in database check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();