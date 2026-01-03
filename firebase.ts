// Using modular SDK imports which are the standard for Firebase v9+
// Re-affirming the modular import for initializeApp from 'firebase/app'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDZzaEIK1WDH26HZYUiLQrlxUhaoKBNywo",
  authDomain: "gen-lang-client-0352129508.firebaseapp.com",
  projectId: "gen-lang-client-0352129508",
  storageBucket: "gen-lang-client-0352129508.firebasestorage.app",
  messagingSenderId: "330779648207",
  appId: "1:330779648207:web:785c23b09285b3abc617ba",
  measurementId: "G-LE4873R9JD"
};

// Initialize Firebase with modular SDK
// The initializeApp function is the core entry point for the Firebase modular SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);