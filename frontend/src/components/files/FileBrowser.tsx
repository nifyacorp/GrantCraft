import React, { useState } from 'react';
import { 
  File, FileText, Image, Video, Music, Archive, Database, 
  FileX, Grid, List, Download, Trash2, Eye, X 
} from 'lucide-react';
import { format } from 'date-fns';
import { File as FileType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface FileBrowserProps {
  files: FileType[];
  onDownload: (file: FileType) => void;
  onDelete: (file: FileType) => void;
  onPreview: (file: FileType) => void;
}

type ViewMode = 'grid' | 'list';
type SortKey = 'name' | 'size' | 'type' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const FileBrowser: React.FC<FileBrowserProps> = ({ 
  files, 
  onDownload, 
  onDelete, 
  onPreview 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [previewFile, setPreviewFile] = useState<FileType | null>(null);
  
  const getFileIcon = (file: FileType) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <Image className="h-10 w-10 text-blue-500" />;
    }
    
    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'].includes(ext || '')) {
      return <FileText className="h-10 w-10 text-green-500" />;
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
      return <Video className="h-10 w-10 text-purple-500" />;
    }
    
    // Audio files
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext || '')) {
      return <Music className="h-10 w-10 text-pink-500" />;
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <Archive className="h-10 w-10 text-amber-500" />;
    }
    
    // Data files
    if (['json', 'csv', 'xml', 'xlsx', 'xls'].includes(ext || '')) {
      return <Database className="h-10 w-10 text-red-500" />;
    }
    
    // Default
    return <File className="h-10 w-10 text-gray-400" />;
  };
  
  const isPreviewable = (file: FileType) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const textExts = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'];
    const pdfExt = ['pdf'];
    
    return [...imageExts, ...textExts, ...pdfExt].includes(ext || '');
  };
  
  const handlePreview = (file: FileType) => {
    if (isPreviewable(file)) {
      setPreviewFile(file);
    } else {
      // If not previewable, try to download instead
      onDownload(file);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    switch (sortKey) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        const extA = a.name.split('.').pop() || '';
        const extB = b.name.split('.').pop() || '';
        comparison = extA.localeCompare(extB);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const renderFilePreview = () => {
    if (!previewFile) return null;
    
    const ext = previewFile.name.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const textExts = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'];
    
    if (imageExts.includes(ext || '')) {
      return (
        <div className="flex justify-center">
          <img 
            src={previewFile.url} 
            alt={previewFile.name} 
            className="max-h-[500px] object-contain" 
          />
        </div>
      );
    }
    
    if (ext === 'pdf') {
      return (
        <iframe 
          src={`${previewFile.url}#view=FitH`} 
          className="w-full h-[500px]" 
          title={previewFile.name}
        />
      );
    }
    
    if (textExts.includes(ext || '')) {
      return (
        <div className="bg-muted p-4 rounded-md overflow-auto h-[500px] w-full">
          <pre className="text-sm whitespace-pre-wrap">
            {/* This would need to be fetched from the API */}
            <p className="text-center text-muted-foreground">
              Text preview is loading...
            </p>
          </pre>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileX className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Preview not available</h3>
        <p className="text-muted-foreground mb-4">
          This file type cannot be previewed. You can download it instead.
        </p>
        <Button onClick={() => onDownload(previewFile)}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </div>
      </div>
      
      {viewMode === 'list' ? (
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-4 p-4 bg-muted text-sm font-medium">
            <div className="col-span-6 cursor-pointer" onClick={() => toggleSort('name')}>
              Name {sortKey === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 cursor-pointer" onClick={() => toggleSort('type')}>
              Type {sortKey === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 cursor-pointer" onClick={() => toggleSort('size')}>
              Size {sortKey === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 cursor-pointer" onClick={() => toggleSort('createdAt')}>
              Created {sortKey === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
          </div>
          
          {sortedFiles.map((file) => (
            <div 
              key={file.id} 
              className="grid grid-cols-12 gap-4 p-4 border-t hover:bg-muted/50 items-center"
            >
              <div className="col-span-6 flex items-center" onClick={() => handlePreview(file)}>
                <div className="mr-2">{getFileIcon(file)}</div>
                <div className="truncate cursor-pointer hover:text-primary">{file.name}</div>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {file.name.split('.').pop()?.toUpperCase() || 'Unknown'}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {format(new Date(file.createdAt), 'MMM d, yyyy')}
              </div>
              <div className="flex space-x-2 items-center justify-end">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handlePreview(file)}
                  disabled={!isPreviewable(file)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDelete(file)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <div 
                className="p-4 flex flex-col h-full cursor-pointer"
                onClick={() => handlePreview(file)}
              >
                <div className="flex justify-center mb-4">
                  {getFileIcon(file)}
                </div>
                <div className="text-center mb-2 truncate font-medium">
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground text-center mb-4">
                  {formatFileSize(file.size)} • {format(new Date(file.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="mt-auto flex justify-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(file);
                    }}
                    disabled={!isPreviewable(file)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(file);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* File Preview Dialog */}
      <Dialog open={previewFile !== null} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{previewFile?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {renderFilePreview()}
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {previewFile && formatFileSize(previewFile.size)}
            </div>
            <div className="flex space-x-2">
              {previewFile && (
                <Button onClick={() => onDownload(previewFile)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileBrowser; 