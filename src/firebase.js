import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/auth";
import "firebase/database";
import "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAd_Zr47J8f-UVUyCM0u01zDFJuLnzWJn8",
  authDomain: "devchat-334dc.firebaseapp.com",
  projectId: "devchat-334dc",
  storageBucket: "devchat-334dc.appspot.com",
  messagingSenderId: "557822616181",
  appId: "1:557822616181:web:8625b9f0594c125645ce3c",
  measurementId: "G-H7MDVB1F7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);