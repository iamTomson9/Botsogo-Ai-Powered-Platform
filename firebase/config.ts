import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCeCLiM_tJ9XAVXC_frNww6Dkbepz1Shc",
  authDomain: "ai-hcp267.firebaseapp.com",
  projectId: "ai-hcp267",
  storageBucket: "ai-hcp267.firebasestorage.app",
  messagingSenderId: "215351716227",
  appId: "1:215351716227:web:ad06aaef7d35542908eeb6",
};

// Prevent re-initialization during hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use initializeAuth with AsyncStorage persistence so login survives app restarts
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Already initialized (hot reload)
  auth = getAuth(app);
}

export { app, auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
