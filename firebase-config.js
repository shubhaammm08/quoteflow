import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5oFi9ltROfsXzhTzO2GkrPFUuGElJCZo",
  authDomain: "quatation-7b312.firebaseapp.com",
  projectId: "quatation-7b312",
  storageBucket: "quatation-7b312.firebasestorage.app",
  messagingSenderId: "135400624262",
  appId: "1:135400624262:web:13b0ef11bf6659373d0107",
  measurementId: "G-J5PM5CW44E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
    console.warn("Firebase offline persistence error:", err.code);
});

export { app, auth, db };
