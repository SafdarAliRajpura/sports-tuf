import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  inMemoryPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Removed AsyncStorage import as it is no longer used

// Your verified Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlgpQoXCaESr0zYKtIzdIlgToEDplBtvE",
  authDomain: "arenapro-ahmedabad.firebaseapp.com",
  projectId: "arenapro-ahmedabad",
  storageBucket: "arenapro-ahmedabad.firebasestorage.app",
  messagingSenderId: "96272879432",
  appId: "1:96272879432:web:4e6790fc31a700ff5f6d7d"
};

// 1. Initialize the Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with In-Memory Persistence
// This means the user session is lost when the app is closed/reloaded
export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence
});

// 3. Initialize Firestore Database
export const db = getFirestore(app);