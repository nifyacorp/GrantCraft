import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import VersionHistory from './VersionHistory';
import ActiveUsersIndicator from './ActiveUsersIndicator';

// FileViewer component to display and edit project files
function FileViewer({ project, file, onSave, onClose }) {
  const [content, setContent] = useState(file?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  const handleSave = async () => {
    if (!file || !project) return;
    
    setIsSaving(true);
    
    try {
      // In a real app, this would make an API call
      await onSave(file.id, content);
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle restoring a previous version
  const handleRestoreVersion = async (fileId, versionId) => {
    if (!project) return;
    
    try {
      // Restore the version
      const restoredFile = await project.restoreVersion(fileId, versionId);
      
      // Update the content in the editor
      if (restoredFile) {
        setContent(restoredFile.content);
      }
      
      // Close the version history view
      setShowVersionHistory(false);
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };
  
  if (!file) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No file selected</p>
            <p className="text-sm text-muted-foreground mt-2">Select a file from the sidebar to view or edit</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show version history if activated
  if (showVersionHistory) {
    return (
      <VersionHistory
        project={project}
        file={file}
        onClose={() => setShowVersionHistory(false)}
        onRestoreVersion={handleRestoreVersion}
      />
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 bg-muted/40">
        <div className="flex items-center">
          <span className="text-2xl mr-2">📄</span>
          <div>
            <CardTitle className="text-base">{file.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{file.path}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActiveUsersIndicator projectId={project?.id} fileId={file?.id} />
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <textarea
          className="w-full h-full min-h-[400px] p-4 font-mono text-sm border-0 focus:ring-0 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter content here..."
        />
      </CardContent>
      
      <CardFooter className="border-t p-3 bg-muted/20 flex justify-between">
        <div className="flex items-center">
          <div className="text-xs text-muted-foreground mr-4">
            Last updated: {new Date(file.updatedAt).toLocaleString()}
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setShowVersionHistory(true)}
          >
            View History
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default FileViewer;