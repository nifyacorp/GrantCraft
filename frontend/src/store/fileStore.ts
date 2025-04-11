import { create } from 'zustand';
import { File as FileType, FileSummary } from '@/types';
import fileService from '@/services/fileService';
import { toast } from '@/lib/hooks/use-toast';

interface FileMetadata {
  name?: string;
  description?: string;
}

interface FileState {
  files: FileType[];
  activeFile: FileType | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;

  // Actions
  fetchFiles: () => Promise<void>;
  fetchFile: (id: string) => Promise<void>;
  uploadFile: (file: File, metadata?: FileMetadata) => Promise<string | null>;
  deleteFile: (id: string) => Promise<boolean>;
  updateFile: (id: string, metadata: FileMetadata) => Promise<boolean>;
  getFileUrl: (id: string) => Promise<string | null>;
  getThumbnailUrl: (id: string) => Promise<string | null>;
  clearActiveFile: () => void;
}

const useFileStore = create<FileState>((set, get) => ({
  files: [],
  activeFile: null,
  loading: false,
  uploading: false,
  error: null,

  fetchFiles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fileService.getFiles();
      if (response.error) {
        throw new Error(response.error);
      }
      set({ files: response.data || [], loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch files';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  },

  fetchFile: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fileService.getFileById(id);
      if (response.error) {
        throw new Error(response.error);
      }
      set({ activeFile: response.data || null, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch file';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  },

  uploadFile: async (file: File, metadata?: FileMetadata) => {
    set({ uploading: true, error: null });
    try {
      // Use filename as default name if not provided
      const fileMetadata = metadata || { name: file.name };
      
      const response = await fileService.uploadFile(file, fileMetadata);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        set(state => ({ 
          files: [response.data!, ...state.files],
          uploading: false 
        }));
        
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
        
        return response.data.id;
      }
      
      set({ uploading: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      set({ error: errorMessage, uploading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  },

  deleteFile: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fileService.deleteFile(id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      set(state => ({ 
        files: state.files.filter(file => file.id !== id),
        activeFile: state.activeFile?.id === id ? null : state.activeFile,
        loading: false 
      }));
      
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },

  updateFile: async (id: string, metadata: FileMetadata) => {
    set({ loading: true, error: null });
    try {
      const response = await fileService.updateFile(id, metadata);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        set(state => {
          const updatedFiles = state.files.map(file => 
            file.id === id ? response.data! : file
          );
          
          // Update activeFile if it's the one being updated
          const updatedActiveFile = state.activeFile?.id === id 
            ? response.data 
            : state.activeFile;
          
          return { 
            files: updatedFiles, 
            activeFile: updatedActiveFile,
            loading: false 
          };
        });
        
        toast({
          title: 'Success',
          description: 'File updated successfully',
        });
        
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update file';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },

  getFileUrl: async (id: string) => {
    try {
      const response = await fileService.getFileUrl(id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data?.url || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get file URL';
      set({ error: errorMessage });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  },

  getThumbnailUrl: async (id: string) => {
    try {
      const response = await fileService.getFileThumbnail(id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data?.url || null;
    } catch (error) {
      // Not showing toast for thumbnails as this could be a common case
      const errorMessage = error instanceof Error ? error.message : 'Failed to get thumbnail';
      set({ error: errorMessage });
      return null;
    }
  },

  clearActiveFile: () => {
    set({ activeFile: null });
  }
}));

export default useFileStore; 