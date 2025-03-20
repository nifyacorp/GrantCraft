/**
 * Funding Agencies Database Module
 * 
 * This module provides information about funding agencies, their preferences,
 * success criteria, and priorities to help researchers target appropriate
 * funding sources and tailor their proposals accordingly.
 */

// Database of funding agencies with their detailed information
const FUNDING_AGENCIES = {
  // National Science Foundation
  NSF: {
    id: 'nsf',
    name: 'National Science Foundation',
    acronym: 'NSF',
    description: 'The National Science Foundation funds research and education in science and engineering through grants, contracts, and cooperative agreements.',
    website: 'https://www.nsf.gov/',
    logo: '/assets/agencies/nsf-logo.png',
    primaryFocus: ['Science', 'Engineering', 'Education'],
    annualBudget: '$8.5 billion (2023)',
    typicalAwardSize: {
      standard: '$100,000 - $300,000 per year',
      large: '$300,000 - $1,500,000 per year',
      early: '$500,000 for 5 years',
    },
    successRate: '20-25%',
    reviewCriteria: [
      {
        name: 'Intellectual Merit',
        description: 'The potential to advance knowledge within its own field or across different fields.',
        weight: 'Primary',
        tips: 'Be explicit about how your research advances fundamental understanding in your field.'
      },
      {
        name: 'Broader Impacts',
        description: 'The potential to benefit society and contribute to the achievement of specific, desired societal outcomes.',
        weight: 'Primary',
        tips: 'Include specific plans for education, outreach, or societal benefits.'
      },
      {
        name: 'Prior NSF Support',
        description: 'Outcomes of prior NSF support for the PI and Co-PIs.',
        weight: 'Secondary',
        tips: 'Include detailed results and outcomes from previous NSF grants.'
      }
    ],
    currentPriorities: [
      'Climate change and environmental sustainability',
      'Artificial intelligence and machine learning',
      'Quantum information science',
      'Biotechnology and life sciences',
      'Advanced manufacturing and Industry 4.0'
    ],
    applicationProcess: {
      deadlines: 'Various throughout the year depending on program',
      portalUrl: 'https://www.research.gov/',
      phases: [
        'Letter of Intent (for some programs)',
        'Full Proposal Submission',
        'Merit Review',
        'Award Notification'
      ],
      reviewTime: '6-9 months'
    },
    divisions: [
      'Biological Sciences (BIO)',
      'Computer & Information Science & Engineering (CISE)',
      'Engineering (ENG)',
      'Geosciences (GEO)',
      'Mathematical & Physical Sciences (MPS)',
      'Social, Behavioral & Economic Sciences (SBE)',
      'Education & Human Resources (EHR)'
    ],
    tips: [
      'Read the specific program solicitation thoroughly',
      'Contact program officers before submission',
      'Balance intellectual merit with broader impacts',
      'Include detailed data management plan',
      'Be explicit about interdisciplinary aspects when applicable'
    ]
  },
  
  // National Institutes of Health
  NIH: {
    id: 'nih',
    name: 'National Institutes of Health',
    acronym: 'NIH',
    description: 'The NIH is the primary federal agency for conducting and supporting medical research to improve health and reduce illness.',
    website: 'https://www.nih.gov/',
    logo: '/assets/agencies/nih-logo.png',
    primaryFocus: ['Biomedical Research', 'Public Health', 'Clinical Translation'],
    annualBudget: '$45 billion (2023)',
    typicalAwardSize: {
      r01: '$250,000 - $500,000 per year for 3-5 years',
      r21: 'Up to $275,000 over 2 years',
      r03: 'Up to $50,000 per year for 2 years',
      k99: 'Up to $90,000 per year for 1-2 years plus R00 phase'
    },
    successRate: '10-20% depending on institute',
    reviewCriteria: [
      {
        name: 'Significance',
        description: 'Does the project address an important problem or critical barrier in the field?',
        weight: 'High',
        tips: 'Clearly state the health impact and knowledge gap.'
      },
      {
        name: 'Investigators',
        description: 'Are the PIs, collaborators, and other researchers well-suited to the project?',
        weight: 'Medium',
        tips: 'Emphasize complementary expertise and teamwork.'
      },
      {
        name: 'Innovation',
        description: 'Does the application challenge current paradigms with novel concepts or approaches?',
        weight: 'Medium',
        tips: 'Clearly state what is novel compared to current approaches.'
      },
      {
        name: 'Approach',
        description: 'Are the strategy, methodology, and analyses well-reasoned and appropriate?',
        weight: 'High',
        tips: 'Include contingency plans, power analyses, and preliminary data.'
      },
      {
        name: 'Environment',
        description: 'Will the scientific environment contribute to the probability of success?',
        weight: 'Medium',
        tips: 'Highlight institutional resources and support.'
      }
    ],
    currentPriorities: [
      'COVID-19 and pandemic preparedness',
      'Precision medicine and personalized health',
      'Cancer moonshot',
      'Brain research through BRAIN Initiative',
      'Health disparities and equity',
      'Data science and artificial intelligence in healthcare'
    ],
    applicationProcess: {
      deadlines: 'Standard dates: Feb 5, Jun 5, Oct 5 (R01)',
      portalUrl: 'https://era.nih.gov/',
      phases: [
        'Optional: Program Officer Contact',
        'Application Submission',
        'Study Section Review',
        'Council Review',
        'Award Notification'
      ],
      reviewTime: '9-12 months'
    },
    institutes: [
      'National Cancer Institute (NCI)',
      'National Heart, Lung, and Blood Institute (NHLBI)',
      'National Institute of Mental Health (NIMH)',
      'National Institute on Aging (NIA)',
      'National Institute of Allergy and Infectious Diseases (NIAID)',
      'National Institute of Neurological Disorders and Stroke (NINDS)',
      'National Institute of General Medical Sciences (NIGMS)',
      'Many more institutes and centers'
    ],
    tips: [
      'Include strong preliminary data',
      'Clearly state the health relevance and impact',
      'Consider resubmission if not funded initially',
      'Use NIH format for biosketches and references',
      'Address rigor and reproducibility explicitly'
    ]
  },
  
  // Department of Energy
  DOE: {
    id: 'doe',
    name: 'Department of Energy',
    acronym: 'DOE',
    description: 'The DOE supports scientific research in energy, environmental sustainability, and nuclear security.',
    website: 'https://www.energy.gov/',
    logo: '/assets/agencies/doe-logo.png',
    primaryFocus: ['Energy', 'Physics', 'Computing', 'Environmental Sciences'],
    annualBudget: '$8.1 billion for Office of Science (2023)',
    typicalAwardSize: {
      standard: '$200,000 - $1,000,000 per year',
      large: '$1,000,000 - $5,000,000 per year',
      early: '$750,000 over 5 years'
    },
    successRate: '15-20%',
    reviewCriteria: [
      {
        name: 'Scientific and/or Technical Merit',
        description: 'The degree to which the proposed research is innovative and advances knowledge.',
        weight: 'Primary',
        tips: 'Focus on fundamental science with potential energy applications.'
      },
      {
        name: 'Appropriateness of the Approach',
        description: 'The quality of the technical approach and the capabilities of the research team.',
        weight: 'Primary',
        tips: 'Demonstrate feasibility with preliminary results when possible.'
      },
      {
        name: 'Competency of Applicant\'s Personnel',
        description: 'Qualifications and experience of the research team.',
        weight: 'Secondary',
        tips: 'Highlight team expertise and access to specialized facilities.'
      },
      {
        name: 'Adequacy of Resources',
        description: 'Availability of facilities and other resources needed for the project.',
        weight: 'Secondary',
        tips: 'Mention any DOE user facilities or specialized equipment.'
      }
    ],
    currentPriorities: [
      'Clean energy technologies',
      'Advanced computing and AI',
      'Fusion energy research',
      'Microelectronics',
      'Quantum information science',
      'Climate science and environmental sustainability'
    ],
    applicationProcess: {
      deadlines: 'Various throughout the year based on funding opportunity announcements',
      portalUrl: 'https://science.osti.gov/grants/',
      phases: [
        'Funding Opportunity Announcement (FOA)',
        'Pre-application (for some programs)',
        'Full Application',
        'Merit Review',
        'Selection and Award'
      ],
      reviewTime: '4-8 months'
    },
    divisions: [
      'Office of Science',
      'Advanced Research Projects Agency-Energy (ARPA-E)',
      'Office of Energy Efficiency & Renewable Energy (EERE)',
      'Office of Nuclear Energy',
      'Office of Fossil Energy and Carbon Management'
    ],
    tips: [
      'Align with DOE strategic priorities',
      'Consider DOE user facilities for experiments',
      'Focus on fundamental science with energy relevance',
      'Include strong management plan for larger proposals',
      'Address technology transfer when applicable'
    ]
  },
  
  // Department of Defense
  DOD: {
    id: 'dod',
    name: 'Department of Defense',
    acronym: 'DoD',
    description: 'The DoD funds research with potential defense applications through various agencies including DARPA, ONR, AFOSR, and ARO.',
    website: 'https://www.defense.gov/',
    logo: '/assets/agencies/dod-logo.png',
    primaryFocus: ['Defense Technology', 'National Security', 'Military Applications'],
    annualBudget: '$2.5 billion (basic research) + additional applied research',
    typicalAwardSize: {
      standard: '$100,000 - $500,000 per year',
      muri: 'Up to $1.5 million per year for 3-5 years',
      ybr: '$120,000 - $200,000 per year for 3 years'
    },
    successRate: 'Highly variable (5-25% depending on program)',
    reviewCriteria: [
      {
        name: 'Scientific Merit',
        description: 'The technical quality and innovation of the proposed research.',
        weight: 'High',
        tips: 'Emphasize novel scientific approaches.'
      },
      {
        name: 'Defense Relevance',
        description: 'The potential impact on defense capabilities or applications.',
        weight: 'High',
        tips: 'Clearly articulate relevance to military needs and missions.'
      },
      {
        name: 'Principal Investigator\'s Qualifications',
        description: 'The qualifications and experience of the PI and team.',
        weight: 'Medium',
        tips: 'Highlight relevant experience or collaborations with defense entities.'
      },
      {
        name: 'Facilities and Resources',
        description: 'The adequacy of the research environment and access to equipment.',
        weight: 'Medium',
        tips: 'Mention specialized facilities and equipment relevant to the research.'
      }
    ],
    currentPriorities: [
      'Artificial intelligence and machine learning',
      'Hypersonics',
      'Microelectronics',
      'Quantum science',
      'Biotechnology',
      'Space technology',
      'Cybersecurity and resilient systems',
      'Advanced materials and manufacturing'
    ],
    applicationProcess: {
      deadlines: 'Varies by agency and program',
      portalUrl: 'https://www.grants.gov/',
      phases: [
        'White Paper/Pre-proposal (common)',
        'Invitation for Full Proposal',
        'Full Proposal Submission',
        'Technical Review',
        'Award Decision'
      ],
      reviewTime: '3-9 months'
    },
    divisions: [
      'Defense Advanced Research Projects Agency (DARPA)',
      'Office of Naval Research (ONR)',
      'Air Force Office of Scientific Research (AFOSR)',
      'Army Research Office (ARO)',
      'Defense Threat Reduction Agency (DTRA)',
      'Defense Innovation Unit (DIU)'
    ],
    tips: [
      'Submit white papers before full proposals',
      'Contact program managers early and often',
      'Clearly articulate defense relevance',
      'Focus on high-risk, high-reward research for DARPA',
      'Consider security requirements for sensitive work',
      'Be aware of export control and foreign national restrictions'
    ]
  },
  
  // Non-US agencies
  ERC: {
    id: 'erc',
    name: 'European Research Council',
    acronym: 'ERC',
    description: 'The ERC supports frontier research across all fields, based on scientific excellence.',
    website: 'https://erc.europa.eu/',
    logo: '/assets/agencies/erc-logo.png',
    primaryFocus: ['Frontier Research', 'Scientific Excellence', 'High-Risk/High-Gain'],
    annualBudget: '€16 billion (2021-2027 total)',
    typicalAwardSize: {
      starting: 'Up to €1.5 million for 5 years',
      consolidator: 'Up to €2 million for 5 years',
      advanced: 'Up to €2.5 million for 5 years',
      synergy: 'Up to €10 million for 6 years'
    },
    successRate: '10-15%',
    reviewCriteria: [
      {
        name: 'Research Quality',
        description: 'Ground-breaking nature, ambition, and feasibility.',
        weight: 'Primary',
        tips: 'Emphasize the frontier nature and potential breakthroughs.'
      },
      {
        name: 'Principal Investigator',
        description: 'Intellectual capacity, creativity, and commitment.',
        weight: 'Primary',
        tips: 'Highlight your track record appropriate to career stage.'
      }
    ],
    currentPriorities: [
      'All fields of research (no thematic priorities)',
      'Emphasis on multidisciplinary and high-risk research',
      'Open science and responsible research'
    ],
    applicationProcess: {
      deadlines: 'Annual calls with specific deadlines by grant type',
      portalUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/',
      phases: [
        'Proposal Submission',
        'Eligibility Check',
        'Panel Evaluation',
        'Interview (for Starting and Consolidator)',
        'Ethics Review',
        'Award Decision'
      ],
      reviewTime: '5-8 months'
    },
    domains: [
      'Physical Sciences & Engineering (PE)',
      'Life Sciences (LS)',
      'Social Sciences & Humanities (SH)'
    ],
    tips: [
      'Focus on scientific excellence above all else',
      'Present a high-risk, high-gain project',
      'Emphasize your independence and leadership',
      'Demonstrate why your idea is frontier research',
      'Tailor the proposal to the specific grant type (Starting, Consolidator, Advanced)'
    ]
  }
};

