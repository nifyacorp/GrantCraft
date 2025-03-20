/**
 * Document Generator Module
 * 
 * This module handles the generation of grant document sections
 * based on templates and conversation context.
 */

import { 
  abstractTemplate,
  introductionTemplate,
  methodologyTemplate,
  impactTemplate, 
  budgetTemplate,
  timelineTemplate,
  COMMON_PLACEHOLDERS,
  replacePlaceholders 
} from './documentTemplates';
import { NLP_CONFIG } from './nlpConfig';

// Main document generator class
class DocumentGenerator {
  constructor() {
    this.templates = {
      abstract: abstractTemplate,
      introduction: introductionTemplate,
      methodology: methodologyTemplate,
      impact: impactTemplate,
      budget: budgetTemplate,
      timeline: timelineTemplate
    };
    
    // Mock AI configurations (in a real app, this would connect to OpenAI/other API)
    this.nlpConfig = NLP_CONFIG;
  }
  
  // Generate text for a specific document section based on conversation context
  async generateSection(sectionType, contextData, projectInfo) {
    // Validate section type
    if (!this.templates[sectionType]) {
      throw new Error(`Unknown section type: ${sectionType}`);
    }
    
    // Extract relevant context for document generation
    const relevantContext = this.extractRelevantContext(contextData, sectionType);
    
    // Prepare template placeholders
    const placeholderValues = this.preparePlaceholderValues(projectInfo, relevantContext);
    
    // Generate each subsection
    const template = this.templates[sectionType];
    const generatedSubsections = {};
    
    // Process each subsection of the template
    for (const subsection of template.structure) {
      const subsectionContent = await this.generateSubsection(
        subsection,
        relevantContext,
        placeholderValues,
        sectionType
      );
      
      generatedSubsections[subsection.id] = subsectionContent;
    }
    
    // Assemble full document from subsections
    const fullDocument = this.assembleDocument(template, generatedSubsections, placeholderValues);
    
    return {
      section: sectionType,
      title: replacePlaceholders(template.name, placeholderValues),
      content: fullDocument,
      subsections: generatedSubsections,
      wordCount: this.countWords(fullDocument),
      template: template
    };
  }
  
  // Extract relevant information from conversation context
  extractRelevantContext(contextData, sectionType) {
    const relevantContext = {
      generalInfo: {},
      sectionSpecificInfo: {}
    };
    
    // Extract information from messages
    if (contextData.messages && Array.isArray(contextData.messages)) {
      contextData.messages.forEach(message => {
        // Process user messages for context
        if (message.user) {
          // Based on section type, extract different information
          switch (sectionType) {
            case 'abstract':
              if (message.user.toLowerCase().includes('problem') || 
                  message.user.toLowerCase().includes('challenge') ||
                  message.user.toLowerCase().includes('issue')) {
                relevantContext.sectionSpecificInfo.problem = message.user;
              }
              if (message.user.toLowerCase().includes('approach') || 
                  message.user.toLowerCase().includes('method') ||
                  message.user.toLowerCase().includes('solution')) {
                relevantContext.sectionSpecificInfo.approach = message.user;
              }
              if (message.user.toLowerCase().includes('impact') || 
                  message.user.toLowerCase().includes('outcome') ||
                  message.user.toLowerCase().includes('result')) {
                relevantContext.sectionSpecificInfo.outcomes = message.user;
              }
              break;
              
            case 'introduction':
              if (message.user.toLowerCase().includes('background') || 
                  message.user.toLowerCase().includes('context') ||
                  message.user.toLowerCase().includes('field')) {
                relevantContext.sectionSpecificInfo.background = message.user;
              }
              if (message.user.toLowerCase().includes('literature') || 
                  message.user.toLowerCase().includes('previous work') ||
                  message.user.toLowerCase().includes('prior research')) {
                relevantContext.sectionSpecificInfo.literature = message.user;
              }
              if (message.user.toLowerCase().includes('question') || 
                  message.user.toLowerCase().includes('objective') ||
                  message.user.toLowerCase().includes('goal')) {
                relevantContext.sectionSpecificInfo.questions = message.user;
              }
              break;
              
            case 'methodology':
              if (message.user.toLowerCase().includes('method') || 
                  message.user.toLowerCase().includes('approach') ||
                  message.user.toLowerCase().includes('technique')) {
                relevantContext.sectionSpecificInfo.methods = message.user;
              }
              if (message.user.toLowerCase().includes('data') || 
                  message.user.toLowerCase().includes('collect') ||
                  message.user.toLowerCase().includes('analysis')) {
                relevantContext.sectionSpecificInfo.data = message.user;
              }
              if (message.user.toLowerCase().includes('limitation') || 
                  message.user.toLowerCase().includes('challenge') ||
                  message.user.toLowerCase().includes('constraint')) {
                relevantContext.sectionSpecificInfo.limitations = message.user;
              }
              break;
              
            // Additional cases for other section types would go here
            
            default:
              // Generic extraction for all section types
              if (message.user.toLowerCase().includes('research') || 
                  message.user.toLowerCase().includes('study') ||
                  message.user.toLowerCase().includes('project')) {
                relevantContext.generalInfo.research = message.user;
              }
          }
        }
      });
    }
    
    // Extract information from metadata
    if (contextData.metadata) {
      relevantContext.generalInfo.topic = contextData.metadata.topic || '';
      relevantContext.generalInfo.projectTitle = contextData.metadata.projectTitle || '';
      
      // Extract key insights
      if (contextData.metadata.keyInsights) {
        relevantContext.keyInsights = contextData.metadata.keyInsights;
      }
    }
    
    return relevantContext;
  }
  
