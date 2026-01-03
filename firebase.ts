
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

// 디버그 로그용 전역 선언
declare global {
  interface Window {
    logToScreen: (msg: string, isError?: boolean) => void;
  }
}

let app;
try {
  if (typeof window !== 'undefined' && window.logToScreen) {
    window.logToScreen("Initializing Firebase...");
  }
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined' && window.logToScreen) {
    window.logToScreen("Firebase app initialized.");
  }
} catch (err) {
  const errorMsg = err instanceof Error ? err.message : String(err);
  if (typeof window !== 'undefined' && window.logToScreen) {
    window.logToScreen("Firebase Init Error: " + errorMsg, true);
  }
  throw err;
}

export const db = getFirestore(app);
export const storage = getStorage(app);
