/**
 * Task-related type definitions shared between frontend and backend
 */

/**
 * Task model
 */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  dueDate?: string; // ISO date string
  assignedTo?: string;
  parentId?: string;
  dependencies: string[];
  metadata: Record<string, any>;
}

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Task priority
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Create task request
 */
export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string; // ISO date string
  assignedTo?: string;
  parentId?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

/**
 * Update task request
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string; // ISO date string
  assignedTo?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
} 