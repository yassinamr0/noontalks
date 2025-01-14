import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your Firebase API key
  authDomain: "noontalks.firebaseapp.com",
  projectId: "noontalks",
  storageBucket: "noontalks.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
