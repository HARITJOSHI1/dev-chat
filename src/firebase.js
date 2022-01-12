import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { getDatabase, ref, set, push, update, child, onValue, off, onChildAdded, onChildRemoved, remove } from "firebase/database";
import { getStorage, uploadBytesResumable, getDownloadURL, ref as sref } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

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
getAnalytics(app);

const database = {
  getDatabase,
  ref,
  set,
  push,
  update,
  child,
  onValue,
  off,
  onChildAdded,
  onChildRemoved,
  remove
}

const storage = {
  getStorage,
  sref,
  onValue,
  uploadBytesResumable,
  getDownloadURL,
  child
}

const firebase = {
  auth: getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  database,
  storage,
  signOut
}

export default firebase;