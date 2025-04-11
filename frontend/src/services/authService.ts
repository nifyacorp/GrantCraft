import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  UserCredential
} from "firebase/auth";
import { auth } from "@/lib/firebase";

class AuthService {
  private googleProvider = new GoogleAuthProvider();
  
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }
  
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, this.googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }
  
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }
  
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }
  
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
  
  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No authenticated user");
    
    try {
      await updateProfile(user, { displayName, photoURL });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }
  
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService(); 