  // Prepare placeholder values based on project info and context
  preparePlaceholderValues(projectInfo, relevantContext) {
    return {
      PROJECT_TITLE: projectInfo.title || relevantContext.generalInfo.projectTitle || 'Research Project',
      RESEARCHER_NAME: projectInfo.researcherName || 'Principal Investigator',
      INSTITUTION: projectInfo.institution || 'Research Institution',
      RESEARCH_TOPIC: projectInfo.topic || relevantContext.generalInfo.topic || 'Research Topic',
      RESEARCH_FIELD: projectInfo.field || this.inferResearchField(relevantContext) || 'Research Field',
      PRIMARY_GOAL: projectInfo.goal || this.inferPrimaryGoal(relevantContext) || 'advance knowledge in this area',
      DURATION: projectInfo.duration || '3 years',
      FUNDING_AMOUNT: projectInfo.fundingAmount || '$500,000',
      YEAR: new Date().getFullYear().toString()
    };
  }
  
  // Infer research field from context
  inferResearchField(relevantContext) {
    // Simple inference based on topic or other context
    const topic = relevantContext.generalInfo.topic || '';
    
    if (topic.toLowerCase().includes('cancer') || 
        topic.toLowerCase().includes('disease') || 
        topic.toLowerCase().includes('health') ||
        topic.toLowerCase().includes('medical')) {
      return 'Health Sciences';
    }
    
    if (topic.toLowerCase().includes('computer') || 
        topic.toLowerCase().includes('software') || 
        topic.toLowerCase().includes('algorithm') ||
        topic.toLowerCase().includes('ai') ||
        topic.toLowerCase().includes('artificial intelligence')) {
      return 'Computer Science';
    }
    
    if (topic.toLowerCase().includes('climate') || 
        topic.toLowerCase().includes('environment') || 
        topic.toLowerCase().includes('sustainability') ||
        topic.toLowerCase().includes('ecology')) {
      return 'Environmental Science';
    }
    
    // Default generic field
    return 'Scientific Research';
  }
  
  // Infer primary goal from context
  inferPrimaryGoal(relevantContext) {
    // Simple inference based on available context
    if (relevantContext.sectionSpecificInfo.problem) {
      return `address ${relevantContext.sectionSpecificInfo.problem.split(' ').slice(0, 5).join(' ')}...`;
    }
    
    if (relevantContext.sectionSpecificInfo.approach) {
      return `develop ${relevantContext.sectionSpecificInfo.approach.split(' ').slice(0, 5).join(' ')}...`;
    }
    
    if (relevantContext.generalInfo.research) {
      return `investigate ${relevantContext.generalInfo.research.split(' ').slice(0, 5).join(' ')}...`;
    }
    
    return 'advance knowledge in this field through innovative research';
  }
  
  // Generate content for a specific subsection
  async generateSubsection(subsection, relevantContext, placeholderValues, sectionType) {
    // In a real app, this would call the AI API
    // For now, we'll simulate it with enhanced template text
    
    // Start with template default text
    let content = replacePlaceholders(subsection.defaultText, placeholderValues);
    
    // Enhance with any relevant context
    content = this.enhanceWithContext(content, subsection.id, relevantContext, sectionType);
    
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return content;
  }
  
