import apiService from './apiService';
import { File as FileType } from '@/types';

interface FileMetadata {
  name?: string;
  description?: string;
}

class FileService {
  private baseEndpoint = '/files';

  async getFiles() {
    return apiService.get<FileType[]>(this.baseEndpoint);
  }

  async getFileById(id: string) {
    return apiService.get<FileType>(`${this.baseEndpoint}/${id}`);
  }

  async uploadFile(file: File, metadata?: FileMetadata) {
    return apiService.uploadFile<FileType>(
      this.baseEndpoint, 
      file, 
      metadata as unknown as Record<string, string>
    );
  }

  async deleteFile(id: string) {
    return apiService.delete(`${this.baseEndpoint}/${id}`);
  }

  async updateFile(id: string, metadata: FileMetadata) {
    return apiService.put<FileType>(`${this.baseEndpoint}/${id}`, metadata);
  }

  // Returns a temporary URL to directly access the file
  async getFileUrl(id: string) {
    return apiService.get<{ url: string }>(`${this.baseEndpoint}/${id}/url`);
  }

  // Returns a thumbnail URL for preview if available
  async getFileThumbnail(id: string) {
    return apiService.get<{ url: string }>(`${this.baseEndpoint}/${id}/thumbnail`);
  }

  // Helper method to get file extension
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }

  // Helper method to get file type category
  getFileTypeCategory(filename: string): string {
    const extension = this.getFileExtension(filename).toLowerCase();
    
    // Document types
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
      return 'document';
    }
    
    // Spreadsheet types
    if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) {
      return 'spreadsheet';
    }
    
    // Presentation types
    if (['ppt', 'pptx', 'odp'].includes(extension)) {
      return 'presentation';
    }
    
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
      return 'image';
    }
    
    // Other types
    return 'other';
  }
}

export default new FileService(); 