/**
 * File-related type definitions shared between frontend and backend
 */

/**
 * File model
 */
export interface File {
  id: string;
  projectId: string;
  name: string;
  path: string;
  type: FileType;
  mimeType: string;
  size: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: string;
  url: string;
  metadata: Record<string, any>;
}

/**
 * File type
 */
export type FileType = 'document' | 'image' | 'spreadsheet' | 'other';

/**
 * File upload response
 */
export interface FileUploadResponse {
  file: File;
  uploadUrl: string;
}

/**
 * File download response
 */
export interface FileDownloadResponse {
  file: File;
  downloadUrl: string;
}

/**
 * File update request
 */
export interface UpdateFileRequest {
  name?: string;
  metadata?: Record<string, any>;
} 