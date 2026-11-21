# Trabajo Práctico N° 4 — App integradora: “Biblioteca IPF”

Aplicación desarrollada con **React Native**, **Expo SDK 58** (`expo ~58.0.26`), **TypeScript** y **Expo Router** que integra todos los contenidos del cuatrimestre:

- **TP 1**: componentes reutilizables, estado, `useEffect` con limpieza y manejo de condiciones de carrera.
- **TP 2**: Expo Router (`Tabs`, `Stack` anidado, modales, `<Redirect>`, `+not-found`, `Stack.Protected`), estructuras de datos `Pila` y `Cola` con campos privados `#items` y sin `shift()`.
- **TP 3**: permisos móviles en contexto (`expo-camera` y `expo-notifications`), pantalla previa con único botón *“Continuar”*, actualización con `AppState` + `useFocusEffect`, canal Android `"prestamos"` y caminos alternativos para que la app nunca se bloquee.

---

## 1. Cómo ejecutar el proyecto

- **Versión del SDK de Expo utilizada:** **SDK 58** (`expo ~58.0.26`, React Native `0.88.1`, Expo Router `~58.0.32`).

```bash
cd TRABAJO4
npm install
npx expo start
```

Para probar en un teléfono físico con **Expo Go**, escaneá el QR que aparece en consola.
Para el acceso de personal en `/login`, las credenciales fijas de prueba son:
- **Usuario:** `admin`
- **Clave:** `ipf2026`

---

## 2. Árbol de carpetas de `src/app` y navegadores 

```text
src/
├── app/
│   ├── _layout.tsx                  # Stack raíz (anchor: '(tabs)', modales y Stack.Protected)
│   ├── +not-found.tsx               # Pantalla 404 (muestra la URL inexistente con usePathname)
│   ├── buscar.tsx                   # URL: /buscar?q= (Stack raíz)
│   ├── escanear.tsx                 # URL: /escanear (Stack raíz)
│   ├── login.tsx                    # URL: /login (Modal en Stack raíz, guard={!conSesion})
│   ├── mostrador.tsx                # URL: /mostrador (Stack raíz, guard={conSesion})
│   ├── reserva.tsx                  # URL: /reserva (<Redirect href="/reservas" />)
│   ├── permisos/
│   │   └── [recurso].tsx            # URL: /permisos/[recurso] (Modal en Stack raíz)
│   ├── reservar/
│   │   └── [isbn].tsx               # URL: /reservar/[isbn] (Modal en Stack raíz)
│   └── (tabs)/
│       ├── _layout.tsx              # Tabs ("Catálogo" y "Mis reservas")
│       ├── reservas.tsx             # URL: /reservas (Tab "Mis reservas")
│       └── (catalogo)/
│           ├── _layout.tsx          # Stack propio de la Tab "Catálogo"
│           ├── index.tsx            # URL: / (Catálogo principal)
│           └── libro/
│               └── [isbn].tsx       # URL: /libro/[isbn] (Detalle dentro de Tab "Catálogo")
├── components/                      # Un componente por archivo, StyleSheet.create y accesibilidad
├── constants/
│   └── tema.ts                      # Colores, espaciados, radios, tipografía y área táctil mínima (44)
├── context/
│   └── biblioteca.tsx               # BibliotecaProvider: préstamos, Colas de espera, Pila recientes, avisos y sesión
├── data/
│   └── libros.ts                    # Catálogo de 16 libros reales + listas de espera iniciales
├── estructuras/
│   ├── Cola.ts                      # Clase Cola<T> con #items y #inicio (sin shift())
│   └── Pila.ts                      # Clase Pila<T> con #items, getter tamanio y aArray()
├── hooks/
│   ├── useLibros.ts                 # Carga de catálogo con estados y limpieza
│   ├── usePermiso.ts                # Hook unificado de permisos (4 estados + AppState)
│   └── useRevisarAlVolver.ts        # Listener de AppState al volver de Ajustes
├── lib/
│   ├── api.ts                       # API simulada (obtenerLibros y buscarLibros)
│   └── permisos.ts                  # Consultas, solicitudes, canal Android "prestamos" y notificaciones
└── types/
    └── index.ts                     # Tipos estrictos (Libro, Prestamo, AvisoBiblioteca, etc.)
```

---

## 3. Bloque `plugins` de `app.json` comentado y `blockedPermissions` (Requisito A5 y F2.3)

```jsonc
{
  "expo": {
    "scheme": "bibliotecaipf",
    "android": {
      "package": "com.ipf.biblioteca",
      // Permisos bloqueados explícitamente (generan tools:node="remove" en AndroidManifest.xml):
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",        // No grabamos video con audio ni notas de voz
        "android.permission.SYSTEM_ALERT_WINDOW"  // No dibujamos ventanas flotantes sobre otras apps
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#0A9484",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ],
      [
        "expo-camera",
        {
          // Texto de propósito para iOS (NSCameraUsageDescription) con el molde exigido por Apple:
          "cameraPermission": "Usamos tu cámara para leer el código de barras de los libros y abrir su ficha en el catálogo.",
          // Principio de mínimo privilegio: desactivamos micrófono en iOS y Android:
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/images/android-icon-monochrome.png",
          "color": "#0A9484",
          // Canal por defecto requerido en Android 13+ antes de solicitar POST_NOTIFICATIONS:
          "defaultChannel": "prestamos"
        }
      ]
    ]
  }
}
```

