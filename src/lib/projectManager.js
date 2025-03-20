/**
 * Project Manager Module
 * 
 * This module handles the creation, management, and organization of grant projects,
 * including file structure and metadata management.
 */

import { VersionManager } from './versionHistory';
import collaborationManager from './collaborationManager';
import authService from './auth';

// Default project structure templates
const PROJECT_TEMPLATES = {
  // Standard research grant template
  STANDARD: {
    id: 'standard',
    name: 'Standard Research Grant',
    description: 'A complete structure for standard research grant proposals',
    folders: [
      {
        name: 'abstract',
        description: 'Project abstract and executive summary',
        defaultFiles: ['abstract.md']
      },
      {
        name: 'introduction',
        description: 'Project introduction and background',
        defaultFiles: ['introduction.md', 'literature_review.md']
      },
      {
        name: 'methodology',
        description: 'Research methodology and approach',
        defaultFiles: ['methodology.md', 'data_collection.md', 'analysis_plan.md']
      },
      {
        name: 'timeline',
        description: 'Project timeline and milestones',
        defaultFiles: ['timeline.md', 'milestones.md']
      },
      {
        name: 'budget',
        description: 'Budget and cost justification',
        defaultFiles: ['budget.md', 'budget_justification.md', 'budget.xlsx']
      },
      {
        name: 'impact',
        description: 'Project impact and significance',
        defaultFiles: ['impact.md', 'broader_impacts.md']
      },
      {
        name: 'team',
        description: 'Research team information',
        defaultFiles: ['team_description.md', 'cv_principal_investigator.pdf']
      },
      {
        name: 'supplementary',
        description: 'Supplementary materials and references',
        defaultFiles: ['references.md', 'appendices.md']
      }
    ]
  },
  
  // NIH grant template (National Institutes of Health)
  NIH: {
    id: 'nih',
    name: 'NIH Research Grant',
    description: 'Structure aligned with NIH grant requirements',
    folders: [
      {
        name: 'specific_aims',
        description: 'Specific aims and objectives',
        defaultFiles: ['specific_aims.md']
      },
      {
        name: 'significance',
        description: 'Research significance and innovation',
        defaultFiles: ['significance.md', 'innovation.md']
      },
      {
        name: 'approach',
        description: 'Research approach and methodology',
        defaultFiles: ['approach.md', 'preliminary_studies.md', 'methods.md']
      },
      {
        name: 'human_subjects',
        description: 'Human subjects research information',
        defaultFiles: ['human_subjects.md', 'inclusion_enrollment.md']
      },
      {
        name: 'vertebrate_animals',
        description: 'Vertebrate animals research information',
        defaultFiles: ['vertebrate_animals.md']
      },
      {
        name: 'budget',
        description: 'Budget and justification',
        defaultFiles: ['budget.md', 'budget_justification.md']
      },
      {
        name: 'biosketches',
        description: 'Biographical sketches',
        defaultFiles: ['biosketch_pi.md', 'biosketch_collaborators.md']
      },
      {
        name: 'facilities',
        description: 'Facilities and resources',
        defaultFiles: ['facilities.md', 'equipment.md']
      }
    ]
  },
  
  // NSF grant template (National Science Foundation)
  NSF: {
    id: 'nsf',
    name: 'NSF Research Grant',
    description: 'Structure aligned with NSF grant requirements',
    folders: [
      {
        name: 'project_summary',
        description: 'Project summary and overview',
        defaultFiles: ['project_summary.md']
      },
      {
        name: 'introduction',
        description: 'Project introduction and context',
        defaultFiles: ['introduction.md']
      },
      {
        name: 'intellectual_merit',
        description: 'Intellectual merit of the project',
        defaultFiles: ['intellectual_merit.md', 'prior_work.md']
      },
      {
        name: 'broader_impacts',
        description: 'Broader impacts of the project',
        defaultFiles: ['broader_impacts.md', 'outreach.md']
      },
      {
        name: 'work_plan',
        description: 'Project work plan and methodology',
        defaultFiles: ['work_plan.md', 'methodology.md', 'timeline.md']
      },
      {
        name: 'budget',
        description: 'Budget information',
        defaultFiles: ['budget.md', 'budget_justification.md']
      },
      {
        name: 'facilities',
        description: 'Facilities, equipment, and resources',
        defaultFiles: ['facilities.md', 'resources.md']
      },
      {
        name: 'data_management',
        description: 'Data management plan',
        defaultFiles: ['data_management_plan.md']
      }
    ]
  }
};

