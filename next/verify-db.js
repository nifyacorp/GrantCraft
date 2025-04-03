// Simple script to verify database tables
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTables() {
  try {
    // Try to query the Account table
    console.log('Checking if Account table exists...');
    const accounts = await prisma.$queryRaw`SHOW TABLES LIKE 'Account'`;
    console.log('Account table exists:', accounts.length > 0);
    
    if (accounts.length > 0) {
      console.log('Database tables are correctly set up for NextAuth');
    } else {
      console.log('Account table is missing - OAuth will not work correctly');
    }
    
    // List all tables
    console.log('\nAll tables in database:');
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });
  } catch (error) {
    console.error('Error verifying tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();