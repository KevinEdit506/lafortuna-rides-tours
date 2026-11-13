# Cuentas de cliente y conductor

La app principal es para clientes. El registro usa Firebase Authentication y crea automáticamente `users/{UID}` con `role: "client"`. El segundo proyecto es el panel de conductor y usa `role: "driver"`.

En Firebase Console habilita Email/Password y configura las variables `VITE_FIREBASE_*` en ambos proyectos. Las reglas de Firestore permiten a clientes crear sus propias reservas y a conductores autorizados consultar y gestionar la operación.