/**
 * Get all funding agencies in the database
 * @returns {Array} Array of all funding agencies
 */
const getAllAgencies = () => {
  return Object.values(FUNDING_AGENCIES).map(agency => ({
    id: agency.id,
    name: agency.name,
    acronym: agency.acronym,
    description: agency.description,
    primaryFocus: agency.primaryFocus,
    website: agency.website
  }));
};

/**
 * Get detailed information about a specific funding agency
 * @param {string} agencyId - The ID of the agency to retrieve
 * @returns {Object} Detailed agency information or null if not found
 */
const getAgencyDetails = (agencyId) => {
  return FUNDING_AGENCIES[agencyId.toUpperCase()] || null;
};

/**
 * Search for agencies matching specific criteria
 * @param {Object} criteria - Search criteria
 * @param {Array} [criteria.focus] - Primary focus areas to match
 * @param {Array} [criteria.priorities] - Current priorities to match
 * @param {string} [criteria.keyword] - Keyword to search in name and description
 * @returns {Array} Array of matching agencies
 */
const searchAgencies = (criteria = {}) => {
  const { focus, priorities, keyword } = criteria;
  
  return Object.values(FUNDING_AGENCIES).filter(agency => {
    // Match by focus areas if specified
    if (focus && focus.length > 0) {
      const matchesFocus = focus.some(f => 
        agency.primaryFocus.some(af => af.toLowerCase().includes(f.toLowerCase()))
      );
      if (!matchesFocus) return false;
    }
    
    // Match by current priorities if specified
    if (priorities && priorities.length > 0) {
      const matchesPriorities = priorities.some(p => 
        agency.currentPriorities.some(ap => ap.toLowerCase().includes(p.toLowerCase()))
      );
      if (!matchesPriorities) return false;
    }
    
    // Match by keyword in name, acronym, or description if specified
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      const matchesKeyword = 
        agency.name.toLowerCase().includes(lowerKeyword) ||
        agency.acronym.toLowerCase().includes(lowerKeyword) ||
        agency.description.toLowerCase().includes(lowerKeyword);
      if (!matchesKeyword) return false;
    }
    
    return true;
  }).map(agency => ({
    id: agency.id,
    name: agency.name,
    acronym: agency.acronym,
    description: agency.description,
    primaryFocus: agency.primaryFocus,
    website: agency.website,
    successRate: agency.successRate
  }));
};

