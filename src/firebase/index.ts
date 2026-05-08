
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  // Garantir que a inicialização ocorra apenas no cliente para evitar erros de SSR com chaves de API
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let firestore: Firestore;
  try {
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (e) {
    firestore = getFirestore(app);
  }
  
  const auth = getAuth(app);
  return { app, firestore, auth };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
