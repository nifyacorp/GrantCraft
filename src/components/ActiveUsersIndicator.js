/**
 * Active Users Indicator Component
 * 
 * This component displays avatars of users currently viewing or editing a file,
 * providing real-time collaboration awareness.
 */

import React, { useState, useEffect } from 'react';
import authService from '../lib/auth';
import collaborationManager from '../lib/collaborationManager';

// Component for displaying active users on a file
const ActiveUsersIndicator = ({ projectId, fileId }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  
  // Current user
  const currentUser = authService.getCurrentUser();
  
  // Load active users and poll for updates
  useEffect(() => {
    if (projectId && fileId) {
      loadActiveUsers();
      
      // Poll for updates every 10 seconds
      const intervalId = setInterval(loadActiveUsers, 10000);
      
      // Mark current user as active
      collaborationManager.markUserActive(projectId, fileId);
      
      // Set up periodic active status refresh
      const activityInterval = setInterval(() => {
        collaborationManager.markUserActive(projectId, fileId);
      }, 30000); // Refresh active status every 30 seconds
      
      // Clean up intervals on unmount
      return () => {
        clearInterval(intervalId);
        clearInterval(activityInterval);
        collaborationManager.markUserInactive(projectId, fileId);
      };
    }
  }, [projectId, fileId]);
  
  // Load active users for the file
  const loadActiveUsers = () => {
    const users = collaborationManager.getActiveUsers(projectId, fileId);
    setActiveUsers(users);
    
    // Get user details (in a real app, would fetch from API)
    const userDetailsObj = {};
    users.forEach(userId => {
      userDetailsObj[userId] = getMockUserDetails(userId);
    });
    
    setUserDetails(userDetailsObj);
  };
  
  // Get mock user details (in a real app, would fetch from API)
  const getMockUserDetails = (userId) => {
    const mockUsers = {
      '1': { 
        name: 'Jane Doe',
        email: 'researcher@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      '2': { 
        name: 'Admin User',
        email: 'admin@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      '3': { 
        name: 'John Smith',
        email: 'jsmith@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      },
      '4': { 
        name: 'Sarah Johnson',
        email: 'sjohnson@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      },
      '5': { 
        name: 'Michael Brown',
        email: 'mbrown@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      }
    };
    
    return mockUsers[userId] || { 
      name: 'Unknown User',
      email: 'unknown@example.com',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    };
  };
  
  // Filter out current user from displayed active users
  const otherActiveUsers = activeUsers.filter(userId => userId !== currentUser?.id);
  
  // Don't render anything if there are no other active users
  if (otherActiveUsers.length === 0) {
    return null;
  }
  
  // Render the component
  return (
    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
      <span className="text-sm text-gray-500 mr-1">Also viewing:</span>
      <div className="flex -space-x-2 overflow-hidden">
        {otherActiveUsers.map(userId => (
          <div 
            key={userId} 
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            title={userDetails[userId]?.name || 'Unknown User'}
          >
            <img
              className="h-8 w-8 rounded-full"
              src={userDetails[userId]?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={userDetails[userId]?.name || 'Unknown User'}
            />
          </div>
        ))}
      </div>
      {otherActiveUsers.length > 3 && (
        <span className="text-xs text-gray-500">
          +{otherActiveUsers.length - 3} more
        </span>
      )}
    </div>
  );
};

export default ActiveUsersIndicator;