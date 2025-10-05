import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This function is intended to be called on the client-side.
// It initializes Firebase if it hasn't been already.
function getClientFirebase() {
  if (getApps().length) {
    return getApp();
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // In a local development environment, connect to the emulators
  if (process.env.NODE_ENV === 'development') {
    // Note: It's important to check if the emulators are actually running
    // before attempting to connect. In a real-world scenario, you might
    // want to use a flag or environment variable to control this.
    // For simplicity, we're assuming they are running if in dev mode.
    // connectAuthEmulator(auth, "http://localhost:9099");
    // connectFirestoreEmulator(db, "localhost", 8080);
  }
  
  return app;
}

// Export a function to get auth and db for client components
export function getClientServices() {
  const app = getClientFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}


// These are re-exported for convenience but getClientServices is preferred
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
