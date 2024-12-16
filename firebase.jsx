// Import the functions you need from the SDKs you need
import * as firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}

const auth = firebase.auth()

export { auth };