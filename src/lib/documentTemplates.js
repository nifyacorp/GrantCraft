/**
 * Document Generation Templates
 * 
 * This module contains structured templates for generating different sections of grant proposals.
 * Each template includes:
 * - A structure guide for content organization
 * - Default text with placeholders
 * - Prompt guidance for generating each subsection
 */

// Common placeholders that will be replaced in all templates
const COMMON_PLACEHOLDERS = {
  PROJECT_TITLE: '{PROJECT_TITLE}',
  RESEARCHER_NAME: '{RESEARCHER_NAME}',
  INSTITUTION: '{INSTITUTION}',
  RESEARCH_TOPIC: '{RESEARCH_TOPIC}',
  RESEARCH_FIELD: '{RESEARCH_FIELD}',
  PRIMARY_GOAL: '{PRIMARY_GOAL}',
  DURATION: '{DURATION}',
  FUNDING_AMOUNT: '{FUNDING_AMOUNT}',
  YEAR: '{YEAR}'
};

// Abstract template
const abstractTemplate = {
  id: 'abstract',
  name: 'Research Abstract',
  wordCount: '250-300',
  description: 'A concise summary of the entire proposal, including problem statement, approach, and expected outcomes.',
  structure: [
    {
      id: 'problem',
      name: 'Problem Statement',
      wordCount: '50-75',
      description: 'Brief introduction to the research problem and its significance.',
      defaultText: `${COMMON_PLACEHOLDERS.RESEARCH_TOPIC} represents a critical challenge in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}. Despite recent advances, [specific gap] remains unaddressed, limiting our ability to [consequence of the gap].`,
      prompts: [
        'What specific problem does your research address?',
        'Why is this problem significant in your field?',
        'What are the current limitations or gaps in addressing this problem?'
      ]
    },
    {
      id: 'approach',
      name: 'Approach',
      wordCount: '100-125',
      description: 'Summary of the research approach and methodology.',
      defaultText: `This research proposes to ${COMMON_PLACEHOLDERS.PRIMARY_GOAL} through a systematic approach combining [methodology 1] and [methodology 2]. Specifically, we will [key research activities] to investigate [specific aspects] of ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC}.`,
      prompts: [
        'What approaches or methods will you use in this research?',
        'What are the key components or stages of your methodology?',
        'What makes your approach innovative or effective?'
      ]
    },
    {
      id: 'outcomes',
      name: 'Expected Outcomes',
      wordCount: '50-75',
      description: 'Brief description of anticipated results and their significance.',
      defaultText: `Expected outcomes include [outcome 1] and [outcome 2], which will contribute to [specific advance in field]. These results will [potential impact], benefiting [stakeholders] through [specific benefits].`,
      prompts: [
        'What are the primary outcomes you expect from this research?',
        'How will these outcomes advance your field?',
        'What groups or stakeholders will benefit from your research?'
      ]
    },
    {
      id: 'conclusion',
      name: 'Concluding Statement',
      wordCount: '25-50',
      description: 'Final statement emphasizing significance and innovation.',
      defaultText: `This research addresses a critical need for [specific need] and offers an innovative approach that will [unique value proposition], positioning ${COMMON_PLACEHOLDERS.INSTITUTION} at the forefront of research in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}.`,
      prompts: [
        'What is the broader significance of your research?',
        'Why is your research timely or urgent?',
        'How does this work align with the funding agency\'s priorities?'
      ]
    }
  ],
  fullTemplate: `[Abstract: ${COMMON_PLACEHOLDERS.PROJECT_TITLE}]

${COMMON_PLACEHOLDERS.RESEARCH_TOPIC} represents a critical challenge in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}. Despite recent advances, [specific gap] remains unaddressed, limiting our ability to [consequence of the gap].

This research proposes to ${COMMON_PLACEHOLDERS.PRIMARY_GOAL} through a systematic approach combining [methodology 1] and [methodology 2]. Specifically, we will [key research activities] to investigate [specific aspects] of ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC}.

Expected outcomes include [outcome 1] and [outcome 2], which will contribute to [specific advance in field]. These results will [potential impact], benefiting [stakeholders] through [specific benefits].

This research addresses a critical need for [specific need] and offers an innovative approach that will [unique value proposition], positioning ${COMMON_PLACEHOLDERS.INSTITUTION} at the forefront of research in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}.`
};

