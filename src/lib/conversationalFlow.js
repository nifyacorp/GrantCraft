/**
 * GrantCraft Conversational Flow
 * 
 * This module defines the primary conversation paths for research topic exploration
 * and grant development process.
 */

// Main conversation stages with transition conditions
const conversationStages = {
  INTRODUCTION: {
    id: 'introduction',
    next: ['TOPIC_EXPLORATION'],
    description: 'Welcome and initial introduction to GrantCraft'
  },
  TOPIC_EXPLORATION: {
    id: 'topic_exploration',
    next: ['GRANT_MATCHING', 'PROJECT_CREATION'],
    description: 'Discuss and refine research topic and interests'
  },
  GRANT_MATCHING: {
    id: 'grant_matching',
    next: ['PROJECT_CREATION'],
    description: 'Find appropriate funding opportunities based on topic'
  },
  PROJECT_CREATION: {
    id: 'project_creation',
    next: ['SECTION_DEVELOPMENT'],
    description: 'Create new project with title and basic structure'
  },
  SECTION_DEVELOPMENT: {
    id: 'section_development',
    next: ['SECTION_DEVELOPMENT', 'BUDGET_PLANNING', 'DOCUMENT_GENERATION'],
    description: 'Develop specific sections of the grant proposal'
  },
  BUDGET_PLANNING: {
    id: 'budget_planning',
    next: ['TIMELINE_PLANNING', 'DOCUMENT_GENERATION'],
    description: 'Create and refine project budget'
  },
  TIMELINE_PLANNING: {
    id: 'timeline_planning',
    next: ['DOCUMENT_GENERATION'],
    description: 'Set project timeline, milestones and deliverables'
  },
  DOCUMENT_GENERATION: {
    id: 'document_generation',
    next: ['REFINEMENT'],
    description: 'Generate complete proposal documents'
  },
  REFINEMENT: {
    id: 'refinement',
    next: ['REFINEMENT', 'COMPLETION'],
    description: 'Review and refine generated content'
  },
  COMPLETION: {
    id: 'completion',
    next: [],
    description: 'Finalize grant proposal package'
  }
};

// Topic exploration prompts to guide the conversation
const topicExplorationPrompts = [
  "Can you describe your research on {topic} in a few sentences?",
  "What specific aspect of {topic} are you most interested in exploring?",
  "What are the potential impacts or applications of your {topic} research?",
  "What methodologies or approaches do you plan to use in your {topic} research?",
  "Who might benefit from the outcomes of your research on {topic}?",
  "What key challenges in {topic} does your research address?",
  "Have you conducted previous research in {topic}? If so, what were your findings?",
  "Are you collaborating with other researchers or institutions on this {topic} work?",
  "What timeframe are you considering for your {topic} research project?",
  "What specific resources, equipment, or funding would you need for your {topic} research?"
];

// Section development prompts based on common grant sections
const sectionDevelopmentPrompts = {
  abstract: [
    "What is the core problem your research addresses?",
    "In one sentence, what is your proposed solution or approach?",
    "What is the ultimate goal or outcome of this research?",
    "Who will benefit from this research and how?"
  ],
  introduction: [
    "What is the broader context of your research area?",
    "Why is this research important now?",
    "What gap in knowledge does your research address?",
    "How does your approach differ from previous work?"
  ],
  methodology: [
    "What specific methods will you use in your research?",
    "How will you collect and analyze data?",
    "What resources or equipment will you need?",
    "What is your timeline for completing different phases of the research?",
    "How will you measure success or progress?"
  ],
  impact: [
    "What are the immediate outcomes of your research?",
    "What are the long-term implications?",
    "How might your findings be applied in practice?",
    "Which communities or stakeholders will benefit most from this research?",
    "How does this research advance your field?"
  ]
};

