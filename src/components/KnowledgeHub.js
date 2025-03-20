import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { 
  getAllAgencies, 
  getAgencyDetails, 
  searchAgencies, 
  getRecommendedAgencies 
} from '../lib/fundingAgencies';
import AgencyProfile from './AgencyProfile';
import BestPracticesViewer from './BestPracticesViewer';

function KnowledgeHub({ projectInfo, onClose }) {
  const [activeTab, setActiveTab] = useState('agencies');
  const [agencies, setAgencies] = useState(getAllAgencies());
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusFilter, setFocusFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [showAgencyProfile, setShowAgencyProfile] = useState(false);
  const [showBestPractices, setShowBestPractices] = useState(false);
  
  // Common focus areas for filtering
  const focusAreas = [
    'Science', 'Engineering', 'Biomedical', 'Health', 'Energy', 
    'Technology', 'Education', 'Environment', 'Defense', 'Social Sciences'
  ];
  
  // Common priority areas for filtering
  const priorityAreas = [
    'AI', 'Machine Learning', 'Climate Change', 'Sustainability', 
    'Quantum', 'Health Disparities', 'Clean Energy', 'COVID-19'
  ];
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    
    if (e.target.value.trim() === '') {
      setAgencies(getAllAgencies());
    } else {
      setAgencies(searchAgencies({ keyword: e.target.value }));
    }
  };
  
  // Handle focus filter toggle
  const handleFocusToggle = (focus) => {
    const updatedFocus = focusFilter.includes(focus)
      ? focusFilter.filter(f => f !== focus)
      : [...focusFilter, focus];
      
    setFocusFilter(updatedFocus);
    
    if (updatedFocus.length === 0 && priorityFilter.length === 0) {
      setAgencies(searchQuery ? searchAgencies({ keyword: searchQuery }) : getAllAgencies());
    } else {
      setAgencies(searchAgencies({ 
        keyword: searchQuery, 
        focus: updatedFocus, 
        priorities: priorityFilter 
      }));
    }
  };
  
  // Handle priority filter toggle
  const handlePriorityToggle = (priority) => {
    const updatedPriorities = priorityFilter.includes(priority)
      ? priorityFilter.filter(p => p !== priority)
      : [...priorityFilter, priority];
      
    setPriorityFilter(updatedPriorities);
    
    if (updatedPriorities.length === 0 && focusFilter.length === 0) {
      setAgencies(searchQuery ? searchAgencies({ keyword: searchQuery }) : getAllAgencies());
    } else {
      setAgencies(searchAgencies({ 
        keyword: searchQuery, 
        focus: focusFilter, 
        priorities: updatedPriorities 
      }));
    }
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFocusFilter([]);
    setPriorityFilter([]);
    setAgencies(getAllAgencies());
  };
  
  // Open agency profile
  const handleOpenAgencyProfile = (agencyId) => {
    const agencyDetails = getAgencyDetails(agencyId);
    setSelectedAgency(agencyDetails);
    setShowAgencyProfile(true);
  };
  
  // Close agency profile
  const handleCloseAgencyProfile = () => {
    setShowAgencyProfile(false);
  };
  
  // Open best practices viewer
  const handleOpenBestPractices = () => {
    setShowBestPractices(true);
  };
  
  // Close best practices viewer
  const handleCloseBestPractices = () => {
    setShowBestPractices(false);
  };
  
  // If showing agency profile
  if (showAgencyProfile) {
    return <AgencyProfile agency={selectedAgency} onClose={handleCloseAgencyProfile} />;
  }
  
  // If showing best practices
  if (showBestPractices) {
    return <BestPracticesViewer projectInfo={projectInfo} onClose={handleCloseBestPractices} />;
  }
  
  // Render main knowledge hub
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle>Grant Knowledge Hub</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Explore funding agencies, grant writing best practices, and expert advice
        </p>
      </CardHeader>
      
      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === 'agencies' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('agencies')}
          >
            Funding Agencies
          </button>
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === 'bestPractices' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={handleOpenBestPractices}
          >
            Best Practices
          </button>
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === 'resources' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
        </div>
      </div>
      
      <CardContent className="p-4">
        {activeTab === 'agencies' && (
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search funding agencies..."
                    className="w-full px-3 py-2 border rounded-md"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Focus Area</h3>
                  <div className="flex flex-wrap gap-1">
                    {focusAreas.map(focus => (
                      <button
                        key={focus}
                        className={`px-2 py-1 rounded-md text-xs ${
                          focusFilter.includes(focus)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                        }`}
                        onClick={() => handleFocusToggle(focus)}
                      >
                        {focus}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Priority</h3>
                  <div className="flex flex-wrap gap-1">
                    {priorityAreas.map(priority => (
                      <button
                        key={priority}
                        className={`px-2 py-1 rounded-md text-xs ${
                          priorityFilter.includes(priority)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                        }`}
                        onClick={() => handlePriorityToggle(priority)}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-3">
                {projectInfo?.topic 
                  ? 'Recommended Agencies for Your Project'
                  : 'Available Funding Agencies'
                }
              </h2>
              
              {agencies.length === 0 ? (
                <div className="text-center p-6 border rounded-md bg-muted/10">
                  <p className="text-muted-foreground">No agencies found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectInfo?.topic 
                    ? getRecommendedAgencies(projectInfo.topic).map(agency => (
                        <Card key={agency.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-lg">{agency.acronym}</h3>
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                Match Score: {agency.relevanceScore}
                              </span>
                            </div>
                            <h4 className="text-base">{agency.name}</h4>
                            <p className="text-sm text-muted-foreground my-2 line-clamp-2">
                              {agency.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agency.primaryFocus?.slice(0, 3).map((focus, index) => (
                                <span 
                                  key={index} 
                                  className="bg-muted/20 text-muted-foreground text-xs px-2 py-1 rounded-md"
                                >
                                  {focus}
                                </span>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                Success Rate: {agency.successRate}
                              </span>
                              <Button 
                                size="sm" 
                                onClick={() => handleOpenAgencyProfile(agency.id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    : agencies.map(agency => (
                        <Card key={agency.id} className="overflow-hidden">
                          <div className="p-4">
                            <h3 className="font-medium text-lg">{agency.acronym}</h3>
                            <h4 className="text-base">{agency.name}</h4>
                            <p className="text-sm text-muted-foreground my-2 line-clamp-2">
                              {agency.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agency.primaryFocus?.slice(0, 3).map((focus, index) => (
                                <span 
                                  key={index} 
                                  className="bg-muted/20 text-muted-foreground text-xs px-2 py-1 rounded-md"
                                >
                                  {focus}
                                </span>
                              ))}
                            </div>
                            <div className="mt-4 text-right">
                              <Button 
                                size="sm" 
                                onClick={() => handleOpenAgencyProfile(agency.id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                  }
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-3">Helpful Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-medium">Grant Writing Guides</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      Comprehensive guides to crafting successful grant proposals.
                    </p>
                    <ul className="text-sm space-y-1 mt-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">NIH Grant Application Guide</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">NSF Proposal Writing Tutorial</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">EU Horizon Application Guide</a>
                      </li>
                    </ul>
                  </div>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-medium">Example Proposals</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      Successfully funded proposals across different fields.
                    </p>
                    <ul className="text-sm space-y-1 mt-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">NIH R01 Examples</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">NSF CAREER Awards</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">Foundation Grant Samples</a>
                      </li>
                    </ul>
                  </div>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-medium">Grant Calendars</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      Upcoming deadlines and submission opportunities.
                    </p>
                    <ul className="text-sm space-y-1 mt-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">Federal Grant Deadlines</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">Foundation Submission Cycles</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <a href="#" className="text-primary hover:underline">International Funding Calendar</a>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-3">Video Tutorials</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <div className="aspect-video bg-muted/20 rounded-md flex items-center justify-center mb-2">
                    <span className="text-muted-foreground">Video Preview</span>
                  </div>
                  <h3 className="font-medium">Crafting a Compelling Specific Aims Page</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Learn how to structure and write an engaging specific aims page that grabs reviewer attention.
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="aspect-video bg-muted/20 rounded-md flex items-center justify-center mb-2">
                    <span className="text-muted-foreground">Video Preview</span>
                  </div>
                  <h3 className="font-medium">Budget Development & Justification</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Step-by-step guide to creating accurate budgets and compelling justifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 p-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}

export default KnowledgeHub;