// Project class for managing an individual project
class Project {
  constructor(title, topic, templateId = 'standard', projectManager = null) {
    this.id = Date.now().toString();
    this.title = title;
    this.topic = topic || 'Research Project';
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
    this.status = 'In Progress';
    this.templateId = templateId;
    this.structure = this.generateStructure(templateId);
    this.files = this.generateInitialFiles();
    this.metadata = {
      researchArea: topic,
      keywords: this.extractKeywords(topic),
      description: '',
      stage: 'initial'
    };
    this.projectManager = projectManager; // Reference to the parent ProjectManager
  }
  
  // Generate project structure based on template
  generateStructure(templateId) {
    const template = PROJECT_TEMPLATES[templateId.toUpperCase()] || PROJECT_TEMPLATES.STANDARD;
    return template.folders.map(folder => ({
      id: `${this.id}_${folder.name}`,
      name: folder.name,
      description: folder.description,
      files: []
    }));
  }
  
  // Generate initial empty files based on template
  generateInitialFiles() {
    const template = PROJECT_TEMPLATES[this.templateId.toUpperCase()] || PROJECT_TEMPLATES.STANDARD;
    const files = [];
    
    template.folders.forEach(folder => {
      folder.defaultFiles.forEach(fileName => {
        files.push({
          id: `${this.id}_${folder.name}_${fileName}`,
          name: fileName,
          path: `${folder.name}/${fileName}`,
          content: '',
          createdAt: this.createdAt,
          updatedAt: this.createdAt
        });
      });
    });
    
    return files;
  }
  
