# Collaboration Modules API Documentation

This document provides technical details about the collaboration modules in GrantCraft, including their APIs, data structures, and integration points.

## Overview

The collaboration system in GrantCraft is built around three core modules:

1. **CollaborationManager**: Manages permissions, comments, activities, and real-time user presence
2. **ProjectManager Extensions**: Integrates permission checks into project operations
3. **UI Components**: Provides user interfaces for collaboration features

## CollaborationManager

The `CollaborationManager` class is the central component of the collaboration system, handling all collaboration-related data and operations.

### Initialization

```javascript
import collaborationManager from '../lib/collaborationManager';
```

### Constants

```javascript
// Permission levels
const PERMISSION_LEVELS = {
  OWNER: 'owner',    // Can edit, share, and manage permissions
  EDITOR: 'editor',  // Can edit and comment on documents
  VIEWER: 'viewer',  // Can view and comment on documents
};

// Permission capabilities mapping
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
```

### Project Permissions API

#### Initialize Project

Initializes a new project with the current user as owner.

```javascript
collaborationManager.initializeProject(projectId);
```

Returns: `boolean` - Success/failure

#### Check Permission

Checks if a user has a specific permission for a project.

```javascript
collaborationManager.hasProjectPermission(projectId, userId, permission);
```

Parameters:
- `projectId`: String - ID of the project
- `userId`: String - ID of the user
- `permission`: String - Permission to check (e.g., 'read', 'write', etc.)

Returns: `boolean` - Whether the user has the specified permission

#### Check Current User Permission

Checks if the currently logged-in user has a specific permission.

```javascript
collaborationManager.currentUserHasPermission(projectId, permission);
```

Parameters:
- `projectId`: String - ID of the project
- `permission`: String - Permission to check

Returns: `boolean` - Whether the current user has the specified permission

#### Add Collaborator

Adds a user as a collaborator to a project.

```javascript
collaborationManager.addCollaborator(projectId, userId, permissionLevel);
```

Parameters:
- `projectId`: String - ID of the project
- `userId`: String - ID of the user to add
- `permissionLevel`: String - One of the permission levels ('owner', 'editor', 'viewer')

Returns: `boolean` - Success/failure

#### Update Collaborator Permission

Updates the permission level of an existing collaborator.

```javascript
collaborationManager.updateCollaboratorPermission(projectId, userId, newPermissionLevel);
```

Parameters:
- `projectId`: String - ID of the project
- `userId`: String - ID of the user
- `newPermissionLevel`: String - New permission level

Returns: `boolean` - Success/failure

#### Remove Collaborator

Removes a collaborator from a project.

```javascript
collaborationManager.removeCollaborator(projectId, userId);
```

Parameters:
- `projectId`: String - ID of the project
- `userId`: String - ID of the user to remove

Returns: `boolean` - Success/failure

#### Get Project Collaborators

Returns a list of all collaborators for a project.

```javascript
collaborationManager.getProjectCollaborators(projectId);
```

Parameters:
- `projectId`: String - ID of the project

Returns: `Array` - List of collaborator objects with userId, permission, and permissionDescription

### Comments API

#### Add Comment

Adds a comment to a file.

```javascript
collaborationManager.addComment(projectId, fileId, content, parentCommentId);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file
- `content`: String - Comment content
- `parentCommentId`: String (optional) - ID of parent comment for replies

Returns: `Object` - The created comment object

#### Update Comment

Updates the content of an existing comment.

```javascript
collaborationManager.updateComment(projectId, fileId, commentId, newContent);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file
- `commentId`: String - ID of the comment
- `newContent`: String - New comment content

Returns: `Object` - The updated comment object

#### Delete Comment

Deletes a comment.

```javascript
collaborationManager.deleteComment(projectId, fileId, commentId);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file
- `commentId`: String - ID of the comment

Returns: `boolean` - Success/failure

#### Toggle Comment Resolution

Resolves or unresolves a comment.

```javascript
collaborationManager.toggleCommentResolution(projectId, fileId, commentId);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file
- `commentId`: String - ID of the comment

Returns: `Object` - The updated comment object

#### Add Comment Reaction

Adds a reaction to a comment (or removes it if already added).

```javascript
collaborationManager.addCommentReaction(projectId, fileId, commentId, reaction);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file
- `commentId`: String - ID of the comment
- `reaction`: String - Reaction identifier (e.g., 'thumbsup')

Returns: `Object` - The updated comment object

#### Get File Comments

Gets all comments for a file.

```javascript
collaborationManager.getFileComments(projectId, fileId);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file

Returns: `Array` - List of comment objects

### Activity Tracking API

