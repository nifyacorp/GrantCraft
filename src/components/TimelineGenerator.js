import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import DocumentGenerator from '../lib/documentGenerator';

function TimelineGenerator({ 
  projectInfo, 
  contextData, 
  onSave, 
  onClose,
  initialContent = null
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeline, setTimeline] = useState(initialContent || null);
  const [phases, setPhases] = useState([]);
  const [editingPhase, setEditingPhase] = useState(null);
  const [duration, setDuration] = useState(projectInfo?.duration || '3 years');
  const [documentGenerator] = useState(new DocumentGenerator());
  
  // Generate timeline when component mounts if not provided
  useEffect(() => {
    if (!timeline && !isGenerating) {
      generateTimeline();
    } else if (timeline) {
      try {
        // Parse existing timeline content
        parseTimelineContent(timeline.content);
      } catch (error) {
        console.error('Error parsing timeline content:', error);
      }
    }
  }, [timeline]);
  
  // Parse timeline content
  const parseTimelineContent = (content) => {
    // In a real implementation, this would parse the Markdown content
    // Here, we'll use a simple regex-based approach
    
    // Extract phases from the content
    const phaseRegex = /Phase\s+(\d+):\s+(.*?)\s+\((.*?)\)\s*\n\s*Activities:([\s\S]*?)(?=\s*(?:Milestones:|Phase \d+:|$))/gi;
    const phaseMatches = [...content.matchAll(phaseRegex)];
    
    // Extract milestones for each phase
    const milestoneRegex = /Milestones:([\s\S]*?)(?=\s*(?:Deliverables:|Phase \d+:|$))/gi;
    const milestoneMatches = [...content.matchAll(milestoneRegex)];
    
    // Extract deliverables for each phase
    const deliverableRegex = /Deliverables:([\s\S]*?)(?=\s*(?:Phase \d+:|$))/gi;
    const deliverableMatches = [...content.matchAll(deliverableRegex)];
    
    // Create phases array
    const parsedPhases = phaseMatches.map((match, index) => {
      const phaseNumber = match[1];
      const phaseName = match[2];
      const timeframe = match[3];
      
      // Parse activities
      const activitiesText = match[4] || '';
      const activities = activitiesText
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => {
          const activityText = line.trim().substring(1).trim();
          return {
            id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: activityText
          };
        });
      
      // Parse milestones for this phase
      const milestones = [];
      if (milestoneMatches[index]) {
        const milestonesText = milestoneMatches[index][1] || '';
        milestonesText
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .forEach(line => {
            const milestoneText = line.trim().substring(1).trim();
            const monthMatch = milestoneText.match(/Month\s+(\d+)/i);
            
            milestones.push({
              id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              text: milestoneText,
              month: monthMatch ? parseInt(monthMatch[1]) : null
            });
          });
      }
      
      // Parse deliverables for this phase
      const deliverables = [];
      if (deliverableMatches[index]) {
        const deliverablesText = deliverableMatches[index][1] || '';
        deliverablesText
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .forEach(line => {
            deliverables.push({
              id: `deliverable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              text: line.trim().substring(1).trim()
            });
          });
      }
      
      return {
        id: `phase_${index + 1}`,
        number: phaseNumber,
        name: phaseName,
        timeframe: timeframe,
        activities: activities,
        milestones: milestones,
        deliverables: deliverables
      };
    });
    
    setPhases(parsedPhases);
  };
  
  // Generate timeline
  const generateTimeline = async () => {
    setIsGenerating(true);
    
    try {
      // Generate the timeline document using DocumentGenerator
      const generatedTimeline = await documentGenerator.generateSection(
        'timeline',
        contextData || { messages: [], metadata: {} },
        {
          ...projectInfo,
          duration: duration
        } || { title: 'Research Project' }
      );
      
      setTimeline(generatedTimeline);
      
      // Parse the generated content to extract timeline items
      parseTimelineContent(generatedTimeline.content);
    } catch (error) {
      console.error('Error generating timeline:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add a new phase
  const addPhase = () => {
    const newPhaseNumber = phases.length + 1;
    
    const newPhase = {
      id: `phase_${Date.now()}`,
      number: newPhaseNumber.toString(),
      name: `Phase ${newPhaseNumber}`,
      timeframe: `Months ${(newPhaseNumber - 1) * 4 + 1}-${newPhaseNumber * 4}`,
      activities: [],
      milestones: [],
      deliverables: []
    };
    
    setPhases([...phases, newPhase]);
    setEditingPhase(newPhase.id);
  };
  
  // Delete a phase
  const deletePhase = (phaseId) => {
    const updatedPhases = phases.filter(phase => phase.id !== phaseId);
    setPhases(updatedPhases);
    
    if (editingPhase === phaseId) {
      setEditingPhase(null);
    }
  };
  
  // Add a new activity to a phase
  const addActivity = (phaseId) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    updatedPhases[phaseIndex].activities.push({
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: ''
    });
    
    setPhases(updatedPhases);
  };
  
  // Update an activity
  const updateActivity = (phaseId, activityId, text) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    const activityIndex = updatedPhases[phaseIndex].activities.findIndex(
      a => a.id === activityId
    );
    
    if (activityIndex === -1) return;
    
    updatedPhases[phaseIndex].activities[activityIndex].text = text;
    setPhases(updatedPhases);
  };
  
  // Delete an activity
  const deleteActivity = (phaseId, activityId) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    updatedPhases[phaseIndex].activities = updatedPhases[phaseIndex].activities.filter(
      a => a.id !== activityId
    );
    
    setPhases(updatedPhases);
  };
  
  // Add a new milestone to a phase
  const addMilestone = (phaseId) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    // Extract month range from timeframe (e.g., "Months 1-4")
    const timeframeMatch = updatedPhases[phaseIndex].timeframe.match(/Months\s+(\d+)-(\d+)/i);
    let defaultMonth = null;
    
    if (timeframeMatch) {
      defaultMonth = parseInt(timeframeMatch[1]);
    }
    
    updatedPhases[phaseIndex].milestones.push({
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      month: defaultMonth
    });
    
    setPhases(updatedPhases);
  };
  
  // Update a milestone
  const updateMilestone = (phaseId, milestoneId, updates) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    const milestoneIndex = updatedPhases[phaseIndex].milestones.findIndex(
      m => m.id === milestoneId
    );
    
    if (milestoneIndex === -1) return;
    
    updatedPhases[phaseIndex].milestones[milestoneIndex] = {
      ...updatedPhases[phaseIndex].milestones[milestoneIndex],
      ...updates
    };
    
    setPhases(updatedPhases);
  };
  
  // Delete a milestone
  const deleteMilestone = (phaseId, milestoneId) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    updatedPhases[phaseIndex].milestones = updatedPhases[phaseIndex].milestones.filter(
      m => m.id !== milestoneId
    );
    
    setPhases(updatedPhases);
  };
  
  // Add a new deliverable to a phase
  const addDeliverable = (phaseId) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    updatedPhases[phaseIndex].deliverables.push({
      id: `deliverable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: ''
    });
    
    setPhases(updatedPhases);
  };
  
  // Update a deliverable
  const updateDeliverable = (phaseId, deliverableId, text) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    const deliverableIndex = updatedPhases[phaseIndex].deliverables.findIndex(
      d => d.id === deliverableId
    );
    
    if (deliverableIndex === -1) return;
    
    updatedPhases[phaseIndex].deliverables[deliverableIndex].text = text;
    setPhases(updatedPhases);
  };
  
  // Delete a deliverable
  const deleteDeliverable = (phaseId, deliverableId) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    updatedPhases[phaseIndex].deliverables = updatedPhases[phaseIndex].deliverables.filter(
      d => d.id !== deliverableId
    );
    
    setPhases(updatedPhases);
  };
  
  // Update phase details
  const updatePhase = (phaseId, updates) => {
    const updatedPhases = [...phases];
    const phaseIndex = updatedPhases.findIndex(phase => phase.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    updatedPhases[phaseIndex] = {
      ...updatedPhases[phaseIndex],
      ...updates
    };
    
    setPhases(updatedPhases);
  };
  
  // Generate timeline document
  const generateTimelineDocument = () => {
    let document = `# Project Timeline: ${projectInfo?.title || 'Research Project'}\n\n`;
    document += `Duration: ${duration}\n\n`;
    
    // Add each phase
    phases.forEach(phase => {
      document += `## Phase ${phase.number}: ${phase.name} (${phase.timeframe})\n\n`;
      
      // Activities
      document += `### Activities:\n\n`;
      phase.activities.forEach(activity => {
        document += `- ${activity.text}\n`;
      });
      document += '\n';
      
      // Milestones
      document += `### Milestones:\n\n`;
      phase.milestones.forEach(milestone => {
        document += `- ${milestone.text}${milestone.month ? `: Month ${milestone.month}` : ''}\n`;
      });
      document += '\n';
      
      // Deliverables
      document += `### Deliverables:\n\n`;
      phase.deliverables.forEach(deliverable => {
        document += `- ${deliverable.text}\n`;
      });
      document += '\n';
    });
    
    // Add contingency planning section
    document += `## Contingency Planning\n\n`;
    document += `Recognizing that research often encounters unexpected challenges, we have built in flexibility to address potential delays. If specific components face delays, we will prioritize critical path activities and adjust timelines accordingly while maintaining overall project goals and deliverables.\n\n`;
    
    return document;
  };
  
  // Save timeline
  const handleSave = () => {
    if (onSave) {
      const timelineContent = generateTimelineDocument();
      
      // Create timeline object
      const timelineData = {
        section: 'timeline',
        title: `Timeline for ${projectInfo?.title || 'Research Project'}`,
        content: timelineContent,
        phases: phases,
        duration: duration
      };
      
      onSave(timelineData);
    }
  };
  
  if (isGenerating) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-4/5 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-6 text-muted-foreground">Generating timeline...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle>Timeline Generator</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Create and edit your project timeline
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Duration:</span>
            <select
              className="text-sm border rounded px-2 py-1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1 year">1 year</option>
              <option value="2 years">2 years</option>
              <option value="3 years">3 years</option>
              <option value="4 years">4 years</option>
              <option value="5 years">5 years</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border-r pr-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Project Phases</h3>
              <Button size="sm" variant="outline" onClick={addPhase}>
                Add Phase
              </Button>
            </div>
            
            <div className="space-y-2">
              {phases.map(phase => (
                <div 
                  key={phase.id}
                  className={`p-2 border rounded-md ${
                    editingPhase === phase.id ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/20'
                  } cursor-pointer`}
                  onClick={() => setEditingPhase(phase.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Phase {phase.number}: {phase.name}
                    </span>
                    <button
                      className="text-red-500 hover:text-red-700 h-5 w-5 text-xs rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhase(phase.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {phase.timeframe}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full"
                onClick={generateTimeline}
                variant="outline"
              >
                Regenerate Timeline
              </Button>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Timeline Preview</h3>
              <div className="border rounded-md p-3 h-[300px] overflow-y-auto whitespace-pre-wrap text-sm bg-muted/10">
                {generateTimelineDocument()}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {editingPhase ? (
              <div>
                {/* Phase Editing UI */}
                <div className="mb-6 border-b pb-4">
                  <h3 className="font-medium mb-4">Phase Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Phase Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        value={phases.find(p => p.id === editingPhase)?.number || ''}
                        onChange={(e) => updatePhase(editingPhase, { number: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phase Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        value={phases.find(p => p.id === editingPhase)?.name || ''}
                        onChange={(e) => updatePhase(editingPhase, { name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeframe</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={phases.find(p => p.id === editingPhase)?.timeframe || ''}
                      onChange={(e) => updatePhase(editingPhase, { timeframe: e.target.value })}
                      placeholder="e.g., Months 1-3"
                    />
                  </div>
                </div>
                
                {/* Activities Section */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Activities</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addActivity(editingPhase)}
                    >
                      Add Activity
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {phases.find(p => p.id === editingPhase)?.activities.map(activity => (
                      <div key={activity.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border rounded-md"
                          value={activity.text}
                          onChange={(e) => updateActivity(editingPhase, activity.id, e.target.value)}
                          placeholder="Describe the activity"
                        />
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteActivity(editingPhase, activity.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {phases.find(p => p.id === editingPhase)?.activities.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No activities defined. Click "Add Activity" to create one.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Milestones Section */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Milestones</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addMilestone(editingPhase)}
                    >
                      Add Milestone
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {phases.find(p => p.id === editingPhase)?.milestones.map(milestone => (
                      <div key={milestone.id} className="grid grid-cols-4 gap-2">
                        <div className="col-span-3">
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            value={milestone.text}
                            onChange={(e) => updateMilestone(editingPhase, milestone.id, { text: e.target.value })}
                            placeholder="Describe the milestone"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md"
                            value={milestone.month || ''}
                            onChange={(e) => updateMilestone(editingPhase, milestone.id, { month: e.target.value })}
                            placeholder="Month"
                          />
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteMilestone(editingPhase, milestone.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {phases.find(p => p.id === editingPhase)?.milestones.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No milestones defined. Click "Add Milestone" to create one.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Deliverables Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Deliverables</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addDeliverable(editingPhase)}
                    >
                      Add Deliverable
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {phases.find(p => p.id === editingPhase)?.deliverables.map(deliverable => (
                      <div key={deliverable.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border rounded-md"
                          value={deliverable.text}
                          onChange={(e) => updateDeliverable(editingPhase, deliverable.id, e.target.value)}
                          placeholder="Describe the deliverable"
                        />
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteDeliverable(editingPhase, deliverable.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {phases.find(p => p.id === editingPhase)?.deliverables.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No deliverables defined. Click "Add Deliverable" to create one.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground mb-4">
                  Select a phase to edit or create a new one
                </p>
                <Button onClick={addPhase}>Add Phase</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 p-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {phases.length} phase{phases.length !== 1 ? 's' : ''} | Duration: {duration}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
          >
            Save Timeline
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default TimelineGenerator;