/**
 * NLP Engine Configuration
 * 
 * This configuration file defines the settings and parameters for the Natural Language 
 * Processing engine used by GrantCraft.
 * 
 * Selected Engine: OpenAI GPT-4
 * Rationale:
 * - Superior context understanding for complex research topics
 * - Strong technical and domain-specific knowledge across academic fields
 * - Good at generating structured content (e.g., grant sections)
 * - Ability to maintain conversation continuity
 */

const NLP_ENGINES = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  COHERE: 'cohere',
  AZURE_OPENAI: 'azure_openai',
};

const NLP_CONFIG = {
  // Primary engine configuration
  primaryEngine: NLP_ENGINES.OPENAI,
  
  // OpenAI configuration
  openai: {
    model: 'gpt-4', // Use most capable model for complex research topics
    temperature: 0.7, // Balance between creativity and predictability
    maxTokens: 1000, // Default response length limit
    topP: 0.95,
    presencePenalty: 0.1, // Slight penalty to avoid repetition
    frequencyPenalty: 0.1,
    systemPrompt: `You are GrantCraft, an AI assistant specialized in helping researchers develop compelling grant proposals.
    Your expertise spans academic disciplines, funding mechanisms, and grant writing best practices.
    You help users explore research topics, find suitable funding opportunities, and develop complete grant packages.
    Always maintain a professional, helpful tone, and guide users through the grant development process step by step.
    When discussing specific research fields, demonstrate knowledge of current trends and methodologies.
    When helping with proposal sections, follow standard grant writing conventions and emphasize clarity, significance, and impact.`
  },
  
  // Anthropic backup configuration (for certain specialized tasks)
  anthropic: {
    model: 'claude-3-opus',
    temperature: 0.5,
    maxTokens: 1000,
    prompt: `You are GrantCraft, an AI assistant specialized in helping researchers develop compelling grant proposals.\n\nHuman: `
  },
  
  // Engine selection rules
  engineRules: {
    // Use Anthropic for certain tasks where it excels
    useClaude: [
      'literature_review',
      'methodology_critique',
      'ethics_considerations'
    ],
    // Use Cohere for specific embedding and semantic search tasks
    useCohere: [
      'grant_matching',
      'semantic_search',
      'document_similarity'
    ]
  },
  
  // Context management
  contextWindow: {
    maxConversationHistory: 20, // Number of exchanges to retain
    priorityContext: ['research_topic', 'project_goals', 'methodology_details'] // High priority items to maintain in context
  }
};

// Function to get the appropriate engine for a given task
export function getEngineForTask(task) {
  if (NLP_CONFIG.engineRules.useClaude.includes(task)) {
    return NLP_ENGINES.ANTHROPIC;
  }
  
  if (NLP_CONFIG.engineRules.useCohere.includes(task)) {
    return NLP_ENGINES.COHERE;
  }
  
  return NLP_CONFIG.primaryEngine;
}

// Function to get configuration for the selected engine
export function getEngineConfig(engine = NLP_CONFIG.primaryEngine) {
  return NLP_CONFIG[engine.toLowerCase()];
}

export { NLP_CONFIG, NLP_ENGINES };