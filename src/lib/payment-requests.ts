import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";

export type PaymentRequest = {
  id: string;
  bookingId: string;
  customerId: string;
  driverId: string;
  amountCrc: number;
  currency: "crc";
  note?: string;
  status: "pending" | "paid" | "cancelled";
  createdAt?: { seconds: number } | null;
};

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
};

export function subscribeToPaymentRequests(
  customerId: string,
  onChange: (requests: PaymentRequest[]) => void,
): Unsubscribe | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) return null;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const requestsQuery = query(
    collection(getFirestore(app), "paymentRequests"),
    where("customerId", "==", customerId),
    where("status", "==", "pending"),
  );
  return onSnapshot(requestsQuery, (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as PaymentRequest));
  });
}