// Introduction template
const introductionTemplate = {
  id: 'introduction',
  name: 'Introduction and Background',
  wordCount: '750-1000',
  description: 'Introduces the research topic, establishes context, and clearly states research questions and objectives.',
  structure: [
    {
      id: 'context',
      name: 'Research Context',
      wordCount: '150-200',
      description: 'Overview of the research field and broader context.',
      defaultText: `${COMMON_PLACEHOLDERS.RESEARCH_FIELD} has increasingly focused on [relevant aspect] due to [reasons for importance]. Within this field, ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC} has emerged as a critical area requiring further investigation, particularly in relation to [specific context].`,
      prompts: [
        'What is the broader context of your research field?',
        'Why has this area become important in recent years?',
        'What key developments or trends have shaped this field?'
      ]
    },
    {
      id: 'problem',
      name: 'Problem Statement',
      wordCount: '150-200',
      description: 'Detailed description of the research problem.',
      defaultText: `Despite significant advances in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}, [specific problem] remains a substantial challenge. Current approaches to [related area] are limited by [limitation 1] and [limitation 2], resulting in [negative consequences]. This gap in [knowledge/capability] affects [stakeholders] by [specific impact], highlighting the need for new approaches.`,
      prompts: [
        'What specific problem does your research address?',
        'What are the limitations of current approaches?',
        'Who is affected by this problem and how?'
      ]
    },
    {
      id: 'literature',
      name: 'Literature Overview',
      wordCount: '200-250',
      description: 'Brief review of relevant literature and state of knowledge.',
      defaultText: `Previous work by [Author et al.] demonstrated [finding], while [Author] established [related finding]. More recently, research has focused on [current trend], with studies by [Authors] revealing [latest developments]. However, these approaches have not adequately addressed [specific aspect], leaving a gap in our understanding of [research gap].`,
      prompts: [
        'What key studies have shaped understanding in this field?',
        'What approaches have others taken to address similar problems?',
        'What gaps or limitations exist in the current literature?'
      ]
    },
    {
      id: 'questions',
      name: 'Research Questions and Objectives',
      wordCount: '100-150',
      description: 'Clear statement of research questions and specific objectives.',
      defaultText: `This research aims to ${COMMON_PLACEHOLDERS.PRIMARY_GOAL} by addressing the following questions:
1. [Research Question 1]
2. [Research Question 2]
3. [Research Question 3]

To answer these questions, we have established the following objectives:
1. [Specific Objective 1]
2. [Specific Objective 2]
3. [Specific Objective 3]`,
      prompts: [
        'What are the primary questions your research seeks to answer?',
        'What specific objectives will help you answer these questions?',
        'How do these questions address the gap you\'ve identified?'
      ]
    },
    {
      id: 'significance',
      name: 'Significance and Innovation',
      wordCount: '100-150',
      description: 'Description of project significance and innovative aspects.',
      defaultText: `This research offers significant innovation through [specific innovation], which represents a departure from conventional approaches that [limitation of conventional approaches]. The significance of this work lies in its potential to [major potential impact], which addresses [important need or priority]. By [specific approach], this research will [unique value proposition].`,
      prompts: [
        'What makes your approach innovative or different?',
        'Why is this research significant to your field?',
        'How does this work align with current priorities in the field?'
      ]
    },
    {
      id: 'outline',
      name: 'Proposal Outline',
      wordCount: '50-75',
      description: 'Brief outline of the remainder of the proposal.',
      defaultText: `The remainder of this proposal outlines our methodology in Section 2, detailing [methodology components]. Section 3 presents our timeline and milestones, while Section 4 details the budget and required resources. Section 5 discusses expected outcomes and their broader impacts, followed by management details in Section 6.`,
      prompts: [
        'How is the rest of your proposal organized?',
        'What key sections will provide details about your approach?'
      ]
    }
  ],
  fullTemplate: `[Introduction: ${COMMON_PLACEHOLDERS.PROJECT_TITLE}]

${COMMON_PLACEHOLDERS.RESEARCH_FIELD} has increasingly focused on [relevant aspect] due to [reasons for importance]. Within this field, ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC} has emerged as a critical area requiring further investigation, particularly in relation to [specific context].

Despite significant advances in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}, [specific problem] remains a substantial challenge. Current approaches to [related area] are limited by [limitation 1] and [limitation 2], resulting in [negative consequences]. This gap in [knowledge/capability] affects [stakeholders] by [specific impact], highlighting the need for new approaches.

Previous work by [Author et al.] demonstrated [finding], while [Author] established [related finding]. More recently, research has focused on [current trend], with studies by [Authors] revealing [latest developments]. However, these approaches have not adequately addressed [specific aspect], leaving a gap in our understanding of [research gap].

This research aims to ${COMMON_PLACEHOLDERS.PRIMARY_GOAL} by addressing the following questions:
1. [Research Question 1]
2. [Research Question 2]
3. [Research Question 3]

To answer these questions, we have established the following objectives:
1. [Specific Objective 1]
2. [Specific Objective 2]
3. [Specific Objective 3]

This research offers significant innovation through [specific innovation], which represents a departure from conventional approaches that [limitation of conventional approaches]. The significance of this work lies in its potential to [major potential impact], which addresses [important need or priority]. By [specific approach], this research will [unique value proposition].

The remainder of this proposal outlines our methodology in Section 2, detailing [methodology components]. Section 3 presents our timeline and milestones, while Section 4 details the budget and required resources. Section 5 discusses expected outcomes and their broader impacts, followed by management details in Section 6.`
};

