<<<<<<< HEAD
// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { initializeApp } from "firebase/app";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvufoIIH8Xg6gKICyNziLGrHFTGyYkjDg",
    authDomain: "mobiluygapp.firebaseapp.com",
    projectId: "mobiluygapp",
    storageBucket: "mobiluygapp.firebasestorage.app",
    messagingSenderId: "947510277550",
    appId: "1:947510277550:web:50d2f38006edec774d443f",
    measurementId: "G-H3CN8BK9NH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);

export default app;
=======
// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { initializeApp } from "firebase/app";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvufoIIH8Xg6gKICyNziLGrHFTGyYkjDg",
    authDomain: "mobiluygapp.firebaseapp.com",
    projectId: "mobiluygapp",
    storageBucket: "mobiluygapp.firebasestorage.app",
    messagingSenderId: "947510277550",
    appId: "1:947510277550:web:50d2f38006edec774d443f",
    measurementId: "G-H3CN8BK9NH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);

export default app;
>>>>>>> cca89c45a037c579b667388482c20e10203ec6c5
