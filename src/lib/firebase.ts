import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Emulator support
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  const authPort = import.meta.env.VITE_AUTH_EMULATOR || 9099;
  const firestorePort = parseInt(import.meta.env.VITE_FIRESTORE_EMULATOR || "8080");
  const storagePort = parseInt(import.meta.env.VITE_STORAGE_EMULATOR || "9199");

  connectAuthEmulator(auth, `http://localhost:${authPort}`);
  connectFirestoreEmulator(db, "localhost", firestorePort);
  connectStorageEmulator(storage, "localhost", storagePort);
}

export default app;
