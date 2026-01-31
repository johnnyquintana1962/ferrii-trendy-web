// Firebase Configuration - Ferrii Trendy
// Credenciales de producción configuradas

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAHhSGlhp_PvIqZSByj2lj9HcQSoNfoT0A",
    authDomain: "ferriitrendy.firebaseapp.com",
    projectId: "ferriitrendy",
    storageBucket: "ferriitrendy.firebasestorage.app",
    messagingSenderId: "951711773592",
    appId: "1:951711773592:web:6c7665c83331af67dbf1ed",
    measurementId: "G-LGXS1LBQKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
