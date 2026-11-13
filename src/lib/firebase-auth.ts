import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
};

export function isFirebaseAuthConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
  );
}

function auth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function subscribeToUser(callback: (user: User | null) => void): Unsubscribe | null {
  if (!isFirebaseAuthConfigured()) return null;
  return onAuthStateChanged(auth(), callback);
}

export async function signInUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth(), email.trim(), password);
}

export async function registerUser(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth(), email.trim(), password);
  await setDoc(
    doc(getFirestore(auth().app), "users", credential.user.uid),
    {
      email: credential.user.email,
      role: "client",
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return credential;
}

export function signOutUser() {
  return signOut(auth());
}
