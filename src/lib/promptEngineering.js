/**
 * Prompt Engineering Module
 * 
 * This module contains carefully crafted prompts for the AI to guide
 * conversations effectively throughout the grant development process.
 */

import { sectionDevelopmentPrompts } from './conversationalFlow';

// Prompt templates with placeholders for dynamic content
const promptTemplates = {
  // Initial conversation prompts
  welcome: `Welcome to GrantCraft, {userName}! I'm your AI assistant specialized in developing compelling research grant proposals. 
I can help you explore your research topic, find matching funding opportunities, and craft a complete grant package including abstract, methodology, timeline, and budget.
What research area are you interested in exploring today?`,

  topicExploration: `I'd like to learn more about your research on {topic}. 
{explorationQuestion}
The more details you can provide, the better I can help structure your grant proposal.`,

  // Grant matching prompts
  grantMatching: `Based on your research focus on {topic}, I can suggest potential funding opportunities.
Are you looking for specific types of grants (e.g., government, foundation, industry) or particular funding amounts?`,

  grantRecommendation: `I've identified several potential funding opportunities for your research on {topic}:

{grantList}

Would you like more details about any of these options?`,

  // Project creation prompts
  projectCreation: `Let's create a new grant project for your research on {topic}.
What would you like to title your grant proposal? This will be used to organize all your project files.`,

  projectStructure: `I've created a project structure for "{projectTitle}". Here's how we'll organize your grant proposal:

{folderStructure}

We can start by developing the {suggestedSection} section. Would you like to begin there or with a different section?`,

  // Section development prompts
  sectionDevelopment: `Now let's work on the {sectionName} section of your proposal. 
{sectionGuidance}

{sectionQuestion}`,

  sectionFeedback: `I've drafted the {sectionName} section based on our discussion:

---
{sectionContent}
---

Would you like to make any adjustments to this draft?`,

  // Budget and timeline prompts
  budgetPlanning: `Let's create a budget for your research project. 
What are the main categories of expenses you anticipate (e.g., personnel, equipment, materials, travel)?`,

  timelinePlanning: `Now let's outline a timeline for your {duration}-month project.
What are the key phases or milestones in your research plan?`,

  // Final review prompts
  projectReview: `I've compiled all sections of your grant proposal for "{projectTitle}". 
Here's a summary of what we've created:

{proposalSummary}

Would you like to review any specific section in detail?`,

  completionMessage: `Your grant proposal package for "{projectTitle}" is complete and ready for submission.
All files have been saved to your project folder. Is there anything else you'd like to refine before finalizing?`
};

// Section-specific guidance to include in prompts
const sectionGuidance = {
  abstract: `The abstract is a concise summary (usually 200-300 words) of your entire proposal. 
It should clearly state the problem, your approach, anticipated outcomes, and broader impacts.`,

  introduction: `The introduction should establish the context and significance of your research.
It should identify the gap in knowledge and clearly state your research questions or objectives.`,

  literature_review: `The literature review demonstrates your knowledge of the field and positions your work within existing research.
Focus on recent, relevant studies and identify the gap your research will address.`,

  methodology: `The methodology section should detail your research design, methods, and analytical approaches.
Be specific about techniques, equipment, and procedures to demonstrate feasibility.`,

  timeline: `The timeline shows your project is well-planned and achievable within the grant period.
Include major milestones, deliverables, and sufficient time for analysis and reporting.`,

  budget: `The budget should be comprehensive and realistic, with clear justification for all expenses.
Align costs with the methodology and show efficient use of resources.`,

  impact: `The impact statement explains the significance of your research beyond the immediate project.
Address broader impacts on society, economy, environment, or advancement of knowledge.`
};

// Function to generate prompts with inserted dynamic content
export function generatePrompt(templateName, variables = {}) {
  let promptTemplate = promptTemplates[templateName] || '';
  
  // Replace placeholders with actual values
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    promptTemplate = promptTemplate.replace(new RegExp(placeholder, 'g'), variables[key]);
  });
  
  return promptTemplate;
}

// Function to get section-specific guidance
export function getSectionGuidance(sectionName) {
  return sectionGuidance[sectionName.toLowerCase()] || '';
}

// Function to get next question for a specific section
export function getNextSectionQuestion(sectionName, askedQuestions = []) {
  const sectionQuestions = sectionDevelopmentPrompts[sectionName.toLowerCase()] || [];
  
  // Find first question that hasn't been asked yet
  const nextQuestion = sectionQuestions.find(question => !askedQuestions.includes(question));
  
  return nextQuestion || "Is there anything else you'd like to add to this section?";
}

// Export the prompt templates for reference
export { promptTemplates, sectionGuidance };