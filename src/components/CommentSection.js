/**
 * Comment Section Component
 * 
 * This component displays and manages comments on project files, allowing
 * collaborators to discuss and provide feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import authService from '../lib/auth';
import collaborationManager from '../lib/collaborationManager';

// Component for displaying and managing file comments
const CommentSection = ({ projectId, fileId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const commentInputRef = useRef(null);
  
  // Current user
  const currentUser = authService.getCurrentUser();
  
  // Load comments when projectId or fileId changes
  useEffect(() => {
    if (projectId && fileId) {
      loadComments();
    }
  }, [projectId, fileId]);
  
  // Load comments for this file
  const loadComments = () => {
    const fileComments = collaborationManager.getFileComments(projectId, fileId);
    setComments(fileComments);
  };
  
  // Add a new comment
  const handleAddComment = () => {
    if (!newComment.trim()) {
      return;
    }
    
    try {
      const result = collaborationManager.addComment(
        projectId,
        fileId,
        newComment.trim()
      );
      
      if (result) {
        setNewComment('');
        loadComments();
      } else {
        setError('Failed to add comment. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while adding the comment');
    }
  };
  
  // Add a reply to a comment
  const handleAddReply = (parentCommentId) => {
    if (!replyContent.trim()) {
      return;
    }
    
    try {
      const result = collaborationManager.addComment(
        projectId,
        fileId,
        replyContent.trim(),
        parentCommentId
      );
      
      if (result) {
        setReplyContent('');
        setReplyingTo(null);
        loadComments();
      } else {
        setError('Failed to add reply. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while adding the reply');
    }
  };
  
  // Update a comment
  const handleUpdateComment = (commentId) => {
    if (!editContent.trim()) {
      return;
    }
    
    try {
      const result = collaborationManager.updateComment(
        projectId,
        fileId,
        commentId,
        editContent.trim()
      );
      
      if (result) {
        setEditContent('');
        setEditingComment(null);
        loadComments();
      } else {
        setError('Failed to update comment. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the comment');
    }
  };
  
  // Delete a comment
  const handleDeleteComment = (commentId) => {
    try {
      const result = collaborationManager.deleteComment(
        projectId,
        fileId,
        commentId
      );
      
      if (result) {
        loadComments();
      } else {
        setError('Failed to delete comment. You may not have permission.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the comment');
    }
  };
  
  // Resolve/unresolve a comment
  const handleToggleResolution = (commentId) => {
    try {
      const result = collaborationManager.toggleCommentResolution(
        projectId,
        fileId,
        commentId
      );
      
      if (result) {
        loadComments();
      } else {
        setError('Failed to update comment resolution status.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the comment');
    }
  };
  
  // Start replying to a comment
  const handleStartReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyContent('');
    
    // Focus the reply input after a short delay to allow for rendering
    setTimeout(() => {
      const replyInput = document.getElementById(`reply-input-${commentId}`);
      if (replyInput) {
        replyInput.focus();
      }
    }, 50);
  };
  
  // Start editing a comment
  const handleStartEdit = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    
    // Focus the edit input after a short delay to allow for rendering
    setTimeout(() => {
      const editInput = document.getElementById(`edit-input-${comment.id}`);
      if (editInput) {
        editInput.focus();
      }
    }, 50);
  };
  
  // Format timestamp to a readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Check if a comment is by the current user
  const isCurrentUserComment = (comment) => {
    return comment.userId === currentUser?.id;
  };
  
  // Filter comments
  const filteredComments = comments
    .filter(comment => !comment.parentId) // Only top-level comments
    .filter(comment => showResolved || !comment.isResolved); // Filter by resolution status
  
  // Get replies for a comment
  const getReplies = (commentId) => {
    return comments.filter(comment => comment.parentId === commentId);
  };
  
  // Update the comment count
  const topLevelCommentCount = comments.filter(comment => !comment.parentId).length;
  const unresolvedCount = comments.filter(comment => !comment.parentId && !comment.isResolved).length;
  
  // Render the component
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        <span>Comments ({topLevelCommentCount})</span>
        <span className="text-sm font-normal">
          <input 
            type="checkbox" 
            id="show-resolved" 
            checked={showResolved} 
            onChange={() => setShowResolved(!showResolved)}
            className="mr-2"
          />
          <label htmlFor="show-resolved">Show resolved ({topLevelCommentCount - unresolvedCount})</label>
        </span>
      </h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* New comment form */}
      <div className="mb-6">
        <textarea
          ref={commentInputRef}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
          rows="3"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <div className="mt-2 flex justify-end">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            Add Comment
          </button>
        </div>
      </div>
      
      {/* Comments list */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          filteredComments.map(comment => (
            <div 
              key={comment.id} 
              className={`border rounded-lg p-4 ${comment.isResolved ? 'bg-gray-50' : 'bg-white'}`}
            >
              {/* Comment header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="font-medium">{comment.userDisplayName}</div>
                  <div className="text-gray-500 text-sm ml-2">
                    {formatTimestamp(comment.timestamp)}
                    {comment.updatedAt && ' (edited)'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      comment.isResolved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => handleToggleResolution(comment.id)}
                  >
                    {comment.isResolved ? 'Resolved' : 'Resolve'}
                  </button>
                </div>
              </div>
              
              {/* Comment content */}
              {editingComment === comment.id ? (
                <div className="mt-2">
                  <textarea
                    id={`edit-input-${comment.id}`}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                    rows="3"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  ></textarea>
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
                      onClick={() => setEditingComment(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-gray-800">
                  {comment.content}
                </div>
              )}
              
              {/* Comment actions */}
              {!editingComment && (
                <div className="mt-3 flex space-x-4 text-sm">
                  <button 
                    className="text-gray-500 hover:text-indigo-600"
                    onClick={() => handleStartReply(comment.id)}
                  >
                    Reply
                  </button>
                  {isCurrentUserComment(comment) && (
                    <>
                      <button 
                        className="text-gray-500 hover:text-indigo-600"
                        onClick={() => handleStartEdit(comment)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
              
              {/* Replies */}
              <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                {getReplies(comment.id).map(reply => (
                  <div key={reply.id} className="pt-2">
                    {/* Reply header */}
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        <div className="font-medium text-sm">{reply.userDisplayName}</div>
                        <div className="text-gray-500 text-xs ml-2">
                          {formatTimestamp(reply.timestamp)}
                          {reply.updatedAt && ' (edited)'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Reply content */}
                    {editingComment === reply.id ? (
                      <div className="mt-2">
                        <textarea
                          id={`edit-input-${reply.id}`}
                          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                          rows="2"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        ></textarea>
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
                            onClick={() => setEditingComment(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                            onClick={() => handleUpdateComment(reply.id)}
                            disabled={!editContent.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-800">
                        {reply.content}
                      </div>
                    )}
                    
                    {/* Reply actions */}
                    {!editingComment && isCurrentUserComment(reply) && (
                      <div className="mt-1 flex space-x-3 text-xs">
                        <button 
                          className="text-gray-500 hover:text-indigo-600"
                          onClick={() => handleStartEdit(reply)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-gray-500 hover:text-red-600"
                          onClick={() => handleDeleteComment(reply.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Reply form */}
                {replyingTo === comment.id && (
                  <div className="mt-2">
                    <textarea
                      id={`reply-input-${comment.id}`}
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                      rows="2"
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    ></textarea>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;