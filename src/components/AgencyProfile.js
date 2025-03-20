import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';

function AgencyProfile({ agency, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!agency) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Agency details not available</p>
          <Button className="mt-4" onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {agency.logo && (
                <img 
                  src={agency.logo} 
                  alt={`${agency.name} logo`} 
                  className="w-24 h-24 object-contain"
                  onError={(e) => e.target.style.display = 'none'} 
                />
              )}
              <div>
                <h3 className="text-lg font-medium">{agency.name}</h3>
                <p className="text-muted-foreground">{agency.description}</p>
                <a 
                  href={agency.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Visit Website
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Primary Focus Areas</h4>
                <ul className="list-disc list-inside space-y-1">
                  {agency.primaryFocus?.map((focus, index) => (
                    <li key={index} className="text-sm">{focus}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Quick Facts</h4>
                <ul className="space-y-1">
                  <li className="text-sm"><span className="font-medium">Annual Budget:</span> {agency.annualBudget}</li>
                  <li className="text-sm"><span className="font-medium">Success Rate:</span> {agency.successRate}</li>
                  <li className="text-sm"><span className="font-medium">Review Time:</span> {agency.applicationProcess?.reviewTime}</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Current Priorities</h4>
              <ul className="list-disc list-inside grid grid-cols-1 md:grid-cols-2 gap-1">
                {agency.currentPriorities?.map((priority, index) => (
                  <li key={index} className="text-sm">{priority}</li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case 'funding':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Typical Award Sizes</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="text-left p-2">Grant Type</th>
                      <th className="text-left p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(agency.typicalAwardSize || {}).map(([type, amount], index) => (
                      <tr key={index} className={index % 2 === 1 ? 'bg-muted/10' : ''}>
                        <td className="p-2">{type.charAt(0).toUpperCase() + type.slice(1)}</td>
                        <td className="p-2">{amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Application Process</h4>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Deadlines:</span> {agency.applicationProcess?.deadlines}</p>
                <p className="text-sm"><span className="font-medium">Portal:</span> 
                  <a 
                    href={agency.applicationProcess?.portalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-2"
                  >
                    {agency.applicationProcess?.portalUrl}
                  </a>
                </p>
                <div>
                  <p className="text-sm font-medium mb-1">Application Phases:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {agency.applicationProcess?.phases.map((phase, index) => (
                      <li key={index}>{phase}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Review Criteria</h4>
              <div className="space-y-3">
                {agency.reviewCriteria?.map((criteria, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{criteria.name}</h5>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {criteria.weight} Weight
                      </span>
                    </div>
                    <p className="text-sm mt-1">{criteria.description}</p>
                    <div className="mt-2">
                      <p className="text-xs font-medium">Reviewer Tip:</p>
                      <p className="text-xs italic text-muted-foreground">{criteria.tips}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'tips':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Expert Tips for {agency.acronym} Applications</h4>
              <ul className="space-y-2">
                {agency.tips?.map((tip, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-bold text-primary">•</span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Divisions and Institutes</h4>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                <ul className="space-y-1">
                  {(agency.divisions || agency.institutes)?.map((division, index) => (
                    <li key={index} className="text-sm">{division}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Select a tab to view information</p>
          </div>
        );
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle>{agency.acronym}: {agency.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
      </CardHeader>
      
      <div className="border-b">
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'funding' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('funding')}
          >
            Funding
          </button>
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'review' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('review')}
          >
            Review Criteria
          </button>
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'tips' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('tips')}
          >
            Tips & Divisions
          </button>
        </div>
      </div>
      
      <CardContent className="p-4">
        {renderTabContent()}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 p-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AgencyProfile;