import { getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDcUrs1p7H2UeAS8X1oYu-qozpzj-GhM6o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'badminton-fund-7430c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'badminton-fund-7430c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'badminton-fund-7430c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '779132525809',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:779132525809:web:c46b95603cb2f5bba5dd50',
}

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean)
const app = hasFirebaseConfig ? (getApps()[0] || initializeApp(firebaseConfig)) : null

export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
export { hasFirebaseConfig }
