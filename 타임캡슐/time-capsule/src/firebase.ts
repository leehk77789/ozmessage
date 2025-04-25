import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwEf8Dt2SP5tPuk80fHEUh6nCcLhJhkAA",
  authDomain: "oz-6month-message.firebaseapp.com",
  projectId: "oz-6month-message",
  storageBucket: "oz-6month-message.firebasestorage.app",
  messagingSenderId: "292547814681",
  appId: "1:292547814681:web:e24c6a2aaa9cdea9345188",
  measurementId: "G-KFCNDTY8PD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 