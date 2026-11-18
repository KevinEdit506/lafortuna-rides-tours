# Firebase Analytics Web para TuraVía

La web usa Firebase Analytics mediante `VITE_FIREBASE_MEASUREMENT_ID` y registra automáticamente un evento `page_view` al abrir o cambiar de ruta.

## Configuración en Firebase Console

En el proyecto `turavia-8109f`:

1. Abre **Project settings → Your apps → Add app → Web**.
2. Registra una app web para TuraVía Cliente y copia su configuración web.
3. En **Analytics → Data streams → Web**, crea o selecciona el flujo web.
4. Copia el `Measurement ID`, con formato `G-XXXXXXXXXX`.
5. Configura en GitHub Pages y en el entorno de build:

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=turavia-8109f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=turavia-8109f
VITE_FIREBASE_STORAGE_BUCKET=turavia-8109f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1091366572922
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=G-GC77D3R38Q
```

La configuración web no se puede deducir del `google-services.json` Android: ese archivo queda reservado para la futura app nativa `com.turavia.app`.

## Eventos registrados

El helper `src/lib/firebase-analytics.ts` inicializa Analytics solo en navegador y solo cuando existen todas las variables públicas requeridas. Si falta el `measurementId` o el navegador no soporta Analytics, la app continúa funcionando sin bloquear autenticación, reservas o navegación.
