/**
 * Project-related type definitions shared between frontend and backend
 */

/**
 * Project model
 */
export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: ProjectStatus;
  collaborators: Collaborator[];
  metadata: ProjectMetadata;
}

/**
 * Project status
 */
export type ProjectStatus = 'active' | 'archived' | 'completed';

/**
 * Project collaborator
 */
export interface Collaborator {
  userId: string;
  role: CollaboratorRole;
  addedAt: string; // ISO date string
}

/**
 * Collaborator role
 */
export type CollaboratorRole = 'editor' | 'viewer';

/**
 * Project metadata
 */
export interface ProjectMetadata {
  fundingSource?: string;
  deadline?: string; // ISO date string
  budget?: number;
  category?: string;
}

/**
 * Create project request
 */
export interface CreateProjectRequest {
  title: string;
  description: string;
  metadata?: ProjectMetadata;
}

/**
 * Update project request
 */
export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  metadata?: ProjectMetadata;
} 