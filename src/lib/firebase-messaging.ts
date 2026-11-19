import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyDsEQWf9w4yeodOGrMBiYeLSSvRIH_UltU",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "turavia-8109f.firebaseapp.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "turavia-8109f",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "1091366572922",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:1091366572922:web:94de368a610d67af64bcc3",
};

const vapidKey = import.meta.env["VITE_FIREBASE_VAPID_KEY"] as string | undefined;
const registerEndpoint = import.meta.env["VITE_FCM_REGISTER_ENDPOINT"] as string | undefined;

function isConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey,
  );
}

export async function enableDriverPush(driverId: string) {
  if (!isConfigured() || !(await isSupported())) {
    return { enabled: false, reason: "missing-config" as const };
  }
  if (!vapidKey) return { enabled: false, reason: "missing-config" as const };
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return { enabled: false, reason: "unsupported" as const };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { enabled: false, reason: "denied" as const };

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return { enabled: false, reason: "no-token" as const };

  if (registerEndpoint) {
    await fetch(registerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ driverId, token, userAgent: navigator.userAgent }),
    });
  }

  return { enabled: true, token };
}

export async function listenForForegroundPush(onPush: (title: string, body: string) => void) {
  if (!isConfigured() || !(await isSupported())) return () => undefined;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    onPush(
      payload.notification?.title ?? "TURAVIA",
      payload.notification?.body ?? "Tienes una nueva asignación.",
    );
  });
}
