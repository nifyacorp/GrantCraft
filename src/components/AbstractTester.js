import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import DocumentGenerator from '../lib/documentGenerator';

// Test component to evaluate the quality of generated abstracts
function AbstractTester() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAbstracts, setGeneratedAbstracts] = useState([]);
  const [documentGenerator] = useState(new DocumentGenerator());
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [testFeedback, setTestFeedback] = useState({});
  
  // Test cases with different project scenarios
  const testCases = [
    {
      id: 'quantum-computing',
      title: 'Quantum Algorithm Optimization for Cryptographic Applications',
      topic: 'quantum computing for cryptography',
      field: 'Computer Science',
      contextData: {
        messages: [
          { 
            user: 'My research focuses on developing new quantum algorithms for cryptographic applications.', 
            assistant: 'That sounds like an interesting research area at the intersection of quantum computing and cryptography.' 
          },
          { 
            user: 'The main problem is that current quantum algorithms for encryption are not optimized for practical implementation on near-term quantum devices.', 
            assistant: 'I understand. So you're looking to bridge the gap between theoretical quantum algorithms and their practical implementation on current or near-term quantum hardware.' 
          },
          { 
            user: 'Yes, I'm specifically looking at post-quantum cryptography and how to optimize these algorithms to run efficiently on quantum processors with limited qubits.', 
            assistant: 'That's a critical research area, especially as quantum computing advances threaten traditional cryptographic methods.' 
          },
          { 
            user: 'We plan to use quantum simulation and circuit optimization techniques, combined with error mitigation strategies.', 
            assistant: 'Those approaches make sense for your research goals. How do you plan to evaluate the effectiveness of your optimized algorithms?' 
          },
          { 
            user: 'We'll benchmark them against classical implementations and measure performance improvements in terms of circuit depth, qubit requirements, and error resilience.', 
            assistant: 'That sounds like a comprehensive evaluation approach.' 
          }
        ],
        metadata: {
          topic: 'quantum computing for cryptography',
          keyInsights: {
            problem: ['Current quantum algorithms for encryption are not optimized for near-term quantum devices'],
            methodology: ['Quantum simulation and circuit optimization techniques, combined with error mitigation strategies'],
            impact: ['More practical quantum-resistant cryptographic systems']
          }
        }
      },
      projectInfo: {
        title: 'Quantum Algorithm Optimization for Cryptographic Applications',
        researcherName: 'Dr. Sarah Chen',
        institution: 'Quantum Research Institute',
        topic: 'quantum computing for cryptography',
        field: 'Computer Science',
        goal: 'develop optimized quantum algorithms for cryptographic applications',
        duration: '3 years',
        fundingAmount: '$1,250,000'
      }
    },
    {
      id: 'climate-change',
      title: 'Coastal Ecosystem Resilience to Climate Change',
      topic: 'coastal ecosystem adaptation to climate change',
      field: 'Environmental Science',
      contextData: {
        messages: [
          { 
            user: 'I'm researching how coastal ecosystems adapt to climate change impacts, particularly sea level rise and increased storm intensity.', 
            assistant: 'That's a critical area of research given the vulnerability of coastal ecosystems to climate change.' 
          },
          { 
            user: 'The main gap is that we don't understand the thresholds at which these ecosystems collapse versus adapt, leading to poor coastal management strategies.', 
            assistant: 'I see. So identifying these tipping points between adaptation and collapse would be crucial for effective management and protection.' 
          },
          { 
            user: 'Our approach combines field monitoring, remote sensing data analysis, and ecosystem modeling to identify resilience indicators.', 
            assistant: 'That's a comprehensive approach using multiple data sources and methodologies.' 
          },
          { 
            user: 'We expect to develop a predictive framework for coastal ecosystem responses that can inform adaptation strategies and restoration efforts.', 
            assistant: 'That would be valuable for coastal managers and policymakers.' 
          },
          { 
            user: 'The results will help coastal communities, conservation organizations, and government agencies develop more effective protection and adaptation plans.', 
            assistant: 'So there's a clear path to practical application of your research findings.' 
          }
        ],
        metadata: {
          topic: 'coastal ecosystem adaptation to climate change',
          keyInsights: {
            problem: ['Don't understand thresholds at which coastal ecosystems collapse versus adapt'],
            methodology: ['Field monitoring, remote sensing data analysis, and ecosystem modeling'],
            impact: ['Help coastal communities and agencies develop effective protection plans']
          }
        }
      },
      projectInfo: {
        title: 'Coastal Ecosystem Resilience to Climate Change',
        researcherName: 'Dr. Maya Johnson',
        institution: 'Coastal Research Center',
        topic: 'coastal ecosystem adaptation to climate change',
        field: 'Environmental Science',
        goal: 'identify resilience thresholds in coastal ecosystems facing climate change',
        duration: '4 years',
        fundingAmount: '$1,850,000'
      }
    },
    {
      id: 'cancer-treatment',
      title: 'Novel Immunotherapy Approaches for Treatment-Resistant Cancers',
      topic: 'immunotherapy for treatment-resistant cancers',
      field: 'Oncology',
      contextData: {
        messages: [
          { 
            user: 'My research focuses on developing new immunotherapy approaches for cancers that don't respond to current treatments.', 
            assistant: 'That's an important area of research, especially for patients with limited treatment options.' 
          },
          { 
            user: 'The challenge is that many patients develop resistance to existing immunotherapies, and we don't fully understand the mechanisms behind this resistance.', 
            assistant: 'Understanding these resistance mechanisms would be crucial for developing more effective treatments.' 
          },
          { 
            user: 'We're using single-cell sequencing and proteomics to identify resistance biomarkers and potential new therapeutic targets.', 
            assistant: 'Those are powerful approaches for detailed molecular characterization.' 
          },
          { 
            user: 'We'll then develop and test targeted combination therapies in patient-derived xenograft models.', 
            assistant: 'That would provide a translational component to validate your findings in a model that better represents human disease.' 
          },
          { 
            user: 'Our goal is to develop personalized immunotherapy regimens based on patient-specific resistance profiles.', 
            assistant: 'So you're working toward a precision medicine approach tailored to individual patients.' 
          }
        ],
        metadata: {
          topic: 'immunotherapy for treatment-resistant cancers',
          keyInsights: {
            problem: ['Patients develop resistance to existing immunotherapies'],
            methodology: ['Single-cell sequencing and proteomics to identify resistance biomarkers'],
            impact: ['Develop personalized immunotherapy regimens based on resistance profiles']
          }
        }
      },
      projectInfo: {
        title: 'Novel Immunotherapy Approaches for Treatment-Resistant Cancers',
        researcherName: 'Dr. James Rodriguez',
        institution: 'Medical Research University',
        topic: 'immunotherapy for treatment-resistant cancers',
        field: 'Oncology',
        goal: 'develop effective immunotherapy approaches for treatment-resistant cancers',
        duration: '5 years',
        fundingAmount: '$2,500,000'
      }
    }
  ];
  
  // Generate abstract for current test case
  const generateTestAbstract = async () => {
    setIsGenerating(true);
    
    try {
      const testCase = testCases[selectedTestCase];
      
      // Generate abstract using the DocumentGenerator
      const generatedAbstract = await documentGenerator.generateSection(
        'abstract',
        testCase.contextData,
        testCase.projectInfo
      );
      
      // Add to the list of generated abstracts
      setGeneratedAbstracts(prev => [...prev, {
        id: `${testCase.id}-${Date.now()}`,
        testCase: testCase.id,
        abstract: generatedAbstract,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error generating test abstract:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Record feedback on abstract quality
  const recordFeedback = (abstractId, criteria, rating) => {
    setTestFeedback(prev => ({
      ...prev,
      [abstractId]: {
        ...(prev[abstractId] || {}),
        [criteria]: rating
      }
    }));
  };
  
  // Filter abstracts for the current test case
  const filteredAbstracts = generatedAbstracts.filter(
    a => a.testCase === testCases[selectedTestCase].id
  );
  
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle>Abstract Generation Tester</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate and evaluate abstracts for different research scenarios
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-6 border-b pb-4">
          <h3 className="font-medium mb-2">Test Case Selection</h3>
          <div className="flex flex-wrap gap-2">
            {testCases.map((testCase, index) => (
              <Button
                key={testCase.id}
                variant={selectedTestCase === index ? 'default' : 'outline'}
                onClick={() => setSelectedTestCase(index)}
              >
                {testCase.title.split(' ').slice(0, 3).join(' ')}...
              </Button>
            ))}
          </div>
          
          <div className="mt-4 bg-muted/20 p-3 rounded-md">
            <h4 className="font-medium">{testCases[selectedTestCase].title}</h4>
            <p className="text-sm mt-1">
              <span className="font-medium">Topic:</span> {testCases[selectedTestCase].topic}
            </p>
            <p className="text-sm">
              <span className="font-medium">Field:</span> {testCases[selectedTestCase].field}
            </p>
            <div className="mt-2">
              <Button
                onClick={generateTestAbstract}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Test Abstract'}
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Generated Abstracts ({filteredAbstracts.length})</h3>
          
          {filteredAbstracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No abstracts generated yet for this test case.</p>
              <p className="text-sm mt-1">Click the button above to generate an abstract.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAbstracts.map((item, index) => (
                <div key={item.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Abstract #{index + 1}</h4>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-muted/10 p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
                    {item.abstract.content}
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Quality Evaluation</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm mb-1">Relevance to Research Topic</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant={testFeedback[item.id]?.relevance === rating ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => recordFeedback(item.id, 'relevance', rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm mb-1">Clarity and Structure</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant={testFeedback[item.id]?.clarity === rating ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => recordFeedback(item.id, 'clarity', rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm mb-1">Completeness</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant={testFeedback[item.id]?.completeness === rating ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => recordFeedback(item.id, 'completeness', rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm mb-1">Overall Quality</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant={testFeedback[item.id]?.overall === rating ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => recordFeedback(item.id, 'overall', rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/10 p-4">
        <div className="text-sm text-muted-foreground">
          This testing tool helps evaluate and improve the quality of generated abstracts.
        </div>
      </CardFooter>
    </Card>
  );
}

export default AbstractTester;