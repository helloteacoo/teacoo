import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// 確保環境變數存在
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) throw new Error('Missing Firebase API Key');
if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) throw new Error('Missing Firebase Auth Domain');
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) throw new Error('Missing Firebase Project ID');
if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) throw new Error('Missing Firebase Storage Bucket');
if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) throw new Error('Missing Firebase Messaging Sender ID');
if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) throw new Error('Missing Firebase App ID');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 初始化 Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage }; 