import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import DocumentGenerator from '../lib/documentGenerator';

function MethodologyGenerator({ 
  projectInfo, 
  contextData, 
  onSave, 
  onClose,
  initialContent = null
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [methodology, setMethodology] = useState(initialContent || null);
  const [editedContent, setEditedContent] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [documentGenerator] = useState(new DocumentGenerator());
  
  // Generate methodology when component mounts if not provided
  useEffect(() => {
    if (!methodology && !isGenerating) {
      generateMethodology();
    } else if (methodology) {
      setEditedContent(methodology.content || '');
    }
  }, [methodology]);
  
  // Generate methodology using DocumentGenerator
  const generateMethodology = async () => {
    setIsGenerating(true);
    
    try {
      const generatedMethodology = await documentGenerator.generateSection(
        'methodology',
        contextData || { messages: [], metadata: {} },
        projectInfo || { title: 'Research Project' }
      );
      
      setMethodology(generatedMethodology);
      setEditedContent(generatedMethodology.content || '');
      setActiveSection(null);
    } catch (error) {
      console.error('Error generating methodology:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save methodology to project
  const handleSave = () => {
    if (onSave && methodology) {
      // Create updated methodology object with edited content
      const updatedMethodology = {
        ...methodology,
        content: editedContent,
        subsections: { ...methodology.subsections } // Keep original subsections for reference
      };
      
      onSave(updatedMethodology);
    }
  };
  
  // Regenerate a specific section
  const regenerateSection = async (sectionId) => {
    if (!methodology || !methodology.template) return;
    
    setIsGenerating(true);
    
    try {
      // Find the subsection in the template
      const subsection = methodology.template.structure.find(s => s.id === sectionId);
      if (!subsection) return;
      
      // Generate new content for just this subsection
      const newSubsectionContent = await documentGenerator.generateSubsection(
        subsection,
        documentGenerator.extractRelevantContext(contextData || { messages: [], metadata: {} }, 'methodology'),
        documentGenerator.preparePlaceholderValues(
          projectInfo || { title: 'Research Project' },
          documentGenerator.extractRelevantContext(contextData || { messages: [], metadata: {} }, 'methodology')
        ),
        'methodology'
      );
      
      // Update the methodology object
      const updatedSubsections = { ...methodology.subsections, [sectionId]: newSubsectionContent };
      
      // Rebuild the full methodology content
      let newContent = '';
      for (const section of methodology.template.structure) {
        newContent += updatedSubsections[section.id] + '\n\n';
      }
      
      const updatedMethodology = {
        ...methodology,
        content: newContent.trim(),
        subsections: updatedSubsections
      };
      
      setMethodology(updatedMethodology);
      setEditedContent(newContent.trim());
    } catch (error) {
      console.error('Error regenerating section:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!methodology && isGenerating) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-4/5 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-6 text-muted-foreground">Generating methodology...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!methodology) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Unable to generate methodology. Please try again.</p>
          <Button onClick={generateMethodology}>Retry Generation</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle>Methodology Generator</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Edit the generated methodology or regenerate specific sections as needed.
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border-r pr-4">
            <h3 className="font-medium mb-2">Sections</h3>
            <div className="space-y-2">
              {methodology.template.structure.map(section => (
                <div 
                  key={section.id}
                  className={`p-2 border rounded-md ${
                    activeSection === section.id ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/20'
                  } cursor-pointer`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{section.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        regenerateSection(section.id);
                      }}
                      disabled={isGenerating}
                    >
                      ↻
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Word Count</h3>
              <div className="text-sm">
                Current: {methodology.content ? documentGenerator.countWords(editedContent) : 0} words
              </div>
              <div className="text-sm text-muted-foreground">
                Target: {methodology.template.wordCount} words
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full"
                onClick={generateMethodology}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Regenerate All'}
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {activeSection ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{methodology.template.structure.find(s => s.id === activeSection)?.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {methodology.template.structure.find(s => s.id === activeSection)?.description}
                  </p>
                  
                  <textarea
                    className="w-full min-h-[200px] p-2 border rounded-md font-mono text-sm"
                    value={methodology.subsections[activeSection]}
                    onChange={(e) => {
                      // Update the subsection
                      const updatedSubsections = {
                        ...methodology.subsections,
                        [activeSection]: e.target.value
                      };
                      
                      // Rebuild the full methodology content
                      let newContent = '';
                      for (const section of methodology.template.structure) {
                        newContent += updatedSubsections[section.id] + '\n\n';
                      }
                      
                      setMethodology({
                        ...methodology,
                        content: newContent.trim(),
                        subsections: updatedSubsections
                      });
                      setEditedContent(newContent.trim());
                    }}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Guiding Questions</h4>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {methodology.template.structure
                      .find(s => s.id === activeSection)?.prompts
                      .map((prompt, index) => (
                        <li key={index} className="text-muted-foreground">
                          {prompt}
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Complete Methodology</h3>
                <textarea
                  className="w-full min-h-[400px] p-3 border rounded-md font-mono text-sm"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 p-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isGenerating ? 'Generating content...' : 'Ready to save or continue editing'}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isGenerating}
          >
            Save Methodology
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default MethodologyGenerator;