import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

function HomePage() {
  const researchTopics = [
    {
      id: 1,
      title: 'Climate Change Mitigation',
      description: 'Research on technologies for reducing carbon emissions',
      keywords: ['climate change', 'carbon capture', 'sustainability']
    },
    {
      id: 2,
      title: 'AI in Healthcare',
      description: 'Application of AI for improving medical diagnostics',
      keywords: ['AI', 'healthcare', 'diagnostics']
    },
    {
      id: 3,
      title: 'Quantum Computing',
      description: 'Development of quantum computing applications',
      keywords: ['quantum', 'computing', 'encryption']
    }
  ];

  return (
    <div className="container p-4 space-y-16 py-10">
      <section className="text-center max-w-4xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to GrantCraft
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered assistant for crafting winning research grant proposals
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link to="/grants">Start New Project</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link to="/grants?tab=knowledge">Knowledge Hub</Link>
          </Button>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">🔍</div>
              <CardTitle>1. Choose Your Topic</CardTitle>
              <CardDescription>
                Select your research topic or define a custom one for your grant proposal.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">📄</div>
              <CardTitle>2. Upload Templates</CardTitle>
              <CardDescription>
                Upload grant templates or funding guidelines as PDFs for our AI to analyze.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">✍️</div>
              <CardTitle>3. Generate & Refine</CardTitle>
              <CardDescription>
                Our AI generates a complete grant package that you can refine through conversation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Popular Research Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {researchTopics.map(topic => (
            <Card key={topic.id}>
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {topic.keywords.map((keyword, idx) => (
                  <span key={idx} className="bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
                    {keyword}
                  </span>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      <section className="bg-muted/40 p-10 rounded-lg text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Grant Proposal?</h2>
        <p className="text-lg mb-6 text-muted-foreground">
          Let our AI assist you in creating a compelling and competitive research grant proposal.
        </p>
        <Button asChild size="lg">
          <Link to="/grants">Create New Project</Link>
        </Button>
      </section>
    </div>
  );
}

export default HomePage;