// Methodology template
const methodologyTemplate = {
  id: 'methodology',
  name: 'Research Methodology',
  wordCount: '1000-1500',
  description: 'Detailed description of research design, methods, and analytical approaches.',
  structure: [
    {
      id: 'overview',
      name: 'Methodological Overview',
      wordCount: '100-150',
      description: 'Brief overview of the overall methodological approach.',
      defaultText: `To achieve our research objectives, we will employ a [methodological approach] that integrates [method 1], [method 2], and [method 3]. This approach was selected because [rationale for methodological choices], and addresses the challenges of [specific challenges] inherent in studying ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC}.`,
      prompts: [
        'What is your overall methodological approach?',
        'Why is this approach appropriate for your research questions?',
        'How will different methods work together in your approach?'
      ]
    },
    {
      id: 'design',
      name: 'Research Design',
      wordCount: '200-300',
      description: 'Description of the overall research design and framework.',
      defaultText: `The research design consists of [number] phases over a ${COMMON_PLACEHOLDERS.DURATION} period:

Phase 1: [Description of Phase 1]
Phase 2: [Description of Phase 2]
Phase 3: [Description of Phase 3]

This design allows for [advantage of design] while addressing potential [challenges] through [mitigation strategies].`,
      prompts: [
        'What is the overall design or framework for your research?',
        'What are the main phases or components of your research design?',
        'How will these components work together to answer your research questions?'
      ]
    },
    {
      id: 'methods',
      name: 'Methods and Procedures',
      wordCount: '400-500',
      description: 'Detailed description of specific methods, techniques, and procedures.',
      defaultText: `Method 1: [Name of Method]
[Detailed description of Method 1, including procedure, materials/equipment, and specific techniques]

Method 2: [Name of Method]
[Detailed description of Method 2, including procedure, materials/equipment, and specific techniques]

Method 3: [Name of Method]
[Detailed description of Method 3, including procedure, materials/equipment, and specific techniques]

These methods will be executed according to [standards/protocols], with particular attention to [critical aspects].`,
      prompts: [
        'What specific methods will you use in your research?',
        'What equipment, materials, or resources will each method require?',
        'What procedures will you follow for each method?',
        'What established protocols or standards will you adhere to?'
      ]
    },
    {
      id: 'data',
      name: 'Data Collection and Analysis',
      wordCount: '200-300',
      description: 'Description of data collection procedures and analytical approaches.',
      defaultText: `Data Collection:
We will collect [types of data] using [data collection instruments/techniques]. The sampling strategy involves [sampling approach] with a target sample of [sample size/characteristics]. Data will be collected [frequency/timing] over [duration].

Data Analysis:
Data analysis will employ [analytical techniques], using [software/tools] to [specific analytical processes]. We will ensure robustness through [validation approaches] and address potential biases through [bias mitigation strategies].`,
      prompts: [
        'What types of data will you collect and how?',
        'What sampling strategy will you use?',
        'How will you analyze the data you collect?',
        'What software or tools will support your analysis?',
        'How will you ensure data quality and validity?'
      ]
    },
    {
      id: 'limitations',
      name: 'Limitations and Mitigation',
      wordCount: '100-150',
      description: 'Discussion of methodological limitations and mitigation strategies.',
      defaultText: `We acknowledge several potential limitations, including [limitation 1], [limitation 2], and [limitation 3]. To address these, we will implement the following mitigation strategies:

- For [limitation 1]: [specific mitigation strategy]
- For [limitation 2]: [specific mitigation strategy]
- For [limitation 3]: [specific mitigation strategy]

These approaches will strengthen our methodology while maintaining transparency about inherent constraints.`,
      prompts: [
        'What are the potential limitations of your chosen methods?',
        'How might these limitations affect your results?',
        'What strategies will you use to address or mitigate these limitations?'
      ]
    },
    {
      id: 'ethics',
      name: 'Ethical Considerations',
      wordCount: '100-150',
      description: 'Discussion of ethical considerations and compliance measures.',
      defaultText: `This research will adhere to ethical guidelines established by [relevant ethical frameworks]. Specific considerations include [ethical consideration 1], [ethical consideration 2], and [ethical consideration 3]. We will obtain appropriate [approvals/permissions] from [relevant bodies], ensure [specific ethical practice], and maintain [specific ethical standard] throughout the research process.`,
      prompts: [
        'What ethical issues might arise in your research?',
        'What approvals or permissions will you need?',
        'How will you ensure ethical standards are maintained?'
      ]
    }
  ],
  fullTemplate: `[Methodology: ${COMMON_PLACEHOLDERS.PROJECT_TITLE}]

To achieve our research objectives, we will employ a [methodological approach] that integrates [method 1], [method 2], and [method 3]. This approach was selected because [rationale for methodological choices], and addresses the challenges of [specific challenges] inherent in studying ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC}.

The research design consists of [number] phases over a ${COMMON_PLACEHOLDERS.DURATION} period:

Phase 1: [Description of Phase 1]
Phase 2: [Description of Phase 2]
Phase 3: [Description of Phase 3]

This design allows for [advantage of design] while addressing potential [challenges] through [mitigation strategies].

Method 1: [Name of Method]
[Detailed description of Method 1, including procedure, materials/equipment, and specific techniques]

Method 2: [Name of Method]
[Detailed description of Method 2, including procedure, materials/equipment, and specific techniques]

Method 3: [Name of Method]
[Detailed description of Method 3, including procedure, materials/equipment, and specific techniques]

These methods will be executed according to [standards/protocols], with particular attention to [critical aspects].

Data Collection:
We will collect [types of data] using [data collection instruments/techniques]. The sampling strategy involves [sampling approach] with a target sample of [sample size/characteristics]. Data will be collected [frequency/timing] over [duration].

Data Analysis:
Data analysis will employ [analytical techniques], using [software/tools] to [specific analytical processes]. We will ensure robustness through [validation approaches] and address potential biases through [bias mitigation strategies].

We acknowledge several potential limitations, including [limitation 1], [limitation 2], and [limitation 3]. To address these, we will implement the following mitigation strategies:

- For [limitation 1]: [specific mitigation strategy]
- For [limitation 2]: [specific mitigation strategy]
- For [limitation 3]: [specific mitigation strategy]

These approaches will strengthen our methodology while maintaining transparency about inherent constraints.

This research will adhere to ethical guidelines established by [relevant ethical frameworks]. Specific considerations include [ethical consideration 1], [ethical consideration 2], and [ethical consideration 3]. We will obtain appropriate [approvals/permissions] from [relevant bodies], ensure [specific ethical practice], and maintain [specific ethical standard] throughout the research process.`
};

