import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  });
} catch {
  // Already initialized (e.g. HMR hot reload) — reuse existing instance
  db = getFirestore(app);
}
export { db };

export const storage = getStorage(app);
// export const analytics = getAnalytics(app);