  // Enhance template text with relevant context
  enhanceWithContext(templateText, subsectionId, relevantContext, sectionType) {
    // Replace placeholder indicators with more specific content based on context
    let enhancedText = templateText;
    
    // Abstract section enhancements
    if (sectionType === 'abstract') {
      switch (subsectionId) {
        case 'problem':
          if (relevantContext.sectionSpecificInfo.problem) {
            enhancedText = enhancedText.replace(
              '[specific gap]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.problem, 'gap')
            );
            enhancedText = enhancedText.replace(
              '[consequence of the gap]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.problem, 'consequence')
            );
          }
          break;
          
        case 'approach':
          if (relevantContext.sectionSpecificInfo.approach) {
            enhancedText = enhancedText.replace(
              '[methodology 1]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.approach, 'methodology1')
            );
            enhancedText = enhancedText.replace(
              '[methodology 2]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.approach, 'methodology2')
            );
            enhancedText = enhancedText.replace(
              '[key research activities]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.approach, 'activities')
            );
            enhancedText = enhancedText.replace(
              '[specific aspects]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.approach, 'aspects')
            );
          }
          break;
          
        case 'outcomes':
          if (relevantContext.sectionSpecificInfo.outcomes) {
            enhancedText = enhancedText.replace(
              '[outcome 1]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.outcomes, 'outcome1')
            );
            enhancedText = enhancedText.replace(
              '[outcome 2]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.outcomes, 'outcome2')
            );
            enhancedText = enhancedText.replace(
              '[specific advance in field]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.outcomes, 'advance')
            );
            enhancedText = enhancedText.replace(
              '[potential impact]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.outcomes, 'impact')
            );
            enhancedText = enhancedText.replace(
              '[stakeholders]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.outcomes, 'stakeholders')
            );
            enhancedText = enhancedText.replace(
              '[specific benefits]',
              this.extractKeyPhrase(relevantContext.sectionSpecificInfo.outcomes, 'benefits')
            );
          }
          break;
          
        case 'conclusion':
          enhancedText = enhancedText.replace(
            '[specific need]',
            this.extractKeyPhrase(relevantContext.generalInfo.research || '', 'need')
          );
          enhancedText = enhancedText.replace(
            '[unique value proposition]',
            this.extractKeyPhrase(relevantContext.generalInfo.research || '', 'value')
          );
          break;
      }
    }
    
    // Other section types would have similar enhancements
    
    // Replace any remaining placeholder indicators with generic text
    enhancedText = this.replaceGenericPlaceholders(enhancedText, sectionType, subsectionId);
    
    return enhancedText;
  }
  
  // Extract key phrases from context based on type
  extractKeyPhrase(contextText, type) {
    // In a real app, this would use NLP to extract relevant phrases
    // Here we'll use simple heuristics
    
    if (!contextText) {
      return this.getDefaultPhraseForType(type);
    }
    
    const words = contextText.split(' ');
    
    switch (type) {
      case 'gap':
        // Look for phrases after "gap" or "limitation"
        const gapIndex = contextText.toLowerCase().indexOf('gap');
        const limitationIndex = contextText.toLowerCase().indexOf('limitation');
        
        if (gapIndex > 0) {
          return contextText.substring(gapIndex, gapIndex + 40).replace(/\.$/, '');
        } else if (limitationIndex > 0) {
          return contextText.substring(limitationIndex, limitationIndex + 40).replace(/\.$/, '');
        } else {
          return 'a fundamental gap in our understanding';
        }
        
      case 'consequence':
        // Look for phrases after "leading to" or "resulting in"
        const leadIndex = contextText.toLowerCase().indexOf('leading to');
        const resultIndex = contextText.toLowerCase().indexOf('resulting in');
        
        if (leadIndex > 0) {
          return contextText.substring(leadIndex + 10, leadIndex + 50).replace(/\.$/, '');
        } else if (resultIndex > 0) {
          return contextText.substring(resultIndex + 12, resultIndex + 52).replace(/\.$/, '');
        } else {
          return 'effectively address this important challenge';
        }
        
      case 'methodology1':
        // Extract potential methodology terms
        const methodTerms = ['using', 'method', 'approach', 'technique', 'analysis'];
        for (const term of methodTerms) {
          const index = contextText.toLowerCase().indexOf(term);
          if (index > 0) {
            const phrase = contextText.substring(index, index + 30);
            const match = phrase.match(/\b\w+\s\w+\b/);
            if (match) return match[0];
          }
        }
        return 'innovative analytical methods';
        
      case 'methodology2':
        // Try to find a second method term
        const methods = ['simulation', 'modeling', 'experiments', 'surveys', 'algorithms', 'analysis'];
        for (const method of methods) {
          if (contextText.toLowerCase().includes(method) && 
              !this.extractKeyPhrase(contextText, 'methodology1').includes(method)) {
            return method;
          }
        }
        return 'data-driven assessment';
      
      // Additional cases for other types would go here
      
      default:
        return this.getDefaultPhraseForType(type);
    }
  }
  
