/**
 * Context Manager
 * 
 * This module is responsible for managing conversation context,
 * ensuring the AI maintains memory of previous interactions.
 */

import { NLP_CONFIG } from './nlpConfig';

// Context retention configuration
const contextConfig = {
  // Maximum number of message pairs to retain
  maxHistoryLength: NLP_CONFIG.contextWindow.maxConversationHistory || 20,
  
  // Weights for different content types when pruning
  contentWeights: {
    RESEARCH_TOPIC: 10,    // Research topic details
    METHODOLOGY: 8,        // Methodology information
    IMPACT: 7,             // Impact statements
    TIMELINE: 5,           // Timeline details
    BUDGET: 5,             // Budget information
    PERSONNEL: 4,          // Personnel details
    GENERAL: 1             // General conversation
  },
  
  // Maximum total context size in characters
  maxContextSize: 8000,
  
  // Keywords to identify content types
  contentTypeKeywords: {
    RESEARCH_TOPIC: ['research', 'topic', 'study', 'investigate', 'explore', 'field'],
    METHODOLOGY: ['method', 'approach', 'procedure', 'technique', 'experiment', 'analysis'],
    IMPACT: ['impact', 'benefit', 'significance', 'importance', 'outcome', 'result'],
    TIMELINE: ['timeline', 'schedule', 'milestone', 'phase', 'deadline', 'month', 'year'],
    BUDGET: ['budget', 'cost', 'funding', 'expense', 'financial', 'dollar', 'amount'],
    PERSONNEL: ['personnel', 'researcher', 'staff', 'collaborator', 'team', 'assistant']
  }
};

// Context storage class
class ConversationContext {
  constructor() {
    this.messageHistory = [];
    this.metadata = {
      topic: '',
      stage: 'introduction',
      projectTitle: '',
      keyInsights: {},
      askedQuestions: []
    };
  }
  
  // Add a message pair to context
  addMessage(userMessage, aiResponse) {
    // Create message pair
    const messagePair = {
      user: userMessage,
      ai: aiResponse,
      timestamp: Date.now(),
      contentType: this.classifyContentType(userMessage),
      weight: 1 // Default weight, will be updated
    };
    
    // Update weight based on content type
    messagePair.weight = this.getMessageWeight(messagePair.contentType);
    
    // Add to history
    this.messageHistory.push(messagePair);
    
    // Perform context pruning if needed
    this.pruneContextIfNeeded();
    
    // Extract and update metadata
    this.updateMetadata(userMessage, aiResponse);
    
    return this;
  }
  
  // Update conversation metadata based on messages
  updateMetadata(userMessage, aiResponse) {
    // Track asked questions to avoid repetition
    if (aiResponse && aiResponse.includes('?')) {
      this.metadata.askedQuestions.push(aiResponse);
    }
    
    // Extract topic if not already set
    if (!this.metadata.topic) {
      const topicKeywords = ['research on', 'studying', 'working on', 'interested in'];
      for (const keyword of topicKeywords) {
        const keywordIndex = userMessage.toLowerCase().indexOf(keyword);
        if (keywordIndex >= 0) {
          const potentialTopic = userMessage.substring(keywordIndex + keyword.length).split('.')[0].trim();
          if (potentialTopic.length > 0 && potentialTopic.length < 50) {
            this.metadata.topic = potentialTopic;
            break;
          }
        }
      }
    }
    
    // Extract project title if mentioned
    const titleIndicators = ['title', 'name', 'call it', 'project'];
    for (const indicator of titleIndicators) {
      if (userMessage.toLowerCase().includes(indicator) && !userMessage.includes('?')) {
        const words = userMessage.split(' ');
        if (words.length >= 3 && words.length <= 10) {
          this.metadata.projectTitle = userMessage.trim();
        }
      }
    }
    
    // Store key insights based on content type
    const contentType = this.classifyContentType(userMessage);
    if (contentType !== 'GENERAL') {
      const key = contentType.toLowerCase();
      if (!this.metadata.keyInsights[key]) {
        this.metadata.keyInsights[key] = [];
      }
      this.metadata.keyInsights[key].push(userMessage);
      
      // Keep only the 3 most recent insights for each category
      if (this.metadata.keyInsights[key].length > 3) {
        this.metadata.keyInsights[key].shift();
      }
    }
  }
  
