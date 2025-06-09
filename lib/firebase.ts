'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-yWNeu1-9sr8yvzteVDz3Tn4NaC62rjE",
  authDomain: "teacoo.firebaseapp.com",
  projectId: "teacoo",
  storageBucket: "teacoo.firebasestorage.app",
  messagingSenderId: "877060205443",
  appId: "1:877060205443:web:318430a7fa0868c15fe4b6"
};

// 初始化 Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); 