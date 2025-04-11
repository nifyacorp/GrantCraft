import React, { useState } from 'react';
import { Folder, FolderPlus, Tag, X, Plus, Search } from 'lucide-react';
import { File as FileType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FileOrganizerProps {
  files: FileType[];
  onCreateFolder: (name: string) => void;
  onAddTag: (fileId: string, tag: string) => void;
  onRemoveTag: (fileId: string, tag: string) => void;
  onFilterByTag: (tag: string | null) => void;
  onFilterByFolder: (folder: string | null) => void;
  onSearchFiles: (query: string) => void;
  activeTags: string[];
  activeFolder: string | null;
}

const FileOrganizer: React.FC<FileOrganizerProps> = ({
  files,
  onCreateFolder,
  onAddTag,
  onRemoveTag,
  onFilterByTag,
  onFilterByFolder,
  onSearchFiles,
  activeTags,
  activeFolder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  
  // Get all unique tags from files
  const allTags = Array.from(
    new Set(
      files.flatMap(file => file.tags || [])
    )
  ).sort();
  
  // Get all unique folders from files
  const folders = Array.from(
    new Set(
      files
        .map(file => file.folder)
        .filter(Boolean) as string[]
    )
  ).sort();
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    onCreateFolder(newFolderName);
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };
  
  const handleAddTag = () => {
    if (!newTag.trim() || !selectedFileId) return;
    
    onAddTag(selectedFileId, newTag);
    setNewTag('');
    setIsAddTagOpen(false);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchFiles(searchQuery);
  };
  
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form className="flex gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      {/* Folder Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Folders</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        <div className="space-y-1">
          <button
            className={cn(
              "flex items-center w-full text-left rounded-md px-3 py-2 text-sm",
              activeFolder === null ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
            onClick={() => onFilterByFolder(null)}
          >
            <Folder className="h-4 w-4 mr-2" />
            All Files
          </button>
          
          {folders.map(folder => (
            <button
              key={folder}
              className={cn(
                "flex items-center w-full text-left rounded-md px-3 py-2 text-sm",
                activeFolder === folder ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={() => onFilterByFolder(folder)}
            >
              <Folder className="h-4 w-4 mr-2" />
              {folder}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tags Section */}
      <div>
        <h3 className="text-sm font-medium mb-2">Tags</h3>
        
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge 
              key={tag}
              variant={activeTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onFilterByTag(activeTags.includes(tag) ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
          
          {allTags.length === 0 && (
            <p className="text-sm text-muted-foreground">No tags created yet</p>
          )}
        </div>
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Tag Dialog */}
      <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="New tag"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
            />
            
            {allTags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Existing Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge 
                      key={tag}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        setNewTag(tag);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tag Management Functions (not directly visible) */}
      <div className="hidden">
        {files.map(file => (
          <div key={file.id}>
            <Button
              onClick={() => {
                setSelectedFileId(file.id);
                setIsAddTagOpen(true);
              }}
            >
              Add Tag to {file.name}
            </Button>
            
            {(file.tags || []).map(tag => (
              <Button
                key={tag}
                onClick={() => onRemoveTag(file.id, tag)}
              >
                Remove {tag} from {file.name}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileOrganizer; 