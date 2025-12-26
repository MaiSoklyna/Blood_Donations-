import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

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
    const firebaseToken = await result.user.getIdToken(true);
    
    console.log('✅ Firebase login successful');
    console.log('📧 Email:', result.user.email);
    
    // Step 2: Try to exchange Firebase token for APP JWT
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebaseToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend response:', data);
        
        const token = data.token;
        const user = data.user;
        const profile_completed = data.profile_completed;
        
        if (token) {
          localStorage.setItem('app_token', token);
          localStorage.setItem('firebase_token', firebaseToken);
          localStorage.setItem('user_data', JSON.stringify(user));
          localStorage.setItem('profile_completed', String(profile_completed));
          
          console.log('✅ APP JWT saved');
          console.log('👤 User role:', user?.role);
          
          return { 
            user: result.user, 
            appToken: token, 
            backendUser: user,
            profileCompleted: profile_completed 
          };
        }
      }
      
      // If response not ok, log and continue to fallback
      console.warn('⚠️ Backend returned error, using Firebase token');
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable:', backendError.message);
    }
    
    // Fallback: Save Firebase token directly
    localStorage.setItem('app_token', firebaseToken);
    localStorage.setItem('firebase_token', firebaseToken);
    localStorage.setItem('user_data', JSON.stringify({
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid,
      role: 'user',
    }));
    
    console.log('✅ Using Firebase token as fallback');
    
    return { 
      user: result.user, 
      appToken: firebaseToken,
      backendUser: { 
        email: result.user.email, 
        displayName: result.user.displayName,
        role: 'user' 
      },
      profileCompleted: true
    };
  } catch (error) {
    console.error('❌ Login error:', error);
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