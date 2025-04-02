#!/usr/bin/env node

/**
 * GrantCraft Login Bypass Test
 * 
 * This script demonstrates how to test the application by bypassing the login
 * by directly calling the backend APIs that don't require authentication.
 */

const apiClient = require('./api-client');
const path = require('path');
const fs = require('fs');

// Path to store any session information
const SESSION_FILE = path.join(__dirname, 'outputs', 'session.json');

async function createOrLoadSession() {
  console.log('Checking for existing session...');
  
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      console.log('Found existing session');
      return sessionData;
    }
  } catch (error) {
    console.error('Error loading session:', error.message);
  }
  
  console.log('Creating new session by logging in...');
  
  // Create a directory to store the session if it doesn't exist
  const dir = path.dirname(SESSION_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  try {
    // This performs a login with the development credentials provider
    // Note: In a real app, you'd use the actual login endpoint with real credentials
    const username = 'test@example.com';
    
    // Test the login functionality
    const loginResult = await apiClient.testLogin(username, 'password123');
    
    if (!loginResult.success) {
      throw new Error('Login test failed');
    }
    
    // Since we can't actually login through the API in this test script,
    // we'll just create a mock session for demonstration purposes
    const sessionData = {
      username,
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    
    // Save the session data
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
    console.log('Created new demo session');
    
    return sessionData;
  } catch (error) {
    console.error('Error creating session:', error.message);
    return null;
  }
}

async function createTestAgent() {
  console.log('Creating a test agent...');
  
  const urls = apiClient.getServiceUrls();
  const backendUrl = urls.backend;
  
  try {
    // In a real test with authentication, you would include the session token
    // Here we're just demonstrating the API structure but not actually creating an agent
    
    console.log('This is a simulated agent creation since we cannot authenticate');
    console.log(`The actual endpoint would be: ${backendUrl}/api/agent`);
    
    // Return a mock agent for illustration
    return {
      id: 'mock-agent-id',
      name: 'Test Agent',
      goal: 'Help with testing',
      createdAt: new Date().toISOString(),
      isDemo: true
    };
  } catch (error) {
    console.error('Error creating test agent:', error.message);
    return null;
  }
}

async function runAgentTask(agentId) {
  console.log(`Running a task for agent ${agentId}...`);
  
  const urls = apiClient.getServiceUrls();
  const backendUrl = urls.backend;
  
  try {
    // Again, this is just for demonstration
    console.log('This is a simulated task execution since we cannot authenticate');
    console.log(`The actual endpoint would be: ${backendUrl}/api/agent/tasks`);
    
    // Return a mock task result
    return {
      taskId: 'mock-task-id',
      status: 'completed',
      result: 'This is a simulated task result',
      createdAt: new Date().toISOString(),
      isDemo: true
    };
  } catch (error) {
    console.error('Error running agent task:', error.message);
    return null;
  }
}

// For any requests that require backend auth but not frontend auth
async function directBackendRequest() {
  console.log('Making a direct backend request that might not require auth...');
  
  try {
    // Test with the ping endpoint we created, which doesn't need auth
    const urls = apiClient.getServiceUrls();
    const pingUrl = `${urls.backend}/api/debug/ping`;
    
    const response = await apiClient.makeApiRequest({ url: pingUrl, method: 'GET' });
    
    console.log('Direct backend request successful:');
    console.log(response.data);
    
    return response;
  } catch (error) {
    console.error('Error making direct backend request:', error.message);
    return null;
  }
}

async function main() {
  console.log('=== GrantCraft Login Bypass Demo ===\n');
  
  // Step 1: Create or load a session
  const session = await createOrLoadSession();
  if (!session) {
    console.error('Failed to create or load session');
    process.exit(1);
  }
  
  // Step 2: Make a direct backend request that doesn't need auth
  const pingResponse = await directBackendRequest();
  if (!pingResponse) {
    console.error('Failed to make direct backend request');
  }
  
  // Step 3: Create a test agent (simulated since we can't authenticate)
  const agent = await createTestAgent();
  if (!agent) {
    console.error('Failed to create test agent');
  }
  
  // Step 4: Run a task on the agent (simulated)
  if (agent) {
    const task = await runAgentTask(agent.id);
    if (!task) {
      console.error('Failed to run agent task');
    }
  }
  
  console.log('\n=== Test Summary ===');
  console.log('Session created:', !!session);
  console.log('Backend ping successful:', !!pingResponse);
  console.log('Agent created (simulated):', !!agent);
  console.log('Task run (simulated):', !!(agent && await runAgentTask(agent.id)));
  
  console.log('\nNote: Some operations are simulated since we cannot authenticate properly in this test script');
  console.log('To test actual functionality, you should login through the UI and then use the debug endpoints');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});