#### Log Activity

Logs an activity in the system.

```javascript
collaborationManager.logActivity({
  type,       // String: Activity type
  projectId,  // String: Project ID
  userId,     // String: User ID
  fileId,     // String (optional): File ID
  details     // Object (optional): Additional details
});
```

Returns: `Object` - The created activity object

#### Get Project Activities

Gets activities for a project.

```javascript
collaborationManager.getProjectActivities(projectId, limit);
```

Parameters:
- `projectId`: String - ID of the project
- `limit`: Number (optional) - Maximum number of activities to return

Returns: `Array` - List of activity objects

### Real-time Presence API

#### Mark User Active

Marks the current user as active on a file.

```javascript
collaborationManager.markUserActive(projectId, fileId);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file

Returns: `boolean` - Success/failure

#### Mark User Inactive

Marks the current user as inactive on a file.

```javascript
collaborationManager.markUserInactive(projectId, fileId);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file

Returns: `boolean` - Success/failure

#### Get Active Users

Gets a list of active users on a file.

```javascript
collaborationManager.getActiveUsers(projectId, fileId);
```

Parameters:
- `projectId`: String - ID of the project
- `fileId`: String - ID of the file

Returns: `Array` - List of user IDs

### Sharing API

#### Generate Shareable Link

Generates a shareable link for a project.

```javascript
collaborationManager.generateShareableLink(projectId, expiration);
```

Parameters:
- `projectId`: String - ID of the project
- `expiration`: String (optional) - ISO date string for link expiration

Returns: `String` - The generated shareable link

## Data Structures

### Collaborator Object

```javascript
{
  userId: "123",              // User ID
  permission: "editor",       // Permission level
  permissionDescription: "Can edit and comment on documents" // Human-readable description
}
```

### Comment Object

```javascript
{
  id: "comment_1234567890",  // Comment ID
  projectId: "project_123",  // Project ID
  fileId: "file_123",        // File ID
  parentId: null,           // Parent comment ID (for replies)
  content: "This looks good, but...", // Comment content
  userId: "user_123",        // Author user ID
  userDisplayName: "Jane Doe", // Author display name
  timestamp: "2023-04-20T15:30:00.000Z", // Creation timestamp
  updatedAt: "2023-04-20T15:35:00.000Z", // Last update timestamp
  isResolved: false,         // Resolution status
  resolvedBy: null,          // User ID who resolved it
  resolvedAt: null,          // Resolution timestamp
  reactions: {               // Reactions to the comment
    "thumbsup": ["user_123", "user_456"]
  }
}
```

### Activity Object

```javascript
{
  type: "file_updated",       // Activity type
  projectId: "project_123",   // Project ID
  fileId: "file_123",         // File ID (optional)
  userId: "user_123",         // User who performed the action
  targetUserId: "user_456",   // Target user (for permission changes)
  timestamp: "2023-04-20T15:30:00.000Z", // Timestamp
  details: {                 // Activity-specific details
    action: "updated",
    resourceType: "file",
    fileName: "budget.md"
  }
}
```

## Integration with ProjectManager

The ProjectManager class has been extended to integrate with the CollaborationManager, adding permission checks to relevant operations.

### Key Integration Points

1. **Project Creation**: When a project is created, it's automatically initialized in the collaboration system with the current user as owner.

2. **Permission Checks**: All project operations (get, update, delete) check for appropriate permissions before executing.

3. **File Operations**: File operations (create, read, update, delete) are protected by permission checks.

4. **Version Management**: Activity is logged when versions are restored.

## UI Components

### CollaboratorsPanel

Displays and manages project collaborators.

```jsx
<CollaboratorsPanel projectId="project_123" />
```

### CommentSection

Displays and manages comments for a file.

```jsx
<CommentSection projectId="project_123" fileId="file_123" />
```

### ActivityLog

Displays project activity history.

```jsx
<ActivityLog projectId="project_123" limit={20} />
```

### ActiveUsersIndicator

Displays users currently viewing a file.

```jsx
<ActiveUsersIndicator projectId="project_123" fileId="file_123" />
```

### CollaborationTabs

Container component that integrates all collaboration components into a tabbed interface.

```jsx
<CollaborationTabs projectId="project_123" fileId="file_123" />
```

## Backend Integration (Future)

Currently, all collaboration data is stored in localStorage. In a production environment, this should be replaced with backend API calls to a persistent database.

### Migration Points

1. Replace the localStorage load/save methods in CollaborationManager with API calls
2. Add proper server-side validation of permissions
3. Implement server-side notifications for real-time updates
4. Use WebSockets for real-time presence indication