  // Extract keywords from research topic
  extractKeywords(topic) {
    if (!topic) return [];
    
    // Simple keyword extraction - in a real app, use NLP
    const words = topic.toLowerCase().split(/\s+/);
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 5); // Take up to 5 keywords
  }
  
  // Get project summary
  getSummary() {
    return {
      id: this.id,
      title: this.title,
      topic: this.topic,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fileCount: this.files.length
    };
  }
  
  // Get project folder structure
  getFolderStructure() {
    return this.structure.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      fileCount: this.files.filter(file => file.path.startsWith(folder.name + '/')).length
    }));
  }
  
  // Get files in a specific folder
  getFilesInFolder(folderName) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    
    // Check if current user has read permission
    if (!collaborationManager.currentUserHasPermission(this.id, 'read')) {
      return [];
    }
    
    return this.files.filter(file => file.path.startsWith(folderName + '/'));
  }
  
  // Get file by ID
  getFile(fileId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return null;
    }
    
    // Check if current user has read permission
    if (!collaborationManager.currentUserHasPermission(this.id, 'read')) {
      return null;
    }
    
    const file = this.files.find(file => file.id === fileId);
    
    if (file) {
      // Mark user as active on this file
      collaborationManager.markUserActive(this.id, fileId);
      
      // Get active users on this file
      const activeUsers = collaborationManager.getActiveUsers(this.id, fileId);
      
      // Attach active users to the file object
      return {
        ...file,
        activeUsers
      };
    }
    
    return file;
  }
  
  // Create a new file
  createFile(folderName, fileName, content = '') {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to create a file');
    }
    
    // Check if current user has 'write' permission
    if (!collaborationManager.currentUserHasPermission(this.id, 'write')) {
      throw new Error('You do not have permission to create files in this project');
    }
    
    // Check if folder exists
    const folder = this.structure.find(f => f.name === folderName);
    if (!folder) {
      throw new Error(`Folder "${folderName}" does not exist`);
    }
    
    // Check if file already exists
    const existingFile = this.files.find(f => f.path === `${folderName}/${fileName}`);
    if (existingFile) {
      throw new Error(`File "${fileName}" already exists in folder "${folderName}"`);
    }
    
    // Create new file
    const newFile = {
      id: `${this.id}_${folderName}_${fileName}_${Date.now()}`,
      name: fileName,
      path: `${folderName}/${fileName}`,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.id
    };
    
    this.files.push(newFile);
    this.updatedAt = newFile.updatedAt;
    
    // Log activity
    if (this.projectManager) {
      collaborationManager.logActivity({
        type: 'file_created',
        projectId: this.id,
        fileId: newFile.id,
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        details: {
          action: 'created',
          resourceType: 'file',
          fileName: newFile.name,
          filePath: newFile.path
        }
      });
    }
    
    return newFile;
  }
  
  // Update file content
  updateFile(fileId, newContent) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to update a file');
    }
    
    // Check if current user has 'write' permission
    if (!collaborationManager.currentUserHasPermission(this.id, 'write')) {
      throw new Error('You do not have permission to edit files in this project');
    }
    
    const file = this.getFile(fileId);
    if (!file) {
      throw new Error(`File with ID "${fileId}" not found`);
    }
    
    // Save the current version before updating
    if (this.projectManager) {
      this.projectManager.versionManager.createVersion(fileId, file.content, {
        fileName: file.name,
        filePath: file.path,
        projectId: this.id,
        projectTitle: this.title,
        userId: currentUser.id
      });
    }
    
    // Mark user as active on this file
    collaborationManager.markUserActive(this.id, fileId);
    
    file.content = newContent;
    file.updatedAt = new Date().toISOString();
    file.updatedBy = currentUser.id;
    this.updatedAt = file.updatedAt;
    
    // Log activity
    if (this.projectManager) {
      collaborationManager.logActivity({
        type: 'file_updated',
        projectId: this.id,
        fileId: file.id,
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        details: {
          action: 'updated',
          resourceType: 'file',
          fileName: file.name,
          filePath: file.path
        }
      });
    }
    
    return file;
  }
  
  // Get version history for a file
  getFileVersions(fileId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !this.projectManager) return [];
    
    // Check if current user has read permission
    if (!collaborationManager.currentUserHasPermission(this.id, 'read')) {
      return [];
    }
    
    return this.projectManager.versionManager.getFileVersions(fileId);
  }
  
  // Restore a previous version
  restoreVersion(fileId, versionId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !this.projectManager) return null;
    
    // Check if current user has write permission
    if (!collaborationManager.currentUserHasPermission(this.id, 'write')) {
      throw new Error('You do not have permission to restore file versions in this project');
    }
    
    const version = this.projectManager.versionManager.getVersion(versionId);
    if (!version) {
      throw new Error(`Version with ID "${versionId}" not found`);
    }
    
    // Log activity
    collaborationManager.logActivity({
      type: 'version_restored',
      projectId: this.id,
      fileId: fileId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: 'restored',
        resourceType: 'version',
        versionId: versionId
      }
    });
    
    // Update the file with the content from the version
    return this.updateFile(fileId, version.content);
  }
  
  // Delete file
  deleteFile(fileId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to delete a file');
    }
    
    // Check if current user has delete permission
    if (!collaborationManager.currentUserHasPermission(this.id, 'delete')) {
      throw new Error('You do not have permission to delete files in this project');
    }
    
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      throw new Error(`File with ID "${fileId}" not found`);
    }
    
    const deletedFile = this.files.splice(fileIndex, 1)[0];
    this.updatedAt = new Date().toISOString();
    
    // Log activity
    if (this.projectManager) {
      collaborationManager.logActivity({
        type: 'file_deleted',
        projectId: this.id,
        fileId: deletedFile.id,
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        details: {
          action: 'deleted',
          resourceType: 'file',
          fileName: deletedFile.name,
          filePath: deletedFile.path
        }
      });
    }
    
    return deletedFile;
  }
  
  // Update project metadata
  updateMetadata(newMetadata) {
    this.metadata = {
      ...this.metadata,
      ...newMetadata
    };
    
    this.updatedAt = new Date().toISOString();
    return this.metadata;
  }
  
  // Update project status
  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    return this.status;
  }
}

