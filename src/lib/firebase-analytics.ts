type AnalyticsValue = string | number | boolean | undefined;
type Gtag = (
  command: "config" | "event",
  target: string,
  params?: Record<string, AnalyticsValue>,
) => void;

declare global {
  interface Window {
    dataLayer?: Array<unknown>;
    gtag?: Gtag;
  }
}

const MEASUREMENT_ID = "G-GC77D3R38Q";
let analyticsPromise: Promise<boolean> | null = null;

function installGtag() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (window.gtag) return true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = ((...args: unknown[]) => {
    window.dataLayer?.push(args);
  }) as Gtag;

  if (!document.querySelector(`script[data-turavia-analytics="${MEASUREMENT_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.dataset["turaviaAnalytics"] = MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
  return true;
}

export function isFirebaseAnalyticsConfigured() {
  return typeof window !== "undefined";
}

export function initializeFirebaseAnalytics() {
  if (!analyticsPromise) analyticsPromise = Promise.resolve(installGtag());
  return analyticsPromise;
}

export async function trackPageView(path: string) {
  if (!(await initializeFirebaseAnalytics()) || !window.gtag) return;
  const pageUrl = new URL(path, window.location.origin);
  window.gtag("event", "page_view", {
    page_path: `${pageUrl.pathname}${pageUrl.search}${pageUrl.hash}`,
    page_location: pageUrl.href,
    page_title: document.title,
  });
}

export async function trackAnalyticsEvent(
  eventName: string,
  params: Record<string, AnalyticsValue> = {},
) {
  if (!(await initializeFirebaseAnalytics()) || !window.gtag) return;
  window.gtag("event", eventName, params);
}
