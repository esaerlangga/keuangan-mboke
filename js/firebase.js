import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsDDRvjzPgYjZJG-9zBf0336lXtDO2R0Y",
  authDomain: "mboke-keuangan-db.firebaseapp.com",
  databaseURL:
    "https://mboke-keuangan-db-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mboke-keuangan-db",
  storageBucket: "mboke-keuangan-db.firebasestorage.app",
  messagingSenderId: "358346933301",
  appId: "1:358346933301:web:9ff52c681c5f590a011d7c",
  measurementId: "G-J6474QTETW",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