### Justificación de `blockedPermissions`
- **`android.permission.RECORD_AUDIO`**: `expo-camera` lo agrega por defecto por si la app graba video con sonido. Como “Biblioteca IPF” solo escanea códigos de barras EAN-13, se bloquea para cumplir mínimo privilegio.
- **`android.permission.SYSTEM_ALERT_WINDOW`**: permiso especial innecesario en la app; se elimina del manifiesto final.
- Además, la app **no instala** `expo-location` ni `expo-image-picker` porque no los necesita.

---

## 4. Tabla de permisos 
| Recurso | Módulo de Expo | ¿Cuándo se pide? | Alternativa si se deniega o bloquea |
| :--- | :--- | :--- | :--- |
| **Cámara** | `expo-camera` | Recién cuando la persona abre `/escanear`, toca **“Continuar”** para abrir `/permisos/camara` y confirma **“Continuar”**. | Ingresar manualmente el ISBN de 13 dígitos en el campo de texto de `/escanear`. |
| **Notificaciones locales** | `expo-notifications` | Únicamente cuando la persona activa el interruptor **“Recordarme”** en un préstamo de `/reservas` (creando antes el canal `"prestamos"` en Android). | Los avisos de entrega desde `/mostrador` aparecen en la bandeja interna **“Avisos dentro de la app”** en `/reservas`. |

---

## 5. Deep links de prueba 

En una development build se usa el esquema `bibliotecaipf://`, y en **Expo Go** el equivalente `exp://<IP_LOCAL>:8081/--/...`:

| Deep link (`bibliotecaipf://`) | Equivalente en Expo Go | Comportamiento esperado |
| :--- | :--- | :--- |
| `bibliotecaipf://libro/9789877801576` | `exp://<IP>:8081/--/libro/9789877801576` | Abre la ficha de *Almendra* dentro de la tab Catálogo. |
| `bibliotecaipf://libro/123` | `exp://<IP>:8081/--/libro/123` | Abre `/libro/[isbn]`, falla la validación de 13 dígitos y muestra mensaje claro + link al Catálogo. |
| `bibliotecaipf://buscar?q=borges` | `exp://<IP>:8081/--/buscar?q=borges` | Abre `/buscar` con `"borges"` precargado y `(tabs)` debajo gracias a `anchor: '(tabs)'`. |
| `bibliotecaipf://mostrador` (sin sesión) | `exp://<IP>:8081/--/mostrador` | Al estar protegida con `Stack.Protected`, no existe sin sesión y redirige / cae fuera de la ruta protegida. |
| `bibliotecaipf://reserva` | `exp://<IP>:8081/--/reserva` | Ejecuta `<Redirect href="/reservas" />` y abre la pestaña Mis reservas. |
| `bibliotecaipf://escanear` | `exp://<IP>:8081/--/escanear` | Abre el escáner respetando el estado actual del permiso de cámara (con carga manual disponible). |

---

## 6. Verificación de TypeScript y ESLint 

Salida obtenida al ejecutar los chequeos en `TRABAJO4/`:

```text
> npx tsc --noEmit
(exit code 0 — sin errores)

> npx expo lint
(exit code 0 — 0 errors, 0 warnings)
```

---

## 7. Capturas 
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/9be75bb9-385b-4074-9c8a-977006a78574" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/007bdab8-10f2-404e-8b15-e4faf41ed855" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/bea17e82-bbe7-40fe-ab59-2634ae7a297a" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/e77e025c-16fd-4c51-9c61-847b8caedc63" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/3013b7b2-9260-4bdc-8e9b-0bdfe9cbd652" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/36f93e3d-2fba-439d-ab39-5f59bdf8eede" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/053977c9-d7c6-4ccd-90d1-a236f5bd1ca8" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/589dda80-374a-466c-8248-212bbf8b81b6" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/4db04303-5860-468a-9778-3c6139462ec3" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/da8e349e-5638-4d7f-8f0a-1f53dfb6922c" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/b5711614-1c4e-4615-a7f6-10247198bf99" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/2b6156fa-1389-4aad-870a-de636e39d1fd" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/db622c3f-cacd-40db-8d9a-9ec1a00f0977" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/16b166c5-ffe7-4cee-be4a-a4aa5dadfcc5" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/fa07b787-002d-4cd0-a7a4-a73cdc6efc3f" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/21e12dcc-ac2f-4e40-b571-7dabb1da5df7" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/ded86d72-6132-46b3-924c-de38bc2da697" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/7529a8ab-2361-45cc-b34c-73bab7b243bf" />


















