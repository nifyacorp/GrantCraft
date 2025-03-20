/**
 * Grant Matcher Module
 * 
 * This module provides functionality for matching research topics to
 * relevant grant opportunities using keyword-based matching.
 */

// Mock grant opportunity database (in a real app, this would be from an API)
const GRANT_OPPORTUNITIES = [
  {
    id: 'nsf-2023001',
    title: 'Artificial Intelligence Research Institutes',
    sponsor: 'National Science Foundation (NSF)',
    description: 'Research to advance AI technologies and their applications to real-world problems.',
    keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'ai', 'ml'],
    deadline: '2025-06-15',
    amount: '$2,000,000 - $4,000,000',
    duration: '4-5 years',
    url: 'https://www.nsf.gov/funding/',
    eligibility: 'U.S. colleges, universities, and non-profit research organizations',
    category: 'Computer Science'
  },
  {
    id: 'nih-2023145',
    title: 'Cancer Research Technology Development',
    sponsor: 'National Institutes of Health (NIH)',
    description: 'Development of innovative technologies for cancer detection, diagnosis, and treatment.',
    keywords: ['cancer', 'oncology', 'tumor', 'carcinoma', 'treatment', 'diagnosis', 'detection'],
    deadline: '2025-05-07',
    amount: '$1,500,000 - $3,000,000',
    duration: '3-4 years',
    url: 'https://grants.nih.gov/grants/',
    eligibility: 'U.S. research institutions and organizations',
    category: 'Health & Medicine'
  },
  {
    id: 'doe-2023078',
    title: 'Clean Energy Innovation',
    sponsor: 'Department of Energy (DOE)',
    description: 'Research and development in renewable energy and sustainable technologies.',
    keywords: ['renewable energy', 'solar', 'wind', 'energy storage', 'clean energy', 'sustainability', 'climate change'],
    deadline: '2025-07-30',
    amount: '$500,000 - $2,000,000',
    duration: '2-3 years',
    url: 'https://www.energy.gov/funding-opportunities',
    eligibility: 'U.S. businesses, universities, and national laboratories',
    category: 'Energy & Environment'
  },
  {
    id: 'nsf-2023089',
    title: 'Quantum Information Science and Engineering',
    sponsor: 'National Science Foundation (NSF)',
    description: 'Fundamental research in quantum computing, sensing, and communication.',
    keywords: ['quantum computing', 'quantum information', 'quantum mechanics', 'qubit', 'entanglement', 'quantum'],
    deadline: '2025-08-12',
    amount: '$1,000,000 - $3,000,000',
    duration: '3-5 years',
    url: 'https://www.nsf.gov/funding/',
    eligibility: 'U.S. academic institutions and non-profit research organizations',
    category: 'Physics & Engineering'
  },
  {
    id: 'nih-2023106',
    title: 'Genomics and Precision Medicine',
    sponsor: 'National Institutes of Health (NIH)',
    description: 'Research on genomic approaches for personalized medicine and treatment.',
    keywords: ['genomics', 'genetics', 'dna', 'precision medicine', 'personalized medicine', 'genome'],
    deadline: '2025-05-29',
    amount: '$1,200,000 - $2,500,000',
    duration: '3-4 years',
    url: 'https://grants.nih.gov/grants/',
    eligibility: 'U.S. academic medical centers and research institutions',
    category: 'Health & Medicine'
  },
  {
    id: 'nsf-2023112',
    title: 'Climate Science and Adaptation',
    sponsor: 'National Science Foundation (NSF)',
    description: 'Research on climate change impacts and adaptation strategies.',
    keywords: ['climate change', 'global warming', 'climate science', 'adaptation', 'resilience', 'carbon emissions'],
    deadline: '2025-09-18',
    amount: '$800,000 - $2,000,000',
    duration: '3-4 years',
    url: 'https://www.nsf.gov/funding/',
    eligibility: 'U.S. universities and research organizations',
    category: 'Environmental Science'
  },
  {
    id: 'usda-2023054',
    title: 'Sustainable Agriculture Research',
    sponsor: 'U.S. Department of Agriculture (USDA)',
    description: 'Research on sustainable farming practices and food production.',
    keywords: ['agriculture', 'farming', 'sustainable agriculture', 'food production', 'crop science', 'organic farming'],
    deadline: '2025-06-22',
    amount: '$500,000 - $1,500,000',
    duration: '2-4 years',
    url: 'https://www.usda.gov/topics/grants',
    eligibility: 'U.S. land-grant universities and agricultural research institutions',
    category: 'Agriculture & Food Science'
  },
  {
    id: 'darpa-2023031',
    title: 'Advanced Materials and Manufacturing',
    sponsor: 'Defense Advanced Research Projects Agency (DARPA)',
    description: 'Research on novel materials and advanced manufacturing processes for defense applications.',
    keywords: ['materials science', 'manufacturing', 'advanced materials', '3d printing', 'nanotechnology', 'composites'],
    deadline: '2025-07-11',
    amount: '$1,500,000 - $3,500,000',
    duration: '3-4 years',
    url: 'https://www.darpa.mil/work-with-us/opportunities',
    eligibility: 'U.S. research organizations and industry partners',
    category: 'Materials Science & Engineering'
  },
  {
    id: 'nih-2023157',
    title: 'Neuroscience and Brain Research',
    sponsor: 'National Institutes of Health (NIH)',
    description: 'Research on brain function, neurological disorders, and brain-machine interfaces.',
    keywords: ['neuroscience', 'brain', 'neural', 'cognition', 'neurological disorders', 'brain-machine interface'],
    deadline: '2025-08-03',
    amount: '$1,000,000 - $2,500,000',
    duration: '3-5 years',
    url: 'https://grants.nih.gov/grants/',
    eligibility: 'U.S. medical research institutions and universities',
    category: 'Health & Medicine'
  },
  {
    id: 'nsf-2023096',
    title: 'Cybersecurity Research and Education',
    sponsor: 'National Science Foundation (NSF)',
    description: 'Research on cybersecurity technologies, practices, and education.',
    keywords: ['cybersecurity', 'information security', 'network security', 'data protection', 'privacy', 'cyber defense'],
    deadline: '2025-07-17',
    amount: '$800,000 - $2,000,000',
    duration: '3-4 years',
    url: 'https://www.nsf.gov/funding/',
    eligibility: 'U.S. universities and research organizations',
    category: 'Computer Science'
  }
];

