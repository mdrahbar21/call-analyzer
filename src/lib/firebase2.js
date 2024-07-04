import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = require("../../hooman-a960d-firebase-adminsdk-fqray-a20bbf6370.json");

if (!global._firebaseClientInitialized) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  global._firebaseClientInitialized = true;
}

const db = getFirestore();
const bucket = getStorage().bucket();
const auth = getAuth();

export { db, bucket, auth };
