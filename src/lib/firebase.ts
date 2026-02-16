import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getRemoteConfig } from "firebase/remote-config";

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
let app: FirebaseApp;

// Prevent multiple initializations during HMR
const globalFire = globalThis as unknown as { _firebaseApp: FirebaseApp | undefined, _emulatorsConnected: boolean | undefined };

if (getApps().length > 0) {
  app = getApp();
} else if (globalFire._firebaseApp) {
  app = globalFire._firebaseApp;
} else {
  app = initializeApp(firebaseConfig);
  globalFire._firebaseApp = app;
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const remoteConfig = typeof window !== 'undefined' ? getRemoteConfig(app) : null;

if (remoteConfig) {
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
  if (import.meta.env.DEV) {
    remoteConfig.settings.minimumFetchIntervalMillis = 0;
  }
}

// Enable App Check (Only once)
if (typeof window !== 'undefined' && !globalFire._emulatorsConnected) {
  const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
  // Initialize if we have a site key OR we are using the emulator (which needs a debug token)
  if (siteKey || import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {

    // Set debug token for localhost/emulator
    if (import.meta.env.DEV) {
      // @ts-expect-error - FIREBASE_APPCHECK_DEBUG_TOKEN is not in globalThis types
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || true;
    }

    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey || 'debug-token'),
      isTokenAutoRefreshEnabled: true,
    });
  }
}

// Emulator support (Only once)
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true" && !globalFire._emulatorsConnected) {
  const authPort = import.meta.env.VITE_AUTH_EMULATOR || 9099;
  const firestorePort = parseInt(import.meta.env.VITE_FIRESTORE_EMULATOR || "8080");
  const storagePort = parseInt(import.meta.env.VITE_STORAGE_EMULATOR || "9199");
  const functionsPort = parseInt(import.meta.env.VITE_FUNCTIONS_EMULATOR || "5001");

  connectAuthEmulator(auth, `http://localhost:${authPort}`);
  // Note: Firestore emulator connection must happen before any Firestore call
  connectFirestoreEmulator(db, "localhost", firestorePort);
  connectStorageEmulator(storage, "localhost", storagePort);
  connectFunctionsEmulator(functions, "localhost", functionsPort);

  globalFire._emulatorsConnected = true;
  console.log("🔥 Firebase Emulators Connected");
}

export default app;
