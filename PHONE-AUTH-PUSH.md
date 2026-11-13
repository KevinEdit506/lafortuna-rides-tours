# Pantalla push de verificación telefónica para clientes

Esta implementación está pensada para `lafortuna-clone`. La pantalla aparece como una vista independiente dentro de la app, usa `pushState`, tiene botón atrás, utiliza Firebase Phone Auth con reCAPTCHA y permite vincular el teléfono a un cliente que ya inició sesión por correo.

## 1. Módulo Firebase Phone Auth

Crear `src/lib/firebase-phone-auth.ts`:

```ts
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  linkWithPhoneNumber,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
};

function getFirebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function createPhoneRecaptcha(containerId: string) {
  return new RecaptchaVerifier(getFirebaseAuth(), containerId, {
    size: "invisible",
    "expired-callback": () => undefined,
  });
}

export function sendPhoneVerificationCode(
  phoneNumber: string,
  verifier: RecaptchaVerifier,
  existingUser?: User | null,
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  const normalizedPhone = phoneNumber.trim();

  if (existingUser) {
    return linkWithPhoneNumber(existingUser, normalizedPhone, verifier);
  }

  return signInWithPhoneNumber(auth, normalizedPhone, verifier);
}

export async function confirmPhoneVerificationCode(
  confirmation: ConfirmationResult,
  code: string,
) {
  return confirmation.confirm(code.trim());
}

export function clearPhoneRecaptcha(verifier: RecaptchaVerifier | null) {
  verifier?.clear();
}
```

## 2. Pantalla independiente de verificación

Crear `src/components/PhoneVerificationScreen.tsx`:

```tsx
import { ArrowLeft, CheckCircle2, LoaderCircle, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ConfirmationResult, RecaptchaVerifier, User } from "firebase/auth";
import {
  clearPhoneRecaptcha,
  confirmPhoneVerificationCode,
  createPhoneRecaptcha,
  sendPhoneVerificationCode,
} from "../lib/firebase-phone-auth";

type PhoneVerificationScreenProps = {
  user: User | null;
  language: "es" | "en";
  onBack: () => void;
  onVerified: (user: User) => void;
};

export function PhoneVerificationScreen({
  user,
  language,
  onBack,
  onVerified,
}: PhoneVerificationScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState("+506 ");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaId = "phone-auth-recaptcha";

  const isSpanish = language === "es";

  useEffect(() => {
    return () => {
      clearPhoneRecaptcha(verifierRef.current);
      verifierRef.current = null;
    };
  }, []);

  const sendCode = async () => {
    setError("");

    if (!/^\+\d{8,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
      setError(
        isSpanish
          ? "Escribe un número internacional válido, por ejemplo +506 8888 8888."
          : "Enter a valid international number, for example +506 8888 8888.",
      );
      return;
    }

    setSubmitting(true);
    try {
      verifierRef.current ??= createPhoneRecaptcha(recaptchaId);
      const result = await sendPhoneVerificationCode(
        phoneNumber.replace(/\s/g, ""),
        verifierRef.current,
        user,
      );
      setConfirmation(result);
    } catch {
      clearPhoneRecaptcha(verifierRef.current);
      verifierRef.current = null;
      setError(
        isSpanish
          ? "No se pudo enviar el SMS. Revisa el número e inténtalo de nuevo."
          : "The SMS could not be sent. Check the number and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmation || verificationCode.trim().length < 6) return;
    setError("");
    setSubmitting(true);

    try {
      const credential = await confirmPhoneVerificationCode(confirmation, verificationCode);
      setSuccess(true);
      onVerified(credential.user);
    } catch {
      setError(
        isSpanish
          ? "El código no es válido o ya expiró. Solicita uno nuevo."
          : "The code is invalid or expired. Request a new one.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="fixed inset-0 z-[60] overflow-y-auto bg-background px-4 pb-10 pt-4 text-foreground sm:px-8 sm:pt-8">
      <section className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-lg rounded-[30px] bg-surface p-5 shadow-xl ring-1 ring-border sm:min-h-[calc(100vh-4rem)] sm:p-8">
        <header className="flex items-center gap-3 border-b border-border pb-5">
          <button
            type="button"
            onClick={onBack}
            aria-label={isSpanish ? "Volver" : "Go back"}
            className="grid size-10 place-items-center rounded-full bg-background ring-1 ring-border transition-transform active:scale-95"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-leaf-ink">
              {isSpanish ? "Cuenta segura" : "Secure account"}
            </p>
            <h1 className="font-display text-2xl font-bold">
              {isSpanish ? "Verifica tu teléfono" : "Verify your phone"}
            </h1>
          </div>
        </header>

        <div className="mt-6 rounded-2xl bg-leaf/10 p-4 ring-1 ring-leaf/20">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-leaf-ink" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isSpanish
                ? "Necesitamos verificar tu número antes de continuar con el pago con tarjeta. No almacenamos datos de tarjeta en Via La Fortuna."
                : "We need to verify your number before continuing with card payment. Via La Fortuna does not store card details."}
            </p>
          </div>
        </div>

        {!confirmation ? (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              {isSpanish ? "Número telefónico" : "Phone number"}
              <div className="relative mt-2">
                <Phone className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="+506 8888 8888"
                  className="w-full rounded-2xl bg-background py-3 pl-10 pr-3 ring-1 ring-border outline-none focus:ring-2 focus:ring-leaf"
                />
              </div>
            </label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isSpanish
                ? "Recibirás un código por SMS. Pueden aplicar cargos de tu operador móvil."
                : "You will receive an SMS code. Your mobile carrier may charge standard rates."}
            </p>
            <button
              type="button"
              id="phone-send-code"
              disabled={submitting}
              onClick={() => void sendCode()}
              className="w-full rounded-2xl bg-leaf py-3.5 text-sm font-bold text-leaf-foreground disabled:opacity-60"
            >
              {submitting ? <LoaderCircle className="mx-auto size-5 animate-spin" /> : isSpanish ? "Enviar código SMS" : "Send SMS code"}
            </button>
            <div id={recaptchaId} />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isSpanish
                ? `Enviamos un código a ${phoneNumber}.`
                : `We sent a code to ${phoneNumber}.`}
            </p>
            <label className="block text-sm font-semibold">
              {isSpanish ? "Código de verificación" : "Verification code"}
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                className="mt-2 w-full rounded-2xl bg-background px-3 py-3 text-center text-xl tracking-[0.4em] ring-1 ring-border outline-none focus:ring-2 focus:ring-leaf"
              />
            </label>
            <button
              type="button"
              disabled={submitting || verificationCode.length < 6}
              onClick={() => void verifyCode()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-3.5 text-sm font-bold text-leaf-foreground disabled:opacity-60"
            >
              {submitting ? <LoaderCircle className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
              {isSpanish ? "Verificar teléfono" : "Verify phone"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmation(null);
                setVerificationCode("");
                setError("");
              }}
              className="w-full text-xs font-bold text-leaf-ink"
            >
              {isSpanish ? "Usar otro número o reenviar" : "Use another number or resend"}
            </button>
          </div>
        )}

        {success && (
          <p className="mt-4 rounded-2xl bg-leaf/15 p-3 text-sm font-semibold text-leaf-ink">
            {isSpanish ? "Teléfono verificado correctamente." : "Phone verified successfully."}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
```