// Impact Statement template
const impactTemplate = {
  id: 'impact',
  name: 'Impact Statement',
  wordCount: '500-750',
  description: 'Description of the potential impacts and significance of the research beyond immediate outcomes.',
  structure: [
    {
      id: 'overview',
      name: 'Impact Overview',
      wordCount: '75-100',
      description: 'Brief summary of the primary impacts of the research.',
      defaultText: `This research on ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC} will generate significant impacts across multiple domains. Beyond advancing knowledge in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}, it will deliver tangible benefits to [stakeholder groups] through [primary impact mechanisms] and contribute to addressing [broader challenges].`,
      prompts: [
        'What are the primary ways your research will have impact?',
        'Who will benefit from your research?',
        'What broader challenges does your research address?'
      ]
    },
    {
      id: 'academic',
      name: 'Intellectual Merit',
      wordCount: '100-150',
      description: 'Discussion of how the research advances knowledge and understanding.',
      defaultText: `The intellectual merit of this work lies in its contribution to [specific knowledge area] through [specific contributions]. It will advance theory by [theoretical advancement], challenge existing paradigms regarding [established concepts], and open new avenues for research in [emerging areas]. The methodological approach of [methodological innovation] will provide [methodological benefit] that can be applied to [related research areas].`,
      prompts: [
        'How will your research advance knowledge in your field?',
        'What theoretical contributions will your work make?',
        'What methodological innovations might your approach offer?'
      ]
    },
    {
      id: 'societal',
      name: 'Broader Impacts',
      wordCount: '150-200',
      description: 'Description of benefits to society, economy, or environment.',
      defaultText: `The broader impacts of this research extend to [societal domains]. Specifically, it will benefit:

1. [Stakeholder Group 1]: [Specific benefit and mechanism]
2. [Stakeholder Group 2]: [Specific benefit and mechanism]
3. [Stakeholder Group 3]: [Specific benefit and mechanism]

These benefits align with [societal needs/priorities] and will contribute to addressing [broader challenges] by providing [specific contributions].`,
      prompts: [
        'What societal benefits will result from your research?',
        'How might your research impact the economy, environment, or public policy?',
        'What specific groups in society will benefit and how?'
      ]
    },
    {
      id: 'longterm',
      name: 'Long-term Significance',
      wordCount: '75-100',
      description: 'Discussion of potential long-term significance and future directions.',
      defaultText: `The long-term significance of this research extends beyond immediate outcomes. It establishes foundations for [future developments] and positions ${COMMON_PLACEHOLDERS.INSTITUTION} to [institutional benefits]. In the coming decade, this work could contribute to [transformative potential] and help address [long-term challenges] through [specific mechanisms].`,
      prompts: [
        'What might be the long-term significance of your research?',
        'How might your research lead to future developments or innovations?',
        'What long-term challenges might your research help address?'
      ]
    },
    {
      id: 'dissemination',
      name: 'Dissemination and Implementation',
      wordCount: '100-150',
      description: 'Plans for disseminating and implementing research findings.',
      defaultText: `To maximize impact, research findings will be disseminated through multiple channels:

Academic channels: [specific journals], [conferences], and [academic networks]
Practitioner channels: [professional outlets], [industry forums], and [practitioner networks]
Public engagement: [public outreach activities], [media engagement], and [community activities]

Implementation will be facilitated through [implementation strategies], with particular attention to [adoption considerations].`,
      prompts: [
        'How will you disseminate your research findings?',
        'What strategies will ensure your research has real-world impact?',
        'How will you engage with different audiences about your research?'
      ]
    }
  ],
  fullTemplate: `[Impact Statement: ${COMMON_PLACEHOLDERS.PROJECT_TITLE}]

This research on ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC} will generate significant impacts across multiple domains. Beyond advancing knowledge in ${COMMON_PLACEHOLDERS.RESEARCH_FIELD}, it will deliver tangible benefits to [stakeholder groups] through [primary impact mechanisms] and contribute to addressing [broader challenges].

The intellectual merit of this work lies in its contribution to [specific knowledge area] through [specific contributions]. It will advance theory by [theoretical advancement], challenge existing paradigms regarding [established concepts], and open new avenues for research in [emerging areas]. The methodological approach of [methodological innovation] will provide [methodological benefit] that can be applied to [related research areas].

The broader impacts of this research extend to [societal domains]. Specifically, it will benefit:

1. [Stakeholder Group 1]: [Specific benefit and mechanism]
2. [Stakeholder Group 2]: [Specific benefit and mechanism]
3. [Stakeholder Group 3]: [Specific benefit and mechanism]

These benefits align with [societal needs/priorities] and will contribute to addressing [broader challenges] by providing [specific contributions].

The long-term significance of this research extends beyond immediate outcomes. It establishes foundations for [future developments] and positions ${COMMON_PLACEHOLDERS.INSTITUTION} to [institutional benefits]. In the coming decade, this work could contribute to [transformative potential] and help address [long-term challenges] through [specific mechanisms].

To maximize impact, research findings will be disseminated through multiple channels:

Academic channels: [specific journals], [conferences], and [academic networks]
Practitioner channels: [professional outlets], [industry forums], and [practitioner networks]
Public engagement: [public outreach activities], [media engagement], and [community activities]

Implementation will be facilitated through [implementation strategies], with particular attention to [adoption considerations].`
};

