// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  getFirestore,
  Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Track if we've initialized with our custom settings
let firestoreInstance: Firestore | null = null;

// Initialize Firestore with persistence for offline support
// Only initialize with persistence on client side
function getFirestoreInstance(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  if (typeof window === "undefined") {
    // Server-side: use basic Firestore
    firestoreInstance = getFirestore(firebaseApp);
    return firestoreInstance;
  }

  try {
    // Client-side: initialize with persistence and long polling
    // experimentalAutoDetectLongPolling handles connection issues better
    firestoreInstance = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache(),
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    // If already initialized, get existing instance
    // This can happen during hot reload or if another module initialized first
    firestoreInstance = getFirestore(firebaseApp);
  }

  return firestoreInstance;
}

export const firestore = getFirestoreInstance();

// Handle expected Firestore connection errors in the browser
// These happen during normal operation (tab switches, network changes, etc.)
// and are recovered automatically by the SDK
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const message = event.message || event.error?.message || "";
    if (
      message.includes("Connection closed") ||
      message.includes("QUIC_PROTOCOL_ERROR") ||
      message.includes("WebChannel")
    ) {
      // Prevent the error from appearing in console as uncaught
      event.preventDefault();
      console.debug("[Firestore] Connection event suppressed:", message);
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason?.message || String(event.reason) || "";
    if (
      message.includes("Connection closed") ||
      message.includes("QUIC_PROTOCOL_ERROR") ||
      message.includes("WebChannel")
    ) {
      // Prevent the rejection from appearing in console as uncaught
      event.preventDefault();
      console.debug("[Firestore] Connection event suppressed:", message);
    }
  });
}
