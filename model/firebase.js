// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2aagWV9vxVf6kqiqvTaoyJOWO_h-bpgc",
  authDomain: "supp-c1e01.firebaseapp.com",
  projectId: "supp-c1e01",
  storageBucket: "supp-c1e01.appspot.com",
  messagingSenderId: "978693849785",
  appId: "1:978693849785:web:dfd8ed67016f11b5475168",
  measurementId: "G-REKKVDD6XK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);