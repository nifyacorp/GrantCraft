/**
 * Best Practices Library Module
 * 
 * This module provides grant writing best practices, examples, and advice
 * tailored to different research disciplines, grant types, and funding agencies.
 */

// Collection of general best practices applicable to most grant proposals
const GENERAL_BEST_PRACTICES = [
  {
    id: 'clear-writing',
    title: 'Use Clear, Concise Writing',
    description: 'Reviewers read many proposals in a short time. Clear, straightforward language helps your ideas stand out.',
    tips: [
      'Use active voice and present tense when possible',
      'Avoid jargon or technical terms without explanation',
      'Keep sentences under 25 words for readability',
      'Use bullet points for lists and key points',
      'Include white space and clear section breaks'
    ],
    example: 'Instead of "Cellular proliferation will be analyzed using flow cytometric methods", write "We will use flow cytometry to analyze cell growth."',
    category: 'writing',
    relevance: ['all']
  },
  {
    id: 'strong-abstract',
    title: 'Create a Compelling Abstract',
    description: 'The abstract is often the first (and sometimes only) section read thoroughly by reviewers and should summarize the entire proposal.',
    tips: [
      'Start with the problem statement or knowledge gap',
      'Briefly mention your approach or methods',
      'Highlight potential outcomes and their significance',
      'Include the broader impacts of your work',
      'Stay within word limits (typically 250-500 words)'
    ],
    example: 'Knowledge Gap: Despite extensive research on X, the mechanisms of Y remain poorly understood.\nApproach: We will investigate Y using a novel Z technique.\nOutcomes: Our findings will establish the relationship between X and Y, potentially leading to new therapeutic strategies for disease D.\nImpact: This work addresses a critical barrier to progress in the field and may lead to improved treatments for millions affected by D.',
    category: 'structure',
    relevance: ['all']
  },
  {
    id: 'pilot-data',
    title: 'Include Preliminary Data',
    description: 'Preliminary results demonstrate feasibility and your capability to conduct the proposed work.',
    tips: [
      'Include your most compelling preliminary results',
      'Present preliminary data in clear figures with informative captions',
      'Explain how preliminary findings lead to your hypotheses',
      'Address potential limitations and how you\'ll overcome them',
      'Highlight how pilot work demonstrates your expertise'
    ],
    example: 'Our preliminary studies (Fig. 1A-C) demonstrate that protein X interacts with Y in cell line Z. Based on these findings, we hypothesize that X regulates Y through phosphorylation at residue R, which we will test in Aim 1.',
    category: 'content',
    relevance: ['experimental', 'biomedical', 'physical-sciences']
  },
  {
    id: 'clear-aims',
    title: 'Develop Clear, Focused Specific Aims',
    description: 'Well-crafted aims provide structure for your proposal and demonstrate a logical research plan.',
    tips: [
      'Limit to 3-4 aims that could be published as separate papers',
      'Make aims related but not dependent on each other\'s success',
      'State the objective, approach, and expected outcome for each aim',
      'Begin each aim with an action verb (Determine, Investigate, Develop, etc.)',
      'Consider making the first aim the most straightforward to build reviewer confidence'
    ],
    example: 'Aim 1: Identify the binding domains mediating the X-Y protein interaction.\nApproach: We will use site-directed mutagenesis and co-immunoprecipitation.\nExpected outcome: A molecular map of critical residues required for X-Y complex formation.',
    category: 'structure',
    relevance: ['biomedical', 'physical-sciences', 'engineering']
  },
  {
    id: 'address-significance',
    title: 'Clearly Articulate Significance',
    description: 'Explain why your work matters and how it will advance your field or benefit society.',
    tips: [
      'Address the specific knowledge gap your research will fill',
      'Connect your work to broader scientific or societal challenges',
      'Include both short-term and long-term impacts',
      'Cite key statistics that highlight the importance of the problem',
      'Reference funding agency priorities when relevant'
    ],
    example: 'Alzheimer\'s disease affects 5.8 million Americans, with annual costs exceeding $290 billion. By identifying new biomarkers for early detection, our research addresses the NIH\'s strategic goal of developing effective interventions for neurodegenerative disorders and could reduce healthcare costs by enabling earlier treatment.',
    category: 'impact',
    relevance: ['all']
  },
  {
    id: 'alternative-approaches',
    title: 'Include Alternative Approaches and Contingency Plans',
    description: 'Demonstrating you\'ve considered potential problems and alternative strategies strengthens reviewer confidence.',
    tips: [
      'Identify potential pitfalls for each aim',
      'Propose specific alternative approaches for high-risk aspects',
      'Show you understand limitations of proposed methods',
      'Demonstrate you have multiple ways to address your questions',
      'Include decision points in your research plan'
    ],
    example: 'If Approach A fails to yield sufficient protein for crystallization, we will employ alternative strategy B using NMR spectroscopy to determine structure. We have established a collaboration with Dr. X, who has extensive experience with this technique (Letter of Support, Appendix C).',
    category: 'methodology',
    relevance: ['biomedical', 'physical-sciences', 'engineering']
  },
  {
    id: 'timeline-feasibility',
    title: 'Demonstrate Feasibility with Timeline and Resources',
    description: 'A realistic timeline shows reviewers you understand the scope of work and have the resources to complete it.',
    tips: [
      'Include a Gantt chart or timeline figure',
      'Allocate appropriate time for each aim',
      'Highlight available resources, equipment, and collaborations',
      'Match timeline to the proposed budget',
      'Address potential resource constraints and solutions'
    ],
    example: 'Year 1: Complete data collection for Aim 1, begin analysis\nYear 2: Complete Aim 1 analysis, begin Aim 2 experiments\nYear 3: Complete Aim 2, prepare manuscripts and develop next-phase applications',
    category: 'planning',
    relevance: ['all']
  },
  {
    id: 'budget-justification',
    title: 'Provide Detailed Budget Justification',
    description: 'Clear budget justification demonstrates good planning and responsible stewardship of funds.',
    tips: [
      'Align budget items directly with research activities',
      'Justify personnel time and effort allocations',
      'Provide specific details for major equipment requests',
      'Explain unusual or large expenses thoroughly',
      'Demonstrate cost-effectiveness and value'
    ],
    example: 'Research Assistant (50% effort): Will perform cell culture, protein extraction, and Western blots for Aims 1 and 2. Dr. Smith (PI, 25% effort): Will oversee all aspects of the project, train staff, perform data analysis, and prepare manuscripts.',
    category: 'administrative',
    relevance: ['all']
  }
];

