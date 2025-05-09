import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAj03NvNvFF1UIO-u9sOUSQlHfBtw_sFEQ",
  authDomain: "cobconnectapp.firebaseapp.com",
  projectId: "cobconnectapp",
  storageBucket: "cobconnectapp.appspot.com",
  messagingSenderId: "1023680543587",
  appId: "1:1023680543587:web:076e3958a0f89c1ed0f156"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;