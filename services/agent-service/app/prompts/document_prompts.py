"""
Document Generation Prompts for GrantCraft.

This module contains prompt templates for document generation.
"""

DOCUMENT_GENERATION_PROMPT_V1 = """
Create a {section_type} section for a research grant proposal on {topic}.

Requirements:
- Maximum length: {max_length} words
- Style: {style}
- Specific requirements: {requirements}

The section should be well-structured, evidence-based, and appropriate for an academic grant proposal.
Focus on clarity, precision, and addressing the key points that would strengthen the proposal.
"""

EXECUTIVE_SUMMARY_PROMPT_V1 = """
Write an executive summary for a grant proposal on {topic}.

The executive summary should:
1. Clearly state the problem or need
2. Introduce the proposed project/solution
3. Highlight key benefits and outcomes
4. Mention methodology briefly
5. State the total funding requested
6. Explain why your organization is qualified

Requirements:
- Maximum length: {max_length} words
- Style: {style}
- Specific requirements: {requirements}

The executive summary should be concise, compelling, and convey the importance and feasibility of the project.
"""

METHODOLOGY_SECTION_PROMPT_V1 = """
Create a methodology section for a research grant proposal on {topic}.

The methodology section should:
1. Clearly describe the research approach and design
2. Explain data collection methods
3. Detail analysis procedures
4. Address potential limitations and how they'll be mitigated
5. Include a timeline for major activities

Requirements:
- Maximum length: {max_length} words
- Style: {style}
- Specific requirements: {requirements}

The methodology should demonstrate rigor, feasibility, and alignment with the research objectives.
"""

LITERATURE_REVIEW_PROMPT_V1 = """
Write a literature review section for a research grant proposal on {topic}.

The literature review should:
1. Summarize the current state of knowledge
2. Identify gaps in existing research
3. Explain how your proposed research addresses these gaps
4. Cite key studies and findings
5. Establish a theoretical framework

Requirements:
- Maximum length: {max_length} words
- Style: {style}
- Specific requirements: {requirements}

The literature review should demonstrate your knowledge of the field and provide context for your research.
"""

BUDGET_NARRATIVE_PROMPT_V1 = """
Write a budget narrative section for a grant proposal on {topic}.

The budget narrative should:
1. Explain each major budget category
2. Justify why each expense is necessary
3. Explain how costs were calculated
4. Demonstrate cost-effectiveness
5. Align with the project description and timeline

Requirements:
- Maximum length: {max_length} words
- Style: {style}
- Specific requirements: {requirements}

The budget narrative should be clear, detailed, and persuasive about the need for funding.
""" 