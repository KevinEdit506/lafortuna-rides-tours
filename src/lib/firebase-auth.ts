import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyDsEQWf9w4yeodOGrMBiYeLSSvRIH_UltU",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "turavia-8109f.firebaseapp.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "turavia-8109f",
  storageBucket:
    import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "turavia-8109f.firebasestorage.app",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "1091366572922",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:1091366572922:web:94de368a610d67af64bcc3",
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

async function ensureClientProfile(user: User) {
  const userRef = doc(getFirestore(auth().app), "users", user.uid);
  const existing = await getDoc(userRef);
  await setDoc(
    userRef,
    {
      email: user.email,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      ...(existing.exists() ? {} : { roles: ["client"] }),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
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
  await ensureClientProfile(credential.user);
  return credential;
}

export async function signInUserWithGoogle() {
  const credential = await signInWithPopup(auth(), new GoogleAuthProvider());
  await ensureClientProfile(credential.user);
  return credential;
}

export async function hasDriverRole(user: User) {
  const roleDoc = await getDoc(doc(getFirestore(auth().app), "users", user.uid));
  const configuredDrivers = (import.meta.env["VITE_DRIVER_EMAILS"] ?? "")
    .split(",")
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean);
  const data = roleDoc.data();
  const roles = Array.isArray(data?.["roles"]) ? (data["roles"] as unknown[]) : [];
  return (
    data?.["role"] === "driver" ||
    roles.includes("driver") ||
    configuredDrivers.includes((user.email ?? "").toLowerCase())
  );
}

export async function signInDriver(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth(), email.trim(), password);
  if (!(await hasDriverRole(credential.user))) {
    await signOut(auth());
    throw new Error("DRIVER_ROLE_REQUIRED");
  }
  return credential;
}

export async function signInDriverWithGoogle() {
  const credential = await signInWithPopup(auth(), new GoogleAuthProvider());
  if (!(await hasDriverRole(credential.user))) {
    await signOut(auth());
    throw new Error("DRIVER_ROLE_REQUIRED");
  }
  return credential;
}

let phoneVerifier: RecaptchaVerifier | null = null;

export function getPhoneVerifier(containerId: string) {
  if (!phoneVerifier) {
    phoneVerifier = new RecaptchaVerifier(auth(), containerId, { size: "invisible" });
  }
  return phoneVerifier;
}

export async function sendPhoneCode(
  phoneNumber: string,
  containerId: string,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth(), phoneNumber.trim(), getPhoneVerifier(containerId));
}

export async function confirmPhoneCode(verification: ConfirmationResult, code: string) {
  const credential = await verification.confirm(code.trim());
  await ensureClientProfile(credential.user);
  return credential;
}

export function resetPhoneVerifier() {
  phoneVerifier?.clear();
  phoneVerifier = null;
}

export function signOutUser() {
  return signOut(auth());
}
