import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPDZNnWVPCZZjTqPtFtxTGGC_hcG4jRBw",
  authDomain: "horto-medicinal-b0f99.firebaseapp.com",
  projectId: "horto-medicinal-b0f99",
  storageBucket: "horto-medicinal-b0f99.appspot.com",
  messagingSenderId: "1098765432109",
  appId: "1:1098765432109:web:abcdef1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Habilitar persistência offline
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Múltiplas abas abertas, persistência pode operar apenas em uma aba por vez');
    } else if (err.code === 'unimplemented') {
      console.error('O navegador atual não suporta todos os recursos necessários');
    }
  });

export { app, auth, db };