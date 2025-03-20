/**
 * Collaborators Panel Component
 * 
 * This component displays and manages project collaborators, allowing the project
 * owner to add, remove, and update permissions for team members.
 */

import React, { useState, useEffect } from 'react';
import authService from '../lib/auth';
import collaborationManager, { PERMISSION_LEVELS, PERMISSION_DESCRIPTIONS } from '../lib/collaborationManager';

// Component to manage project collaborators
const CollaboratorsPanel = ({ projectId }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPermission, setSelectedPermission] = useState(PERMISSION_LEVELS.VIEWER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Current user
  const currentUser = authService.getCurrentUser();
  
  // Determine if current user is owner
  const isOwner = collaborationManager.hasProjectPermission(
    projectId, 
    currentUser?.id, 
    'manage_permissions'
  );
  
  // Load collaborators
  useEffect(() => {
    if (projectId) {
      loadCollaborators();
      loadUsers();
    }
  }, [projectId]);
  
  // Load collaborators for this project
  const loadCollaborators = () => {
    const projectCollaborators = collaborationManager.getProjectCollaborators(projectId);
    
    // Get user details for each collaborator
    const enrichedCollaborators = projectCollaborators.map(collab => {
      // This would fetch from a real API in a full implementation
      // For now, use mock data
      const userDetails = getMockUserDetails(collab.userId);
      
      return {
        ...collab,
        ...userDetails
      };
    });
    
    setCollaborators(enrichedCollaborators);
  };
  
  // Load available users to add as collaborators
  const loadUsers = () => {
    // This would fetch from a real API in a full implementation
    // For now, use mock data
    const allUsers = getMockUsers();
    
    // Filter out users that are already collaborators
    const projectCollaboratorIds = collaborationManager.getProjectCollaborators(projectId)
      .map(collab => collab.userId);
    
    const availableUsers = allUsers.filter(user => !projectCollaboratorIds.includes(user.id));
    setUsers(availableUsers);
    
    // Select first user in the list by default
    if (availableUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(availableUsers[0].id);
    }
  };
  
  // Get mock user details (in a real app, would fetch from API)
  const getMockUserDetails = (userId) => {
    const mockUsers = {
      '1': { 
        name: 'Jane Doe',
        email: 'researcher@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        institution: 'Example University'
      },
      '2': { 
        name: 'Admin User',
        email: 'admin@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        institution: 'GrantCraft'
      },
      '3': { 
        name: 'John Smith',
        email: 'jsmith@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        institution: 'Research Institute'
      },
      '4': { 
        name: 'Sarah Johnson',
        email: 'sjohnson@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        institution: 'State University'
      },
      '5': { 
        name: 'Michael Brown',
        email: 'mbrown@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        institution: 'Medical Center'
      }
    };
    
    return mockUsers[userId] || { 
      name: 'Unknown User',
      email: 'unknown@example.com',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      institution: 'Unknown'
    };
  };
  
  // Get mock users (in a real app, would fetch from API)
  const getMockUsers = () => {
    return [
      { id: '1', name: 'Jane Doe', email: 'researcher@example.com' },
      { id: '2', name: 'Admin User', email: 'admin@example.com' },
      { id: '3', name: 'John Smith', email: 'jsmith@example.com' },
      { id: '4', name: 'Sarah Johnson', email: 'sjohnson@example.com' },
      { id: '5', name: 'Michael Brown', email: 'mbrown@example.com' },
    ];
  };
  
  // Add a new collaborator
  const handleAddCollaborator = () => {
    if (!selectedUserId) {
      setError('Please select a user to add as a collaborator');
      return;
    }
    
    try {
      const result = collaborationManager.addCollaborator(
        projectId, 
        selectedUserId, 
        selectedPermission
      );
      
      if (result) {
        setSuccess(`Collaborator added successfully`);
        setError('');
        loadCollaborators();
        loadUsers();
        
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add collaborator. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while adding the collaborator');
    }
  };
  
  // Update a collaborator's permission level
  const handleUpdatePermission = (userId, newPermission) => {
    try {
      const result = collaborationManager.updateCollaboratorPermission(
        projectId, 
        userId, 
        newPermission
      );
      
      if (result) {
        setSuccess('Permission updated successfully');
        setError('');
        loadCollaborators();
        
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update permission. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the permission');
    }
  };
  
  // Remove a collaborator
  const handleRemoveCollaborator = (userId) => {
    try {
      const result = collaborationManager.removeCollaborator(projectId, userId);
      
      if (result) {
        setSuccess('Collaborator removed successfully');
        setError('');
        loadCollaborators();
        loadUsers();
        
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to remove collaborator. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while removing the collaborator');
    }
  };
  
  // Generate a shareable link
  const handleGenerateShareableLink = () => {
    try {
      // Create a link that expires in 7 days
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      
      const link = collaborationManager.generateShareableLink(
        projectId, 
        expirationDate.toISOString()
      );
      
      if (link) {
        // Copy to clipboard
        navigator.clipboard.writeText(link)
          .then(() => {
            setSuccess('Shareable link copied to clipboard! It will expire in 7 days.');
            setError('');
            
            // Clear the success message after 5 seconds
            setTimeout(() => setSuccess(''), 5000);
          })
          .catch(err => {
            setSuccess(`Shareable link generated: ${link}`);
            setError('Could not copy to clipboard. Please copy the link manually.');
          });
      } else {
        setError('Failed to generate shareable link. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the link');
    }
  };
  
  // Render the component
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Project Collaborators</h2>
      
      {/* Error and success messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Collaborators list */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Collaborators</h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Permission</th>
                {isOwner && (
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {collaborators.map(collaborator => (
                <tr key={collaborator.userId}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={collaborator.avatar} 
                          alt={collaborator.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{collaborator.name}</div>
                        <div className="text-gray-500">{collaborator.institution}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {collaborator.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isOwner && collaborator.permission !== PERMISSION_LEVELS.OWNER ? (
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={collaborator.permission}
                        onChange={(e) => handleUpdatePermission(collaborator.userId, e.target.value)}
                      >
                        {Object.entries(PERMISSION_LEVELS)
                          .filter(([key, value]) => value !== PERMISSION_LEVELS.OWNER)
                          .map(([key, value]) => (
                            <option key={value} value={value}>
                              {value.charAt(0).toUpperCase() + value.slice(1)} - {PERMISSION_DESCRIPTIONS[value]}
                            </option>
                          ))
                        }
                      </select>
                    ) : (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        {collaborator.permission.charAt(0).toUpperCase() + collaborator.permission.slice(1)}
                      </span>
                    )}
                  </td>
                  {isOwner && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                      {collaborator.permission !== PERMISSION_LEVELS.OWNER && (
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemoveCollaborator(collaborator.userId)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              
              {collaborators.length === 0 && (
                <tr>
                  <td colSpan={isOwner ? 4 : 3} className="py-4 text-center text-sm text-gray-500">
                    No collaborators yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add collaborator form */}
      {isOwner && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Add Collaborator</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                User
              </label>
              <select
                id="user"
                name="user"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="permission" className="block text-sm font-medium text-gray-700">
                Permission Level
              </label>
              <select
                id="permission"
                name="permission"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
              >
                {Object.entries(PERMISSION_LEVELS)
                  .filter(([key, value]) => value !== PERMISSION_LEVELS.OWNER)
                  .map(([key, value]) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)} - {PERMISSION_DESCRIPTIONS[value]}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleAddCollaborator}
              disabled={!selectedUserId}
            >
              Add Collaborator
            </button>
          </div>
        </div>
      )}
      
      {/* Sharing options */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Share Project</h3>
        <p className="text-sm text-gray-500 mb-4">
          Generate a shareable link that can be sent to others. They will need to create an account to access the project.
        </p>
        
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleGenerateShareableLink}
        >
          Generate Shareable Link
        </button>
      </div>
    </div>
  );
};

export default CollaboratorsPanel;