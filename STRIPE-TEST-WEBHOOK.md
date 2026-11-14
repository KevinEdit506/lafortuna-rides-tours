# Stripe en modo prueba y webhooks locales

La aplicación cliente no debe recibir ni almacenar `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET`. Las claves secretas solo viven en el servidor o en el entorno local del receptor de webhooks. Las variables con prefijo `VITE_` se consideran públicas.

## 1. Crear las claves de prueba

En el Dashboard de Stripe, activa **Test mode** y copia:

- `pk_test_...` como clave pública.
- `sk_test_...` como clave secreta del servidor.

No pegues claves reales en GitHub, en `src/`, en un archivo que no esté ignorado ni en mensajes de chat.

## 2. Configurar el entorno local

Copia la plantilla:

```bash
cp .env.example .env.local
```

Edita `.env.local` y reemplaza únicamente estos valores:

```dotenv
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_PORT=8787
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

`STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` no deben llevar el prefijo `VITE_`.

## 3. Instalar e iniciar Stripe CLI

Instala Stripe CLI desde la documentación oficial de Stripe e inicia sesión:

```bash
stripe login
```

Luego, en una terminal, reenvía los eventos de prueba al receptor local:

```bash
stripe listen --forward-to http://127.0.0.1:8787/api/stripe/webhook
```

Stripe CLI mostrará un secreto temporal `whsec_...`. Colócalo como `STRIPE_WEBHOOK_SECRET` en `.env.local` y reinicia el receptor.

## 4. Iniciar el receptor firmado

```bash
npm run stripe:webhook
```

Comprobar salud:

```bash
curl http://127.0.0.1:8787/health
```

El receptor verifica la firma `Stripe-Signature`, rechaza eventos falsificados o antiguos y solo procesa el cuerpo crudo firmado. Los eventos exitosos reconocidos son:

- `payment_intent.succeeded`
- `checkout.session.completed`

## 5. Enviar un evento de prueba

Con `stripe listen` activo, ejecuta:

```bash
stripe trigger checkout.session.completed
```

En la terminal del receptor debe aparecer el `eventId`, el tipo del evento y el identificador del objeto de Stripe. Un webhook válido responde con HTTP 200; una firma incorrecta responde con HTTP 400.

## Importante para producción

Este receptor local valida firmas y demuestra la ruta de webhook, pero todavía no crea sesiones de Checkout ni cambia una reserva de Firestore a `paid`. Para completar el cobro real se necesita un endpoint de servidor que:

1. Cree una sesión de Stripe Checkout con `STRIPE_SECRET_KEY`.
2. Asocie la sesión a la reserva mediante metadata no sensible.
3. Verifique `checkout.session.completed` en el webhook.
4. Actualice Firestore de forma idempotente a `paid`.
5. Genere el comprobante y lo adjunte a la reserva.
6. Envíe WhatsApp solo después de confirmar el evento exitoso.

Nunca se debe marcar una reserva como pagada basándose solo en el navegador o en una redirección de éxito.
