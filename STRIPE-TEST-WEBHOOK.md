# Stripe en modo prueba, Checkout y webhooks

La aplicación cliente no recibe ni almacena `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ni la cuenta de servicio de Firebase. Las claves secretas solo viven en el servidor. Las variables con prefijo `VITE_` son públicas.

## Variables locales

```bash
cp .env.example .env.local
```

Configura `.env.local` con claves de prueba y una cuenta de servicio de Firebase con permiso para actualizar Firestore:

```dotenv
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_PORT=8787
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_WEB_API_KEY=your-firebase-web-api-key
FIREBASE_SERVICE_ACCOUNT_JSON={"client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"}
```

No publiques `.env.local`, una clave `sk_...`, `whsec_...` ni `FIREBASE_SERVICE_ACCOUNT_JSON`. El archivo `.gitignore` excluye los archivos `.env.*` excepto `.env.example`.

## Endpoints backend

El servidor de la app expone:

- `GET /api/stripe/health`: comprueba que el módulo esté disponible.
- `POST /api/stripe/create-checkout-session`: exige un Firebase ID token en `Authorization: Bearer ...`, valida usuario, tour, reserva, moneda y monto; luego crea una sesión de Stripe Checkout con metadata `bookingId` y `userId`.
- `POST /api/stripe/webhook`: verifica la firma `Stripe-Signature` sobre el cuerpo crudo y procesa `checkout.session.completed` o `payment_intent.succeeded`.

Cuando el webhook confirma el pago, actualiza en Firestore únicamente los campos de pago de la reserva:

- `status: "paid"`
- `stripeCheckoutSessionId`
- `stripePaymentIntentId`
- `receiptUrl`
- `paidAt`

La reserva nunca se marca como pagada por una redirección del navegador.

## Probar localmente con Stripe CLI

Instala Stripe CLI desde la documentación oficial de Stripe e inicia sesión:

```bash
stripe login
```

Inicia la app y escucha eventos:

```bash
npm run dev
stripe listen --forward-to http://127.0.0.1:4173/api/stripe/webhook
```

Stripe CLI mostrará un `whsec_...` temporal. Colócalo como `STRIPE_WEBHOOK_SECRET` y reinicia la app.

Comprueba salud:

```bash
curl http://127.0.0.1:4173/api/stripe/health
```

Genera un evento de prueba:

```bash
stripe trigger checkout.session.completed
```

Para probar el receptor aislado anterior:

```bash
npm run stripe:webhook
curl http://127.0.0.1:8787/health
```

## Flujo de reserva con tarjeta

1. El cliente inicia sesión en Firebase.
2. El servidor valida el Firebase ID token.
3. El servidor crea Checkout con `STRIPE_SECRET_KEY` y metadata de la reserva.
4. Stripe procesa la tarjeta en su dominio seguro.
5. Stripe envía el webhook firmado.
6. El servidor verifica el webhook y actualiza Firestore a `paid`.
7. Se obtiene el comprobante de Stripe y se asocia a la reserva.
8. Solo después de la confirmación se puede enviar la reserva y el comprobante por WhatsApp.

El endpoint no acepta montos negativos, monedas arbitrarias ni reservas sin identificador. Para producción se recomienda mover `FIREBASE_SERVICE_ACCOUNT_JSON` a un secret manager y hacer la actualización de Firestore idempotente por `stripePaymentIntentId`.
