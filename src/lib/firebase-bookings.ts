import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";

export type BookingPayload = {
  serviceType: "transfer" | "tour";
  origin?: string;
  destination?: string;
  tourName?: string;
  rideType?: "private" | "shared";
  passengers?: number;
  paymentMethod?: "card" | "cash";
  confirmationMethod?: "cash" | "card" | "whatsapp";
  timing?: "now" | "schedule";
  scheduleDate?: string;
  scheduleTime?: string;
  fareCrc?: number;
  fareUsd?: number | null;
  distanceKm?: number;
  durationMinutes?: number;
  language: "es" | "en";
  userId?: string | undefined;
};

export type DriverBooking = BookingPayload & {
  id: string;
  status?: string;
  createdAt?: { seconds: number } | null;
};

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyDsEQWf9w4yeodOGrMBiYeLSSvRIH_UltU",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "turavia-8109f.firebaseapp.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "turavia-8109f",
  storageBucket:
    import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "turavia-8109f.firebasestorage.app",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "1091366572922",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:1091366572922:web:94de368a610d67af64bcc3",
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
  const { userId, ...bookingData } = payload;
  const reference = await addDoc(collection(firestore(), "bookings"), {
    ...bookingData,
    ...(userId ? { userId } : {}),
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return { ok: true as const, id: reference.id };
}

export function subscribeToBookings(
  onChange: (bookings: DriverBooking[]) => void,
): Unsubscribe | null {
  if (!configured()) return null;
  return onSnapshot(collection(firestore(), "bookings"), (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as DriverBooking));
  });
}
