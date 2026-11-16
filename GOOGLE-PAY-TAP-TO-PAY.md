# Google Pay y cobros del conductor

## Flujo implementado

1. El conductor inicia sesión con una cuenta cuyo documento `users/{uid}` tiene `role: "driver"`.
2. En **Cobro digital**, selecciona una reserva vinculada a un cliente autenticado, define el monto en colones y crea una solicitud privada.
3. Firestore permite que esa solicitud sea leída únicamente por el `customerId` o el `driverId` asociado.
4. El cliente recibe la solicitud en tiempo real y abre el endpoint seguro de Stripe Checkout con su token de Firebase.
5. Stripe valida nuevamente la propiedad de la reserva y el monto almacenado en la solicitud. El webhook firmado actualiza la reserva y la solicitud a `paid`.
6. Google Pay aparece dentro de Stripe Checkout cuando está habilitado en la cuenta Stripe, el dominio está registrado y el dispositivo/navegador es compatible. Apple Pay puede aparecer en dispositivos compatibles.

## Variables de servidor

El servidor que expone `/api/stripe/create-checkout-session` y `/api/stripe/webhook` debe tener, como mínimo:

- `STRIPE_SECRET_KEY` (modo test durante desarrollo; nunca en `VITE_*`).
- `STRIPE_WEBHOOK_SECRET`.
- `FIREBASE_SERVICE_ACCOUNT_JSON` o las variables equivalentes que ya usa `stripe-server.ts`.
- `FIREBASE_PROJECT_ID`.
- `APP_ORIGIN` con el origen público HTTPS permitido.

Las variables `VITE_FIREBASE_*` solo contienen la configuración pública del SDK web y deben estar configuradas en los builds del cliente y del conductor. No deben contener claves secretas de Stripe ni una cuenta de servicio.

## Activación en Stripe

En Stripe Dashboard, modo test:

1. Activa Google Pay en la configuración de métodos de pago.
2. Registra y verifica el dominio HTTPS real que abrirá Checkout.
3. Configura el endpoint del webhook para `checkout.session.completed`, `payment_intent.succeeded` y `payment_intent.payment_failed`.
4. Usa tarjetas y wallets de prueba de Stripe. No uses datos reales en modo test.

## Tap to Pay del conductor

Tap to Pay directo en el teléfono del conductor **no se implementa dentro de esta aplicación web**. Web NFC no es un terminal de pago y no sustituye Stripe Terminal. Para cobrar acercando una wallet al teléfono del conductor hace falta una aplicación móvil nativa compatible con Stripe Terminal Tap to Pay, un dispositivo compatible, permisos NFC, conexión, onboarding de Stripe Connect y disponibilidad del producto en el país de la cuenta. El panel web muestra esta limitación para no presentar un botón que parezca cobrar cuando no puede hacerlo.

Si se requiere esa modalidad, el siguiente paso correcto es crear una app Android/iOS del conductor con Stripe Terminal SDK y usar el backend actual para crear PaymentIntents con `capture_method: automatic`, conectados a la cuenta del conductor mediante Stripe Connect. El cliente seguiría usando Google Pay/Checkout o el método acordado.
