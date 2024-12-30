// userUtils.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Kullanıcıları alıp konsola yazdıran fonksiyon.
 */
export const getUsers = async() => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    } catch (error) {
        console.error("Error getting users: ", error);
    }
};