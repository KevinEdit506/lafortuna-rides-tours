# Reservas compartidas con Firestore

La app cliente guarda reservas en la colección `bookings` de Firebase Firestore. El panel administrativo del repositorio `lafortuna-rides-tours-admin` escucha esa misma colección en tiempo real.

## Variables de GitHub Actions

Configura estos secretos en **ambos repositorios**:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

La app cliente usa esos valores durante el build. El panel administrativo usa los mismos valores para leer las reservas.

## Reglas recomendadas

No publiques Firestore con lectura y escritura abierta. Para producción, habilita Firebase Authentication para el panel administrativo y usa reglas que permitan crear reservas públicas con campos validados, pero restrinjan la lectura a usuarios administrativos autenticados.

Ejemplo conceptual:

```text
match /bookings/{bookingId} {
  allow create: if request.resource.data.serviceType in ["transfer", "tour"];
  allow read, update, delete: if request.auth != null && request.auth.token.admin == true;
}
```

La integración actual no inventa credenciales ni reglas de seguridad. Si Firebase no está configurado, la app muestra un error y conserva WhatsApp como respaldo manual.

## Datos guardados

Cada reserva contiene el tipo de servicio, origen/destino o tour, modalidad, pasajeros, pago, horario, tarifa, distancia, idioma, estado `pending` y `createdAt`.