// Field-specific best practices for different research disciplines
const FIELD_SPECIFIC_PRACTICES = {
  biomedical: [
    {
      id: 'biomedical-rigor',
      title: 'Address Rigor and Reproducibility',
      description: 'NIH and other biomedical funders require explicit discussion of scientific rigor.',
      tips: [
        'Describe how you will ensure robust and unbiased experimental design',
        'Address biological and technical replicates',
        'Include power calculations for animal studies',
        'Discuss authentication of key biological resources',
        'Include both sexes in studies when appropriate'
      ],
      example: 'To ensure statistical power, we will use n=8 animals per group (power calculation in Appendix A), include both male and female mice, and blind investigators to treatment groups during data collection and analysis.',
      category: 'methodology',
      relevance: ['biomedical', 'NIH']
    },
    {
      id: 'translational-impact',
      title: 'Emphasize Translational Potential',
      description: 'For biomedical research, connecting basic findings to clinical applications strengthens significance.',
      tips: [
        'Include a translational roadmap if appropriate',
        'Discuss potential clinical implications',
        'Reference relevant diseases or conditions',
        'Consider including clinician collaborators',
        'Describe future translational steps beyond the current proposal'
      ],
      example: 'While this project focuses on basic mechanisms of protein X signaling, our findings have direct translational potential. Dysregulation of this pathway has been implicated in diseases Y and Z, and small molecules targeting this interaction could lead to novel therapeutic approaches (Fig. 7).',
      category: 'impact',
      relevance: ['biomedical', 'NIH']
    }
  ],
  physical_sciences: [
    {
      id: 'theoretical-framework',
      title: 'Develop Strong Theoretical Framework',
      description: 'Physical sciences proposals benefit from clear theoretical underpinnings and mathematical models.',
      tips: [
        'Present relevant equations and theoretical models',
        'Connect theory to experimental approaches',
        'Include computational models when appropriate',
        'Discuss theoretical limitations and assumptions',
        'Address how your work extends current theoretical understanding'
      ],
      example: 'Building on the theoretical framework established by Smith et al. (2019), we extend the model to include quantum effects according to Equation 3. This modification predicts the behavior shown in Figure 2, which we will test experimentally in Aim 1.',
      category: 'content',
      relevance: ['physical-sciences', 'NSF', 'DOE']
    },
    {
      id: 'equipment-innovation',
      title: 'Highlight Methodological Innovation',
      description: 'In physical sciences, novel methodologies, instruments, or computational approaches can be significant contributions.',
      tips: [
        'Describe innovations in experimental design or equipment',
        'Highlight development of new analytical methods',
        'Discuss improvements to existing techniques',
        'Address how methodological advances enable new science',
        'Include preliminary data demonstrating new methods'
      ],
      example: 'We have developed a novel spectroscopic approach that increases sensitivity by 10-fold compared to conventional methods (Fig. 3A). This innovation will allow us to detect previously unobservable quantum states described in Aim 2.',
      category: 'methodology',
      relevance: ['physical-sciences', 'engineering', 'NSF', 'DOE']
    }
  ],
  social_sciences: [
    {
      id: 'participant-diversity',
      title: 'Address Population Diversity and Inclusion',
      description: 'Social science proposals should explicitly consider diversity, representation, and inclusion.',
      tips: [
        'Discuss how you will ensure diverse participant representation',
        'Address potential selection biases',
        'Consider cultural and contextual factors',
        'Include power analysis for sample size',
        'Discuss generalizability of findings to diverse populations'
      ],
      example: 'We will recruit a socioeconomically and ethnically diverse sample using stratified sampling methods (Table 2). To ensure cultural sensitivity, community members will provide input on study materials, and materials will be available in multiple languages.',
      category: 'methodology',
      relevance: ['social-sciences', 'education', 'NSF']
    },
    {
      id: 'mixed-methods',
      title: 'Consider Mixed Methods Approaches',
      description: 'Combining qualitative and quantitative methods can strengthen social science proposals.',
      tips: [
        'Explain how mixed methods address research questions more comprehensively',
        'Clearly describe integration of qualitative and quantitative components',
        'Include data collection and analysis plans for each method',
        'Address how methods complement each other',
        'Discuss timeline and sequencing of different methodological components'
      ],
      example: 'We will employ a sequential explanatory design: Phase 1 will collect survey data from 300 participants to identify patterns, followed by Phase 2 qualitative interviews (n=25) to explore mechanisms underlying these patterns. Integration will occur at both analytical and interpretive stages.',
      category: 'methodology',
      relevance: ['social-sciences', 'education', 'humanities']
    }
  ],
  humanities: [
    {
      id: 'cultural-significance',
      title: 'Articulate Cultural and Historical Significance',
      description: 'Humanities proposals should clearly articulate scholarly significance and broader cultural relevance.',
      tips: [
        'Connect your project to existing scholarly conversations',
        'Articulate how your work advances critical understanding',
        'Address contemporary relevance of historical topics',
        'Discuss interdisciplinary implications',
        'Consider broader societal or cultural impact'
      ],
      example: 'This study of 18th century literary networks not only fills a gap in our understanding of women\'s writing during the Enlightenment but also offers new methods for analyzing historical social networks that can be applied across literary periods and cultural contexts.',
      category: 'impact',
      relevance: ['humanities', 'NEH']
    },
    {
      id: 'archival-methodology',
      title: 'Detail Archival and Primary Source Methodology',
      description: 'Humanities proposals should clearly describe source materials and methodological approach.',
      tips: [
        'Identify specific archives, collections, or texts',
        'Discuss access arrangements for rare materials',
        'Address methodological approach to source analysis',
        'Consider digital humanities methods when appropriate',
        'Discuss language skills or specialized knowledge required'
      ],
      example: 'This project will draw on previously unexamined manuscripts in the Smith Collection (University Archive, confirmed access letter in Appendix B). We will apply comparative textual analysis using both traditional close reading and computational text analysis via the ATLAS.ti software.',
      category: 'methodology',
      relevance: ['humanities', 'NEH']
    }
  ],
  engineering: [
    {
      id: 'practical-applications',
      title: 'Emphasize Practical Applications and Implementation',
      description: 'Engineering proposals benefit from clear connections to practical problems and solutions.',
      tips: [
        'Identify specific industry or societal problems addressed',
        'Discuss pathway to implementation or commercialization',
        'Include letters from industry partners when applicable',
        'Address scalability and cost-effectiveness',
        'Consider regulatory or implementation barriers'
      ],
      example: 'This novel sensor design addresses a critical need in environmental monitoring by reducing production costs by 60% while increasing sensitivity threefold. Our industry partner (see letter, Appendix C) will prototype the device in Year 2, with pilot testing in municipal water systems planned for Year 3.',
      category: 'impact',
      relevance: ['engineering', 'NSF', 'DOE']
    },
    {
      id: 'benchmarking',
      title: 'Include Benchmarking and Performance Metrics',
      description: 'Clearly defined metrics and comparisons to existing technologies strengthen engineering proposals.',
      tips: [
        'Define specific, measurable performance targets',
        'Compare proposed approach to current state-of-the-art',
        'Include quantitative benchmarks and testing protocols',
        'Address efficiency, cost, durability, or other relevant metrics',
        'Discuss verification and validation approach'
      ],
      example: 'Table 3 benchmarks our approach against existing technologies across five key metrics. Our target performance represents a 40% improvement in energy efficiency and 25% reduction in production cost while maintaining reliability standards. We will verify these metrics through the testing protocol described in Aim 3.',
      category: 'methodology',
      relevance: ['engineering', 'computer-science', 'NSF']
    }
  ],
  interdisciplinary: [
    {
      id: 'team-integration',
      title: 'Demonstrate Team Integration and Communication',
      description: 'Interdisciplinary proposals must show how different expertise will be meaningfully integrated.',
      tips: [
        'Describe team communication and coordination strategies',
        'Explain how disciplinary perspectives will be integrated',
        'Include management plan for large teams',
        'Address potential disciplinary language or approach differences',
        'Highlight previous successful collaborations when applicable'
      ],
      example: 'Our interdisciplinary team will employ a hub-and-spoke model with monthly full team meetings and weekly subgroup meetings. We will use integrated research questions (Fig. 1) that bridge disciplines and a common data repository with standardized protocols for cross-disciplinary analysis.',
      category: 'planning',
      relevance: ['interdisciplinary', 'NSF', 'NIH']
    },
    {
      id: 'methodological-integration',
      title: 'Address Methodological Integration',
      description: 'Clearly explain how methods from different disciplines will be combined or complement each other.',
      tips: [
        'Explain how methods from different fields complement each other',
        'Address potential methodological conflicts or differences',
        'Discuss data integration across methodological approaches',
        'Include integrative analytical frameworks',
        'Consider novel methods emerging from disciplinary combinations'
      ],
      example: 'This project integrates computational modeling (Aim 1), experimental validation (Aim 2), and human factors analysis (Aim 3). Figure 4 illustrates our iterative approach, where each methodological component informs the others through structured feedback loops and shared protocols.',
      category: 'methodology',
      relevance: ['interdisciplinary', 'NSF', 'NIH']
    }
  ]
};

