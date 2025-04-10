/**
 * Shared validation functions for frontend and backend
 */

/**
 * Check if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a password meets minimum requirements (8+ chars, at least 1 number, 1 uppercase, 1 lowercase)
 */
export function isValidPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}

/**
 * Check if a string is a valid project title (non-empty, reasonable length)
 */
export function isValidProjectTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}

/**
 * Check if an ISO date string is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

/**
 * Check if a budget number is valid (positive number)
 */
export function isValidBudget(budget: number): boolean {
  return !isNaN(budget) && budget >= 0;
}

/**
 * Check if a file size is within allowed limits
 */
export function isValidFileSize(sizeInBytes: number, maxSizeInMB: number = 50): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
} 