type ServerEnv = Record<string, unknown>;

type FirebaseLookup = {
  users?: Array<{ localId?: string; email?: string }>;
};

type CheckoutRequest = {
  bookingId?: string;
  tourName?: string;
  amountCents?: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
};

type StripeCheckoutSession = {
  id: string;
  url?: string | null;
};

type StripePaymentIntent = {
  id?: string;
  latest_charge?: { receipt_url?: string | null } | string | null;
};

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };
const allowedCurrencies = new Set(["crc", "usd"]);

function envValue(env: ServerEnv, key: string): string | undefined {
  const value = env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function base64Url(bytes: ArrayBuffer | Uint8Array): string {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function parseJsonSecret(
  value: string | undefined,
): { client_email: string; private_key: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { client_email?: unknown; private_key?: unknown };
    if (typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string")
      return null;
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  } catch {
    return null;
  }
}

async function signServiceAccountJwt(
  serviceAccount: { client_email: string; private_key: string },
  projectId: string,
) {
  const header = base64Url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const claims = base64Url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
        sub: serviceAccount.client_email,
        project_id: projectId,
      }),
    ),
  );
  const unsigned = `${header}.${claims}`;
  const pem = serviceAccount.private_key.replace(
    /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,
    "",
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    decodeBase64Url(pem) as unknown as BufferSource,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64Url(signature)}`;
}

async function getFirestoreAccessToken(env: ServerEnv, projectId: string) {
  const serviceAccount = parseJsonSecret(envValue(env, "FIREBASE_SERVICE_ACCOUNT_JSON"));
  if (!serviceAccount) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  const assertion = await signServiceAccountJwt(serviceAccount, projectId);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!tokenResponse.ok)
    throw new Error(`Google OAuth token request failed (${tokenResponse.status})`);
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Google OAuth response did not include access_token");
  return token.access_token;
}

async function lookupFirebaseUser(env: ServerEnv, idToken: string) {
  const apiKey = envValue(env, "VITE_FIREBASE_API_KEY") ?? envValue(env, "FIREBASE_WEB_API_KEY");
  if (!apiKey) throw new Error("VITE_FIREBASE_API_KEY is not configured on the server");
  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );
  if (!lookup.ok) throw new Error("Firebase authentication token is invalid or expired");
  const payload = (await lookup.json()) as FirebaseLookup;
  const user = payload.users?.[0];
  if (!user?.localId) throw new Error("Firebase user was not found");
  return { uid: user.localId, email: user.email };
}

async function stripeFetch(env: ServerEnv, path: string, init: RequestInit = {}) {
  const secret = envValue(env, "STRIPE_SECRET_KEY");
  if (!secret || (!secret.startsWith("sk_test_") && !secret.startsWith("sk_live_"))) {
    throw new Error("STRIPE_SECRET_KEY is not configured on the server");
  }
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${secret}`);
  return fetch(`https://api.stripe.com/v1${path}`, { ...init, headers });
}

function getBearerToken(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  return value.startsWith("Bearer ") ? value.slice("Bearer ".length).trim() : "";
}

