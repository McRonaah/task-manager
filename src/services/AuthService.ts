import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import firebase, { auth, db } from '../lib/firebase';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export class AuthService {
  // Sign in user
  static async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Create user (Admin only)
  static async createUser(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<UserData> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    
    const userData: UserData = {
      id: user.uid,
      name,
      email,
      role
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    return userData;
  }

  // Sign out user
  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  // Get current user data
  static async getCurrentUserData(): Promise<UserData | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;
    
    return userDoc.data() as UserData;
  }

  // Get all users (Admin only)
  static async getAllUsers(): Promise<UserData[]> {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as UserData);
  }

  // Update user (Admin only)
  static async updateUser(userId: string, updates: Partial<UserData>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), updates);
  }

  // Delete user (Admin only)
  static async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId));
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}