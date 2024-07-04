import admin from 'firebase-admin';

// Check if there's already an instance, to avoid initializing multiple times
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: "https://your-project-id.firebaseio.com"
  });
}

const db = admin.firestore();

export { db };
