import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { 
  getAllBestPractices, 
  getFieldPractices, 
  getAgencyPractices, 
  getRecommendedPractices,
  searchPractices 
} from '../lib/bestPractices';

function BestPracticesViewer({ projectInfo, onClose }) {
  const [practices, setPractices] = useState([]);
  const [filteredPractices, setFilteredPractices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeField, setActiveField] = useState('');
  const [activeAgency, setActiveAgency] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePractice, setActivePractice] = useState(null);
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Tips' },
    { id: 'writing', name: 'Writing & Style' },
    { id: 'structure', name: 'Structure & Organization' },
    { id: 'content', name: 'Content' },
    { id: 'impact', name: 'Impact & Significance' },
    { id: 'methodology', name: 'Methodology' },
    { id: 'planning', name: 'Planning & Timeline' },
    { id: 'administrative', name: 'Administrative' },
    { id: 'qualifications', name: 'Qualifications' }
  ];
  
  // Research fields for filtering
  const fields = [
    { id: '', name: 'All Fields' },
    { id: 'biomedical', name: 'Biomedical Sciences' },
    { id: 'physical_sciences', name: 'Physical Sciences' },
    { id: 'social_sciences', name: 'Social Sciences' },
    { id: 'humanities', name: 'Humanities' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'interdisciplinary', name: 'Interdisciplinary' }
  ];
  
  // Agencies for filtering
  const agencies = [
    { id: '', name: 'All Agencies' },
    { id: 'NSF', name: 'NSF' },
    { id: 'NIH', name: 'NIH' },
    { id: 'DOE', name: 'DOE' },
    { id: 'DOD', name: 'DOD' },
    { id: 'EU', name: 'EU Funding' }
  ];
  
  // Load initial practices on component mount
  useEffect(() => {
    const initialPractices = getAllBestPractices();
    setPractices(initialPractices);
    setFilteredPractices(initialPractices);
    
    // Set default active practice
    if (initialPractices.length > 0) {
      setActivePractice(initialPractices[0]);
    }
    
    // If project info includes research field or funding agency, apply those filters
    if (projectInfo) {
      if (projectInfo.researchField) {
        handleFieldChange(projectInfo.researchField);
      }
      if (projectInfo.targetAgency) {
        handleAgencyChange(projectInfo.targetAgency);
      }
    }
  }, []);
  
  // Apply filters when filter criteria change
  useEffect(() => {
    let results = [];
    
    // Get practices based on selected field and agency
    if (activeField && activeAgency) {
      results = getRecommendedPractices({ 
        field: activeField, 
        agency: activeAgency 
      });
    } else if (activeField) {
      results = getFieldPractices(activeField);
      results = [...getAllBestPractices(), ...results];
    } else if (activeAgency) {
      results = getAgencyPractices(activeAgency);
      results = [...getAllBestPractices(), ...results];
    } else {
      results = getAllBestPractices();
    }
    
    // Apply category filter if not "all"
    if (activeCategory !== 'all') {
      results = results.filter(practice => practice.category === activeCategory);
    }
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const searchResults = searchPractices(searchQuery);
      // Intersection of current results and search results
      const searchIds = new Set(searchResults.map(p => p.id));
      results = results.filter(p => searchIds.has(p.id));
    }
    
    // Update filtered practices
    setFilteredPractices(results);
    
    // Update active practice if current one is filtered out
    if (results.length > 0) {
      if (!activePractice || !results.find(p => p.id === activePractice.id)) {
        setActivePractice(results[0]);
      }
    } else {
      setActivePractice(null);
    }
  }, [activeCategory, activeField, activeAgency, searchQuery]);
  
  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };
  
  // Handle field filter change
  const handleFieldChange = (fieldId) => {
    setActiveField(fieldId);
  };
  
  // Handle agency filter change
  const handleAgencyChange = (agencyId) => {
    setActiveAgency(agencyId);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Select a practice to view details
  const handleSelectPractice = (practice) => {
    setActivePractice(practice);
  };
  
  // Render practice detail view
  const renderPracticeDetail = () => {
    if (!activePractice) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No practices found matching your criteria.</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => {
              setActiveCategory('all');
              setActiveField('');
              setActiveAgency('');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-medium">{activePractice.title}</h3>
          <p className="text-muted-foreground mt-1">{activePractice.description}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Tips</h4>
          <ul className="space-y-1">
            {activePractice.tips.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-bold text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {activePractice.example && (
          <div>
            <h4 className="font-medium mb-2">Example</h4>
            <div className="bg-muted/10 p-3 rounded-md border text-sm whitespace-pre-line">
              {activePractice.example}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {categories.find(c => c.id === activePractice.category)?.name || activePractice.category}
          </span>
          {activePractice.relevance?.map((rel, index) => (
            <span key={index} className="text-xs bg-muted/20 text-muted-foreground px-2 py-1 rounded">
              {rel}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle>Grant Writing Best Practices</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Discover tips and strategies for creating compelling grant proposals
        </p>
      </CardHeader>
      
      <div className="border-b p-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search best practices..."
              className="w-full px-3 py-2 border rounded-md"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <select
            className="px-3 py-2 border rounded-md"
            value={activeField}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            {fields.map(field => (
              <option key={field.id} value={field.id}>{field.name}</option>
            ))}
          </select>
          
          <select
            className="px-3 py-2 border rounded-md"
            value={activeAgency}
            onChange={(e) => handleAgencyChange(e.target.value)}
          >
            {agencies.map(agency => (
              <option key={agency.id} value={agency.id}>{agency.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap ${
                activeCategory === category.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[60vh]">
          <div className="border-r overflow-y-auto max-h-full">
            <div className="py-3 px-3 text-sm text-muted-foreground flex justify-between items-center border-b">
              <span>{filteredPractices.length} practices found</span>
            </div>
            
            <div className="divide-y">
              {filteredPractices.map(practice => (
                <div 
                  key={practice.id}
                  className={`p-3 cursor-pointer ${
                    activePractice?.id === practice.id 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted/10'
                  }`}
                  onClick={() => handleSelectPractice(practice)}
                >
                  <h4 className="font-medium">{practice.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {practice.description}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {categories.find(c => c.id === practice.category)?.name || practice.category}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredPractices.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">No practices found matching your criteria.</p>
                  <Button 
                    className="mt-2" 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setActiveCategory('all');
                      setActiveField('');
                      setActiveAgency('');
                      setSearchQuery('');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 p-4 overflow-y-auto max-h-full">
            {renderPracticeDetail()}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 p-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}

export default BestPracticesViewer;