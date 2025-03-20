import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ChatInterface from '../components/ChatInterface';
import FileManager from '../components/FileManager';
import KnowledgeHub from '../components/KnowledgeHub';
import CollaborationTabs from '../components/CollaborationTabs';
import { ProjectManager } from '../lib/projectManager';

function GrantsPage({ user }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabFromQuery === 'knowledge' ? 'knowledge' : (tabFromQuery === 'collaborate' ? 'collaborate' : 'dashboard'));
  const [showChat, setShowChat] = useState(false);
  const [showKnowledgeHub, setShowKnowledgeHub] = useState(tabFromQuery === 'knowledge');
  const [projectManager] = useState(() => new ProjectManager());
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  
  // Load projects on component mount
  useEffect(() => {
    const loadedProjects = projectManager.getAllProjects();
    
    // If no projects exist yet, add a sample project
    if (loadedProjects.length === 0) {
      const sampleProject = projectManager.createProject(
        'Carbon Capture Technology Research',
        'Climate Change Mitigation'
      );
      setProjects([sampleProject.getSummary()]);
    } else {
      setProjects(loadedProjects);
    }
  }, [projectManager]);

  // Handle project creation from chat interface
  const handleCreateProject = (projectTitle, topic) => {
    const newProject = projectManager.createProject(projectTitle, topic);
    
    // Update projects list
    setProjects(projectManager.getAllProjects());
    
    // Set as active project
    setActiveProject(newProject.getSummary());
    
    return newProject.getSummary();
  };
  
  // Open an existing project
  const openProject = (project) => {
    setActiveProject(project);
    setShowChat(true);
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Grant Projects</h1>
          {user && (
            <p className="text-muted-foreground mt-1">
              {user.firstName ? `Welcome, ${user.firstName}!` : `Welcome to GrantCraft!`}
            </p>
          )}
        </div>
        <Button
          onClick={() => {
            setActiveProject(null);
            setShowChat(true);
          }}
        >
          New Project
        </Button>
      </div>

      <div className="border-b">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`py-4 px-6 ${
              activeTab === 'files'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('files')}
          >
            Files
          </button>
          <button
            className={`py-4 px-6 ${
              activeTab === 'collaborate'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              setActiveTab('collaborate');
            }}
          >
            Collaborate
          </button>
          <button
            className={`py-4 px-6 ${
              activeTab === 'knowledge'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              setActiveTab('knowledge');
              setShowKnowledgeHub(true);
            }}
          >
            Knowledge Hub
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id}>
              <CardHeader className="bg-muted/40">
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 mb-4">
                  <p>
                    <span className="font-medium">Topic:</span> {project.topic}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {project.status}
                  </p>
                  <p>
                    <span className="font-medium">Last Updated:</span> {
                      new Date(project.updatedAt).toLocaleDateString() || 
                      new Date(project.createdAt).toLocaleDateString()
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.fileCount || 0} file{project.fileCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => openProject(project)}
                  >
                    Open
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setActiveProject(project);
                      setActiveTab('files');
                    }}
                  >
                    Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border border-dashed">
            <CardContent className="p-8 flex flex-col justify-center items-center text-center">
              <div className="text-5xl text-muted-foreground mb-4">+</div>
              <p className="text-lg font-medium mb-4">Start New Project</p>
              <Button 
                onClick={() => {
                  setActiveProject(null);
                  setShowChat(true);
                }}
              >
                Create Project
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'files' && activeProject && (
        <FileManager 
          project={activeProject}
          projectManager={projectManager}
          onBack={() => setActiveTab('dashboard')}
          user={user}
        />
      )}
      
      {activeTab === 'files' && !activeProject && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-4">Select a Project</h3>
          <p className="text-muted-foreground mb-6">
            Please select a project to view associated files
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {projects.map(project => (
              <Button 
                key={project.id} 
                variant="outline"
                onClick={() => setActiveProject(project)}
              >
                {project.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {showChat && (
        <ChatInterface
          initialMessages={[]}
          onClose={() => setShowChat(false)}
          onCreateProject={handleCreateProject}
          projectTitle={activeProject?.title}
          currentTopic={activeProject?.topic}
          user={user}
        />
      )}
      
      {showKnowledgeHub && (
        <KnowledgeHub
          projectInfo={activeProject}
          onClose={() => setShowKnowledgeHub(false)}
        />
      )}
      
      {activeTab === 'collaborate' && (
        <div className="space-y-6">
          {!activeProject ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-4">Select a Project to Collaborate</h3>
              <p className="text-muted-foreground mb-6">
                Please select a project to view collaboration features
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {projects.map(project => (
                  <Button 
                    key={project.id} 
                    variant="outline"
                    onClick={() => setActiveProject(project)}
                  >
                    {project.title}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Collaboration: {activeProject.title}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveProject(null)}
                >
                  Change Project
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CollaborationTabs 
                    projectId={activeProject.id} 
                    fileId={activeFile?.id}
                  />
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeProject && (
                        <div className="space-y-4">
                          <div className="text-sm">
                            Select a file to view and manage comments:
                          </div>
                          
                          {/* File selector */}
                          <div className="space-y-2">
                            {projectManager.getProject(activeProject.id)?.getFolderStructure().map(folder => (
                              <div key={folder.id} className="space-y-1">
                                <div className="font-medium text-sm">{folder.name}</div>
                                <div className="pl-4 space-y-1">
                                  {projectManager.getProject(activeProject.id)?.getFilesInFolder(folder.name).map(file => (
                                    <button
                                      key={file.id}
                                      className={`w-full text-left px-2 py-1 text-sm rounded ${
                                        activeFile?.id === file.id
                                          ? 'bg-primary text-primary-foreground'
                                          : 'hover:bg-muted'
                                      }`}
                                      onClick={() => setActiveFile(file)}
                                    >
                                      {file.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GrantsPage;