import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";

export type BookingPayload = {
  serviceType: "transfer" | "tour";
  origin?: string;
  destination?: string;
  tourName?: string;
  rideType?: "private" | "shared";
  passengers?: number;
  paymentMethod?: "card" | "cash";
  timing?: "now" | "schedule";
  scheduleDate?: string;
  scheduleTime?: string;
  fareCrc?: number;
  fareUsd?: number | null;
  distanceKm?: number;
  durationMinutes?: number;
  language: "es" | "en";
};

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
};

function configured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

function firestore() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export async function saveBooking(payload: BookingPayload) {
  if (!configured()) return { ok: false as const, reason: "missing-config" as const };
  const reference = await addDoc(collection(firestore(), "bookings"), {
    ...payload,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return { ok: true as const, id: reference.id };
}
