import { create } from 'zustand';
import { User } from 'firebase/auth';
import authService from '../services/authService';
import apiService from '../services/apiService';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  
  setUser: (user) => {
    set({ user });
    
    // Set the auth token for API calls when user changes
    if (user) {
      user.getIdToken().then(token => {
        apiService.setAuthToken(token);
      });
    } else {
      apiService.setAuthToken(null);
    }
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.signIn(email, password);
      set({ user: result.user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in', 
        loading: false 
      });
    }
  },
  
  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await authService.signInWithGoogle();
      set({ user: result.user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in with Google', 
        loading: false 
      });
    }
  },
  
  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.signUp(email, password);
      set({ user: result.user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign up', 
        loading: false 
      });
    }
  },
  
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await authService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out', 
        loading: false 
      });
    }
  },
  
  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await authService.resetPassword(email);
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reset password', 
        loading: false 
      });
    }
  },
}));

// Initialize auth listener
if (typeof window !== 'undefined') {
  authService.onAuthStateChange((user) => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setLoading(false);
  });
}

export default useAuthStore; 