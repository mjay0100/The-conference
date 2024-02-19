// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: "conference-web-app-a7607.firebaseapp.com",
  projectId: "conference-web-app-a7607",
  storageBucket: "conference-web-app-a7607.appspot.com",
  messagingSenderId: "901771822328",
  appId: "1:901771822328:web:1bfa3be6687d8a82cfa70d",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
export { database, storage, ref, auth, googleProvider };
