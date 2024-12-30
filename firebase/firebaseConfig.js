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

export const setAdminRole = async(uid) => {
    try {
        // Firestore'da `users` koleksiyonunda UID'ye sahip bir belge oluştur veya güncelle
        await db.collection("users").doc(uid).set({ role: "admin" }, { merge: true });
        console.log("Admin rolü başarıyla atandı.");
    } catch (error) {
        console.error("Admin rolü atanırken bir hata oluştu:", error);
        throw error;
    }
};

// Kullanıcı rolünü kontrol et
export const getUserRole = async(uid) => {
    try {
        const doc = await db.collection("users").doc(uid).get();
        return doc.exists ? doc.data().role : null;
    } catch (error) {
        console.error("Rol alınırken hata oluştu:", error);
        throw error;
    }
};