  // Get default phrases for different types
  getDefaultPhraseForType(type) {
    const defaults = {
      gap: 'key knowledge gaps in the current understanding',
      consequence: 'effectively address important challenges in this field',
      methodology1: 'innovative analytical approaches',
      methodology2: 'empirical investigation',
      activities: 'collect and analyze diverse data sources',
      aspects: 'critical dimensions',
      outcome1: 'a comprehensive analytical framework',
      outcome2: 'validated methodological approaches',
      advance: 'advancing our understanding of key phenomena',
      impact: 'significantly enhance our capability to address challenges',
      stakeholders: 'researchers, practitioners, and policy makers',
      benefits: 'improved decision-making and practical applications',
      need: 'evidence-based approaches to pressing challenges',
      value: 'establish new paradigms for future research'
    };
    
    return defaults[type] || 'innovative research contributions';
  }
  
  // Replace any remaining placeholder indicators with generic text
  replaceGenericPlaceholders(text, sectionType, subsectionId) {
    // Replace bracketed placeholders with generic content
    let processedText = text
      .replace(/\[specific gap\]/g, 'key knowledge gaps in the current understanding')
      .replace(/\[consequence of the gap\]/g, 'effectively address important challenges in this field')
      .replace(/\[methodology 1\]/g, 'innovative analytical approaches')
      .replace(/\[methodology 2\]/g, 'empirical investigation')
      .replace(/\[key research activities\]/g, 'collect and analyze diverse data sources')
      .replace(/\[specific aspects\]/g, 'critical dimensions')
      .replace(/\[outcome 1\]/g, 'a comprehensive analytical framework')
      .replace(/\[outcome 2\]/g, 'validated methodological approaches')
      .replace(/\[specific advance in field\]/g, 'advancing our understanding of key phenomena')
      .replace(/\[potential impact\]/g, 'significantly enhance our capability to address challenges')
      .replace(/\[stakeholders\]/g, 'researchers, practitioners, and policy makers')
      .replace(/\[specific benefits\]/g, 'improved decision-making and practical applications')
      .replace(/\[specific need\]/g, 'evidence-based approaches to pressing challenges')
      .replace(/\[unique value proposition\]/g, 'establish new paradigms for future research');
    
    // Add more replacements as needed
    
    return processedText;
  }
  
  // Assemble the full document from generated subsections
  assembleDocument(template, subsections, placeholderValues) {
    let document = replacePlaceholders(`[${template.name}: ${COMMON_PLACEHOLDERS.PROJECT_TITLE}]\n\n`, placeholderValues);
    
    for (const subsection of template.structure) {
      document += subsections[subsection.id] + '\n\n';
    }
    
    return document.trim();
  }
  
  // Count words in a text
  countWords(text) {
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }
  
  // Get template structure
  getTemplateStructure(sectionType) {
    if (!this.templates[sectionType]) {
      throw new Error(`Unknown section type: ${sectionType}`);
    }
    
    return this.templates[sectionType];
  }
  
  // Get specific prompts for subsections
  getSubsectionPrompts(sectionType, subsectionId) {
    if (!this.templates[sectionType]) {
      throw new Error(`Unknown section type: ${sectionType}`);
    }
    
    const subsection = this.templates[sectionType].structure.find(s => s.id === subsectionId);
    if (!subsection) {
      throw new Error(`Unknown subsection: ${subsectionId}`);
    }
    
    return subsection.prompts;
  }
}

export default DocumentGenerator;