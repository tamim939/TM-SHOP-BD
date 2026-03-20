import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOl7VidBZbvDswXprNaJm7VzJUnjlua_s",
  authDomain: "tamimbahi-b4202.firebaseapp.com",
  databaseURL: "https://tamimbahi-b4202-default-rtdb.firebaseio.com",
  projectId: "tamimbahi-b4202",
  storageBucket: "tamimbahi-b4202.firebasestorage.app",
  messagingSenderId: "505108929746",
  appId: "1:505108929746:web:9c434352bf2940548ae10b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