/**
 * Get a list of funding agencies that match a research topic
 * @param {string} topic - The research topic to match
 * @returns {Array} Recommended agencies sorted by relevance
 */
const getRecommendedAgencies = (topic) => {
  if (!topic) return [];
  
  // Extract keywords from the topic
  const keywords = topic.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['and', 'the', 'for', 'with', 'this', 'that'].includes(word));
  
  // Score each agency based on keyword matches
  return Object.values(FUNDING_AGENCIES).map(agency => {
    let score = 0;
    
    // Check for keyword matches in focus areas
    agency.primaryFocus.forEach(focus => {
      keywords.forEach(keyword => {
        if (focus.toLowerCase().includes(keyword)) {
          score += 3;
        }
      });
    });
    
    // Check for keyword matches in current priorities
    agency.currentPriorities.forEach(priority => {
      keywords.forEach(keyword => {
        if (priority.toLowerCase().includes(keyword)) {
          score += 2;
        }
      });
    });
    
    // Check for keyword matches in description
    keywords.forEach(keyword => {
      if (agency.description.toLowerCase().includes(keyword)) {
        score += 1;
      }
    });
    
    return {
      id: agency.id,
      name: agency.name,
      acronym: agency.acronym,
      description: agency.description,
      relevanceScore: score,
      successRate: agency.successRate,
      primaryFocus: agency.primaryFocus
    };
  })
  .filter(agency => agency.relevanceScore > 0)
  .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

export { getAllAgencies, getAgencyDetails, searchAgencies, getRecommendedAgencies };