  // Classify message content type for better retention
  classifyContentType(message) {
    const messageLower = message.toLowerCase();
    
    for (const [contentType, keywords] of Object.entries(contextConfig.contentTypeKeywords)) {
      for (const keyword of keywords) {
        if (messageLower.includes(keyword)) {
          return contentType;
        }
      }
    }
    
    return 'GENERAL';
  }
  
  // Get weight for a content type
  getMessageWeight(contentType) {
    return contextConfig.contentWeights[contentType] || contextConfig.contentWeights.GENERAL;
  }
  
  // Prune context when it exceeds limits
  pruneContextIfNeeded() {
    // Check if we need to prune by count
    if (this.messageHistory.length > contextConfig.maxHistoryLength) {
      this.pruneByCount();
    }
    
    // Check if we need to prune by size
    const totalContextSize = this.getContextSize();
    if (totalContextSize > contextConfig.maxContextSize) {
      this.pruneBySize();
    }
  }
  
  // Prune by keeping the highest weighted and most recent messages
  pruneByCount() {
    // Sort by weight and recency
    const sortedMessages = [...this.messageHistory].sort((a, b) => {
      // If weights differ significantly, prioritize by weight
      if (Math.abs(a.weight - b.weight) > 2) {
        return b.weight - a.weight;
      }
      // Otherwise prioritize by recency
      return b.timestamp - a.timestamp;
    });
    
    // Keep only the max allowed number of messages
    this.messageHistory = sortedMessages.slice(0, contextConfig.maxHistoryLength);
  }
  
  // Prune by removing lowest weighted messages until size is acceptable
  pruneBySize() {
    while (this.getContextSize() > contextConfig.maxContextSize && this.messageHistory.length > 5) {
      // Find the lowest weighted message
      let lowestWeightIndex = 0;
      for (let i = 1; i < this.messageHistory.length; i++) {
        if (this.messageHistory[i].weight < this.messageHistory[lowestWeightIndex].weight) {
          lowestWeightIndex = i;
        }
      }
      
      // Remove it
      this.messageHistory.splice(lowestWeightIndex, 1);
    }
  }
  
  // Calculate current context size in characters
  getContextSize() {
    return this.messageHistory.reduce((size, message) => {
      return size + message.user.length + message.ai.length;
    }, 0);
  }
  
  // Get formatted context for API requests
  getFormattedContext() {
    return {
      messages: this.messageHistory.map(message => ({
        user: message.user,
        assistant: message.ai
      })),
      metadata: this.metadata
    };
  }
  
  // Get the message history
  getMessageHistory() {
    return this.messageHistory;
  }
  
  // Get summary of key insights for context windowing
  getContextSummary() {
    const summary = {
      topic: this.metadata.topic,
      projectTitle: this.metadata.projectTitle,
      insights: {}
    };
    
    // Include key insights from each category
    for (const [category, insights] of Object.entries(this.metadata.keyInsights)) {
      if (insights.length > 0) {
        summary.insights[category] = insights.join(' ');
      }
    }
    
    return summary;
  }
  
  // Set the conversation stage
  setStage(stage) {
    this.metadata.stage = stage;
    return this;
  }
  
  // Set the research topic
  setTopic(topic) {
    this.metadata.topic = topic;
    return this;
  }
  
  // Set the project title
  setProjectTitle(title) {
    this.metadata.projectTitle = title;
    return this;
  }
  
  // Get the current conversation stage
  getStage() {
    return this.metadata.stage;
  }
  
  // Get the research topic
  getTopic() {
    return this.metadata.topic;
  }
  
  // Get all metadata
  getMetadata() {
    return this.metadata;
  }
  
  // Clear context but retain critical metadata
  clear() {
    const topic = this.metadata.topic;
    const projectTitle = this.metadata.projectTitle;
    
    this.messageHistory = [];
    this.metadata = {
      topic,
      projectTitle,
      stage: 'introduction',
      keyInsights: {},
      askedQuestions: []
    };
    
    return this;
  }
}

// Export context manager
export default ConversationContext;