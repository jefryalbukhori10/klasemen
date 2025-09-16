// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKUA6pYgkawiuvVXnHe387u-5iyXj5-h8",
  authDomain: "palaan-cup.firebaseapp.com",
  projectId: "palaan-cup",
  storageBucket: "palaan-cup.firebasestorage.app",
  messagingSenderId: "139436706788",
  appId: "1:139436706788:web:7dddb93724ea5b641e15f1",
  measurementId: "G-FMYFXLCJRG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