// Agency-specific best practices tailored to specific funding organizations
const AGENCY_SPECIFIC_PRACTICES = {
  NSF: [
    {
      id: 'nsf-broader-impacts',
      title: 'Develop Strong Broader Impacts',
      description: 'NSF requires addressing broader impacts as a separate review criterion of equal importance to intellectual merit.',
      tips: [
        'Explicitly address education, diversity, outreach, and societal benefits',
        'Include specific, measurable broader impacts activities',
        'Connect broader impacts to your expertise and research',
        'Consider partnerships with education or outreach organizations',
        'Allocate appropriate resources for broader impacts activities'
      ],
      example: 'Our broader impacts include: (1) Development of undergraduate laboratory modules based on this research; (2) Summer research experiences for two underrepresented minority students annually; (3) Public science workshops at the local children\'s museum reaching ~200 K-12 students per year; (4) Open-source publication of all analysis software with documentation.',
      category: 'impact',
      relevance: ['NSF']
    },
    {
      id: 'nsf-transformative',
      title: 'Emphasize Transformative Potential',
      description: 'NSF prioritizes projects with potential to transform understanding or create new fields.',
      tips: [
        'Explicitly discuss how your research might transform the field',
        'Address potential paradigm shifts or new directions',
        'Highlight highly innovative or creative elements',
        'Consider interdisciplinary approaches that create new fields',
        'Balance transformative elements with feasibility'
      ],
      example: 'This research challenges the dominant paradigm by proposing that X, rather than Y, underlies Z phenomena. If successful, our approach will create an entirely new framework for understanding these systems and potentially bridge previously unconnected fields of quantum mechanics and evolutionary biology.',
      category: 'impact',
      relevance: ['NSF']
    }
  ],
  NIH: [
    {
      id: 'nih-significance-innovation',
      title: 'Balance Significance and Innovation',
      description: 'NIH reviews explicitly score both significance (importance of problem) and innovation (novelty of approach).',
      tips: [
        'Clearly delineate significance and innovation sections',
        'Address how your work fills a specific knowledge gap',
        'Highlight novel methods, approaches, or concepts',
        'Connect to NIH mission of enhancing health and reducing illness',
        'Consider including conceptual diagrams for both aspects'
      ],
      example: 'Significance: Heart failure affects 6.2 million Americans with 5-year mortality rates exceeding 50%. This research addresses a critical gap in understanding mitochondrial dysfunction in heart failure progression.\n\nInnovation: Our approach is innovative in three ways: (1) Novel use of tissue-specific knockout models; (2) First application of technique X to this disease model; (3) Unprecedented integration of metabolomic and transcriptomic data to identify therapeutic targets.',
      category: 'impact',
      relevance: ['NIH']
    },
    {
      id: 'nih-investigator',
      title: 'Demonstrate Investigator Qualifications',
      description: 'NIH explicitly scores investigator qualifications and research environment.',
      tips: [
        'Highlight relevant expertise and preliminary data',
        'Address complementary skills among team members',
        'Discuss institutional resources and support',
        'Include evidence of productive collaboration for multi-PI grants',
        'Reference specialized facilities or equipment access'
      ],
      example: 'Dr. Smith (PI) has published 15 papers on protein X signaling (cited >1000 times) and has continuous NIH funding since 2015. Dr. Jones (co-I) brings complementary expertise in mouse models (10 publications) and has collaborated with Dr. Smith on 3 previous studies. Our institution provides dedicated laboratory space and access to a state-of-the-art metabolomics core facility (see Facilities page).',
      category: 'qualifications',
      relevance: ['NIH']
    }
  ],
  DOD: [
    {
      id: 'dod-military-relevance',
      title: 'Emphasize Military Relevance',
      description: 'DOD funding requires clear connections to military needs and missions.',
      tips: [
        'Explicitly connect research to military challenges or requirements',
        'Reference specific military programs or needs',
        'Consider dual-use applications (military and civilian)',
        'Address technology readiness levels when appropriate',
        'Include letters from military stakeholders if possible'
      ],
      example: 'This lightweight sensor technology addresses a critical need for the Air Force\'s unmanned aerial systems, reducing payload weight by 40% while extending operational range. As outlined in the 2023 Air Force Science & Technology Strategy (p.15), these capabilities directly support priority area #2: Advanced Sensing and Mobility.',
      category: 'impact',
      relevance: ['DOD']
    },
    {
      id: 'dod-transition-plan',
      title: 'Include Technology Transition Plan',
      description: 'DOD values clear pathways to implementation in military systems.',
      tips: [
        'Outline specific steps toward military application',
        'Address technology readiness levels (current and target)',
        'Include industry or military transition partners',
        'Consider testing and validation requirements',
        'Address manufacturing or scale-up considerations'
      ],
      example: 'Figure 8 outlines our technology transition plan, advancing from TRL 3 (current) to TRL 6 by project completion. We have established a transition agreement with Defense Contractor X (letter, Appendix D) for prototype development in Year 3, followed by field testing with Army Research Lab personnel in Year 4.',
      category: 'planning',
      relevance: ['DOD']
    }
  ],
  DOE: [
    {
      id: 'doe-energy-relevance',
      title: 'Connect to Energy Challenges',
      description: 'DOE funding requires clear relevance to energy production, storage, efficiency, or policy.',
      tips: [
        'Explicitly address energy relevance, even for basic science',
        'Connect to specific DOE research priorities',
        'Quantify potential energy impacts when possible',
        'Consider multiple energy applications',
        'Address sustainability and environmental impacts'
      ],
      example: 'While focused on fundamental materials science, this research directly addresses DOE\'s Energy Storage Grand Challenge by targeting a 50% increase in battery energy density. Our novel electrode materials could enable electric vehicles with 500+ mile range, supporting DOE\'s goal of decarbonizing the transportation sector.',
      category: 'impact',
      relevance: ['DOE']
    },
    {
      id: 'doe-facilities',
      title: 'Leverage DOE User Facilities',
      description: 'DOE values proposals that make use of national laboratories and user facilities.',
      tips: [
        'Incorporate DOE user facilities in research plan when appropriate',
        'Include letters confirming facility access',
        'Describe specific facility capabilities required',
        'Address experience with facility usage',
        'Consider collaborations with DOE laboratory scientists'
      ],
      example: 'Our experimental plan utilizes the Advanced Photon Source at Argonne National Laboratory for high-resolution structural analysis (beamtime allocation confirmed, Appendix B). Co-I Dr. Johnson has 5 years experience using this facility, resulting in 7 publications. We will also collaborate with staff scientist Dr. Williams at Lawrence Berkeley National Laboratory, who will perform complementary computational modeling.',
      category: 'methodology',
      relevance: ['DOE']
    }
  ],
  EU: [
    {
      id: 'eu-consortium',
      title: 'Develop Strong Consortia with European Coverage',
      description: 'EU funding often requires multi-country partnerships with complementary expertise.',
      tips: [
        'Include partners from multiple EU countries',
        'Ensure balanced geographic distribution',
        'Clearly define partner roles and responsibilities',
        'Address consortium management and communication',
        'Consider including partners from less represented regions'
      ],
      example: 'Our consortium includes 7 partners from 5 EU countries: 2 research universities (Germany, Sweden), 1 research institute (France), 2 industry partners (Spain, Ireland), 1 SME (Poland), and 1 non-profit organization (Italy). This composition ensures complementary expertise and broad European representation, with 40% of partners from widening countries.',
      category: 'planning',
      relevance: ['EU', 'Horizon-Europe']
    },
    {
      id: 'eu-impact',
      title: 'Address Excellence, Impact, and Implementation',
      description: 'EU proposals are evaluated on excellence, impact, and quality of implementation.',
      tips: [
        'Structure proposal to explicitly address all three criteria',
        'Include impact pathways with specific indicators',
        'Address EU policy priorities and missions',
        'Include detailed implementation plan with milestones',
        'Discuss risk management and contingency planning'
      ],
      example: 'Impact Pathway: Our innovation will reduce carbon emissions in the manufacturing sector by 15% by 2030, directly supporting the European Green Deal goal of climate neutrality. Impact indicators include: (1) CO2 reduction per unit production; (2) Industry adoption rate; (3) Policy recommendations implemented. Dissemination through our Industry Advisory Board will reach 200+ companies in Year 1.',
      category: 'impact',
      relevance: ['EU', 'Horizon-Europe']
    }
  ]
};

