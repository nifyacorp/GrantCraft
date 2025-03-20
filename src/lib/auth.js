/**
 * Authentication Module
 * 
 * This module handles user authentication, authorization, and session management.
 * In a real application, this would integrate with a backend authentication service.
 */

// Simple mock user database
const MOCK_USERS = [
  {
    id: '1',
    username: 'researcher',
    email: 'researcher@example.com',
    password: 'password123', // In a real app, this would be hashed
    firstName: 'Jane',
    lastName: 'Doe',
    institution: 'Example University',
    role: 'researcher',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    firstName: 'Admin',
    lastName: 'User',
    institution: 'GrantCraft',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00.000Z'
  }
];

// User roles and permissions
const PERMISSIONS = {
  researcher: ['read', 'write', 'create_project', 'delete_own_project'],
  admin: ['read', 'write', 'create_project', 'delete_project', 'manage_users']
};

// AuthService class for handling authentication
class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.sessionKey = 'grantcraft_session';
    
    // Initialize on creation
    this.init();
  }
  
  // Initialize the auth service
  init() {
    if (this.isInitialized) return;
    
    this.loadUserFromSession();
    this.isInitialized = true;
  }
  
  // Load user from session storage
  loadUserFromSession() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const sessionData = localStorage.getItem(this.sessionKey);
        if (sessionData) {
          try {
            const { userId, expiry } = JSON.parse(sessionData);
            
            // Check if session has expired
            if (new Date(expiry) > new Date()) {
              // Find the user in our mock database
              const user = MOCK_USERS.find(u => u.id === userId);
              if (user) {
                // Clone the user object without the password
                this.currentUser = { ...user };
                delete this.currentUser.password;
              }
            } else {
              // Session expired, clear it
              localStorage.removeItem(this.sessionKey);
            }
          } catch (error) {
            console.error('Error loading user session:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }
  
  // Login a user
  login(username, password) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const user = MOCK_USERS.find(
          u => (u.username === username || u.email === username) && u.password === password
        );
        
        if (user) {
          // Create a session (expires in 24 hours)
          const expiry = new Date();
          expiry.setHours(expiry.getHours() + 24);
          
          const session = {
            userId: user.id,
            expiry: expiry.toISOString()
          };
          
          // Save session to localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
          }
          
          // Set the current user (without password)
          this.currentUser = { ...user };
          delete this.currentUser.password;
          
          resolve(this.currentUser);
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500); // Simulate network delay
    });
  }
  
  // Logout the current user
  logout() {
    this.currentUser = null;
    
    // Clear session from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.sessionKey);
    }
    
    return Promise.resolve();
  }
  
  // Register a new user
  register(userData) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Check if username or email already exists
        const existingUser = MOCK_USERS.find(
          u => u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
          reject(new Error('Username or email already exists'));
          return;
        }
        
        // Create a new user
        const newUser = {
          id: Date.now().toString(),
          username: userData.username,
          email: userData.email,
          password: userData.password, // In a real app, this would be hashed
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          institution: userData.institution || '',
          role: 'researcher', // Default role
          createdAt: new Date().toISOString()
        };
        
        // Add to mock database
        MOCK_USERS.push(newUser);
        
        // Login the new user automatically
        this.login(newUser.username, newUser.password)
          .then(user => resolve(user))
          .catch(error => reject(error));
      }, 500); // Simulate network delay
    });
  }
  
  // Get the current user
  getCurrentUser() {
    return this.currentUser;
  }
  
  // Check if a user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }
  
  // Check if the current user has a specific permission
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    const userRole = this.currentUser.role;
    const userPermissions = PERMISSIONS[userRole] || [];
    
    return userPermissions.includes(permission);
  }
  
  // Update user profile
  updateProfile(profileData) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (!this.currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }
        
        // Update the user in the mock database
        const userIndex = MOCK_USERS.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        // Update only allowed fields
        const updatedUser = {
          ...MOCK_USERS[userIndex],
          firstName: profileData.firstName || MOCK_USERS[userIndex].firstName,
          lastName: profileData.lastName || MOCK_USERS[userIndex].lastName,
          institution: profileData.institution || MOCK_USERS[userIndex].institution
        };
        
        // Update in mock database
        MOCK_USERS[userIndex] = updatedUser;
        
        // Update current user
        this.currentUser = { ...updatedUser };
        delete this.currentUser.password;
        
        resolve(this.currentUser);
      }, 500); // Simulate network delay
    });
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;