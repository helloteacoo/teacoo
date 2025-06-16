import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 檢查環境變數是否都已設定
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    console.error(`Firebase 設定錯誤: ${key} 未設定`);
  }
});

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // 初始化 Firebase
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase 初始化成功');
} catch (error) {
  console.error('Firebase 初始化失敗:', error);
  throw error;
}

export { app, auth, db }; 