/**
 * Get all general best practices
 * @returns {Array} Array of general best practices
 */
const getAllBestPractices = () => {
  return GENERAL_BEST_PRACTICES;
};

/**
 * Get field-specific best practices for a particular research discipline
 * @param {string} field - The research field (e.g., 'biomedical', 'physical_sciences')
 * @returns {Array} Array of field-specific best practices
 */
const getFieldPractices = (field) => {
  return FIELD_SPECIFIC_PRACTICES[field] || [];
};

/**
 * Get agency-specific best practices for a particular funding agency
 * @param {string} agency - The agency ID (e.g., 'NSF', 'NIH')
 * @returns {Array} Array of agency-specific best practices
 */
const getAgencyPractices = (agency) => {
  return AGENCY_SPECIFIC_PRACTICES[agency] || [];
};

/**
 * Get recommended best practices based on research field and target funding agency
 * @param {Object} options - Options for retrieving recommendations
 * @param {string} [options.field] - Research field
 * @param {string} [options.agency] - Target funding agency
 * @param {string} [options.category] - Practice category (e.g., 'impact', 'methodology')
 * @returns {Array} Array of recommended best practices
 */
const getRecommendedPractices = (options = {}) => {
  const { field, agency, category } = options;
  let recommendations = [];
  
  // Add general best practices
  recommendations = recommendations.concat(GENERAL_BEST_PRACTICES);
  
  // Add field-specific practices if field is specified
  if (field && FIELD_SPECIFIC_PRACTICES[field]) {
    recommendations = recommendations.concat(FIELD_SPECIFIC_PRACTICES[field]);
  }
  
  // Add agency-specific practices if agency is specified
  if (agency && AGENCY_SPECIFIC_PRACTICES[agency]) {
    recommendations = recommendations.concat(AGENCY_SPECIFIC_PRACTICES[agency]);
  }
  
  // Filter by category if specified
  if (category) {
    recommendations = recommendations.filter(practice => practice.category === category);
  }
  
  // Return unique recommendations (no duplicates)
  const uniqueIds = {};
  return recommendations.filter(practice => {
    if (uniqueIds[practice.id]) {
      return false;
    }
    uniqueIds[practice.id] = true;
    return true;
  });
};

