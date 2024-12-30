// adminUtils.js
import { doc, updateDoc, where, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Kullanıcıyı admin yapmak için Firestore'daki 'isAdmin' alanını güncelleme fonksiyonu.
 * 
 * @param {string} userId - Admin yapılacak kullanıcının UID'si
 */
export const assignAdmin = async(userId) => {
    try {
        const userRef = doc(db, "users", userId);

        // 'isAdmin' alanını true olarak güncelle
        await updateDoc(userRef, {
            isAdmin: true,
        });

        console.log(`User with UID: ${userId} has been assigned as admin.`);
    } catch (error) {
        console.error("Error assigning admin: ", error);
    }
};



/**
 * Kullanıcının admin olup olmadığını kontrol etme fonksiyonu.
 * 
 * @param {string} documentId - Kullanıcının Firestore'daki belge (document) ID'si
 * @returns {boolean} - Kullanıcının admin olup olmadığını döndürür
 */
export const checkIfAdmin = async (documentId) => {
    try {
        // 'users' koleksiyonunda doküman ID'ye göre sorgu oluşturuyoruz
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("_name_", "==", documentId)); // Firestore'da doküman ID'yi filtreliyoruz
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const isAdmin = userData.isAdmin || false;

            console.log(`Belge ID: ${documentId}, Admin mi? ${isAdmin ? "Evet" : "Hayır"}`);

            return isAdmin; // Admin durumunu döndür
        } else {
            console.log("Belge bulunamadı.");
            return false; // Belge bulunamazsa admin değildir
        }
    } catch (error) {
        console.error("Admin kontrolü sırasında hata oluştu:", error);
        return false; // Hata durumunda false döndür
    }
};
