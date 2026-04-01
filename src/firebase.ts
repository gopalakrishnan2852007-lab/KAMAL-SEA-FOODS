import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuLNZiUCy1R-6i0k2SN4KBdOXyBWJO_QA",
  authDomain: "kamal-sea-foods.firebaseapp.com",
  projectId: "kamal-sea-foods",
  storageBucket: "kamal-sea-foods.firebasestorage.app",
  messagingSenderId: "9802546588",
  appId: "1:9802546588:web:ab55561253804ce7a0dc59",
  measurementId: "G-1N9JYV0WKE"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
