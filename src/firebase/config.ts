import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCKqz2Xd5DhFulxl1_IRMSPaPQA1VcnGXk',
  authDomain: 'days-challenge-96f21.firebaseapp.com',
  projectId: 'days-challenge-96f21',
  storageBucket: 'days-challenge-96f21.firebasestorage.app',
  messagingSenderId: '112234932793',
  appId: '1:112234932793:web:1130a4046083f0d4b1fbe8',
  measurementId: 'G-VE2VW0KH2K'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Create a Google auth provider
export const googleProvider = new GoogleAuthProvider()

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Storage
export const storage = getStorage(app)

export default app