// Budget Justification template
const budgetTemplate = {
  id: 'budget',
  name: 'Budget and Justification',
  wordCount: '500-750',
  description: 'Detailed budget and justification for all expenses.',
  structure: [
    {
      id: 'overview',
      name: 'Budget Overview',
      wordCount: '75-100',
      description: 'Summary of total budget and major categories.',
      defaultText: `This project requests a total of ${COMMON_PLACEHOLDERS.FUNDING_AMOUNT} over ${COMMON_PLACEHOLDERS.DURATION} to support research on ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC}. Major budget categories include Personnel (XX%), Equipment (XX%), Materials and Supplies (XX%), Travel (XX%), and Other Direct Costs (XX%). This budget has been carefully developed to ensure efficient resource allocation while providing all necessary support for achieving the project objectives.`,
      prompts: [
        'What is the total budget requested for your project?',
        'What are the major budget categories and their approximate percentages?',
        'How does the budget align with your research objectives?'
      ]
    },
    {
      id: 'personnel',
      name: 'Personnel',
      wordCount: '150-200',
      description: 'Justification for all personnel costs.',
      defaultText: `Principal Investigator (${COMMON_PLACEHOLDERS.RESEARCHER_NAME}): XX% effort, $XXX
[Description of PI role and justification for effort level]

Co-Investigator (Name): XX% effort, $XXX
[Description of Co-I role and justification for effort level]

Graduate Research Assistant: XX FTE, $XXX
[Description of GRA responsibilities and justification]

Undergraduate Assistants: X hours/week, $XXX
[Description of undergraduate roles and justification]

Fringe benefits are calculated at the institutional rates of XX% for faculty, XX% for graduate students, and XX% for undergraduate students.`,
      prompts: [
        'What personnel are required for this project?',
        'What is each person\'s role and effort level?',
        'Why is each team member essential to the project?'
      ]
    },
    {
      id: 'equipment',
      name: 'Equipment',
      wordCount: '75-100',
      description: 'Justification for equipment purchases.',
      defaultText: `[Equipment Item 1]: $XXX
[Justification for necessity, how it will be used, and why existing equipment is insufficient]

[Equipment Item 2]: $XXX
[Justification for necessity, how it will be used, and why existing equipment is insufficient]

All equipment purchases are necessary for [specific research activities] and will be maintained according to [maintenance plan]. No suitable equipment is currently available at ${COMMON_PLACEHOLDERS.INSTITUTION} that meets the specific requirements of [technical specifications needed].`,
      prompts: [
        'What equipment is required for your research?',
        'Why is each piece of equipment necessary?',
        'Could you use existing equipment instead of purchasing new items?'
      ]
    },
    {
      id: 'materials',
      name: 'Materials and Supplies',
      wordCount: '75-100',
      description: 'Justification for materials and supplies.',
      defaultText: `Laboratory/Research Supplies: $XXX
[Itemized list and justification of major supply categories]

Computing Resources: $XXX
[Description and justification of computing needs]

Publication Costs: $XXX
[Explanation of expected publication fees]

These materials and supplies are directly required for [specific research activities] and have been estimated based on [basis for cost estimates].`,
      prompts: [
        'What materials and supplies will your research require?',
        'How did you estimate these costs?',
        'Why are these items necessary for your project?'
      ]
    },
    {
      id: 'travel',
      name: 'Travel',
      wordCount: '75-100',
      description: 'Justification for travel expenses.',
      defaultText: `Conference Travel: $XXX
[Description of conferences, benefits of attendance, and breakdown of costs]

Field/Research Travel: $XXX
[Description of field work locations, necessity, and breakdown of costs]

Collaborative Visits: $XXX
[Description of collaborator meetings, purpose, and breakdown of costs]

All travel is directly related to [research objectives] and will enable [specific benefits to the project].`,
      prompts: [
        'What travel is necessary for your research?',
        'What is the purpose of each trip?',
        'How will this travel benefit your project?'
      ]
    },
    {
      id: 'other',
      name: 'Other Direct Costs',
      wordCount: '50-75',
      description: 'Justification for any other direct costs.',
      defaultText: `Participant Compensation: $XXX
[Justification and breakdown of participant costs]

Service Contracts: $XXX
[Description and justification of any service contracts]

Other specialized costs: $XXX
[Description and justification of other specialized costs]

These costs are necessary for [specific research components] and have been estimated based on [basis for estimates].`,
      prompts: [
        'What other direct costs are associated with your project?',
        'Why are these costs necessary?',
        'How did you estimate these costs?'
      ]
    }
  ],
  fullTemplate: `[Budget and Justification: ${COMMON_PLACEHOLDERS.PROJECT_TITLE}]

This project requests a total of ${COMMON_PLACEHOLDERS.FUNDING_AMOUNT} over ${COMMON_PLACEHOLDERS.DURATION} to support research on ${COMMON_PLACEHOLDERS.RESEARCH_TOPIC}. Major budget categories include Personnel (XX%), Equipment (XX%), Materials and Supplies (XX%), Travel (XX%), and Other Direct Costs (XX%). This budget has been carefully developed to ensure efficient resource allocation while providing all necessary support for achieving the project objectives.

Principal Investigator (${COMMON_PLACEHOLDERS.RESEARCHER_NAME}): XX% effort, $XXX
[Description of PI role and justification for effort level]

Co-Investigator (Name): XX% effort, $XXX
[Description of Co-I role and justification for effort level]

Graduate Research Assistant: XX FTE, $XXX
[Description of GRA responsibilities and justification]

Undergraduate Assistants: X hours/week, $XXX
[Description of undergraduate roles and justification]

Fringe benefits are calculated at the institutional rates of XX% for faculty, XX% for graduate students, and XX% for undergraduate students.

[Equipment Item 1]: $XXX
[Justification for necessity, how it will be used, and why existing equipment is insufficient]

[Equipment Item 2]: $XXX
[Justification for necessity, how it will be used, and why existing equipment is insufficient]

All equipment purchases are necessary for [specific research activities] and will be maintained according to [maintenance plan]. No suitable equipment is currently available at ${COMMON_PLACEHOLDERS.INSTITUTION} that meets the specific requirements of [technical specifications needed].

Laboratory/Research Supplies: $XXX
[Itemized list and justification of major supply categories]

Computing Resources: $XXX
[Description and justification of computing needs]

Publication Costs: $XXX
[Explanation of expected publication fees]

These materials and supplies are directly required for [specific research activities] and have been estimated based on [basis for cost estimates].

Conference Travel: $XXX
[Description of conferences, benefits of attendance, and breakdown of costs]

Field/Research Travel: $XXX
[Description of field work locations, necessity, and breakdown of costs]

Collaborative Visits: $XXX
[Description of collaborator meetings, purpose, and breakdown of costs]

All travel is directly related to [research objectives] and will enable [specific benefits to the project].

Participant Compensation: $XXX
[Justification and breakdown of participant costs]

Service Contracts: $XXX
[Description and justification of any service contracts]

Other specialized costs: $XXX
[Description and justification of other specialized costs]

These costs are necessary for [specific research components] and have been estimated based on [basis for estimates].`
};

