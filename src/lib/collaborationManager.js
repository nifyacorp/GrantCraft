/**
 * Collaboration Manager Module
 * 
 * This module manages collaboration features including permissions, sharing,
 * activity tracking, and real-time collaboration indicators.
 */

import authService from './auth';

// Permission levels
const PERMISSION_LEVELS = {
  OWNER: 'owner',
  EDITOR: 'editor', 
  VIEWER: 'viewer',
};

// Permission descriptions
const PERMISSION_DESCRIPTIONS = {
  [PERMISSION_LEVELS.OWNER]: 'Can edit, share, and manage permissions',
  [PERMISSION_LEVELS.EDITOR]: 'Can edit and comment on documents',
  [PERMISSION_LEVELS.VIEWER]: 'Can view and comment on documents',
};

// Permission capabilities
const PERMISSION_CAPABILITIES = {
  [PERMISSION_LEVELS.OWNER]: [
    'read', 'write', 'comment', 'share', 
    'manage_permissions', 'delete', 'export'
  ],
  [PERMISSION_LEVELS.EDITOR]: [
    'read', 'write', 'comment', 'export'
  ],
  [PERMISSION_LEVELS.VIEWER]: [
    'read', 'comment', 'export'
  ]
};

// Storage keys
const STORAGE_KEYS = {
  COLLABORATIONS: 'grantcraft_collaborations',
  COMMENTS: 'grantcraft_comments',
  ACTIVITIES: 'grantcraft_activities',
  ACTIVE_USERS: 'grantcraft_active_users',
};

class CollaborationManager {
  constructor() {
    this.collaborations = {}; // projectId -> {userId -> permission}
    this.comments = {}; // projectId -> fileId -> comments
    this.activities = []; // Array of activity logs
    this.activeUsers = {}; // projectId -> fileId -> [userIds]
    
    // Initialize data from storage
    this.loadCollaborations();
    this.loadComments();
    this.loadActivities();
    
    // Set up activity cleanup interval (keep last 100 activities)
    this.cleanupInterval = setInterval(() => {
      if (this.activities.length > 100) {
        this.activities = this.activities.slice(-100);
        this.saveActivities();
      }
    }, 60000); // Run every minute
  }
  
