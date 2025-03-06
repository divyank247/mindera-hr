import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCePeGUiC-wmxZhmWH-223UCb1DoSkmRQM",
  authDomain: "hr-portal-38c04.firebaseapp.com",
  projectId: "hr-portal-38c04",
  storageBucket: "hr-portal-38c04.firebasestorage.app",
  messagingSenderId: "356820374031",
  appId: "1:356820374031:web:9be6d45064bad39a27497a",
  measurementId: "G-Y39TLM3LME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db,auth };