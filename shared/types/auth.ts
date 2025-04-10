/**
 * Authentication-related type definitions shared between frontend and backend
 */

/**
 * User profile data
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string; // ISO date string
  lastLogin: string; // ISO date string
  settings: UserSettings;
}

/**
 * User settings
 */
export interface UserSettings {
  theme: string;
  notifications: boolean;
}

/**
 * Authentication response with token
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Login request with credentials
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request with user details
 */
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
} 