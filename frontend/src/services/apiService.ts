import authService from './authService';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  
  setAuthToken(token: string | null) {
    this.authToken = token;
  }
  
  private async refreshToken(): Promise<string | null> {
    // This would typically call an endpoint to refresh the token
    // For now, we'll just get the current token from Firebase
    try {
      const user = authService.getCurrentUser();
      if (!user) return null;
      
      const token = await user.getIdToken();
      this.setAuthToken(token);
      return token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
  
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }
  
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;
    
    if (status === 204) {
      return { status };
    }
    
    try {
      const data = await response.json();
      
      if (response.ok) {
        return { data, status };
      } else {
        // Handle token expiration
        if (status === 401) {
          const newToken = await this.refreshToken();
          if (newToken) {
            // Retry the request with the new token
            // This would need to be implemented for each method
          }
        }
        
        return { 
          error: data.message || 'An error occurred',
          status
        };
      }
    } catch (error) {
      return {
        error: 'Failed to parse response',
        status
      };
    }
  }
  
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      if (params) {
        Object.keys(params).forEach(key => {
          url.searchParams.append(key, params[key]);
        });
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`GET error for ${endpoint}:`, error);
      return {
        error: 'Network error',
        status: 0
      };
    }
  }
  
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`POST error for ${endpoint}:`, error);
      return {
        error: 'Network error',
        status: 0
      };
    }
  }
  
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`PUT error for ${endpoint}:`, error);
      return {
        error: 'Network error',
        status: 0
      };
    }
  }
  
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`DELETE error for ${endpoint}:`, error);
      return {
        error: 'Network error',
        status: 0
      };
    }
  }
  
  async uploadFile<T>(endpoint: string, file: File, metadata?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        Object.keys(metadata).forEach(key => {
          formData.append(key, metadata[key]);
        });
      }
      
      const headers: HeadersInit = {};
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Upload error for ${endpoint}:`, error);
      return {
        error: 'Network error',
        status: 0
      };
    }
  }
}

export default new ApiService(); 