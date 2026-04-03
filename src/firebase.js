import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLkXYfq97Qu9WL13_r74hSAKCoTab4pzc",
  authDomain: "vocab-app-c6a1f.firebaseapp.com",
  projectId: "vocab-app-c6a1f",
  storageBucket: "vocab-app-c6a1f.firebasestorage.app",
  messagingSenderId: "643572201778",
  appId: "1:643572201778:web:e1e23bfd6b4a591643bf2b",
  measurementId: "G-30ZB1W01QT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);