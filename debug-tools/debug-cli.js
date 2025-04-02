#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

// Default URLs for the services
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://grantcraft-frontend-320165158819.us-central1.run.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://grantcraft-backend-320165158819.us-central1.run.app';
const DEBUG_PASSWORD = process.env.DEBUG_PASSWORD || 'GrantCraft2025!Debug';

// Helper to format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}

// Check health of both services
async function checkHealth() {
  const spinner = ora('Checking service health...').start();
  
  try {
    // Check frontend
    const frontendResponse = await axios.get(`${FRONTEND_URL}/api/debug/health`, { timeout: 5000 });
    
    // Check backend
    const backendResponse = await axios.get(`${BACKEND_URL}/api/debug/health`, { timeout: 5000 });
    
    spinner.succeed('Health check completed');
    
    console.log('\nFrontend Status:');
    console.log(`  Status: ${chalk.green(frontendResponse.data.status)}`);
    console.log(`  Timestamp: ${formatTime(frontendResponse.data.timestamp)}`);
    console.log(`  Version: ${frontendResponse.data.version}`);
    console.log(`  Environment: ${frontendResponse.data.node_env}`);
    
    console.log('\nBackend Status:');
    console.log(`  Status: ${chalk.green(backendResponse.data.status)}`);
    console.log(`  Timestamp: ${formatTime(backendResponse.data.timestamp)}`);
    console.log(`  Version: ${backendResponse.data.version}`);
    
    return true;
  } catch (error) {
    spinner.fail('Health check failed');
    
    if (error.response) {
      console.error(chalk.red(`Error: Received ${error.response.status} from ${error.config.url}`));
    } else if (error.request) {
      console.error(chalk.red(`Error: No response received from ${error.config.url}`));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return false;
  }
}

// Test login functionality
async function testLogin(username, password) {
  const spinner = ora('Testing login functionality...').start();
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/debug/test/login`, {
      params: { username, password },
      timeout: 5000
    });
    
    spinner.succeed('Login test completed');
    
    console.log(`\nStatus: ${response.data.status === 'success' ? chalk.green(response.data.status) : chalk.red(response.data.status)}`);
    console.log(`Message: ${response.data.message}`);
    console.log(`Would succeed: ${response.data.would_succeed ? chalk.green('Yes') : chalk.red('No')}`);
    
    return response.data.would_succeed;
  } catch (error) {
    spinner.fail('Login test failed');
    
    if (error.response) {
      console.error(chalk.red(`Error: Received ${error.response.status} from server`));
      console.error(error.response.data);
    } else if (error.request) {
      console.error(chalk.red('Error: No response received from server'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return false;
  }
}

// Test database connectivity
async function testDatabase() {
  const spinner = ora('Testing database connectivity...').start();
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/debug/test/database`, {
      params: { password: DEBUG_PASSWORD },
      timeout: 8000
    });
    
    if (response.data.connected) {
      spinner.succeed('Database connection successful');
      console.log(`\nDatabase version: ${response.data.version}`);
    } else {
      spinner.fail('Database connection failed');
      console.error(chalk.red(`Error: ${response.data.message}`));
    }
    
    return response.data.connected;
  } catch (error) {
    spinner.fail('Database test failed');
    
    if (error.response) {
      if (error.response.status === 403) {
        console.error(chalk.red('Error: Authentication failed - check DEBUG_PASSWORD'));
      } else {
        console.error(chalk.red(`Error: Received ${error.response.status} from server`));
        console.error(error.response.data);
      }
    } else if (error.request) {
      console.error(chalk.red('Error: No response received from server'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return false;
  }
}

// Get recent errors
async function getErrors() {
  const spinner = ora('Fetching recent errors...').start();
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/debug/errors`, {
      params: { password: DEBUG_PASSWORD },
      timeout: 5000
    });
    
    spinner.succeed(`Found ${response.data.count} errors`);
    
    if (response.data.count === 0) {
      console.log(chalk.green('\nNo errors found - system looks healthy!'));
    } else {
      console.log(chalk.yellow(`\nMost recent errors (${response.data.count}):`));
      
      response.data.errors.slice(-10).forEach((error, index) => {
        console.log(`\n${index + 1}. ${chalk.red(error.level)} at ${formatTime(error.timestamp)}`);
        console.log(`   Module: ${error.module}:${error.line}`);
        console.log(`   Message: ${error.message}`);
      });
    }
    
    return response.data.errors;
  } catch (error) {
    spinner.fail('Failed to fetch errors');
    
    if (error.response) {
      if (error.response.status === 403) {
        console.error(chalk.red('Error: Authentication failed - check DEBUG_PASSWORD'));
      } else {
        console.error(chalk.red(`Error: Received ${error.response.status} from server`));
      }
    } else if (error.request) {
      console.error(chalk.red('Error: No response received from server'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return [];
  }
}

// Setup CLI commands
program
  .name('grantcraft-debug')
  .description('CLI tool for debugging GrantCraft services')
  .version('1.0.0');

program
  .command('health')
  .description('Check health of frontend and backend services')
  .action(checkHealth);

program
  .command('login')
  .description('Test login functionality')
  .option('-u, --username <username>', 'Username for login test', 'test@example.com')
  .option('-p, --password <password>', 'Password for login test', 'password123')
  .action((options) => testLogin(options.username, options.password));

program
  .command('database')
  .description('Test database connectivity')
  .action(testDatabase);

program
  .command('errors')
  .description('Get recent errors from the backend')
  .action(getErrors);

program
  .command('all')
  .description('Run all checks')
  .action(async () => {
    console.log(chalk.blue('=== GrantCraft System Check ===\n'));
    
    console.log(chalk.blue('Checking service health...'));
    const healthOk = await checkHealth();
    
    console.log(chalk.blue('\nTesting login functionality...'));
    const loginOk = await testLogin('test@example.com', 'password123');
    
    console.log(chalk.blue('\nTesting database connectivity...'));
    const dbOk = await testDatabase();
    
    console.log(chalk.blue('\nChecking for recent errors...'));
    const errors = await getErrors();
    
    console.log(chalk.blue('\n=== Summary ==='));
    console.log(`Health check: ${healthOk ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Login test: ${loginOk ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Database test: ${dbOk ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Errors: ${errors.length === 0 ? chalk.green('None found') : chalk.yellow(errors.length + ' found')}`);
    
    const allOk = healthOk && loginOk && dbOk && errors.length === 0;
    console.log(`\nOverall status: ${allOk ? chalk.green('HEALTHY') : chalk.yellow('ISSUES DETECTED')}`);
    
    if (!allOk) {
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// Default to "all" if no command is provided
if (process.argv.length <= 2) {
  program.help();
}