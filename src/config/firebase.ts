import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4wa5tOCR8D0R0kZVZJxWuv4aCLyVwu_s",
  authDomain: "fitup-491d6.firebaseapp.com",
  projectId: "fitup-491d6",
  storageBucket: "fitup-491d6.firebasestorage.app",
  messagingSenderId: "741684257944",
  appId: "1:741684257944:web:c8610e8521efc45a74dced"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;