// ProjectManager class for managing all projects
class ProjectManager {
  constructor() {
    this.projects = [];
    this.versionManager = new VersionManager();
    this.loadProjects();
  }
  
  // Load projects from localStorage in a browser environment
  loadProjects() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedProjects = localStorage.getItem('grantcraft_projects');
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          this.projects = parsedProjects.map(projectData => {
            const project = new Project(projectData.title, projectData.topic, projectData.templateId, this);
            Object.assign(project, projectData);
            project.projectManager = this; // Ensure the reference is maintained
            return project;
          });
        } catch (error) {
          console.error('Error loading projects:', error);
          this.projects = [];
        }
      }
    }
  }
  
  // Save projects to localStorage in a browser environment
  saveProjects() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('grantcraft_projects', JSON.stringify(this.projects));
    }
  }
  
  // Create a new project
  createProject(title, topic, templateId = 'standard') {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to create a project');
    }
    
    const project = new Project(title, topic, templateId, this);
    this.projects.push(project);
    this.saveProjects();
    
    // Initialize collaboration permissions with current user as owner
    collaborationManager.initializeProject(project.id);
    
    return project;
  }
  
  // Get all projects
  getAllProjects() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    
    // Only return projects where current user has at least 'read' permission
    return this.projects
      .filter(project => collaborationManager.currentUserHasPermission(project.id, 'read'))
      .map(project => {
        const summary = project.getSummary();
        
        // Add user's permission level to the summary
        const collaborators = collaborationManager.getProjectCollaborators(project.id);
        const userCollaboration = collaborators.find(collab => collab.userId === currentUser.id);
        
        return {
          ...summary,
          userPermission: userCollaboration ? userCollaboration.permission : null
        };
      });
  }
  
  // Get project by ID
  getProject(projectId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return null;
    }
    
    // Check if current user has at least 'read' permission
    if (!collaborationManager.currentUserHasPermission(projectId, 'read')) {
      return null;
    }
    
    return this.projects.find(project => project.id === projectId);
  }
  
  // Update project
  updateProject(projectId, updateData) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to update a project');
    }
    
    // Check if current user has 'write' permission
    if (!collaborationManager.currentUserHasPermission(projectId, 'write')) {
      throw new Error('You do not have permission to update this project');
    }
    
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project with ID "${projectId}" not found`);
    }
    
    Object.assign(project, updateData);
    project.updatedAt = new Date().toISOString();
    this.saveProjects();
    
    // Log activity
    collaborationManager.logActivity({
      type: 'project_updated',
      projectId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: 'updated',
        resourceType: 'project'
      }
    });
    
    return project;
  }
  
  // Delete project
  deleteProject(projectId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to delete a project');
    }
    
    // Project owners can delete their own projects
    // Admins can delete any project
    const isOwner = collaborationManager.hasProjectPermission(projectId, currentUser.id, 'delete');
    const isAdmin = authService.hasPermission('delete_project');
    
    if (!isOwner && !isAdmin) {
      throw new Error('You do not have permission to delete this project');
    }
    
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error(`Project with ID "${projectId}" not found`);
    }
    
    const deletedProject = this.projects.splice(projectIndex, 1)[0];
    this.saveProjects();
    
    return deletedProject;
  }
  
  // Get available templates
  getTemplates() {
    return Object.values(PROJECT_TEMPLATES).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description
    }));
  }
}

// Export project manager and related utilities
export { Project, ProjectManager, PROJECT_TEMPLATES };