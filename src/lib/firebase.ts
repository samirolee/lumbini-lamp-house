import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCmqf3C7EPEpM5vy5raZ1GjCBPYnRzG-dc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mero-maya-florals.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mero-maya-florals',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mero-maya-florals.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '954064560203',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:954064560203:web:fea84f199e09fc78beedce',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
