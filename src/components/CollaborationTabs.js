/**
 * Collaboration Tabs Component
 * 
 * This component provides a tabbed interface for all collaboration features,
 * including collaborator management, comments, and activity logs.
 */

import React, { useState } from 'react';
import CollaboratorsPanel from './CollaboratorsPanel';
import CommentSection from './CommentSection';
import ActivityLog from './ActivityLog';

// Component for displaying collaboration features in tabs
const CollaborationTabs = ({ projectId, fileId = null }) => {
  const [activeTab, setActiveTab] = useState('collaborators');
  
  // Check if comments tab should be active and available
  const showComments = !!fileId;
  
  // If file is selected and comments tab was previously active, switch to it
  React.useEffect(() => {
    if (fileId && activeTab === 'comments') {
      setActiveTab('comments');
    } else if (!fileId && activeTab === 'comments') {
      setActiveTab('collaborators');
    }
  }, [fileId]);
  
  // Render the component
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            className={`${
              activeTab === 'collaborators'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center`}
            onClick={() => setActiveTab('collaborators')}
          >
            Collaborators
          </button>
          
          <button
            disabled={!showComments}
            className={`${
              !showComments
                ? 'cursor-not-allowed text-gray-300'
                : activeTab === 'comments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center`}
            onClick={() => showComments && setActiveTab('comments')}
          >
            Comments {!showComments && '(Select a file)'}
          </button>
          
          <button
            className={`${
              activeTab === 'activity'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="p-0">
        {activeTab === 'collaborators' && (
          <CollaboratorsPanel projectId={projectId} />
        )}
        
        {activeTab === 'comments' && showComments && (
          <CommentSection projectId={projectId} fileId={fileId} />
        )}
        
        {activeTab === 'activity' && (
          <ActivityLog projectId={projectId} />
        )}
      </div>
    </div>
  );
};

export default CollaborationTabs;