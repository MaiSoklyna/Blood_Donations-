import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Store confirmation result for OTP verification
let confirmationResultGlobal: ConfirmationResult | null = null;

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// Setup Recaptcha for Phone Auth
export const setupRecaptcha = (containerId: string) => {
  try {
    // Clear existing verifier
    if ((window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier) {
      (window as unknown as { recaptchaVerifier: RecaptchaVerifier }).recaptchaVerifier.clear();
    }
    
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('Recaptcha verified');
      },
      'expired-callback': () => {
        console.log('Recaptcha expired');
      }
    });
    
    (window as unknown as { recaptchaVerifier: RecaptchaVerifier }).recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error('Recaptcha setup error:', error);
    throw error;
  }
};

// Send OTP to Phone
export const sendPhoneOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    // Format phone number for Cambodia (+855)
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
    
    // Add +855 if not present
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+855' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+855' + formattedPhone;
    }
    
    console.log('Sending OTP to:', formattedPhone);
    
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    confirmationResultGlobal = confirmationResult;
    
    return { success: true, formattedPhone };
  } catch (error) {
    console.error('Send OTP error:', error);
    throw error;
  }
};

// Verify OTP Code
export const verifyPhoneOTP = async (otpCode: string) => {
  try {
    if (!confirmationResultGlobal) {
      throw new Error('No confirmation result. Please request OTP again.');
    }
    
    const result = await confirmationResultGlobal.confirm(otpCode);
    const idToken = await result.user.getIdToken();
    
    // Clear confirmation result
    confirmationResultGlobal = null;
    
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

// Sign Out
export const firebaseSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Get ID Token
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export { auth };