## 3. Integración en `src/routes/index.tsx`

Agregar el import:

```tsx
import { PhoneVerificationScreen } from "../components/PhoneVerificationScreen";
```

Agregar el estado junto a `profileOpen` y `paymentOpen`:

```tsx
const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false);
```

Agregar estas funciones dentro de `Index`, antes del `return`:

```tsx
const openPhoneVerification = () => {
  window.history.pushState({ screen: "phone-verification" }, "", "#verify-phone");
  setPhoneVerificationOpen(true);
};

const closePhoneVerification = () => {
  if (window.location.hash === "#verify-phone") window.history.back();
  else setPhoneVerificationOpen(false);
};

useEffect(() => {
  const handleBack = () => setPhoneVerificationOpen(false);
  window.addEventListener("popstate", handleBack);
  return () => window.removeEventListener("popstate", handleBack);
}, []);
```

En el selector de pago con tarjeta, la acción debe ser:

```tsx
onClick={() => {
  setPaymentMethod("card");
  if (!user) {
    setProfileOpen(true);
    setAuthError(
      language === "es"
        ? "Primero inicia sesión o crea una cuenta. Luego verifica tu teléfono para pagar con tarjeta."
        : "First sign in or create an account. Then verify your phone to pay by card.",
    );
    return;
  }
  openPhoneVerification();
}}
```

En `confirmTransferBooking`, sustituir el bloqueo de tarjeta por:

```tsx
if (paymentMethod === "card") {
  if (!user) {
    setProfileOpen(true);
    setAuthError(
      language === "es"
        ? "Para pagar con tarjeta debes iniciar sesión o crear una cuenta."
        : "You must sign in or create an account to pay by card.",
    );
    return;
  }

  if (!user.phoneNumber) {
    openPhoneVerification();
    return;
  }

  setPaymentOpen(true);
  return;
}
```

Antes del `return` principal, o inmediatamente dentro del fragmento raíz, renderizar la pantalla push:

```tsx
{phoneVerificationOpen && (
  <PhoneVerificationScreen
    user={user}
    language={language}
    onBack={closePhoneVerification}
    onVerified={() => {
      closePhoneVerification();
      setPaymentOpen(true);
    }}
  />
)}
```

## 4. Regla Firestore para tarjeta

La verificación telefónica de Firebase deja el número en el token de autenticación. Las reglas pueden exigirlo para reservas con tarjeta:

```firestore
match /bookings/{bookingId} {
  allow create: if (
    request.resource.data.paymentMethod == "cash"
    && !("userId" in request.resource.data)
  ) || (
    request.resource.data.paymentMethod == "card"
    && request.auth != null
    && request.resource.data.userId == request.auth.uid
    && request.auth.token.phone_number != null
  );

  allow read, update, delete: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "driver";
}
```

## 5. Configuración obligatoria en Firebase Console

1. Activar **Authentication → Sign-in method → Phone**.
2. En **Authentication → Settings → SMS region policy**, permitir Costa Rica.
3. Agregar el dominio publicado en **Authorized domains**.
4. Usar HTTPS para la prueba desplegada.
5. No colocar claves privadas ni credenciales de servicio en el cliente.

## 6. Validación

```bash
cd /home/ubuntu/lafortuna-clone
npx prettier --write src/components/PhoneVerificationScreen.tsx src/lib/firebase-phone-auth.ts src/routes/index.tsx
npm run lint
npm run typecheck
npm run build
```

Esta pantalla verifica identidad telefónica, pero no procesa tarjetas. El pago real debe continuar con Stripe Checkout o Stripe Payment Element mediante backend y webhook. La clave secreta de Stripe nunca debe estar en una variable `VITE_*`.
