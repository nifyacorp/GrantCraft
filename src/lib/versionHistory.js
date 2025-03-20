/**
 * Version History Module
 * 
 * This module manages version tracking for project files, allowing users
 * to save, view, and restore previous versions of their grant documents.
 */

// Class for managing version history of a file
class VersionHistory {
  constructor() {
    this.versions = {};
  }
  
  // Add a new version for a file
  addVersion(fileId, content, metadata = {}) {
    if (!this.versions[fileId]) {
      this.versions[fileId] = [];
    }
    
    // Create a new version entry
    const newVersion = {
      versionId: `${fileId}_v${this.versions[fileId].length + 1}`,
      timestamp: new Date().toISOString(),
      content,
      metadata: {
        ...metadata,
        versionNumber: this.versions[fileId].length + 1
      }
    };
    
    // Add to versions array
    this.versions[fileId].push(newVersion);
    
    return newVersion;
  }
  
  // Get all versions for a file
  getVersions(fileId) {
    return this.versions[fileId] || [];
  }
  
  // Get a specific version by version ID
  getVersion(versionId) {
    for (const fileId in this.versions) {
      const version = this.versions[fileId].find(v => v.versionId === versionId);
      if (version) return version;
    }
    
    return null;
  }
  
  // Get the latest version for a file
  getLatestVersion(fileId) {
    const versions = this.getVersions(fileId);
    if (versions.length === 0) return null;
    
    return versions[versions.length - 1];
  }
  
  // Compare two versions and generate a diff
  compareVersions(versionId1, versionId2) {
    const version1 = this.getVersion(versionId1);
    const version2 = this.getVersion(versionId2);
    
    if (!version1 || !version2) {
      throw new Error('One or both version IDs are invalid');
    }
    
    // In a real app, this would use a diff algorithm
    // For now, we'll just return basic metadata
    return {
      version1: {
        versionId: version1.versionId,
        timestamp: version1.timestamp,
        metadata: version1.metadata
      },
      version2: {
        versionId: version2.versionId,
        timestamp: version2.timestamp,
        metadata: version2.metadata
      },
      // Basic diff stats (in a real app, use an actual diff algorithm)
      diffStats: {
        addedLines: 'Not implemented',
        removedLines: 'Not implemented',
        changedLines: 'Not implemented'
      }
    };
  }
}

// Class for managing version history across all projects
class VersionManager {
  constructor() {
    this.versionHistory = new VersionHistory();
    this.loadHistory();
  }
  
  // Load version history from localStorage
  loadHistory() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedHistory = localStorage.getItem('grantcraft_version_history');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          this.versionHistory.versions = parsedHistory.versions || {};
        } catch (error) {
          console.error('Error loading version history:', error);
          this.versionHistory = new VersionHistory();
        }
      }
    }
  }
  
  // Save version history to localStorage
  saveHistory() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('grantcraft_version_history', JSON.stringify({
        versions: this.versionHistory.versions
      }));
    }
  }
  
  // Create a new version
  createVersion(fileId, content, metadata = {}) {
    const newVersion = this.versionHistory.addVersion(fileId, content, metadata);
    this.saveHistory();
    return newVersion;
  }
  
  // Get all versions for a file
  getFileVersions(fileId) {
    return this.versionHistory.getVersions(fileId);
  }
  
  // Get a specific version
  getVersion(versionId) {
    return this.versionHistory.getVersion(versionId);
  }
  
  // Compare two versions
  compareVersions(versionId1, versionId2) {
    return this.versionHistory.compareVersions(versionId1, versionId2);
  }
  
  // Get the latest version for a file
  getLatestVersion(fileId) {
    return this.versionHistory.getLatestVersion(fileId);
  }
}

export { VersionHistory, VersionManager };