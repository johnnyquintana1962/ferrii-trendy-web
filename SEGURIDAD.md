# Seguridad — Ferrii Trendy

## Situación
Hoy la base de datos (Firestore) y las fotos (Storage) permiten **escritura sin
login**, y la contraseña del admin (`admin123`) está en el código público.
Esto significa que cualquiera podría modificar o borrar el catálogo.

El plan de blindaje deja la **lectura pública** (para que la tienda se vea) pero
exige un **administrador autenticado (Firebase Auth)** para escribir.

## Lo que YA está preparado en el repo
- `firestore.rules` y `storage.rules` — lectura pública, escritura solo con login.
- `firebase.json` y `.firebaserc` — para desplegar esas reglas.

## Pasos para activarlo (única parte que requiere la consola de Firebase)
> Solo se puede hacer desde tu cuenta de Firebase — por seguridad, el asistente
> no inicia sesión en tu cuenta. Son ~3 minutos y te guío en cada clic.

1. **Habilitar login**: Firebase Console → *Authentication* → *Get started* →
   pestaña *Sign-in method* → *Email/Password* → *Enable* → *Save*.
2. **Crear el usuario admin**: *Authentication* → *Users* → *Add user* →
   escribir un email y una contraseña (los que quieras usar para entrar al panel).
3. **Publicar las reglas**: pegar el contenido de `firestore.rules` en
   Firestore → *Rules* → *Publish*; y el de `storage.rules` en Storage → *Rules*
   → *Publish*. (O, si instalás Firebase CLI: `firebase deploy --only firestore:rules,storage`.)

## Lo que hará el asistente en el código (cuando el paso 1 y 2 estén listos)
- Cambiar el login del panel para usar Firebase Auth (email/contraseña reales) en
  lugar de la contraseña fija `admin123`.
- Publicar ese cambio (push a `main` → Vercel redepliega).

Hasta que se complete, **no se rompe nada**: el sitio sigue funcionando igual.