// Timeline template
const timelineTemplate = {
  id: 'timeline',
  name: 'Project Timeline',
  wordCount: '300-500',
  description: 'Detailed timeline with milestones and deliverables.',
  structure: [
    {
      id: 'overview',
      name: 'Timeline Overview',
      wordCount: '50-75',
      description: 'Brief overview of project duration and phases.',
      defaultText: `This project will be conducted over a period of ${COMMON_PLACEHOLDERS.DURATION}, beginning in [start date] and concluding in [end date]. The work is organized into [number] major phases with specific milestones and deliverables for each phase as detailed below.`,
      prompts: [
        'What is the total duration of your project?',
        'How have you organized your project timeline (phases, years, etc.)?',
        'What are the major segments of your timeline?'
      ]
    },
    {
      id: 'phase1',
      name: 'Phase 1',
      wordCount: '75-100',
      description: 'Details of first project phase.',
      defaultText: `Phase 1: [Phase Name] (Months X-Y)

Activities:
- [Activity 1.1]: [Brief description]
- [Activity 1.2]: [Brief description]
- [Activity 1.3]: [Brief description]

Milestones:
- [Milestone 1.1]: Month X
- [Milestone 1.2]: Month Y

Deliverables:
- [Deliverable 1.1]: [Brief description and timing]
- [Deliverable 1.2]: [Brief description and timing]`,
      prompts: [
        'What are the main activities in the first phase of your project?',
        'What specific milestones will mark progress in this phase?',
        'What deliverables will be produced during this phase?'
      ]
    },
    {
      id: 'phase2',
      name: 'Phase 2',
      wordCount: '75-100',
      description: 'Details of second project phase.',
      defaultText: `Phase 2: [Phase Name] (Months X-Y)

Activities:
- [Activity 2.1]: [Brief description]
- [Activity 2.2]: [Brief description]
- [Activity 2.3]: [Brief description]

Milestones:
- [Milestone 2.1]: Month X
- [Milestone 2.2]: Month Y

Deliverables:
- [Deliverable 2.1]: [Brief description and timing]
- [Deliverable 2.2]: [Brief description and timing]`,
      prompts: [
        'What are the main activities in the second phase of your project?',
        'What specific milestones will mark progress in this phase?',
        'What deliverables will be produced during this phase?'
      ]
    },
    {
      id: 'phase3',
      name: 'Phase 3',
      wordCount: '75-100',
      description: 'Details of third project phase.',
      defaultText: `Phase 3: [Phase Name] (Months X-Y)

Activities:
- [Activity 3.1]: [Brief description]
- [Activity 3.2]: [Brief description]
- [Activity 3.3]: [Brief description]

Milestones:
- [Milestone 3.1]: Month X
- [Milestone 3.2]: Month Y

Deliverables:
- [Deliverable 3.1]: [Brief description and timing]
- [Deliverable 3.2]: [Brief description and timing]`,
      prompts: [
        'What are the main activities in the final phase of your project?',
        'What specific milestones will mark progress in this phase?',
        'What deliverables will be produced during this phase?'
      ]
    },
    {
      id: 'contingency',
      name: 'Contingency Planning',
      wordCount: '50-75',
      description: 'Discussion of contingency plans for potential delays.',
      defaultText: `Recognizing that research often encounters unexpected challenges, we have built in contingency plans to address potential delays. For [potential challenge 1], we will [specific strategy]. If [potential challenge 2] occurs, we will [alternative approach]. These strategies ensure that overall project goals will be achieved even if specific components face delays.`,
      prompts: [
        'What potential challenges might delay your timeline?',
        'What contingency plans do you have in place?',
        'How will you ensure major objectives are still met if delays occur?'
      ]
    }
  ],
  fullTemplate: `[Project Timeline: ${COMMON_PLACEHOLDERS.PROJECT_TITLE}]

This project will be conducted over a period of ${COMMON_PLACEHOLDERS.DURATION}, beginning in [start date] and concluding in [end date]. The work is organized into [number] major phases with specific milestones and deliverables for each phase as detailed below.

Phase 1: [Phase Name] (Months X-Y)

Activities:
- [Activity 1.1]: [Brief description]
- [Activity 1.2]: [Brief description]
- [Activity 1.3]: [Brief description]

Milestones:
- [Milestone 1.1]: Month X
- [Milestone 1.2]: Month Y

Deliverables:
- [Deliverable 1.1]: [Brief description and timing]
- [Deliverable 1.2]: [Brief description and timing]

Phase 2: [Phase Name] (Months X-Y)

Activities:
- [Activity 2.1]: [Brief description]
- [Activity 2.2]: [Brief description]
- [Activity 2.3]: [Brief description]

Milestones:
- [Milestone 2.1]: Month X
- [Milestone 2.2]: Month Y

Deliverables:
- [Deliverable 2.1]: [Brief description and timing]
- [Deliverable 2.2]: [Brief description and timing]

Phase 3: [Phase Name] (Months X-Y)

Activities:
- [Activity 3.1]: [Brief description]
- [Activity 3.2]: [Brief description]
- [Activity 3.3]: [Brief description]

Milestones:
- [Milestone 3.1]: Month X
- [Milestone 3.2]: Month Y

Deliverables:
- [Deliverable 3.1]: [Brief description and timing]
- [Deliverable 3.2]: [Brief description and timing]

Recognizing that research often encounters unexpected challenges, we have built in contingency plans to address potential delays. For [potential challenge 1], we will [specific strategy]. If [potential challenge 2] occurs, we will [alternative approach]. These strategies ensure that overall project goals will be achieved even if specific components face delays.`
};

// Function to replace placeholders in a template
function replacePlaceholders(template, values) {
  let result = template;
  
  for (const [placeholder, value] of Object.entries(values)) {
    const regex = new RegExp(`{${placeholder}}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

// Export templates and utility functions
export {
  abstractTemplate,
  introductionTemplate,
  methodologyTemplate,
  impactTemplate,
  budgetTemplate,
  timelineTemplate,
  COMMON_PLACEHOLDERS,
  replacePlaceholders
};