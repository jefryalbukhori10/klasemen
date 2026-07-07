import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCKUA6pYgkawiuvVXnHe387u-5iyXj5-h8',
  authDomain: 'palaan-cup.firebaseapp.com',
  projectId: 'palaan-cup',
  storageBucket: 'palaan-cup.firebasestorage.app',
  messagingSenderId: '139436706788',
  appId: '1:139436706788:web:7dddb93724ea5b641e15f1',
  measurementId: 'G-FMYFXLCJRG',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Analytics only works in supported browser contexts (blocked by some
// adblockers / privacy extensions) — guard it so it never crashes the app.
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app)
  })
  .catch(() => {})
