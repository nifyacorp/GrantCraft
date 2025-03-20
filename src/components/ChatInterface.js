import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { generatePrompt } from '../lib/promptEngineering';
import { getNextPrompt, determineNextStage } from '../lib/conversationalFlow';
import ConversationContext from '../lib/contextManager';
import GrantMatcher from '../lib/grantMatcher';
import GrantMatchResults from './GrantMatchResults';

function ChatInterface({ 
  initialMessages = [], 
  onClose, 
  onCreateProject,
  projectTitle,
  currentTopic
}) {
  const [messages, setMessages] = useState(initialMessages.length > 0 
    ? initialMessages 
    : [{ 
        id: 1, 
        sender: 'ai', 
        content: generatePrompt('welcome', { userName: 'Researcher' }) 
      }]
  );
  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationState, setConversationState] = useState({
    stage: 'introduction',
    topic: currentTopic || '',
    previousResponses: {}
  });
  const [grantMatcher] = useState(new GrantMatcher());
  const [showGrantMatches, setShowGrantMatches] = useState(false);
  const [grantMatches, setGrantMatches] = useState([]);
  
  // Create conversation context manager
  const [contextManager] = useState(() => {
    const manager = new ConversationContext();
    
    if (projectTitle) {
      manager.setProjectTitle(projectTitle);
    }
    
    if (currentTopic) {
      manager.setTopic(currentTopic);
    }
    
    // Add initial welcome message to context
    if (initialMessages.length === 0) {
      manager.addMessage(
        "", // No user message for initial greeting
        generatePrompt('welcome', { userName: 'Researcher' })
      );
    } else {
      // Add any initial messages to context
      initialMessages.forEach((msg, index) => {
        if (index % 2 === 0 && initialMessages[index + 1]) {
          manager.addMessage(
            msg.content,
            initialMessages[index + 1].content
          );
        }
      });
    }
    
    return manager;
  });
  
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Function to simulate AI response - would connect to backend API in production
  const generateAIResponse = async (userMessage, state) => {
    setIsProcessing(true);
    
    try {
      // Determine next conversation stage based on user message
      const nextStage = determineNextStage(state.stage, userMessage);
      
      // Update conversation state and context manager
      const newState = {
        ...state,
        stage: nextStage.toLowerCase(),
        topic: state.topic || extractTopic(userMessage)
      };
      
      // Update context manager with new information
      contextManager.setStage(newState.stage);
      if (newState.topic && newState.topic !== contextManager.getTopic()) {
        contextManager.setTopic(newState.topic);
      }
      
      // Get next appropriate prompt based on conversation state
      const response = getNextPrompt(
        newState.stage, 
        newState.topic, 
        newState.previousResponses
      );
      
      // Add this exchange to context manager 
      contextManager.addMessage(userMessage, response);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Project creation logic
      if (newState.stage === 'project_creation' && userMessage.length > 0 && !projectTitle) {
        const projectName = userMessage.trim();
        
        // Update context with project title
        contextManager.setProjectTitle(projectName);
        
        if (onCreateProject) {
          onCreateProject(projectName, newState.topic);
        }
        
        // Create project creation response
        const projectResponse = `Great! I've created a new project titled "${projectName}". Let's start by developing the abstract for your proposal. Can you tell me the core problem your research addresses?`;
        
        // Update context with this response
        contextManager.addMessage(userMessage, projectResponse);
        
        // Return message about project creation
        return {
          message: projectResponse,
          state: {
            ...newState,
            stage: 'section_development',
            previousResponses: {
              ...newState.previousResponses,
              currentSection: 'abstract'
            }
          }
        };
      }
      
      // If we've gathered enough info about the topic, transition to next stage
      if (newState.stage === 'topic_exploration') {
        const topicResponses = newState.previousResponses.topicExploration || [];
        const contextInsights = contextManager.getMetadata().keyInsights;
        const hasEnoughContext = contextInsights && 
                                (contextInsights.methodology || contextInsights.research_topic) &&
                                contextManager.getMessageHistory().length >= 4;
        
        if (topicResponses.length >= 3 || hasEnoughContext) {
          const summaryResponse = `I have a good understanding of your research on ${newState.topic}. Would you like to see matching grant opportunities or start creating your project?`;
          
          // Update context with this response
          contextManager.addMessage(userMessage, summaryResponse);
          
          return {
            message: summaryResponse,
            state: newState
          };
        }
        
        // Track which topic questions have been asked
        return {
          message: response,
          state: {
            ...newState,
            previousResponses: {
              ...newState.previousResponses,
              topicExploration: [...(topicResponses || []), response]
            }
          }
        };
      }
      
      // Handle grant matching stage
      if (newState.stage === 'grant_matching') {
        // Find matching grants based on the research topic
        const matches = grantMatcher.findMatchingGrants(newState.topic, 5);
        
        if (matches.length > 0) {
          setGrantMatches(matches);
          
          // Prepare to show grant matches UI
          setTimeout(() => {
            setShowGrantMatches(true);
          }, 500);
          
          const matchingResponse = `I've found ${matches.length} grant opportunities that match your research on ${newState.topic}. I'll display them for you to review.`;
          
          // Update context with this response
          contextManager.addMessage(userMessage, matchingResponse);
          
          return {
            message: matchingResponse,
            state: newState
          };
        } else {
          const noMatchesResponse = `I couldn't find specific grant opportunities matching your research on ${newState.topic} in my database. Would you like to start creating your project, or refine your research topic further?`;
          
          // Update context with this response
          contextManager.addMessage(userMessage, noMatchesResponse);
          
          return {
            message: noMatchesResponse,
            state: newState
          };
        }
      }
      
      return { message: response, state: newState };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return { 
        message: "I'm sorry, I encountered an error. Please try again.", 
        state 
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to extract research topic from user message (simplified)
  const extractTopic = (message) => {
    if (!message || conversationState.topic) return conversationState.topic;
    
    // Very simple topic extraction - would use NLP in production
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('climate') || lowerMessage.includes('global warming')) {
      return 'climate change';
    } else if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      return 'artificial intelligence';
    } else if (lowerMessage.includes('cancer') || lowerMessage.includes('oncology')) {
      return 'cancer research';
    } else if (lowerMessage.includes('quantum')) {
      return 'quantum computing';
    }
    
    // Extract first few words as a fallback
    const words = message.split(' ');
    return words.slice(0, 3).join(' ');
  };
  
  // Send user message and get AI response
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isProcessing) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: newMessage.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Generate AI response
    const { message, state } = await generateAIResponse(
      userMessage.content, 
      conversationState
    );
    
    // Add AI response
    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      content: message
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setConversationState(state);
  };
  
  // Handle grant selection
  const handleGrantSelection = (grant) => {
    setShowGrantMatches(false);
    
    // Add a message about the selected grant
    const grantMessage = {
      id: Date.now(),
      sender: 'ai',
      content: `You've selected the "${grant.title}" grant from ${grant.sponsor}. This is a great match for your research! Would you like to create a project structured for this grant opportunity?`
    };
    
    setMessages(prev => [...prev, grantMessage]);
    
    // Update context with this information
    contextManager.addMessage(
      `Selected grant: ${grant.title}`, 
      grantMessage.content
    );
    
    // Update conversation state to move towards project creation
    setConversationState(prev => ({
      ...prev,
      stage: 'project_creation'
    }));
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {showGrantMatches ? (
        <GrantMatchResults 
          matches={grantMatches}
          onClose={() => setShowGrantMatches(false)}
          onSelect={handleGrantSelection}
        />
      ) : (
        <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
            <h2 className="font-bold text-lg">
              {projectTitle ? `Project: ${projectTitle}` : 'AI Assistant'}
            </h2>
            <button onClick={onClose} className="hover:opacity-80">✕</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-muted/30">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`p-3 rounded-lg my-2 max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-primary/10 ml-auto' 
                    : 'bg-background border shadow-sm'
                }`}
              >
                <div className="font-semibold mb-1">
                  {message.sender === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div>{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {isProcessing && (
              <div className="flex items-center p-2 text-muted-foreground">
                <div className="animate-pulse mr-2">●</div>
                <div className="text-sm">AI is thinking...</div>
              </div>
            )}
          </div>
          
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button 
                type="submit" 
                className="rounded-l-none"
                disabled={isProcessing}
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;