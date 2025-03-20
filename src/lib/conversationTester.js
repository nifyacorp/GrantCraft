/**
 * Conversation Tester
 * 
 * This module provides a testing harness for evaluating the AI's ability
 * to understand and respond to research topic discussions.
 */

import { getNextPrompt, determineNextStage } from './conversationalFlow';
import { generatePrompt } from './promptEngineering';

// Test cases for conversation flow with expected stage transitions
const testCases = [
  {
    name: 'Introduction to Topic Exploration',
    input: 'I\'m interested in researching climate change mitigation strategies.',
    initialStage: 'introduction',
    expectedNextStage: 'topic_exploration',
    expectedResponseContains: ['climate', 'research', 'specific']
  },
  {
    name: 'Topic Exploration to Grant Matching',
    input: 'I would like to find funding opportunities for my research.',
    initialStage: 'topic_exploration',
    expectedNextStage: 'grant_matching',
    expectedResponseContains: ['grant', 'funding', 'match']
  },
  {
    name: 'Topic Exploration to Project Creation',
    input: 'I want to create a new project for my quantum computing research.',
    initialStage: 'topic_exploration',
    expectedNextStage: 'project_creation',
    expectedResponseContains: ['title', 'proposal', 'project']
  },
  {
    name: 'Project Creation to Section Development',
    input: 'Quantum Computing Applications in Cryptography',
    initialStage: 'project_creation',
    expectedNextStage: 'section_development',
    expectedResponseContains: ['abstract', 'research', 'problem']
  },
  {
    name: 'Section Development Topic Extraction',
    input: 'My research focuses on developing new algorithms for quantum key distribution.',
    initialStage: 'section_development',
    topic: 'quantum computing',
    expectedNextStage: 'section_development',
    expectedResponseContains: ['method', 'approach', 'collect']
  }
];

// Function to run test cases and report results
export function runConversationTests() {
  console.log('🧪 Running Conversation Flow Tests 🧪');
  console.log('===================================');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  testCases.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: ${test.name}`);
    
    try {
      // Determine next stage based on user input
      const nextStage = determineNextStage(test.initialStage, test.input);
      
      // Get response based on determined stage
      const response = getNextPrompt(
        nextStage.toLowerCase(), 
        test.topic || extractTestTopic(test.input), 
        {}
      );
      
      // Check if stage transition is correct
      const stageMatch = nextStage.toLowerCase() === test.expectedNextStage.toLowerCase();
      
      // Check if response contains expected fragments
      const responseChecks = test.expectedResponseContains.map(fragment => {
        return {
          fragment,
          found: response.toLowerCase().includes(fragment.toLowerCase())
        };
      });
      
      const responseMatch = responseChecks.every(check => check.found);
      
      if (stageMatch && responseMatch) {
        console.log('✅ PASSED');
        results.passed++;
      } else {
        console.log('❌ FAILED');
        results.failed++;
        
        if (!stageMatch) {
          console.log(`  - Expected stage: ${test.expectedNextStage}`);
          console.log(`  - Actual stage: ${nextStage.toLowerCase()}`);
        }
        
        if (!responseMatch) {
          console.log('  - Response missing expected content:');
          responseChecks
            .filter(check => !check.found)
            .forEach(check => {
              console.log(`    - "${check.fragment}"`);
            });
          console.log(`  - Actual response: "${response}"`);
        }
      }
      
      results.details.push({
        name: test.name,
        passed: stageMatch && responseMatch,
        stage: {
          expected: test.expectedNextStage.toLowerCase(),
          actual: nextStage.toLowerCase(),
          passed: stageMatch
        },
        response: {
          text: response,
          checks: responseChecks,
          passed: responseMatch
        }
      });
      
    } catch (error) {
      console.log('❌ ERROR');
      console.error(error);
      
      results.failed++;
      results.details.push({
        name: test.name,
        passed: false,
        error: error.message
      });
    }
  });
  
  console.log('\n===================================');
  console.log(`📊 Results: ${results.passed} passed, ${results.failed} failed`);
  
  return results;
}

// Simple topic extraction for testing purposes
function extractTestTopic(input) {
  const topicKeywords = {
    'climate': 'climate change',
    'quantum': 'quantum computing',
    'ai': 'artificial intelligence',
    'cancer': 'cancer research',
    'genetic': 'genetic engineering',
    'neural': 'neural networks',
    'renewable': 'renewable energy'
  };
  
  const inputLower = input.toLowerCase();
  for (const [keyword, topic] of Object.entries(topicKeywords)) {
    if (inputLower.includes(keyword)) {
      return topic;
    }
  }
  
  return 'research';
}

// Function to test prompt generation with different variables
export function testPromptGeneration() {
  console.log('\n🔤 Testing Prompt Generation 🔤');
  console.log('===================================');
  
  const testVariables = [
    {
      template: 'welcome',
      variables: { userName: 'Dr. Smith' }
    },
    {
      template: 'topicExploration',
      variables: { 
        topic: 'quantum computing',
        explorationQuestion: 'What specific quantum algorithms are you researching?' 
      }
    },
    {
      template: 'projectCreation',
      variables: { topic: 'renewable energy' }
    },
    {
      template: 'sectionDevelopment',
      variables: { 
        sectionName: 'methodology',
        sectionGuidance: 'Be specific about techniques and procedures.',
        sectionQuestion: 'What equipment or resources will you need for this research?' 
      }
    }
  ];
  
  testVariables.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: ${test.template} template`);
    
    try {
      const prompt = generatePrompt(test.template, test.variables);
      const success = prompt && prompt.length > 0 && 
                    Object.values(test.variables).every(value => 
                      prompt.includes(value));
      
      if (success) {
        console.log('✅ PASSED');
        console.log(`Prompt: "${prompt.substring(0, 100)}..."`);
      } else {
        console.log('❌ FAILED');
        console.log(`Generated prompt: "${prompt}"`);
        console.log('Missing variables:');
        Object.entries(test.variables).forEach(([key, value]) => {
          if (!prompt.includes(value)) {
            console.log(`  - ${key}: ${value}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.error(error);
    }
  });
}

// Export test functions
export { testCases };