  // Load collaborations from localStorage
  loadCollaborations() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCollaborations = localStorage.getItem(STORAGE_KEYS.COLLABORATIONS);
      if (savedCollaborations) {
        try {
          this.collaborations = JSON.parse(savedCollaborations);
        } catch (error) {
          console.error('Error loading collaborations:', error);
          this.collaborations = {};
        }
      }
    }
  }
  
  // Save collaborations to localStorage
  saveCollaborations() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.COLLABORATIONS, JSON.stringify(this.collaborations));
    }
  }
  
  // Load comments from localStorage
  loadComments() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (savedComments) {
        try {
          this.comments = JSON.parse(savedComments);
        } catch (error) {
          console.error('Error loading comments:', error);
          this.comments = {};
        }
      }
    }
  }
  
  // Save comments to localStorage
  saveComments() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
    }
  }
  
  // Load activities from localStorage
  loadActivities() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (savedActivities) {
        try {
          this.activities = JSON.parse(savedActivities);
        } catch (error) {
          console.error('Error loading activities:', error);
          this.activities = [];
        }
      }
    }
  }
  
  // Save activities to localStorage
  saveActivities() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(this.activities));
    }
  }
  
  // Load active users from localStorage
  loadActiveUsers() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedActiveUsers = localStorage.getItem(STORAGE_KEYS.ACTIVE_USERS);
      if (savedActiveUsers) {
        try {
          this.activeUsers = JSON.parse(savedActiveUsers);
        } catch (error) {
          console.error('Error loading active users:', error);
          this.activeUsers = {};
        }
      }
    }
  }
  
  // Save active users to localStorage
  saveActiveUsers() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USERS, JSON.stringify(this.activeUsers));
    }
  }
  
  // Initialize a project with the current user as owner
  initializeProject(projectId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    if (!this.collaborations[projectId]) {
      this.collaborations[projectId] = {};
    }
    
    this.collaborations[projectId][currentUser.id] = PERMISSION_LEVELS.OWNER;
    this.saveCollaborations();
    
    // Log activity
    this.logActivity({
      type: 'project_created',
      projectId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: 'created',
        resourceType: 'project'
      }
    });
    
    return true;
  }
  
  // Check if a user has permission for a project
  hasProjectPermission(projectId, userId, permission) {
    if (!userId || !projectId) return false;
    
    const projectCollaborations = this.collaborations[projectId];
    if (!projectCollaborations) return false;
    
    const userPermissionLevel = projectCollaborations[userId];
    if (!userPermissionLevel) return false;
    
    const userCapabilities = PERMISSION_CAPABILITIES[userPermissionLevel] || [];
    return userCapabilities.includes(permission);
  }
  
  // Check if current user has permission
  currentUserHasPermission(projectId, permission) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    return this.hasProjectPermission(projectId, currentUser.id, permission);
  }
  
  // Add a collaborator to a project
  addCollaborator(projectId, userId, permissionLevel) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if current user has permission to manage collaborators
    if (!this.hasProjectPermission(projectId, currentUser.id, 'manage_permissions')) {
      return false;
    }
    
    // Ensure permission level is valid
    if (!Object.values(PERMISSION_LEVELS).includes(permissionLevel)) {
      permissionLevel = PERMISSION_LEVELS.VIEWER; // Default to viewer
    }
    
    // Initialize project collaborations if not exist
    if (!this.collaborations[projectId]) {
      this.collaborations[projectId] = {};
    }
    
    this.collaborations[projectId][userId] = permissionLevel;
    this.saveCollaborations();
    
    // Log activity
    this.logActivity({
      type: 'collaborator_added',
      projectId,
      userId: currentUser.id,
      targetUserId: userId,
      timestamp: new Date().toISOString(),
      details: {
        action: 'added',
        resourceType: 'collaborator',
        permissionLevel
      }
    });
    
    return true;
  }
  
  // Update a collaborator's permission level
  updateCollaboratorPermission(projectId, userId, newPermissionLevel) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if current user has permission to manage collaborators
    if (!this.hasProjectPermission(projectId, currentUser.id, 'manage_permissions')) {
      return false;
    }
    
    // Cannot change permission of project owner
    const projectCollaborations = this.collaborations[projectId];
    if (!projectCollaborations) return false;
    
    // Find the project owner
    const ownerEntry = Object.entries(projectCollaborations).find(
      ([uid, permission]) => permission === PERMISSION_LEVELS.OWNER
    );
    
    // Don't allow changing the owner's permission
    if (ownerEntry && ownerEntry[0] === userId) {
      return false;
    }
    
    // Ensure permission level is valid
    if (!Object.values(PERMISSION_LEVELS).includes(newPermissionLevel)) {
      return false;
    }
    
    this.collaborations[projectId][userId] = newPermissionLevel;
    this.saveCollaborations();
    
    // Log activity
    this.logActivity({
      type: 'permission_updated',
      projectId,
      userId: currentUser.id,
      targetUserId: userId,
      timestamp: new Date().toISOString(),
      details: {
        action: 'updated',
        resourceType: 'permission',
        newPermissionLevel
      }
    });
    
    return true;
  }
  
  // Remove a collaborator from a project
  removeCollaborator(projectId, userId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if current user has permission to manage collaborators
    if (!this.hasProjectPermission(projectId, currentUser.id, 'manage_permissions')) {
      return false;
    }
    
    // Cannot remove the project owner
    const projectCollaborations = this.collaborations[projectId];
    if (!projectCollaborations) return false;
    
    const userPermission = projectCollaborations[userId];
    if (userPermission === PERMISSION_LEVELS.OWNER) {
      return false;
    }
    
    // Remove the collaborator
    delete this.collaborations[projectId][userId];
    this.saveCollaborations();
    
    // Log activity
    this.logActivity({
      type: 'collaborator_removed',
      projectId,
      userId: currentUser.id,
      targetUserId: userId,
      timestamp: new Date().toISOString(),
      details: {
        action: 'removed',
        resourceType: 'collaborator'
      }
    });
    
    return true;
  }
  
  // Get all collaborators for a project
  getProjectCollaborators(projectId) {
    const projectCollaborations = this.collaborations[projectId];
    if (!projectCollaborations) return [];
    
    return Object.entries(projectCollaborations).map(([userId, permission]) => ({
      userId,
      permission,
      permissionDescription: PERMISSION_DESCRIPTIONS[permission]
    }));
  }
  
  // Add a comment to a file
  addComment(projectId, fileId, content, parentCommentId = null) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if current user has permission to comment
    if (!this.hasProjectPermission(projectId, currentUser.id, 'comment')) {
      return false;
    }
    
    // Initialize if not exists
    if (!this.comments[projectId]) {
      this.comments[projectId] = {};
    }
    if (!this.comments[projectId][fileId]) {
      this.comments[projectId][fileId] = [];
    }
    
    // Create new comment
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      fileId,
      parentId: parentCommentId,
      content,
      userId: currentUser.id,
      userDisplayName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.username,
      timestamp: new Date().toISOString(),
      isResolved: false,
      reactions: {}
    };
    
    this.comments[projectId][fileId].push(newComment);
    this.saveComments();
    
    // Log activity
    this.logActivity({
      type: 'comment_added',
      projectId,
      fileId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: 'added',
        resourceType: 'comment',
        commentId: newComment.id,
        isReply: !!parentCommentId
      }
    });
    
    return newComment;
  }
  
  // Update a comment
  updateComment(projectId, fileId, commentId, newContent) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if comments exist for this file
    if (!this.comments[projectId] || !this.comments[projectId][fileId]) {
      return false;
    }
    
    // Find the comment to update
    const commentIndex = this.comments[projectId][fileId].findIndex(
      comment => comment.id === commentId
    );
    
    if (commentIndex === -1) return false;
    
    const comment = this.comments[projectId][fileId][commentIndex];
    
    // Only the comment creator can update it
    if (comment.userId !== currentUser.id) {
      return false;
    }
    
    // Update the comment
    this.comments[projectId][fileId][commentIndex] = {
      ...comment,
      content: newContent,
      updatedAt: new Date().toISOString()
    };
    
    this.saveComments();
    
    // Log activity
    this.logActivity({
      type: 'comment_updated',
      projectId,
      fileId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: 'updated',
        resourceType: 'comment',
        commentId
      }
    });
    
    return this.comments[projectId][fileId][commentIndex];
  }
  
  // Delete a comment
  deleteComment(projectId, fileId, commentId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if comments exist for this file
    if (!this.comments[projectId] || !this.comments[projectId][fileId]) {
      return false;
    }
    
    // Find the comment to delete
    const commentIndex = this.comments[projectId][fileId].findIndex(
      comment => comment.id === commentId
    );
    
    if (commentIndex === -1) return false;
    
    const comment = this.comments[projectId][fileId][commentIndex];
    
    // Only the comment creator or users with appropriate permission can delete it
    if (comment.userId !== currentUser.id && 
        !this.hasProjectPermission(projectId, currentUser.id, 'manage_permissions')) {
      return false;
    }
    
    // Remove the comment
    this.comments[projectId][fileId].splice(commentIndex, 1);
    
    // Also remove any replies to this comment
    if (this.comments[projectId][fileId].length > 0) {
      this.comments[projectId][fileId] = this.comments[projectId][fileId].filter(
        c => c.parentId !== commentId
      );
    }
    
    this.saveComments();
    
    // Log activity
    this.logActivity({
      type: 'comment_deleted',
      projectId,
      fileId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: 'deleted',
        resourceType: 'comment',
        commentId
      }
    });
    
    return true;
  }
  
  // Resolve/unresolve a comment
  toggleCommentResolution(projectId, fileId, commentId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if comments exist for this file
    if (!this.comments[projectId] || !this.comments[projectId][fileId]) {
      return false;
    }
    
    // Find the comment to update
    const commentIndex = this.comments[projectId][fileId].findIndex(
      comment => comment.id === commentId
    );
    
    if (commentIndex === -1) return false;
    
    const comment = this.comments[projectId][fileId][commentIndex];
    
    // Update the resolution status
    const newResolvedStatus = !comment.isResolved;
    this.comments[projectId][fileId][commentIndex] = {
      ...comment,
      isResolved: newResolvedStatus,
      resolvedBy: newResolvedStatus ? currentUser.id : null,
      resolvedAt: newResolvedStatus ? new Date().toISOString() : null
    };
    
    this.saveComments();
    
    // Log activity
    this.logActivity({
      type: newResolvedStatus ? 'comment_resolved' : 'comment_reopened',
      projectId,
      fileId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: newResolvedStatus ? 'resolved' : 'reopened',
        resourceType: 'comment',
        commentId
      }
    });
    
    return this.comments[projectId][fileId][commentIndex];
  }
  
  // Add a reaction to a comment
  addCommentReaction(projectId, fileId, commentId, reaction) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if comments exist for this file
    if (!this.comments[projectId] || !this.comments[projectId][fileId]) {
      return false;
    }
    
    // Find the comment to update
    const commentIndex = this.comments[projectId][fileId].findIndex(
      comment => comment.id === commentId
    );
    
    if (commentIndex === -1) return false;
    
    const comment = this.comments[projectId][fileId][commentIndex];
    
    // Initialize reactions if not exists
    if (!comment.reactions) {
      comment.reactions = {};
    }
    
    // Initialize reaction type if not exists
    if (!comment.reactions[reaction]) {
      comment.reactions[reaction] = [];
    }
    
    // Check if user already reacted with this reaction
    const userIndex = comment.reactions[reaction].indexOf(currentUser.id);
    
    if (userIndex === -1) {
      // Add the reaction
      comment.reactions[reaction].push(currentUser.id);
    } else {
      // Remove the reaction
      comment.reactions[reaction].splice(userIndex, 1);
      
      // Clean up empty reaction arrays
      if (comment.reactions[reaction].length === 0) {
        delete comment.reactions[reaction];
      }
    }
    
    this.saveComments();
    return comment;
  }
  
  // Get all comments for a file
  getFileComments(projectId, fileId) {
    if (!this.comments[projectId] || !this.comments[projectId][fileId]) {
      return [];
    }
    
    return this.comments[projectId][fileId];
  }
  
  // Get all activities for a project
  getProjectActivities(projectId, limit = 20) {
    return this.activities
      .filter(activity => activity.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  // Log an activity
  logActivity(activity) {
    this.activities.push(activity);
    this.saveActivities();
    return activity;
  }
  
  // Mark user as active on a file
  markUserActive(projectId, fileId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Initialize if not exists
    if (!this.activeUsers[projectId]) {
      this.activeUsers[projectId] = {};
    }
    if (!this.activeUsers[projectId][fileId]) {
      this.activeUsers[projectId][fileId] = [];
    }
    
    // Add user to active users if not already there
    if (!this.activeUsers[projectId][fileId].includes(currentUser.id)) {
      this.activeUsers[projectId][fileId].push(currentUser.id);
      this.saveActiveUsers();
    }
    
    // Set up automatic cleanup after inactivity
    setTimeout(() => {
      this.markUserInactive(projectId, fileId);
    }, 60000); // Consider inactive after 1 minute
    
    return true;
  }
  
  // Mark user as inactive on a file
  markUserInactive(projectId, fileId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Check if structure exists
    if (!this.activeUsers[projectId] || 
        !this.activeUsers[projectId][fileId]) {
      return false;
    }
    
    // Remove user from active users
    const userIndex = this.activeUsers[projectId][fileId].indexOf(currentUser.id);
    if (userIndex !== -1) {
      this.activeUsers[projectId][fileId].splice(userIndex, 1);
      this.saveActiveUsers();
    }
    
    return true;
  }
  
  // Get active users for a file
  getActiveUsers(projectId, fileId) {
    if (!this.activeUsers[projectId] || !this.activeUsers[projectId][fileId]) {
      return [];
    }
    
    return this.activeUsers[projectId][fileId];
  }
  
  // Generate a shareable link for a project
  generateShareableLink(projectId, expiration = null) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    // Check if current user has permission to share
    if (!this.hasProjectPermission(projectId, currentUser.id, 'share')) {
      return null;
    }
    
    // Generate a unique token
    const token = Math.random().toString(36).substr(2, 16);
    
    // Create share data
    const shareData = {
      token,
      projectId,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      expiration: expiration ? new Date(expiration).toISOString() : null
    };
    
    // In a real app, this would be stored in a database
    // For now, we'll use localStorage as a simple demo
    const shareableLinks = JSON.parse(localStorage.getItem('grantcraft_shareable_links') || '{}');
    shareableLinks[token] = shareData;
    localStorage.setItem('grantcraft_shareable_links', JSON.stringify(shareableLinks));
    
    // Log activity
    this.logActivity({
      type: 'project_shared',
      projectId,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details: {
        action: 'shared',
        resourceType: 'project',
        expiration: shareData.expiration
      }
    });
    
    // Generate the URL (in a real app, this would be a proper URL)
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${token}`;
  }
}

// Create and export a singleton instance
const collaborationManager = new CollaborationManager();
export default collaborationManager;

// Export constants and utilities
export {
  PERMISSION_LEVELS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_CAPABILITIES
};