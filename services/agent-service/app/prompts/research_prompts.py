"""
Research Prompts for GrantCraft.

This module contains prompt templates for research-related tools.
"""

RESEARCH_TOPIC_PROMPT_V1 = """
Perform research on the topic: {topic}

Provide a comprehensive analysis including:
1. Key concepts and definitions
2. Current state of research
3. Major trends and developments
4. Key challenges and gaps
5. Potential research directions

The depth of research should be: {depth}

Format the output as structured information.
"""

FUNDING_SOURCES_PROMPT_V1 = """
Identify potential funding sources for research in {research_area} for a {institution_type}.

For each funding source, provide:
1. Name of the funding organization
2. Relevant grant programs
3. Typical funding amounts
4. Application deadlines (if known)
5. Success rates (if known)
6. Alignment with {research_area}

Format as a structured list of funding sources.
"""

RESEARCH_GAPS_PROMPT_V1 = """
Analyze the research gaps and opportunities in {research_area}.

For this analysis, provide:
1. Summary of current knowledge
2. Identification of key gaps in the literature
3. Emerging questions that need investigation
4. Potential methodological innovations needed
5. Interdisciplinary opportunities
6. Potential impact of addressing these gaps

Focus on identifying promising research directions that could lead to innovative grant proposals.
"""

LITERATURE_ANALYSIS_PROMPT_V1 = """
Conduct a structured analysis of the literature on {research_area}.

This analysis should include:
1. Key theories and frameworks
2. Seminal works and their contributions
3. Recent developments in the last 2-3 years
4. Methodological approaches commonly used
5. Contradictions or debates in the field
6. Most cited papers and their significance

Organize this information to help inform a research proposal on this topic.
"""

COMPETITIVE_ANALYSIS_PROMPT_V1 = """
Analyze the competitive landscape for research funding in {research_area} for {institution_type}.

The analysis should include:
1. Major institutions and researchers active in this field
2. Recent major grants awarded in this area
3. Trending topics that are receiving funding
4. Funding priorities of major agencies
5. Success factors in funded proposals
6. Potential collaborators or competitors

This analysis should help position a research proposal strategically.
""" 