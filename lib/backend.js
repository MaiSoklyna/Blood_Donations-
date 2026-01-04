import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { authApi } from './api';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


// Google Sign In + Exchange for APP JWT
export const signInWithGoogle = async () => {
  try {
    // Step 1: Sign in with Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseToken = await result.user.getIdToken(true); // Force refresh
    
    console.log('✅ Firebase login successful');
    console.log('📧 Email:', result.user.email);
    
    // Step 2: Exchange Firebase token for APP JWT
    const response = await authApi.login(firebaseToken);
    console.log('✅ Backend login response:', response);
    
    // Handle response - might be response.data or response directly
    const data = response.data || response;
    const { token, user, profile_completed } = data;
    
    if (!token) {
      throw new Error('No token received from backend');
    }
    
    // Step 3: Save APP JWT
    localStorage.setItem('app_token', token);
    localStorage.setItem('firebase_token', firebaseToken);
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('profile_completed', String(profile_completed));
    
    console.log('✅ APP JWT saved:', token.substring(0, 20) + '...');
    
    return { 
      user: result.user, 
      appToken: token, 
      backendUser: user,
      profileCompleted: profile_completed 
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// Refresh token if needed
export const refreshAppToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Get fresh Firebase token
    const firebaseToken = await user.getIdToken(true);
    
    // Exchange for new APP JWT
    const response = await authApi.login(firebaseToken);
    const data = response.data || response;
    const { token } = data;
    
    if (token) {
      localStorage.setItem('app_token', token);
      localStorage.setItem('firebase_token', firebaseToken);
      console.log('✅ Token refreshed');
      return token;
    }
    
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    throw error;
  }
};

// Sign Out
export const firebaseSignOut = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('app_token');
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('profile_completed');
    console.log('✅ Signed out');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Get APP JWT Token
export const getAppToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('app_token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('app_token');
};

// Get stored user data
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export { auth };