// Function to determine appropriate prompt based on conversation state
export function getNextPrompt(currentStage, topic, previousResponses = {}) {
  switch(currentStage) {
    case 'introduction':
      return "Welcome to GrantCraft! I'm here to help you develop a compelling research grant proposal. What research area are you interested in exploring?";
    
    case 'topic_exploration':
      // Select a prompt that hasn't been asked yet
      const askedPrompts = previousResponses.topicExploration || [];
      const availablePrompts = topicExplorationPrompts.filter(
        prompt => !askedPrompts.includes(prompt)
      );
      
      if (availablePrompts.length === 0) {
        return "Based on our discussion about your research, would you like to explore potential grant opportunities or start creating your project?";
      }
      
      return availablePrompts[0].replace('{topic}', topic || 'your research area');
    
    case 'grant_matching':
      return "I can help you find grants that match your research interests. Would you like to focus on government grants, foundation funding, or both?";
    
    case 'project_creation':
      return "Let's create your grant project. What would you like to title your research proposal?";
    
    case 'section_development':
      const section = previousResponses.currentSection || 'abstract';
      const sectionPrompts = sectionDevelopmentPrompts[section] || [];
      const askedSectionPrompts = previousResponses.sectionPrompts || [];
      
      const availableSectionPrompts = sectionPrompts.filter(
        prompt => !askedSectionPrompts.includes(prompt)
      );
      
      if (availableSectionPrompts.length === 0) {
        return `I have enough information to draft the ${section} section. Would you like me to generate it now, or would you prefer to work on another section?`;
      }
      
      return availableSectionPrompts[0];
    
    default:
      return "What would you like to work on next for your grant proposal?";
  }
}

// Function to analyze user response and determine next stage
export function determineNextStage(currentStage, userResponse) {
  const stage = conversationStages[currentStage.toUpperCase()];
  
  if (!stage) {
    return 'INTRODUCTION';
  }
  
  const userResponseLower = userResponse.toLowerCase();
  
  // Stage-specific transition logic
  switch (currentStage) {
    case 'introduction':
      // Any response from introduction should move to topic exploration
      return 'TOPIC_EXPLORATION';
      
    case 'topic_exploration':
      // Check for grant/funding related keywords
      if (userResponseLower.includes('grant') || 
          userResponseLower.includes('funding') || 
          userResponseLower.includes('opportunity') ||
          userResponseLower.includes('money') ||
          userResponseLower.includes('financial')) {
        return 'GRANT_MATCHING';
      }
      
      // Check for project creation intent
      if (userResponseLower.includes('project') || 
          userResponseLower.includes('create') || 
          userResponseLower.includes('start') ||
          userResponseLower.includes('begin') ||
          userResponseLower.includes('new')) {
        return 'PROJECT_CREATION';
      }
      
      // Stay in topic exploration if the response contains questions
      if (userResponseLower.includes('?') || 
          userResponseLower.includes('what') ||
          userResponseLower.includes('how') ||
          userResponseLower.includes('why')) {
        return 'TOPIC_EXPLORATION';
      }
      
      // Default for topic exploration
      return 'TOPIC_EXPLORATION';
      
    case 'grant_matching':
      // Move to project creation if user shows readiness
      if (userResponseLower.includes('create') ||
          userResponseLower.includes('start') ||
          userResponseLower.includes('project') ||
          userResponseLower.includes('begin') ||
          userResponseLower.includes('ready')) {
        return 'PROJECT_CREATION';
      }
      
      // Stay in grant matching otherwise
      return 'GRANT_MATCHING';
      
    case 'project_creation':
      // Any response with a potential project title should move to section development
      if (userResponse.length > 3 && !userResponseLower.includes('?')) {
        return 'SECTION_DEVELOPMENT';
      }
      
      // Stay in project creation if the user seems to be asking questions
      return 'PROJECT_CREATION';
      
    case 'section_development':
      // Check for budget related keywords
      if (userResponseLower.includes('budget') ||
          userResponseLower.includes('cost') ||
          userResponseLower.includes('fund') ||
          userResponseLower.includes('expense') ||
          userResponseLower.includes('money')) {
        return 'BUDGET_PLANNING';
      }
      
      // Check for timeline related keywords
      if (userResponseLower.includes('timeline') ||
          userResponseLower.includes('schedule') ||
          userResponseLower.includes('milestone') ||
          userResponseLower.includes('deadline') ||
          userResponseLower.includes('timeframe')) {
        return 'TIMELINE_PLANNING';
      }
      
      // Default to staying in section development
      return 'SECTION_DEVELOPMENT';
      
    default:
      // For all other stages, take the first available transition
      return stage.next[0] || 'INTRODUCTION';
  }
}

export { conversationStages, topicExplorationPrompts, sectionDevelopmentPrompts };