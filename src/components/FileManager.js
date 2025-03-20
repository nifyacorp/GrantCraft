import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import FileViewer from './FileViewer';
import AbstractGenerator from './AbstractGenerator';
import IntroductionGenerator from './IntroductionGenerator';
import MethodologyGenerator from './MethodologyGenerator';
import BudgetGenerator from './BudgetGenerator';
import TimelineGenerator from './TimelineGenerator';

function FileManager({ project, projectManager, onBack }) {
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [isAbstractGeneratorOpen, setIsAbstractGeneratorOpen] = useState(false);
  const [isIntroductionGeneratorOpen, setIsIntroductionGeneratorOpen] = useState(false);
  const [isMethodologyGeneratorOpen, setIsMethodologyGeneratorOpen] = useState(false);
  const [isBudgetGeneratorOpen, setIsBudgetGeneratorOpen] = useState(false);
  const [isTimelineGeneratorOpen, setIsTimelineGeneratorOpen] = useState(false);
  const [contextData, setContextData] = useState(null);
  const [activeGenerator, setActiveGenerator] = useState(null);
  
  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Find the actual project object
  const projectObj = projectManager.getProject(project.id);
  
  // Get all folders
  const folders = projectObj?.getFolderStructure() || [];
  
  // Prepare context data for generators
  const prepareContextData = () => {
    // In a real app, this would come from chat history or other source
    return {
      messages: [],
      metadata: {
        topic: project.topic || projectObj?.metadata?.researchArea || '',
        projectTitle: project.title,
        keyInsights: projectObj?.metadata?.keywords
          ? { research_topic: [projectObj.metadata.researchArea || ''] }
          : {}
      }
    };
  };
  
  // Open the abstract generator
  const openAbstractGenerator = () => {
    setContextData(prepareContextData());
    setIsAbstractGeneratorOpen(true);
    setActiveGenerator('abstract');
  };
  
  // Open the introduction generator
  const openIntroductionGenerator = () => {
    setContextData(prepareContextData());
    setIsIntroductionGeneratorOpen(true);
    setActiveGenerator('introduction');
  };
  
  // Open the methodology generator
  const openMethodologyGenerator = () => {
    setContextData(prepareContextData());
    setIsMethodologyGeneratorOpen(true);
    setActiveGenerator('methodology');
  };
  
  // Open the budget generator
  const openBudgetGenerator = () => {
    setContextData(prepareContextData());
    setIsBudgetGeneratorOpen(true);
    setActiveGenerator('budget');
  };
  
  // Open the timeline generator
  const openTimelineGenerator = () => {
    setContextData(prepareContextData());
    setIsTimelineGeneratorOpen(true);
    setActiveGenerator('timeline');
  };
  
  // Handle saving generated document
  const handleSaveDocument = (sectionType, documentData) => {
    if (!projectObj) return;
    
    try {
      // Find the folder
      const folder = folders.find(folder => folder.name === sectionType);
      if (!folder) {
        console.error(`${sectionType} folder not found`);
        return;
      }
      
      // Save the content to a file
      const fileName = `${sectionType}.md`;
      const file = projectObj.createFile(sectionType, fileName, documentData.content);
      
      // Update project metadata
      const metadataUpdate = {};
      metadataUpdate[`hasGenerated${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}`] = true;
      metadataUpdate.lastUpdated = new Date().toISOString();
      
      projectObj.updateMetadata(metadataUpdate);
      
      // Save changes
      projectManager.saveProjects();
      
      // Close the generator
      if (sectionType === 'abstract') {
        setIsAbstractGeneratorOpen(false);
      } else if (sectionType === 'introduction') {
        setIsIntroductionGeneratorOpen(false);
      } else if (sectionType === 'methodology') {
        setIsMethodologyGeneratorOpen(false);
      } else if (sectionType === 'budget') {
        setIsBudgetGeneratorOpen(false);
      } else if (sectionType === 'timeline') {
        setIsTimelineGeneratorOpen(false);
      }
      
      setActiveGenerator(null);
      
      // Show the file
      setActiveFile(file);
      setActiveFolder(sectionType);
      setIsFileViewerOpen(true);
      
      // Expand the folder
      setExpandedFolders(prev => ({
        ...prev,
        [folder.id]: true
      }));
    } catch (error) {
      console.error(`Error saving ${sectionType}:`, error);
    }
  };
  
  // Handle saving generated abstract (wrapper for consistency)
  const handleSaveAbstract = (abstractData) => {
    handleSaveDocument('abstract', abstractData);
  };
  
  // Handle saving generated introduction
  const handleSaveIntroduction = (introductionData) => {
    handleSaveDocument('introduction', introductionData);
  };
  
  // Handle saving generated methodology
  const handleSaveMethodology = (methodologyData) => {
    handleSaveDocument('methodology', methodologyData);
  };
  
  // Handle saving generated budget
  const handleSaveBudget = (budgetData) => {
    handleSaveDocument('budget', budgetData);
  };
  
  // Handle saving generated timeline
  const handleSaveTimeline = (timelineData) => {
    handleSaveDocument('timeline', timelineData);
  };
  
  // Open a file
  const openFile = (file) => {
    setActiveFile(file);
    setIsFileViewerOpen(true);
  };
  
  // Save file changes
  const handleSaveFile = (fileId, newContent) => {
    if (!projectObj) return;
    
    try {
      const updatedFile = projectObj.updateFile(fileId, newContent);
      
      // Save changes to storage
      projectManager.saveProjects();
      
      // Update active file with the latest content
      setActiveFile(updatedFile);
      
      return updatedFile;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  };
  
  // Create a new file in a folder
  const createNewFile = (folderName) => {
    if (!projectObj) return;
    
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    
    try {
      const newFile = projectObj.createFile(folderName, fileName);
      
      // Save changes to storage
      projectManager.saveProjects();
      
      // Open the new file
      openFile(newFile);
      
      // Expand the folder
      setExpandedFolders(prev => ({
        ...prev,
        [folderName]: true
      }));
      
      return newFile;
    } catch (error) {
      alert(`Error creating file: ${error.message}`);
      console.error('Error creating file:', error);
    }
  };
  
  if (isFileViewerOpen && activeFile) {
    return (
      <FileViewer 
        project={projectObj} 
        file={activeFile} 
        onSave={handleSaveFile}
        onClose={() => setIsFileViewerOpen(false)}
      />
    );
  }
  
  if (isAbstractGeneratorOpen) {
    return (
      <AbstractGenerator
        projectInfo={{
          title: project.title,
          topic: project.topic || projectObj?.metadata?.researchArea,
          institution: 'Your Institution', // In a real app, this would come from user profile
          researcherName: 'Researcher', // In a real app, this would come from user profile
          field: projectObj?.metadata?.field || ''
        }}
        contextData={contextData}
        onSave={handleSaveAbstract}
        onClose={() => {
          setIsAbstractGeneratorOpen(false);
          setActiveGenerator(null);
        }}
        initialContent={null} // In a real app, you might load an existing abstract
      />
    );
  }
  
  if (isIntroductionGeneratorOpen) {
    return (
      <IntroductionGenerator
        projectInfo={{
          title: project.title,
          topic: project.topic || projectObj?.metadata?.researchArea,
          institution: 'Your Institution', // In a real app, this would come from user profile
          researcherName: 'Researcher', // In a real app, this would come from user profile
          field: projectObj?.metadata?.field || ''
        }}
        contextData={contextData}
        onSave={handleSaveIntroduction}
        onClose={() => {
          setIsIntroductionGeneratorOpen(false);
          setActiveGenerator(null);
        }}
        initialContent={null} // In a real app, you might load an existing introduction
      />
    );
  }
  
  if (isMethodologyGeneratorOpen) {
    return (
      <MethodologyGenerator
        projectInfo={{
          title: project.title,
          topic: project.topic || projectObj?.metadata?.researchArea,
          institution: 'Your Institution', // In a real app, this would come from user profile
          researcherName: 'Researcher', // In a real app, this would come from user profile
          field: projectObj?.metadata?.field || '',
          duration: '3 years' // Default duration, in a real app this would be configurable
        }}
        contextData={contextData}
        onSave={handleSaveMethodology}
        onClose={() => {
          setIsMethodologyGeneratorOpen(false);
          setActiveGenerator(null);
        }}
        initialContent={null} // In a real app, you might load an existing methodology
      />
    );
  }
  
  if (isBudgetGeneratorOpen) {
    return (
      <BudgetGenerator
        projectInfo={{
          title: project.title,
          topic: project.topic || projectObj?.metadata?.researchArea,
          institution: 'Your Institution',
          researcherName: 'Researcher',
          field: projectObj?.metadata?.field || '',
          duration: '3 years',
          fundingAmount: '$500,000' // Default value, would be configurable in a real app
        }}
        contextData={contextData}
        onSave={handleSaveBudget}
        onClose={() => {
          setIsBudgetGeneratorOpen(false);
          setActiveGenerator(null);
        }}
        initialContent={null}
      />
    );
  }
  
  if (isTimelineGeneratorOpen) {
    return (
      <TimelineGenerator
        projectInfo={{
          title: project.title,
          topic: project.topic || projectObj?.metadata?.researchArea,
          institution: 'Your Institution',
          researcherName: 'Researcher',
          field: projectObj?.metadata?.field || '',
          duration: '3 years'
        }}
        contextData={contextData}
        onSave={handleSaveTimeline}
        onClose={() => {
          setIsTimelineGeneratorOpen(false);
          setActiveGenerator(null);
        }}
        initialContent={null}
      />
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 bg-muted/40">
        <CardTitle className="text-lg">{project.title} - Files</CardTitle>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ←
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="border-b p-3 bg-muted/20 flex flex-wrap items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveFolder(null)}
              className="mr-2"
            >
              All Folders
            </Button>
            {activeFolder && (
              <Button 
                size="sm"
                onClick={() => createNewFile(activeFolder)}
              >
                New File
              </Button>
            )}
          </div>
          
          <div className="flex mt-2 sm:mt-0 gap-2 flex-wrap">
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <span className="mr-1">✨</span> Generate Document
              </Button>
              
              <div className="absolute right-0 mt-1 w-48 bg-background rounded-md shadow-lg border hidden group-hover:block z-10">
                <div className="py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/40"
                    onClick={openAbstractGenerator}
                  >
                    Abstract
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/40"
                    onClick={openIntroductionGenerator}
                  >
                    Introduction
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/40"
                    onClick={openMethodologyGenerator}
                  >
                    Methodology
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/40"
                    onClick={openBudgetGenerator}
                  >
                    Budget
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/40"
                    onClick={openTimelineGenerator}
                  >
                    Timeline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {/* Folder listing */}
          {!activeFolder && folders.map(folder => (
            <div key={folder.id}>
              <div 
                className="p-3 flex items-center justify-between hover:bg-muted/40 cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {expandedFolders[folder.id] ? '📂' : '📁'}
                  </span>
                  <div>
                    <div className="font-medium">{folder.name.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground">{folder.description}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-muted-foreground mr-3">
                    {folder.fileCount} files
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFolder(folder.name);
                    }}
                  >
                    →
                  </Button>
                </div>
              </div>
              
              {/* Show files when folder is expanded */}
              {expandedFolders[folder.id] && (
                <div className="pl-10 pr-3 pb-2 space-y-1 bg-muted/10">
                  {projectObj.getFilesInFolder(folder.name).map(file => (
                    <div 
                      key={file.id} 
                      className="p-2 flex items-center rounded-md hover:bg-muted/40 cursor-pointer"
                      onClick={() => openFile(file)}
                    >
                      <span className="text-xl mr-2">📄</span>
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => createNewFile(folder.name)}
                  >
                    + Add File
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {/* Files in active folder */}
          {activeFolder && (
            <div className="p-3">
              <div className="font-medium text-lg mb-3">
                {activeFolder.replace(/_/g, ' ')}
              </div>
              
              <div className="space-y-1">
                {projectObj.getFilesInFolder(activeFolder).map(file => (
                  <div 
                    key={file.id} 
                    className="p-2 flex items-center rounded-md hover:bg-muted/40 cursor-pointer"
                    onClick={() => openFile(file)}
                  >
                    <span className="text-xl mr-2">📄</span>
                    <div>
                      <div>{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {new Date(file.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {projectObj.getFilesInFolder(activeFolder).length === 0 && (
                  <div className="text-center p-6 text-muted-foreground">
                    <p>No files in this folder</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => createNewFile(activeFolder)}
                    >
                      Create File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FileManager;