// Grant matcher class
class GrantMatcher {
  constructor() {
    this.grants = GRANT_OPPORTUNITIES;
  }
  
  // Find matching grants based on research topic
  findMatchingGrants(researchTopic, limit = 5) {
    if (!researchTopic || typeof researchTopic !== 'string') {
      return [];
    }
    
    const topicKeywords = this.extractKeywords(researchTopic);
    
    // Score grants based on keyword matches
    const scoredGrants = this.grants.map(grant => {
      const score = this.calculateMatchScore(topicKeywords, grant);
      return { ...grant, matchScore: score };
    });
    
    // Sort by match score (highest first) and return top matches
    return scoredGrants
      .filter(grant => grant.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }
  
  // Extract keywords from research topic
  extractKeywords(topic) {
    // Convert to lowercase
    const lowercaseTopic = topic.toLowerCase();
    
    // Remove punctuation and split into words
    const words = lowercaseTopic.replace(/[^\w\s]/g, ' ').split(/\s+/);
    
    // Filter out stop words and short words
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of'];
    const keywords = words.filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    // Add potential bigrams and trigrams for phrase matching
    const bigrams = [];
    const trigrams = [];
    
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
      
      if (i < words.length - 2) {
        trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }
    
    return [...keywords, ...bigrams, ...trigrams];
  }
  
  // Calculate match score between topic keywords and grant
  calculateMatchScore(topicKeywords, grant) {
    let score = 0;
    
    // Check for keyword matches in title, description, and keywords
    for (const keyword of topicKeywords) {
      // Title matches are highly weighted
      if (grant.title.toLowerCase().includes(keyword)) {
        score += 3;
      }
      
      // Description matches
      if (grant.description.toLowerCase().includes(keyword)) {
        score += 1;
      }
      
      // Exact keyword matches are most important
      for (const grantKeyword of grant.keywords) {
        if (grantKeyword === keyword) {
          score += 5;
        } else if (grantKeyword.includes(keyword) || keyword.includes(grantKeyword)) {
          score += 2;
        }
      }
    }
    
    return score;
  }
  
  // Get all available categories
  getCategories() {
    const categories = this.grants.map(grant => grant.category);
    return [...new Set(categories)];
  }
  
  // Get grants by category
  getGrantsByCategory(category) {
    return this.grants.filter(grant => grant.category === category);
  }
  
  // Get grants by deadline range
  getGrantsByDeadlineRange(startDate, endDate) {
    return this.grants.filter(grant => {
      const deadline = new Date(grant.deadline);
      return deadline >= startDate && deadline <= endDate;
    });
  }
  
  // Get all grants
  getAllGrants() {
    return this.grants;
  }
  
  // Get grant by ID
  getGrantById(id) {
    return this.grants.find(grant => grant.id === id);
  }
}

export default GrantMatcher;