// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-yWNeu1-9sr8yvzteVDz3Tn4NaC62rjE",
  authDomain: "teacoo.firebaseapp.com",
  projectId: "teacoo",
  storageBucket: "teacoo.firebasestorage.app",
  messagingSenderId: "877060205443",
  appId: "1:877060205443:web:318430a7fa0868c15fe4b6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
