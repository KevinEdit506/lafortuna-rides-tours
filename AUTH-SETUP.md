# Autenticación y roles de TuraVía

La aplicación unificada usa un solo Firebase Authentication y un solo documento `users/{uid}` por persona. Los proveedores previstos son Email/Password, Google y Phone Authentication.

## Perfil compartido

Los perfiles nuevos usan `roles: ["client"]` y `activeRole: "client"`. Un conductor aprobado puede usar `roles: ["client", "driver"]` y cambiar de modo sin cerrar sesión. `activeRole` solo controla la interfaz; las reglas de Firestore autorizan por `roles` y no por ese campo.

Durante la migración se aceptan temporalmente ambos formatos antiguos:

- `role: "client"` o `role: "driver"`
- `roles: ["client"]`, `roles: ["driver"]` o `roles: ["client", "driver"]`

No se deben borrar los documentos existentes ni crear un segundo usuario al cambiar de proveedor de acceso.

## Habilitación en Firebase Console

En el proyecto `turavia-8109f`, habilita en **Authentication → Sign-in method**:

- Email/Password
- Google
- Phone

Agrega como dominios autorizados el dominio de GitHub Pages y el dominio real de Vercel. Después configura las variables `VITE_FIREBASE_*` en GitHub Actions y Vercel.

La lista `VITE_DRIVER_EMAILS` es únicamente un respaldo temporal. La autorización definitiva debe quedar en el documento `users/{uid}` con rol `driver`.

## Reglas y despliegue

El archivo `firebase.json` del repositorio unificado apunta a `firestore.rules`. Para desplegar las reglas desde una cuenta Firebase autenticada:

```bash
firebase use turavia-8109f
firebase deploy --only firestore:rules
```

Las reglas permiten que un cliente autenticado cree reservas de efectivo o tarjeta usando su propio `userId`, que un cliente lea únicamente sus reservas y que un conductor autorizado consulte la operación. El perfil puede actualizar datos básicos, pero no puede modificar `role`, `roles` ni permisos operativos.

## Privacidad

El cliente solo puede leer sus propias reservas mediante `userId`. El conductor solo puede consultar reservas operativas según las reglas de Firestore. `roles`, `role`, `paymentStatus`, `driverId` y los documentos de conductor no se pueden modificar desde el perfil público.
