// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// SUBSTITUA ESTES VALORES PELAS SUAS CHAVES DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAJhBxpJbSMPfoBz0UZLkXFPJdy-sHckps",
    authDomain: "crm-lojinha.firebaseapp.com",
    projectId: "crm-lojinha",
    storageBucket: "crm-lojinha.firebasestorage.app",
    messagingSenderId: "550296080969",
    appId: "1:550296080969:web:ffc809b0bcc81d66842598"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

