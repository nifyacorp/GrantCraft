import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';

function GrantMatchResults({ matches, onClose, onSelect }) {
  if (!matches || matches.length === 0) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Grant Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-muted-foreground">No matching grants found for your research topic.</p>
            <p className="text-sm text-muted-foreground mt-2">Try refining your research description or keywords.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="bg-muted/40">
        <div className="flex justify-between items-center">
          <CardTitle>Matching Grant Opportunities</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Found {matches.length} matching grant opportunities for your research
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {matches.map(grant => (
            <div key={grant.id} className="p-4 hover:bg-muted/20">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{grant.title}</h3>
                <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {grant.category}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm mb-3">
                <div className="font-medium">{grant.sponsor}</div>
                <div className="text-muted-foreground">Deadline: {new Date(grant.deadline).toLocaleDateString()}</div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{grant.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {grant.keywords.map((keyword, idx) => (
                  <span key={idx} className="bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
                    {keyword}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">Amount:</span> {grant.amount}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {grant.duration}
                </div>
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(grant.url, '_blank')}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSelect(grant)}
                >
                  Use This Grant
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 p-4">
        <div className="text-sm text-muted-foreground">
          Note: Always check the official funding agency website for the most up-to-date information.
        </div>
      </CardFooter>
    </Card>
  );
}

export default GrantMatchResults;