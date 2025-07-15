import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  appId: "1:422578595725:web:20e8318c1d0a0a8994ffc4",
  apiKey: "AIzaSyCrkg8kUh2Pq1mWIifPrEAtSYeEW83Yl7M",
  authDomain: "ask-manager.firebaseapp.com",
  databaseURL: "https://ask-manager-default-rtdb.firebaseio.com",
  projectId: "ask-manager",
  storageBucket: "ask-manager.firebasestorage.app",
  messagingSenderId: "422578595725",
  measurementId: "G-CHGTBW42FY"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;