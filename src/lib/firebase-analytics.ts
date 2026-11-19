import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyDsEQWf9w4yeodOGrMBiYeLSSvRIH_UltU",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "turavia-8109f.firebaseapp.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "turavia-8109f",
  storageBucket:
    import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "turavia-8109f.firebasestorage.app",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "1091366572922",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:1091366572922:web:94de368a610d67af64bcc3",
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] || "G-GC77D3R38Q",
};

let analyticsPromise: Promise<Analytics | null> | null = null;

export function isFirebaseAnalyticsConfigured() {
  return Boolean(
    typeof window !== "undefined" &&
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.measurementId,
  );
}

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function initializeFirebaseAnalytics() {
  if (!isFirebaseAnalyticsConfigured()) return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(getFirebaseApp()) : null))
      .catch(() => null);
  }
  return analyticsPromise;
}

export async function trackPageView(path: string) {
  const analytics = await initializeFirebaseAnalytics();
  if (!analytics) return;
  const pageUrl = new URL(path, window.location.origin);
  logEvent(analytics, "page_view", {
    page_path: `${pageUrl.pathname}${pageUrl.search}${pageUrl.hash}`,
    page_location: pageUrl.href,
    page_title: document.title,
  });
}

export async function trackAnalyticsEvent(
  eventName: string,
  params: Record<string, string | number | boolean | undefined> = {},
) {
  const analytics = await initializeFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}
