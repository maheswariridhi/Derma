import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBJDXrLKX8Nx4kKo8LWK703gaZ6zSzQjWk",
  authDomain: "patientworkflowmvp.firebaseapp.com",
  projectId: "patientworkflowmvp",
  storageBucket: "patientworkflowmvp.appspot.com",
  messagingSenderId: "375343036097",
  appId: "1:375343036097:web:4a985f92ec073dffcd0640",
  measurementId: "G-5FYEBY5KPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app); 