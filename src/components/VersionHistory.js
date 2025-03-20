import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';

function VersionHistory({ 
  project, 
  file, 
  onClose,
  onRestoreVersion
}) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load versions when component mounts
  useEffect(() => {
    if (project && file) {
      loadVersions();
    }
  }, [project, file]);
  
  // Load versions for the file
  const loadVersions = () => {
    setIsLoading(true);
    
    try {
      // Get file versions from project
      const fileVersions = project.getFileVersions(file.id);
      
      // Add the current version
      const allVersions = [
        ...fileVersions,
        {
          versionId: 'current',
          timestamp: file.updatedAt,
          content: file.content,
          metadata: {
            versionNumber: fileVersions.length + 1,
            fileName: file.name,
            filePath: file.path,
            current: true
          }
        }
      ];
      
      setVersions(allVersions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ));
      
      // Select the current version by default
      setSelectedVersion(allVersions.find(v => v.versionId === 'current'));
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle version restore
  const handleRestore = () => {
    if (!selectedVersion || selectedVersion.metadata.current) return;
    
    if (onRestoreVersion) {
      onRestoreVersion(file.id, selectedVersion.versionId);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
          </div>
          <p className="mt-6 text-muted-foreground">Loading version history...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle>Version History: {file.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          View and restore previous versions of this document.
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border-r pr-4">
            <h3 className="font-medium mb-2">Available Versions</h3>
            
            {versions.length === 0 ? (
              <p className="text-center p-6 text-muted-foreground">
                No version history available
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {versions.map(version => (
                  <div 
                    key={version.versionId}
                    className={`p-2 border rounded-md ${
                      selectedVersion?.versionId === version.versionId ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/20'
                    } cursor-pointer`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {version.metadata.current ? 'Current Version' : `Version ${version.metadata.versionNumber}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(version.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <div>
              <h3 className="font-medium mb-2">
                {selectedVersion?.metadata?.current ? 'Current Version' : `Version ${selectedVersion?.metadata?.versionNumber || ''}`} 
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {formatTimestamp(selectedVersion?.timestamp)}
                </span>
              </h3>
              
              <div className="border rounded-md p-3 min-h-[400px] font-mono text-sm whitespace-pre-line overflow-auto">
                {selectedVersion?.content || 'No content available'}
              </div>
              
              {selectedVersion && !selectedVersion.metadata.current && (
                <div className="mt-4 text-right">
                  <Button 
                    onClick={handleRestore}
                    variant="outline"
                    className="text-sm"
                  >
                    Restore This Version
                  </Button>
                </div>
              )}
            </div>
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

export default VersionHistory;