async function createCheckoutSession(request: Request, env: ServerEnv) {
  const idToken = getBearerToken(request);
  if (!idToken) return response({ error: "Authentication required" }, 401);
  const user = await lookupFirebaseUser(env, idToken);
  const body = (await request.json()) as CheckoutRequest;
  const bookingId = body.bookingId?.trim();
  const tourName = body.tourName?.trim();
  const amountCents = body.amountCents;
  const currency = body.currency?.toLowerCase();
  if (
    !bookingId ||
    !tourName ||
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents < 100 ||
    amountCents > 10_000_000
  ) {
    return response({ error: "bookingId, tourName and a valid amountCents are required" }, 400);
  }
  if (!currency || !allowedCurrencies.has(currency))
    return response({ error: "Unsupported currency" }, 400);
  if (!body.successUrl || !body.cancelUrl)
    return response({ error: "successUrl and cancelUrl are required" }, 400);

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", body.successUrl);
  form.set("cancel_url", body.cancelUrl);
  form.set("client_reference_id", bookingId);
  form.set("customer_email", user.email ?? "");
  form.set("line_items[0][price_data][currency]", currency);
  form.set("line_items[0][price_data][product_data][name]", tourName);
  form.set("line_items[0][price_data][unit_amount]", String(amountCents));
  form.set("line_items[0][quantity]", "1");
  form.set("metadata[bookingId]", bookingId);
  form.set("metadata[userId]", user.uid);
  form.set("metadata[serviceType]", "tour");

  const stripeResponse = await stripeFetch(env, "/checkout/sessions", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const payload = (await stripeResponse.json()) as StripeCheckoutSession & {
    error?: { message?: string };
  };
  if (!stripeResponse.ok || !payload.id || !payload.url) {
    return response(
      { error: payload.error?.message ?? "Stripe could not create the Checkout session" },
      502,
    );
  }
  return response({ sessionId: payload.id, checkoutUrl: payload.url });
}

function parseStripeSignature(header: string) {
  const values = new Map(header.split(",").map((part) => part.split("=", 2) as [string, string]));
  return { timestamp: values.get("t"), signature: values.get("v1") };
}

async function verifyStripeSignature(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const { timestamp, signature } = parseStripeSignature(header);
  if (!timestamp || !signature || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300)
    return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = base64Url(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`)),
  );
  const expectedHex = Array.from(decodeBase64Url(expected), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return expectedHex === signature;
}

function firestoreString(value: string) {
  return { stringValue: value };
}

async function markBookingPaid(env: ServerEnv, bookingId: string, fields: Record<string, string>) {
  const projectId =
    envValue(env, "VITE_FIREBASE_PROJECT_ID") ?? envValue(env, "FIREBASE_PROJECT_ID");
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID is not configured on the server");
  const accessToken = await getFirestoreAccessToken(env, projectId);
  const documentFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, firestoreString(value)]),
  );
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/bookings/${encodeURIComponent(bookingId)}?updateMask.fieldPaths=status&updateMask.fieldPaths=stripeCheckoutSessionId&updateMask.fieldPaths=stripePaymentIntentId&updateMask.fieldPaths=receiptUrl&updateMask.fieldPaths=paidAt`;
  const update = await fetch(url, {
    method: "PATCH",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ fields: documentFields }),
  });
  if (!update.ok) throw new Error(`Firestore paid update failed (${update.status})`);
}

async function retrieveReceiptUrl(env: ServerEnv, paymentIntentId: string) {
  const result = await stripeFetch(
    env,
    `/payment_intents/${encodeURIComponent(paymentIntentId)}?expand[]=latest_charge`,
  );
  if (!result.ok) return "";
  const paymentIntent = (await result.json()) as StripePaymentIntent;
  return typeof paymentIntent.latest_charge === "object" && paymentIntent.latest_charge?.receipt_url
    ? paymentIntent.latest_charge.receipt_url
    : "";
}

async function handleWebhook(request: Request, env: ServerEnv) {
  const secret = envValue(env, "STRIPE_WEBHOOK_SECRET");
  if (!secret) return response({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, 503);
  const rawBody = await request.text();
  if (!(await verifyStripeSignature(rawBody, request.headers.get("stripe-signature"), secret))) {
    return response({ error: "Invalid Stripe signature" }, 400);
  }
  const event = JSON.parse(rawBody) as {
    id?: string;
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  if (event.type !== "checkout.session.completed" && event.type !== "payment_intent.succeeded") {
    return response({ received: true, ignored: true });
  }
  const object = event.data?.object ?? {};
  const metadata = (object["metadata"] ?? {}) as Record<string, string>;
  const bookingId =
    metadata["bookingId"] ??
    (typeof object["client_reference_id"] === "string" ? object["client_reference_id"] : "");
  const paymentIntentId =
    typeof object["payment_intent"] === "string"
      ? object["payment_intent"]
      : typeof object["id"] === "string" && object["id"].startsWith("pi_")
        ? object["id"]
        : "";
  if (!bookingId || !paymentIntentId) return response({ received: true, ignored: true });
  const receiptUrl = await retrieveReceiptUrl(env, paymentIntentId);
  await markBookingPaid(env, bookingId, {
    status: "paid",
    stripeCheckoutSessionId:
      typeof object["id"] === "string" && object["id"].startsWith("cs_") ? object["id"] : "",
    stripePaymentIntentId: paymentIntentId,
    receiptUrl,
    paidAt: new Date().toISOString(),
  });
  return response({ received: true, bookingId, status: "paid", eventId: event.id ?? null });
}

export async function handleStripeRequest(request: Request, env: ServerEnv) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/api/stripe/health") {
    return response({ ok: true, service: "stripe-checkout-and-webhook" });
  }
  if (request.method === "POST" && url.pathname === "/api/stripe/create-checkout-session") {
    try {
      return await createCheckoutSession(request, env);
    } catch (error) {
      console.error(error);
      return response({ error: "Unable to create Checkout session" }, 500);
    }
  }
  if (request.method === "POST" && url.pathname === "/api/stripe/webhook") {
    try {
      return await handleWebhook(request, env);
    } catch (error) {
      console.error(error);
      return response({ error: "Unable to process Stripe webhook" }, 500);
    }
  }
  return null;
}
