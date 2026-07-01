import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if credentials are set and are not placeholder strings
export const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'YOUR_FIREBASE_API_KEY' &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

let app: any = null;
let auth: any = null;
let db: any = null;
let messaging: any = null;
let analytics: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Analytics is only supported in browser environments
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    
    // Messaging may fail if notifications are blocked or running on unsupported browser
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { app, auth, db, messaging, analytics, GoogleAuthProvider };
export const googleProvider = new GoogleAuthProvider();
