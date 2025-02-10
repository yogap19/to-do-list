import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAWwkIx-S1oVpa7XoB3KHlMgTb23Pt8470',
  authDomain: 'to-do-list-f25b4.firebaseapp.com',
  projectId: 'to-do-list-f25b4',
  storageBucket: 'to-do-list-f25b4.firebasestorage.app',
  messagingSenderId: '510549940404',
  appId: '1:510549940404:web:891fa3bc29df9345ae9fe1',
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