/**
 * Search best practices by keyword
 * @param {string} keyword - Keyword to search for
 * @returns {Array} Array of matching best practices
 */
const searchPractices = (keyword) => {
  if (!keyword) return [];
  
  const lowerKeyword = keyword.toLowerCase();
  let results = [];
  
  // Search general best practices
  results = results.concat(
    GENERAL_BEST_PRACTICES.filter(practice => 
      practice.title.toLowerCase().includes(lowerKeyword) ||
      practice.description.toLowerCase().includes(lowerKeyword)
    )
  );
  
  // Search field-specific practices
  Object.values(FIELD_SPECIFIC_PRACTICES).forEach(practices => {
    results = results.concat(
      practices.filter(practice => 
        practice.title.toLowerCase().includes(lowerKeyword) ||
        practice.description.toLowerCase().includes(lowerKeyword)
      )
    );
  });
  
  // Search agency-specific practices
  Object.values(AGENCY_SPECIFIC_PRACTICES).forEach(practices => {
    results = results.concat(
      practices.filter(practice => 
        practice.title.toLowerCase().includes(lowerKeyword) ||
        practice.description.toLowerCase().includes(lowerKeyword)
      )
    );
  });
  
  // Return unique results
  const uniqueIds = {};
  return results.filter(practice => {
    if (uniqueIds[practice.id]) {
      return false;
    }
    uniqueIds[practice.id] = true;
    return true;
  });
};

export { 
  getAllBestPractices, 
  getFieldPractices, 
  getAgencyPractices, 
  getRecommendedPractices,
  searchPractices 
};