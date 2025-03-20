/**
 * Activity Log Component
 * 
 * This component displays a log of project activities, showing changes
 * made by users over time, and providing filtering options.
 */

import React, { useState, useEffect } from 'react';
import authService from '../lib/auth';
import collaborationManager from '../lib/collaborationManager';

// Component for displaying project activity
const ActivityLog = ({ projectId, limit = 20 }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filter, setFilter] = useState('all'); // all, files, comments, collaborators
  const [userDetails, setUserDetails] = useState({});
  
  // Load activities when projectId changes
  useEffect(() => {
    if (projectId) {
      loadActivities();
    }
  }, [projectId, limit]);
  
  // Apply filters when filter or activities change
  useEffect(() => {
    applyFilter();
  }, [filter, activities]);
  
  // Load activities from the collaboration manager
  const loadActivities = () => {
    const projectActivities = collaborationManager.getProjectActivities(projectId, limit);
    setActivities(projectActivities);
    
    // Collect unique user IDs from activities
    const userIds = [...new Set(projectActivities.map(activity => activity.userId))];
    
    // Get user details for each user (in a real app, would fetch from API)
    const userDetailsObj = {};
    userIds.forEach(userId => {
      userDetailsObj[userId] = getMockUserDetails(userId);
    });
    
    setUserDetails(userDetailsObj);
  };
  
  // Apply the current filter to activities
  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredActivities(activities);
      return;
    }
    
    const filtered = activities.filter(activity => {
      if (filter === 'files') {
        return ['file_created', 'file_updated', 'file_deleted', 'version_restored'].includes(activity.type);
      } else if (filter === 'comments') {
        return ['comment_added', 'comment_updated', 'comment_deleted', 'comment_resolved', 'comment_reopened'].includes(activity.type);
      } else if (filter === 'collaborators') {
        return ['collaborator_added', 'collaborator_removed', 'permission_updated', 'project_shared'].includes(activity.type);
      }
      return true;
    });
    
    setFilteredActivities(filtered);
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
  
  // Format a timestamp to a readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Generate a human-readable activity description
  const getActivityDescription = (activity) => {
    const user = userDetails[activity.userId]?.name || 'Someone';
    
    switch (activity.type) {
      case 'project_created':
        return `${user} created this project`;
      
      case 'project_updated':
        return `${user} updated project details`;
      
      case 'file_created':
        return `${user} created file "${activity.details.fileName}"`;
      
      case 'file_updated':
        return `${user} updated file "${activity.details.fileName}"`;
      
      case 'file_deleted':
        return `${user} deleted file "${activity.details.fileName}"`;
      
      case 'version_restored':
        return `${user} restored a previous version of a file`;
      
      case 'comment_added':
        if (activity.details.isReply) {
          return `${user} replied to a comment`;
        }
        return `${user} added a comment`;
      
      case 'comment_updated':
        return `${user} edited a comment`;
      
      case 'comment_deleted':
        return `${user} deleted a comment`;
      
      case 'comment_resolved':
        return `${user} resolved a comment`;
      
      case 'comment_reopened':
        return `${user} reopened a comment`;
      
      case 'collaborator_added':
        const targetUser1 = getMockUserDetails(activity.targetUserId)?.name || 'a user';
        const permission1 = activity.details.permissionLevel;
        return `${user} added ${targetUser1} as a ${permission1}`;
      
      case 'collaborator_removed':
        const targetUser2 = getMockUserDetails(activity.targetUserId)?.name || 'a user';
        return `${user} removed ${targetUser2} from the project`;
      
      case 'permission_updated':
        const targetUser3 = getMockUserDetails(activity.targetUserId)?.name || 'a user';
        const newPermission = activity.details.newPermissionLevel;
        return `${user} changed ${targetUser3}'s permission to ${newPermission}`;
      
      case 'project_shared':
        return `${user} shared the project with others`;
      
      default:
        return `${user} performed an action`;
    }
  };
  
  // Get an appropriate icon for each activity type
  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'project_created':
      case 'project_updated':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              <path d="M7 13h6v2H7v-2z" />
            </svg>
          </div>
        );
        
      case 'file_created':
      case 'file_updated':
      case 'file_deleted':
      case 'version_restored':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
        
      case 'comment_added':
      case 'comment_updated':
      case 'comment_deleted':
      case 'comment_resolved':
      case 'comment_reopened':
        return (
          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        );
        
      case 'collaborator_added':
      case 'collaborator_removed':
      case 'permission_updated':
      case 'project_shared':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
        );
        
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  // Render the component
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Activity Log</h2>
      
      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('all')}
          >
            All Activities
          </button>
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'files'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('files')}
          >
            Files
          </button>
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'comments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('comments')}
          >
            Comments
          </button>
          <button
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'collaborators'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setFilter('collaborators')}
          >
            Collaborators
          </button>
        </nav>
      </div>
      
      {/* Activity list */}
      <div className="flow-root">
        <ul className="-mb-8">
          {filteredActivities.length === 0 ? (
            <li className="text-center py-4 text-gray-500">
              No activities to display
            </li>
          ) : (
            filteredActivities.map((activity, activityIdx) => (
              <li key={activity.timestamp + activity.type + activityIdx}>
                <div className="relative pb-8">
                  {activityIdx !== filteredActivities.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      {getActivityIcon(activity)}
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {getActivityDescription(activity)}
                        </p>
                      </div>
                      <div className="text-right text-xs whitespace-nowrap text-gray-500">
                        <time dateTime={activity.timestamp}>{formatTimestamp(activity.timestamp)}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLog;