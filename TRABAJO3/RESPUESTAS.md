# Trabajo Práctico N° 3 — Permisos móviles: Android, iOS y Expo
## Respuestas Teóricas y Ejercicios (Partes A a F)

---

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a) ¿Qué es un permiso? ¿Qué papel cumplen la app, el sistema operativo y la persona usuaria?**
Un **permiso** es una autorización controlada que habilita a una aplicación a acceder a un recurso sensible del dispositivo (como la cámara, el micrófono o el GPS) o a datos privados de la persona usuaria (contactos, fotos, calendario).
- **La app:** solicita el acceso cuando necesita cumplir una función concreta para la persona usuaria, pero no tiene poder para tomar el recurso por sí sola.
- **El sistema operativo (Android / iOS):** actúa como guardián e intermediario. Bloquea el acceso por defecto, muestra el diálogo oficial del sistema, recuerda la decisión tomada y hace cumplir esa decisión a nivel de kernel/APIs.
- **La persona usuaria:** es la dueña del dispositivo y de sus datos; es la única que decide si concede, limita o rechaza el acceso, y puede cambiar o revocar esa decisión en cualquier momento desde los Ajustes del sistema.

**b) ¿Qué es la caja de arena (sandbox) y qué relación tiene con los permisos? ¿Qué puede hacer una app sin ningún permiso?**
La **caja de arena (*sandbox*)** es un entorno aislado que el sistema operativo le asigna a cada aplicación al instalarse (con su propio directorio de archivos y espacio de memoria). Impide que una app lea archivos de otras apps o acceda directamente al hardware y datos del teléfono. Los **permisos** son las "puertas controladas" que abren excepciones puntuales en ese *sandbox* para recursos específicos.
Sin pedir ningún permiso en tiempo de ejecución, una app igualmente puede:
- Leer y escribir archivos dentro de su propio directorio privado del *sandbox* (`AsyncStorage`, SQLite local, caché).
- Renderizar interfaz gráfica, reproducir sonido o animaciones propias.
- Vibrar o conectarse a Internet (en Android son permisos normales de instalación; en iOS ni siquiera requieren declaración).
- Abrir selectores del sistema (como el selector de fotos `launchImageLibraryAsync` o compartir archivos) donde es la persona usuaria quien elige qué archivo puntual entregarle a la app.

**c) Nombrá las cuatro razones por las que existen los permisos y dá un ejemplo concreto de cada una.**
1. **Privacidad de los datos personales:** evitar que una app robe información íntima sin consentimiento. *Ejemplo:* impedir que una app de linterna lea la agenda de contactos o toda la galería de fotos personales para subirlas a un servidor.
2. **Seguridad física y del dispositivo:** proteger a la persona usuaria de vigilancia o suplantación. *Ejemplo:* evitar que una app active la cámara o el micrófono en silencio para espiar, o que rastree la ubicación física en tiempo real sin que la persona lo sepa.
3. **Cuidado de recursos del sistema (batería, CPU y datos):** evitar abusos en segundo plano que degraden el teléfono. *Ejemplo:* impedir que diez apps usen el GPS de alta precisión en segundo plano todo el día agotando la batería en un par de horas.
4. **Transparencia y control del usuario (confianza):** que la persona entienda por qué se usa cada sensor y pueda decidir el nivel de acceso. *Ejemplo:* permitir elegir ubicación aproximada en lugar de exacta para una app del clima, o conceder acceso solo "esta vez".

**d) En la analogía del portero del edificio, ¿quién es la visita, quién el portero y quién el dueño del departamento? ¿Qué significa que “el portero se acuerda de la respuesta”?**
- **La visita:** es la **aplicación** (quiere entrar a usar un recurso, como la cámara o la ubicación).
- **El portero:** es el **sistema operativo** (Android o iOS), que frena a la visita en la entrada y consulta por el intercomunicador.
- **El dueño del departamento:** es la **persona usuaria**, quien decide si la deja pasar, solo por hoy, o le niega la entrada.
- **“El portero se acuerda de la respuesta”:** significa que el sistema operativo **persiste el estado del permiso** (`granted` o bloqueado). Si la persona dijo que sí ("Mientras la app está en uso") o si bloqueó el permiso definitivamente (`canAskAgain: false`), la próxima vez que la app llame a `request...PermissionsAsync()`, el sistema operativo **no vuelve a mostrar el diálogo** a la persona usuaria, sino que devuelve inmediatamente la respuesta guardada.

---

### A2. Declarar y solicitar

| Pregunta | Declarar (al compilar) | Solicitar (al ejecutar) |
| :--- | :--- | :--- |
| **¿Qué se hace?** | Se anuncia en los archivos de configuración nativos de la build qué permisos va a necesitar la app (y en iOS, con qué propósito). | Se ejecuta código JavaScript/nativo en el momento justo para pedirle al sistema operativo que muestre el diálogo a la persona usuaria (o devuelva su decisión previa). |
| **¿Dónde / cómo en Android?** | En `android/app/src/main/AndroidManifest.xml` mediante etiquetas `<uses-permission android:name="android.permission.X" />`. | Llamando a las APIs de runtime de Android (`ActivityCompat.requestPermissions` / `ActivityResultLauncher`) desde la Activity. |
| **¿Dónde / cómo en iOS?** | En `ios/<App>/Info.plist` agregando la clave de uso (`NS...UsageDescription`) con un texto obligatorio explicando el propósito. | Invocando el método de autorización del framework nativo correspondiente (`AVCaptureDevice.requestAccess`, `CLLocationManager`, `UNUserNotificationCenter`, etc.). |
| **¿Dónde / cómo en Expo?** | En `app.json` (o `app.config.ts`) configurando los *config plugins* dentro de `expo.plugins` (y `expo.android.permissions` / `expo.ios.infoPlist`). | Usando los hooks o funciones de cada módulo de Expo, por ejemplo `useCameraPermissions()` o `Location.requestForegroundPermissionsAsync()`. |
| **¿Qué pasa si se omite?** | **Android:** el sistema rechaza el permiso automáticamente sin mostrar diálogo (o lanza `SecurityException`). **iOS:** la app **crashea** inmediatamente al intentar pedirlo y Apple rechaza la build en App Store Connect (`ITMS-90683`). | Para permisos de tiempo de ejecución, el permiso queda en estado `undetermined` ("sin decidir") y cuando la app intenta usar el recurso, la API falla o no devuelve datos. |

---

### A3. Verdadero o falso

- **a) El diálogo de permiso lo dibuja tu app con componentes de React Native.**
  **Falso.** El diálogo de permiso lo dibuja y controla exclusivamente el **sistema operativo** (Android o iOS) por razones de seguridad, para que ninguna app pueda falsificar los botones o engañar al usuario. Lo único que dibuja tu app con React Native es la *pantalla previa* explicativa antes de invocar al diálogo del sistema.

- **b) En Expo, la fuente de verdad de los permisos es `app.json` (o `app.config.ts`), no el `AndroidManifest.xml`.**
  **Verdadero.** En el flujo de *Continuous Native Generation (CNG)* / *Prebuild* de Expo, las carpetas `android/` e `ios/` se regeneran a partir de `app.json`.

- **c) Agregar un permiso nuevo en el `Info.plist` se puede publicar con una actualización OTA.**
  **Falso.** Las actualizaciones OTA (*Over-The-Air*, como `eas update`) solo actualizan el bundle de JavaScript y assets. El `Info.plist` y el `AndroidManifest.xml` forman parte del binario nativo compilado, por lo que agregar o cambiar un permiso nativo requiere generar una **nueva build nativa** y subirla a la tienda.

- **d) Si tu código pide un permiso que no está en el manifiesto, Android igual muestra el diálogo.**
  **Falso.** Si un permiso de tiempo de ejecución no está declarado en el `AndroidManifest.xml`, Android ignora el pedido, **no muestra ningún diálogo** y devuelve directamente el permiso como denegado (`granted: false`, `canAskAgain: false`).

- **e) El paquete `expo-permissions` es la forma recomendada de pedir permisos en SDK 57.**
  **Falso.** El paquete `expo-permissions` está **deprecado y eliminado** hace varias versiones de SDK. En Expo SDK 57 cada módulo gestiona sus propios permisos (por ejemplo, `expo-camera`, `expo-location`, `expo-notifications`, `expo-image-picker`).

- **f) En iOS, las notificaciones no llevan texto de propósito en el `Info.plist`.**
  **Verdadero.** A diferencia de cámara, ubicación o micrófono, las notificaciones en iOS se piden mediante el framework `UserNotifications` (`UNUserNotificationCenter`) y no utilizan una clave `NS...UsageDescription` en el `Info.plist`.

- **g) Con acceso limitado a fotos, `status` vale `'granted'` y el matiz está en `accessPrivileges`.**
  **Verdadero.** Cuando el usuario elige *"Seleccionar fotos"* (acceso parcial), Expo reporta `status: 'granted'` y `granted: true` porque la app sí puede leer las fotos seleccionadas, e indica el recorte en `accessPrivileges: 'limited'` (frente a `'all'`).

- **h) Desinstalar y reinstalar la app es la forma confiable de volver a “sin decidir” en las dos plataformas.**
  **Falso.** En Android desinstalar y reinstalar sí resetea los permisos, pero **en iOS el sistema operativo recuerda la decisión por un tiempo** (aproximadamente 24 horas) aunque desinstales y reinstales la app. Para resetearlo de inmediato en iOS hay que ir a *Ajustes → General → Transferir o restablecer → Restablecer localización y privacidad* o usar `xcrun simctl privacy <device> reset all <bundleId>` en el simulador.

---

### A4. Los estados de un permiso

**a) Diagrama de estados de un permiso en Android y en iOS y diferencia central:**

```
                  ┌───────────────────────────┐
                  │        SIN DECIDIR        │
                  │  status: 'undetermined'   │
                  │    canAskAgain: true      │
                  └─────────────┬─────────────┘
                                │
                     request...PermissionsAsync()
                                │
        ┌───────────────────────┼───────────────────────┐
        │ (Acepta / Parcial)    │ (Rechaza 1° vez       │ (Rechaza en iOS
        ▼                       │  en Android)          │  o 2° vez en Android)
┌───────────────────┐   ┌───────┴───────────────┐   ┌───┴───────────────────┐
│     CONCEDIDO     │   │  DENEGADO PREGUNTABLE │   │       BLOQUEADO       │
│ status: 'granted' │   │   status: 'denied'    │   │   status: 'denied'    │
│ canAskAgain: true │   │   canAskAgain: true   │   │  canAskAgain: false   │
└─────────┬─────────┘   └───────────┬───────────┘   └───────────┬───────────┘
          │                         │                           │
          │                request...() de nuevo      Solo cambia si va a
          │                (Acep. -> Concedido /      Ajustes del sistema
          │                 Rech. -> Bloqueado)       (Linking.openSettings)
          └─────────────────────────┴───────────────────────────┘
```

- **Diferencia central entre Android e iOS:**
  - **En iOS** el diálogo del sistema se muestra **una única vez**. Si la persona toca *"No permitir"* la primera vez, el permiso pasa **directamente de `undetermined` a Bloqueado** (`status: 'denied', canAskAgain: false`). No existe el estado intermedio "Denegado pero se puede volver a pedir".
  - **En Android (11+)** la persona tiene **dos oportunidades**: al primer *"No permitir"*, el permiso queda en **Denegado preguntable** (`status: 'denied', canAskAgain: true`), permitiendo mostrar el diálogo una segunda vez. Si vuelve a rechazar por segunda vez, recién ahí pasa a **Bloqueado** (`canAskAgain: false`).

**b) Qué devuelve Expo en cada estado:**

| Estado | `status` | `canAskAgain` | ¿Puede aparecer el diálogo? |
| :--- | :--- | :--- | :--- |
| **Sin decidir** | `'undetermined'` | `true` | **Sí**, al llamar a `request...PermissionsAsync()`. |
| **Concedido** | `'granted'` | `true` | **No** (ya está concedido; `request...()` resuelve de inmediato). |
| **Denegado (se puede volver a pedir)** | `'denied'` | `true` | **Sí** (ocurre en Android tras el primer rechazo). |
| **Bloqueado** | `'denied'` | `false` | **No**. Llamar a `request...()` devuelve `denied` sin mostrar nada; hay que enviar a Ajustes (`Linking.openSettings()`). |

---

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
| :--- | :--- | :--- |
| `INTERNET` | De instalación (normal) | Se declara en `AndroidManifest.xml` y Android lo concede automáticamente al instalar la app, sin preguntar al usuario. |
| `CAMERA` | De tiempo de ejecución (peligroso) | Se declara en `AndroidManifest.xml` y además se debe pedir en tiempo de ejecución mostrando el diálogo del sistema. |
| `VIBRATE` | De instalación (normal) | Se declara en `AndroidManifest.xml` y se concede automáticamente al instalar la app. |
| `SYSTEM_ALERT_WINDOW` | Especial | Se declara en el manifiesto y hay que enviar al usuario a una pantalla especial de Ajustes del sistema (*"Mostrar sobre otras apps"*). |
| `POST_NOTIFICATIONS` | De tiempo de ejecución (Android 13+) | Se declara en el manifiesto y desde Android 13 (API 33) se pide en tiempo de ejecución con el diálogo del sistema (en Android ≤ 12 era de instalación). |
| `ACCESS_NETWORK_STATE` | De instalación (normal) | Se declara en `AndroidManifest.xml` y se concede automáticamente al instalar la app. |
| `READ_CONTACTS` | De tiempo de ejecución (peligroso) | Se declara en `AndroidManifest.xml` y se pide en tiempo de ejecución mediante el diálogo del sistema. |
| `SCHEDULE_EXACT_ALARM` | Especial (Android 12+) | Se declara en el manifiesto y (para apps que no son reloj/calendario en Android 14+) requiere que el usuario lo habilite en la pantalla especial de *Alarmas y recordatorios* en Ajustes. |
| `RECORD_AUDIO` | De tiempo de ejecución (peligroso) | Se declara en `AndroidManifest.xml` y se solicita en tiempo de ejecución mediante el diálogo del sistema. |
| `MANAGE_EXTERNAL_STORAGE` | Especial | Se declara en el manifiesto y requiere que el usuario lo active manualmente en Ajustes (*"Acceso a todos los archivos"*), además de una revisión estricta de Google Play. |

---

### B2. Grupos y nombres

**a) ¿Qué es un grupo de permisos? Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, ¿cuántos diálogos ve la persona?**
Un **grupo de permisos** es un conjunto lógico en el que Android agrupa permisos de tiempo de ejecución relacionados con una misma capacidad o área de privacidad (por ejemplo, el grupo `LOCATION`, `STORAGE`, `CONTACTS`, `MICROPHONE`).
Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos en la misma solicitud, la persona ve **un solo diálogo** (el de Ubicación, que en Android 12+ incluye el selector visual entre *"Precisa"* y *"Aproximada"*).

**b) ¿Qué prefijo lleva el nombre completo de un permiso? Escribí el nombre completo del permiso de cámara.**
Los permisos estándar del sistema Android llevan el prefijo `android.permission.`.
El nombre completo del permiso de cámara es:
`android.permission.CAMERA`

**c) ¿Qué son los permisos de firma (`signature`)? ¿Por qué no se usan en apps comunes?**
Los permisos de firma (`protectionLevel="signature"`) son permisos que Android solo concede si la aplicación que lo solicita está **firmada criptográficamente con el mismo certificado digital** que la aplicación o el sistema operativo que definió el permiso. No se usan en apps comunes para acceder a funciones del sistema porque las apps de terceros no están firmadas con la clave privada del fabricante del teléfono ni de Google; se reservan para comunicación privada entre apps de una misma empresa o componentes internos del sistema operativo.

---

### B3. Leé el manifiesto

**a) ¿Qué permisos se conceden solos al instalar y cuáles hay que pedir además en tiempo de ejecución?**
- **Se conceden solos al instalar:** `android.permission.INTERNET`.
- **Hay que pedir en tiempo de ejecución:**
  - `android.permission.CAMERA`
  - `android.permission.ACCESS_COARSE_LOCATION` y `android.permission.ACCESS_FINE_LOCATION`
  - `android.permission.POST_NOTIFICATIONS` (en Android 13 / API 33 o superior)
  - `android.permission.READ_EXTERNAL_STORAGE` (solo en dispositivos con Android 12L / API 32 o inferior, por el `maxSdkVersion="32"`).
- *(Nota: `RECORD_AUDIO` tiene `tools:node="remove"`, por lo que el compilador de manifiestos lo elimina del manifiesto final).*

**b) ¿Qué significa `android:maxSdkVersion="32"`? ¿Qué permisos reemplazan a `READ_EXTERNAL_STORAGE` desde Android 13?**
- `android:maxSdkVersion="32"` indica que ese permiso (`READ_EXTERNAL_STORAGE`) solo existe y se aplica en dispositivos con versión de Android hasta **API 32 (Android 12L)** inclusive; en Android 13 (API 33) o superior el sistema lo ignora.
- Desde **Android 13 (API 33)**, `READ_EXTERNAL_STORAGE` fue reemplazado por permisos granulares por tipo de medio:
  - `android.permission.READ_MEDIA_IMAGES` (fotos e imágenes)
  - `android.permission.READ_MEDIA_VIDEO` (videos)
  - `android.permission.READ_MEDIA_AUDIO` (archivos de audio)

**c) ¿Qué hace `tools:node="remove"`? Escribí el fragmento de `app.json` que lo genera.**
`tools:node="remove"` es una directiva para el *Manifest Merger* de Gradle que ordena **eliminar ese permiso del manifiesto final**, incluso si alguna librería nativa (como `expo-camera`) lo declara en su propio `AndroidManifest.xml` interno.
En `app.json` se genera usando `android.blockedPermissions`:
```json
{
  "expo": {
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

**d) Necesitás agregar `SCHEDULE_EXACT_ALARM`, que ninguna librería declara. ¿En qué propiedad de `app.json` va?**
Va en la propiedad `expo.android.permissions`:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.SCHEDULE_EXACT_ALARM"
      ]
    }
  }
}
```

**e) ¿Por qué en Expo no conviene editar este archivo a mano? ¿Funciona `blockedPermissions` en Expo Go?**
- **No conviene editar `AndroidManifest.xml` a mano** porque en proyectos Expo con *Prebuild* (CNG), la carpeta `android/` es código generado: la próxima vez que se ejecute `npx expo prebuild --clean` o se compile en EAS Build, cualquier cambio manual en `AndroidManifest.xml` se sobrescribe y se pierde. Todo debe declararse en `app.json`.
- **¿Funciona `blockedPermissions` en Expo Go? No.** Expo Go es un binario precompilado por Expo que ya incluye todos los permisos posibles en su propio manifiesto para poder probar cualquier proyecto. `blockedPermissions` recién surte efecto al generar el `AndroidManifest.xml` propio en una **development build** o build de producción.

---

### B4. Así pregunta Android

**a) ¿Se puede poner texto propio dentro del diálogo de Android? Entonces, ¿dónde tenés que explicar para qué usás el permiso?**
**No**, en Android no existe forma de personalizar ni agregar texto propio dentro del cuadro de diálogo del sistema. Por eso, la explicación de para qué usás el permiso se debe mostrar en una **pantalla previa propia (rationale)** diseñada dentro de la app (por ejemplo, el modal `/permisos/[recurso]`) justo antes de disparar el diálogo del sistema.

**b) ¿Qué diferencia hay entre “Mientras la app está en uso” y “Solo esta vez”? ¿Para qué permisos existe esta última opción?**
- **“Mientras la app está en uso”:** el permiso queda guardado de forma permanente para usos en primer plano; cuando el usuario cierre y vuelva a abrir la app mañana, seguirá teniendo permiso (`granted`).
- **“Solo esta vez” (One-time permission):** concede el permiso temporalmente solo para la sesión actual de la app (y unos segundos después de pasar a segundo plano). Cuando la app se cierra por completo y se vuelve a abrir, el permiso regresa al estado *"Sin decidir"* y habrá que volver a pedirlo.
- **¿Para qué permisos existe “Solo esta vez”?** Existe únicamente para los tres permisos más sensibles en tiempo real: **Cámara**, **Micrófono** y **Ubicación**.

**c) En Android 11+, ¿qué pasa si la persona toca “No permitir” dos veces? ¿Qué valor toma `canAskAgain`?**
A partir de Android 11 (API 30), tocar *"No permitir"* dos veces para el mismo permiso hace que el sistema interprete **"No volver a preguntar"** automáticamente. El permiso queda **bloqueado**, `canAskAgain` toma el valor `false` y cualquier llamada posterior a `request...PermissionsAsync()` se resuelve inmediatamente con `denied` sin mostrar ningún diálogo.

**d) La ubicación aproximada tiene una precisión de unos 3 km². Dá un ejemplo de función que anda bien con ella y otro de una que no.**
- **Anda bien con ubicación aproximada:** mostrar el pronóstico del clima de tu ciudad, listar sucursales o puntos de reciclaje en tu barrio/localidad, o configurar el idioma/moneda regional.
- **No anda bien con ubicación aproximada:** navegación paso a paso en auto (*turn-by-turn*), pedir un remis/ambulancia a la puerta exacta de tu casa, o marcar en qué aula o pasillo específico dentro de un edificio está un desperfecto.

**e) Si la persona revoca un permiso desde Ajustes mientras la app está abierta, ¿qué hace Android con el proceso de la app?**
Cuando se **revoca** un permiso otorgado desde Ajustes, Android **termina (mata) el proceso de la app** inmediatamente para garantizar que ningún código en memoria ni hilo en segundo plano siga leyendo datos del sensor revocado. *(En cambio, si la persona **concede** un permiso que estaba denegado en Ajustes y vuelve a la app, Android **no** mata el proceso; la app sigue viva y por eso necesita escuchar `AppState` para enterarse del cambio).*

---

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
| :--- | :--- | :--- |
| **Nacen los permisos en tiempo de ejecución** | **Android 6.0 (API 23)** | Ya no alcanza con declarar permisos peligrosos en el `AndroidManifest.xml`; el código debe consultar y pedir el permiso en ejecución (`request...PermissionsAsync`) y manejar el rechazo. |
| **La ubicación en segundo plano pasa a ser un permiso aparte** | **Android 10 (API 29)** | Nace `ACCESS_BACKGROUND_LOCATION`. Si la app solo usa ubicación con la pantalla abierta, solo debe pedir foreground; si necesita background, debe pedirlo aparte. |
| **Dos rechazos equivalen a “no volver a preguntar”** | **Android 11 (API 30)** | Desaparece el checkbox *"No volver a preguntar"* del diálogo; tras dos rechazos `canAskAgain` pasa a `false` y el código debe mostrar un botón a `Linking.openSettings()`. Además se introduce *"Solo esta vez"* y que el permiso de segundo plano debe pedirse **después** de haber obtenido el de primer plano. |
| **Ubicación precisa o aproximada** | **Android 12 (API 31)** | El usuario puede conceder ubicación pero desactivar *"Precisa"*. El código debe pedir `ACCESS_COARSE_LOCATION` junto con `ACCESS_FINE_LOCATION` y revisar `android.accuracy` (`'fine'` vs `'coarse'`). |
| **Las notificaciones pasan a ser un permiso (`POST_NOTIFICATIONS`)** | **Android 13 (API 33)** | Las notificaciones dejan de estar habilitadas al instalar: hay que crear al menos un canal de notificación y llamar a `Notifications.requestPermissionsAsync()` en contexto. |
| **Acceso parcial a fotos y videos (“Seleccionar fotos”)** | **Android 14 (API 34)** | Se incorpora `READ_MEDIA_VISUAL_USER_SELECTED`. El usuario puede dar acceso solo a fotos elegidas (`accessPrivileges: 'limited'`), o bien la app debe usar el Photo Picker del sistema sin pedir permisos. |
| **Permiso de red local (`ACCESS_LOCAL_NETWORK`)** | **Android 16 / 17 (API 36/37)** | Descubrir y conectarse a dispositivos en la LAN (mDNS, Chromecast, impresoras locales) deja de estar cubierto solo por `INTERNET` y pasa a requerir un permiso de tiempo de ejecución propio. |

**¿Qué es el `targetSdkVersion`? ¿A qué API apunta Expo SDK 57 y qué exige Google Play desde el 31 de agosto de 2026?**
- **`targetSdkVersion`:** es el entero en la configuración de Android que le indica al sistema operativo **para qué versión de Android fue diseñada y probada la app**. Mientras que `minSdkVersion` define en qué teléfonos se puede instalar, `targetSdkVersion` activa las reglas de comportamiento y restricciones de permisos de esa versión de Android.
- **Expo SDK 57 y Google Play (31 de agosto de 2026):** Expo SDK 57 apunta a **API 36 (Android 16)**, cumpliendo el requisito obligatorio de Google Play que desde el **31 de agosto de 2026** exige que todas las apps nuevas y actualizaciones apunten como mínimo a **API 36 (Android 16)** (un año después del lanzamiento de esa versión principal del SO).

---

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del `Info.plist`

| Recurso | Clave en `Info.plist` |
| :--- | :--- |
| **Cámara** | `NSCameraUsageDescription` |
| **Micrófono** | `NSMicrophoneUsageDescription` |
| **Ubicación en uso** | `NSLocationWhenInUseUsageDescription` |
| **Ubicación siempre** | `NSLocationAlwaysAndWhenInUseUsageDescription` *(y `NSLocationWhenInUseUsageDescription`)* |
| **Fotos (leer)** | `NSPhotoLibraryUsageDescription` |
| **Fotos (solo guardar)** | `NSPhotoLibraryAddUsageDescription` |
| **Contactos** | `NSContactsUsageDescription` |
| **Face ID** | `NSFaceIDUsageDescription` |
| **Rastreo entre apps (ATT)** | `NSUserTrackingUsageDescription` |
| **Notificaciones** | **No lleva clave en `Info.plist`** (se solicita por código con `UNUserNotificationCenter`). |

---

### C2. Sin texto, no hay permiso

**a) ¿Qué pasa si falta el texto de propósito y la app intenta usar la cámara? ¿Y al subir la build a App Store Connect? Mencioná el código de error.**
- **En tiempo de ejecución:** cuando la app intenta pedir el permiso o abrir la cámara sin `NSCameraUsageDescription` en el `Info.plist`, **iOS cierra la app de inmediato (crash / abort)** lanzando en consola: *"This app has crashed because it attempted to access privacy-sensitive data without a usage description"*.
- **Al subir la build a App Store Connect:** el análisis estático automático de Apple rechaza el binario por correo/consola con el código de error **`ITMS-90683: Missing Purpose String in Info.plist`**.

**b) ¿Cuántas veces muestra iOS el diálogo de un permiso? Si la persona dice que no, ¿qué le queda a la app?**
iOS muestra el diálogo del sistema **una sola vez** por permiso (salvo que la persona elija *"Permitir una vez"* en ubicación). Si la persona toca *"No permitir"*, el permiso queda bloqueado (`status: 'denied'`, `canAskAgain: false`). A la app le quedan dos cosas:
1. Ofrecer un botón claro para **abrir la pantalla de Ajustes de la app** (`Linking.openSettings()`) explicando cómo activarlo manualmente.
2. Ofrecer un **camino alternativo** dentro de la app (por ejemplo, escribir el aula o sector a mano) para que la persona pueda seguir usando la aplicación.

**c) En el diálogo de iOS, ¿qué parte arma el sistema y cuál escribís vos? En Expo, ¿dónde se configura ese texto?**
- **Lo que arma el sistema (iOS):** el título del cuadro (por ejemplo, *"¿Permitir que «Mantenimiento IPF» acceda a tu cámara?"*), el ícono/mapa y los botones de acción (*"Permitir"*, *"No permitir"*, *"Permitir al usar la app"*, etc.).
- **Lo que escribís vos:** el párrafo de subtítulo (el *purpose string* o texto de propósito) que aparece debajo del título explicando para qué se usará el dato.
- **Dónde se configura en Expo:** en `app.json` dentro de las opciones del plugin de cada módulo en `expo.plugins` (por ejemplo, `"cameraPermission"` en `expo-camera`, `"locationWhenInUsePermission"` en `expo-location`), o directamente en `expo.ios.infoPlist`.

**d) Una librería usa una API protegida que tu app nunca llama y Apple rechaza la build. ¿Por qué pasa y cómo se resuelve?**
- **¿Por qué pasa?** Porque el validador de App Store Connect hace un **análisis estático del binario compilado** buscando símbolos de APIs protegidas (como `AVCaptureDevice`, `PHPhotoLibrary` o `AudioRecord`). Aunque tu código JavaScript nunca ejecute esa función, si el código nativo de la librería incluye la referencia a esa API, Apple exige el texto de propósito correspondiente (error `ITMS-90683`).
- **¿Cómo se resuelve?** Configurando el plugin de Expo para deshabilitar esa parte nativa si lo soporta (por ejemplo, `"microphonePermission": false` en `expo-camera`, que evita inyectar el permiso o la API de micrófono), o bien declarando una descripción honesta en `infoPlist` / eliminando la dependencia nativa que no se utiliza.

---

### C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobado? | Versión mejorada |
| :--- | :---: | :--- |
| “Necesitamos tu ubicación.” | **No** (vago, no explica para qué ni qué beneficio obtiene el usuario). | *“Usamos tu ubicación para adjuntar el sector del edificio donde se encuentra el desperfecto reportado.”* |
| “Para mejorar tu experiencia.” | **No** (genérico; Apple rechaza explícitamente frases comodín en la pauta 5.1.1). | *“Usamos tu ubicación para mostrarte los reportes y puntos de mantenimiento más cercanos al aula donde estás.”* |
| “Usamos tu ubicación para mostrarte las farmacias de turno más cercanas.” | **Sí** (cumple el molde: indica qué dato usa y el beneficio concreto y verificable). | *(Aprobado tal cual está).* |
| “La app no funciona sin ubicación.” | **No** (coercitivo y no explica qué función concreta usa la ubicación). | *“Usamos tu ubicación para ubicar automáticamente en el plano del instituto el problema que estás reportando.”* |
| “Ubicación requerida por el sistema.” | **No** (engañoso y técnico; no explica la finalidad dentro de la app). | *“Usamos tu ubicación para identificar el patio, pasillo o estacionamiento del reclamo sin que tengas que cargarlo a mano.”* |

---

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
| :--- | :---: | :--- |
| **Fotos limitadas (“Seleccionar fotos”)** | **iOS 14+** | `ImagePicker.useMediaLibraryPermissions()` devuelve `status: 'granted'` con `accessPrivileges: 'limited'` (y `ImagePicker.presentLimitedLibraryPickerAsync()` permite cambiar la selección). |
| **Ubicación aproximada (interruptor “Precisa”)** | **iOS 14+** | `Location.getForegroundPermissionsAsync()` devuelve `ios.accuracy: 'reduced'` (aproximada) o `'full'` (precisa), o al leer `Location.getCurrentPositionAsync()` la propiedad `coords.accuracy` tiene un radio alto (> 1000 m). |
| **“Permitir una vez” (ubicación)** | **iOS 13+** | Durante esa sesión devuelve `status: 'granted'` (`ios.scope: 'whenInUse'`). Al cerrar y reabrir la app, vuelve a `status: 'undetermined'` y `canAskAgain: true`. |
| **Ubicación escalonada: de “al usar la app” a “Siempre”** | **iOS 13+ / 14+** | Primero se llama a `Location.requestForegroundPermissionsAsync()` y recién después de obtenida se llama a `Location.requestBackgroundPermissionsAsync()`. |
| **Notificaciones provisionales** | **iOS 12+** | Se pide con `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })` y se detecta cuando `settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL` (valor `3`). |
| **Rastreo entre apps (App Tracking Transparency)** | **iOS 14.5+** | Módulo `expo-tracking-transparency`: `requestTrackingPermissionsAsync()` / `useTrackingPermissions()`. |

**¿Qué versión mínima de iOS requiere Expo SDK 57? ¿Qué consecuencia práctica tiene eso sobre la tabla anterior?**
Expo SDK 57 requiere como versión mínima **iOS 16.0** (o superior). La consecuencia práctica es que **todos los casos de la tabla anterior (introducidos entre iOS 12 e iOS 14.5) están garantizados en el 100 % de los iPhones compatibles con nuestra app**: nunca vamos a correr en un iOS antiguo donde no exista ubicación aproximada, fotos limitadas, "Permitir una vez" ni ATT, por lo que nuestro código siempre debe contemplar esos estados sin necesidad de chequear la versión de iOS.

---

### C5. Android vs iOS, lado a lado

| Aspecto | Android | iOS |
| :--- | :--- | :--- |
| **¿Dónde se declara?** | En `android/app/src/main/AndroidManifest.xml` con etiquetas `<uses-permission />`. | En `ios/<App>/Info.plist` con claves `NS...UsageDescription`. |
| **Texto en el diálogo** | **Fijo del sistema operativo.** No se puede modificar ni agregar texto propio en el diálogo. | **Personalizable y obligatorio.** Muestra el texto de propósito configurado en el `Info.plist`. |
| **Oportunidades para preguntar** | **Hasta 2 veces** (en Android 11+). Si el usuario rechaza 2 veces, queda bloqueado (`canAskAgain: false`). | **1 sola vez.** Si el usuario toca *"No permitir"* la primera vez, queda bloqueado (`canAskAgain: false`). |
| **“Solo esta vez” / “Permitir una vez”** | Existe para **cámara, micrófono y ubicación** (desde Android 11). | Existe para **ubicación** (desde iOS 13). |
| **Notificaciones** | Requiere permiso en tiempo de ejecución (`POST_NOTIFICATIONS`) recién desde **Android 13 (API 33)**, y exige crear un canal antes. | Requiere permiso en tiempo de ejecución desde siempre (**iOS 8+**), no lleva clave en `Info.plist` y soporta envío provisional silencioso. |
| **Ubicación en segundo plano** | Requiere pedir primero primer plano y luego `ACCESS_BACKGROUND_LOCATION`, que lleva al usuario a la pantalla de Ajustes del sistema. | Se pide primero *"Al usar la app"* (`WhenInUse`) y luego se solicita escalar a *"Siempre"* (`Always`). |
| **Si falta la declaración** | El sistema **niega el permiso silenciosamente** sin mostrar diálogo (`granted: false`). | La app **crashea inmediatamente** al pedir el permiso y Apple rechaza la build (`ITMS-90683`). |

---

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
| :--- | :--- | :--- |
| **Escanear un QR con la cámara** | `expo-camera` | `useCameraPermissions()` / `Camera.requestCameraPermissionsAsync()` |
| **Grabar video con sonido** | `expo-camera` | `useCameraPermissions()` + `useMicrophonePermissions()` |
| **Mostrar farmacias cercanas** | `expo-location` | `Location.useForegroundPermissions()` / `Location.requestForegroundPermissionsAsync()` |
| **Seguir un envío con la app en segundo plano** | `expo-location` | `Location.useForegroundPermissions()` + `Location.useBackgroundPermissions()` (`requestBackgroundPermissionsAsync()`) |
| **Mostrar un recordatorio** | `expo-notifications` | `Notifications.getPermissionsAsync()` / `Notifications.requestPermissionsAsync()` |
| **Grabar una nota de voz** | `expo-audio` | `useAudioRecorder()` + `AudioModule.requestRecordingPermissionsAsync()` (`getRecordingPermissionsAsync()`) |
| **Galería propia dentro de la app** | `expo-media-library` *(o `expo-image-picker`)* | `MediaLibrary.usePermissions()` / `MediaLibrary.requestPermissionsAsync()` |
| **Publicidad personalizada entre apps (iOS)** | `expo-tracking-transparency` | `useTrackingPermissions()` / `requestTrackingPermissionsAsync()` |

**Un tutorial usa `import * as Permissions from 'expo-permissions'`. ¿Qué te dice eso sobre el tutorial?**
Me dice que el tutorial está **muy desactualizado** (corresponde a Expo SDK 40 o anterior, de hace varios años). `expo-permissions` fue deprecado y eliminado porque obligaba a incluir código nativo de todos los permisos aunque no se usaran (provocando rechazos en las tiendas). Hoy cada paquete de Expo trae sus propios métodos y hooks de permisos.

---

### D2. Consultar, pedir y el hook

**a) ¿Qué diferencia hay entre `get…PermissionsAsync()` y `request…PermissionsAsync()`? ¿Cuál puede mostrar un diálogo?**
- `get…PermissionsAsync()`: **solo consulta** el estado actual del permiso en el sistema operativo de forma silenciosa. **Nunca** muestra un diálogo al usuario.
- `request…PermissionsAsync()`: **solicita** el permiso al usuario. **Esta es la que puede mostrar el diálogo del sistema** (si el estado era `undetermined` o si en Android estaba `denied` con `canAskAgain: true`).

**b) El hook devuelve tres elementos. ¿Qué es cada uno? ¿Qué vale `permiso` en el primer render y qué tiene que mostrar la pantalla mientras tanto?**
En `const [permiso, pedirPermiso, consultarPermiso] = Location.useForegroundPermissions();`:
1. `permiso`: el objeto `PermissionResponse | null` con el estado actual (`status`, `granted`, `canAskAgain`, etc.).
2. `pedirPermiso`: función asíncrona equivalente a `requestForegroundPermissionsAsync()` que actualiza el estado del hook.
3. `consultarPermiso`: función asíncrona equivalente a `getForegroundPermissionsAsync()` para refrescar el estado manualmente (por ejemplo, al volver de Ajustes).
- **¿Qué vale `permiso` en el primer render?** Vale **`null`**, porque consultar el permiso al sistema operativo es una operación asíncrona nativa que todavía no terminó.
- **¿Qué tiene que mostrar la pantalla mientras tanto?** Un indicador de carga (`<ActivityIndicator />` o estado `'cargando'`) y no intentar leer `permiso.status` directamente para no romper con `TypeError: Cannot read property 'status' of null`.

**c) Si `canAskAgain` es `false`, ¿qué pasa al llamar a `request…()`? ¿Qué problema aparece si se lo llama en un bucle?**
- Si `canAskAgain` es `false`, llamar a `request…()` **no muestra ningún diálogo** en pantalla y resuelve casi instantáneamente devolviendo `{ status: 'denied', granted: false, canAskAgain: false }`.
- Si se lo llama dentro de un `useEffect` mal configurado o al renderizar cuando no está concedido, se produce un **bucle infinito de renders y llamadas nativas**, congelando la interfaz o dejando la pantalla atrapada en *"Pidiendo permiso..."* para siempre sin que el usuario vea jamás un diálogo.

---

### D3. Leé la respuesta

| Respuesta | Qué hace la app |
| :--- | :--- |
| `null` | Mostrar un estado de **cargando** (`ActivityIndicator`); todavía se está consultando al sistema operativo. |
| `{ status: 'granted', granted: true }` | **Usar el recurso** normalmente (mostrar la cámara, obtener ubicación, etc.). |
| `{ status: 'undetermined', canAskAgain: true }` | Mostrar la **pantalla previa explicativa** con el botón *"Continuar"* (que al tocarse llama a `pedirPermiso()`) y ofrecer la alternativa manual. |
| `{ status: 'denied', canAskAgain: true }` | Igual que el anterior (el usuario rechazó una vez en Android, pero se puede volver a preguntar): mostrar la explicación con *"Continuar"* solo cuando el usuario toque la función, más la alternativa manual. |
| `{ status: 'denied', canAskAgain: false }` | El permiso está **bloqueado**: no sirve llamar a `pedirPermiso()`. Mostrar explicación de cómo activarlo con el botón ***"Abrir Ajustes"*** (`Linking.openSettings()`) y ofrecer la alternativa manual. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Usar las fotos seleccionadas, indicar que el acceso es **parcial/limitado** y ofrecer un botón para gestionar qué fotos comparte o ir a Ajustes si no encuentra la que busca. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Usar la ubicación sabiendo que es **aproximada** (~3 km²): mostrar *"Ubicación aproximada"* en vez de coordenadas exactas de aula, o permitir elegir el sector a mano. |

**¿Cuáles son los dos campos que deciden casi todo? ¿Qué pregunta responde cada uno?**
Los dos campos clave son:
1. **`granted` (o `status === 'granted'`):** responde a la pregunta ***"¿Puedo usar el recurso ahora mismo?"***.
2. **`canAskAgain`:** cuando `granted` es `false`, responde a la pregunta ***"¿Puedo mostrar el diálogo del sistema con `request...()` (`true` → botón «Continuar») o tengo que mandar a la persona a Ajustes con `Linking.openSettings()` (`false` → botón «Abrir Ajustes»)?"***.

---

### D4. Simulación del ciclo completo

**Tabla en Android 14 (app recién instalada, `expo-location`):**

| # | Acción | `status` | `canAskAgain` | ¿Diálogo? |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `getForegroundPermissionsAsync()` | `'undetermined'` | `true` | **No** |
| **2** | `requestForegroundPermissionsAsync()` → *“No permitir”* | `'denied'` | `true` | **Sí** (1° vez) |
| **3** | `requestForegroundPermissionsAsync()` → *“No permitir”* | `'denied'` | `false` | **Sí** (2° vez) |
| **4** | `requestForegroundPermissionsAsync()` | `'denied'` | `false` | **No** (ya estaba bloqueado) |
| **5** | `Linking.openSettings()` → habilita *“Mientras la app está en uso”* → vuelve y la app consulta | `'granted'` | `true` | **No** (se cambió en Ajustes) |
| **6** | Igual que el 5, pero la app **no** vuelve a consultar: ¿qué muestra? | `'denied'` *(en el estado viejo de React)* | `false` *(en el estado viejo de React)* | **No**. La pantalla **sigue mostrando “Permiso bloqueado / Abrir Ajustes”** porque el hook no se enteró del cambio al no re-consultar con `AppState`. |

**Repetí los pasos 1 a 4 en iOS. ¿En qué paso cambia el resultado y por qué? ¿Qué pasa en iOS si la persona elige “Permitir una vez” y después cierra y reabre la app?**
- **Pasos 1 a 4 en iOS:**
  - **Paso 1:** `status: 'undetermined'`, `canAskAgain: true`, ¿Diálogo?: **No**.
  - **Paso 2 (`request` → *"No permitir"*):** `status: 'denied'`, **`canAskAgain: false`**, ¿Diálogo?: **Sí**.
  - **Paso 3 (`request`):** `status: 'denied'`, `canAskAgain: false`, **¿Diálogo?: No**.
  - **Paso 4 (`request`):** `status: 'denied'`, `canAskAgain: false`, **¿Diálogo?: No**.
- **¿En qué paso cambia y por qué?** Cambia a partir del **Paso 2**: en iOS solo hay **una oportunidad** para mostrar el diálogo. Apenas el usuario toca *"No permitir"* la primera vez (Paso 2), `canAskAgain` pasa inmediatamente a `false` y en el Paso 3 ya no aparece el diálogo.
- **¿Qué pasa en iOS si elige “Permitir una vez” y después cierra y reabre la app?** Mientras la app está abierta en esa sesión, el permiso vale `status: 'granted'`. Cuando la persona cierra completamente la app y la vuelve a abrir, el permiso vuelve automáticamente al estado inicial: **`status: 'undetermined'` y `canAskAgain: true`**, por lo que la próxima vez que pida ubicación volverá a aparecer el diálogo del sistema.

---

### D5. Configurar `app.json`

```json
{
  "expo": {
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para leer el código QR del aula.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos.",
          "isAndroidBackgroundLocationEnabled": false,
          "isIosBackgroundLocationEnabled": false
        }
      ]
    ]
  }
}
```

**¿Por qué `expo-camera` agrega `RECORD_AUDIO` en Android aunque la app no grabe sonido?**
Porque el componente nativo `CameraView` de `expo-camera` sirve tanto para sacar fotos/leer QR como para **grabar video con audio** (`recordAsync()`). Por defecto, el plugin de `expo-camera` inyecta `android.permission.RECORD_AUDIO` en el `AndroidManifest.xml` por si la app llama a grabar video. Si nuestra app no graba video con sonido, debemos desactivarlo explícitamente con `"recordAudioAndroid": false` (y `"microphonePermission": false` en iOS) siguiendo el principio de mínimo privilegio.

---

### D6. Expo Go no es tu app

**a) ¿Por qué tus textos de propósito no aparecen cuando probás en Expo Go?**
Porque los textos de propósito en iOS se leen del archivo `Info.plist` compilado dentro del binario nativo de la aplicación. Cuando probás en **Expo Go**, el binario instalado en el teléfono es la app "Expo Go" (compilada por el equipo de Expo con sus propios textos genéricos en inglés), no tu binario propio. Tus textos de `app.json` recién se compilan en el `Info.plist` cuando generás una **development build** o una build de producción.

**b) ¿Qué se puede probar en Expo Go y qué necesita una development build? Pensá en push en Android y en ubicación en segundo plano.**
- **Se puede probar en Expo Go:** permisos de cámara, ubicación en primer plano, selector de imágenes (`expo-image-picker`) y **notificaciones locales** (`scheduleNotificationAsync`).
- **Necesita una development build:**
  - **Notificaciones Push remotas en Android** (eliminadas de Expo Go desde SDK 53 porque requieren tu propio `google-services.json` y credenciales FCM).
  - **Ubicación en segundo plano** (`TaskManager` + `startLocationUpdatesAsync`) con configuración nativa propia.
  - Ver tus propios **textos de propósito en iOS** (`Info.plist`).
  - Probar que **`blockedPermissions`** realmente quite permisos del `AndroidManifest.xml`.

**c) Escribí los comandos para ver los archivos nativos generados y para compilar una development build en Android.**
- Para generar/ver las carpetas nativas `android/` e `ios/` a partir de `app.json`:
  ```bash
  npx expo prebuild --clean
  ```
- Para compilar e instalar una development build en Android (localmente o en la nube con EAS):
  ```bash
  # Compilación local en tu máquina / emulador conectado:
  npx expo run:android

  # O en la nube con EAS Build:
  eas build --profile development --platform android
  ```

**d) ¿Cómo volvés un permiso a “sin decidir” sin reinstalar, en Android (`adb`) y en el simulador de iOS (`xcrun simctl`)?**
- **En Android (`adb`):**
  ```bash
  # Resetear todos los permisos de tiempo de ejecución del paquete:
  adb shell pm reset-permissions -p com.tuusuario.trabajo3

  # O revocar un permiso puntual:
  adb shell pm revoke com.tuusuario.trabajo3 android.permission.CAMERA
  ```
- **En el simulador de iOS (`xcrun simctl`):**
  ```bash
  # Resetear todos los permisos al estado "sin decidir" (undetermined):
  xcrun simctl privacy booted reset all com.tuusuario.trabajo3

  # O solo el de cámara:
  xcrun simctl privacy booted reset camera com.tuusuario.trabajo3
  ```

---

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

**Errores encontrados en el código original:**
1. **Rompe en el primer render (`permiso` es `null`):** `useCameraPermissions()` devuelve `permiso = null` mientras consulta al sistema operativo. Hacer `if (permiso.status === 'granted')` sin chequear antes `if (!permiso)` lanza un crash (`TypeError: Cannot read property 'status' of null`).
2. **No distingue entre “preguntable” y “bloqueado” (`canAskAgain: false`):** Si el usuario ya rechazó el permiso definitivamente (`!permiso.canAskAgain`), el botón *"Permitir"* sigue llamando a `pedirPermiso()`, lo cual **no hace nada** (no abre ningún diálogo) y deja al usuario sin forma de ir a Ajustes (`Linking.openSettings()`) ni de ingresar el aula manualmente.
3. **El botón de la pantalla previa dice “Permitir” en vez de “Continuar”:** una pantalla previa no concede el permiso por sí misma, sino que da paso al diálogo del sistema, por lo que debe decir *"Continuar"* para no confundir al usuario.

**Versión corregida con los cuatro estados (`cargando` → `concedido` → `preguntable` → `bloqueado`):**

```tsx
// src/app/escanear.tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Button, Linking, View } from 'react-native';
import { Explicacion } from '../components/Explicacion';

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();

  // 1. Estado: Cargando (primer render mientras responde el SO)
  if (!permiso) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 2. Estado: Concedido
  if (permiso.granted) {
    return <CameraView style={{ flex: 1 }} facing="back" />;
  }

  // 3. Estado: Preguntable (sin decidir o denegado con posibilidad de volver a pedir)
  if (permiso.canAskAgain) {
    return (
      <Explicacion texto="Usamos tu cámara para leer el código QR del aula.">
        <Button title="Continuar" onPress={pedirPermiso} />
      </Explicacion>
    );
  }

  // 4. Estado: Bloqueado (canAskAgain === false)
  return (
    <Explicacion texto="El acceso a la cámara está desactivado. Podés habilitarlo desde los Ajustes del teléfono o escribir el aula a mano.">
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
    </Explicacion>
  );
}
```

---

### E2. El orden importa (ubicación)

**a) ¿Qué está mal? ¿Qué ocurre en iOS y qué ocurre en Android 11+?**
- **¿Qué está mal?** La función pide primero el permiso en **segundo plano** (`requestBackgroundPermissionsAsync()`) antes de haber obtenido el permiso en **primer plano** (`requestForegroundPermissionsAsync()`).
- **¿Qué ocurre en Android 11+?** El sistema operativo **rechaza automáticamente** el pedido de ubicación en segundo plano (o lanza error) sin mostrar diálogo si la app no tiene concedido previamente el permiso de ubicación en primer plano.
- **¿Qué ocurre en iOS?** En iOS moderno el flujo obligatorio es escalonado (*provisional/step-up*): pedir `Background` sin tener `Foreground` falla o es ignorado por `CLLocationManager`. Siempre debe concederse primero *"Al usar la app"* y recién después solicitar *"Siempre"*.

**b) Reescribí la función correctamente:**

```ts
// src/lib/ubicacion.ts
import * as Location from 'expo-location';

export async function activarSeguimiento(): Promise<boolean> {
  // 1° Pedir siempre ubicación en primer plano
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) return false;

  // 2° Recién con primer plano concedido, pedir segundo plano
  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

**c) Escribí `obtenerUbicacion()` contemplando Android (`accuracy`) e iOS (`accuracy`) y devolviendo `null` si se deniega:**

```ts
// src/lib/ubicacion.ts
import * as Location from 'expo-location';

export type ResultadoUbicacion = {
  latitud: number;
  longitud: number;
  aproximada: boolean;
};

export async function obtenerUbicacion(): Promise<ResultadoUbicacion | null> {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) {
      return null;
    }

    // Detectar si el permiso es aproximado en Android ('coarse') o en iOS ('reduced')
    const aproximadaPorPermiso =
      permiso.android?.accuracy === 'coarse' ||
      (permiso as any).ios?.accuracy === 'reduced';

    const posicion = await Location.getCurrentPositionAsync({
      accuracy: aproximadaPorPermiso
        ? Location.Accuracy.Balanced
        : Location.Accuracy.High,
    });

    // Además, si el radio de incertidumbre supera los 1000 metros, es aproximada
    const aproximadaPorRadio =
      typeof posicion.coords.accuracy === 'number' &&
      posicion.coords.accuracy > 1000;

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada: Boolean(aproximadaPorPermiso || aproximadaPorRadio),
    };
  } catch {
    return null;
  }
}
```

**d) ¿Hace falta segundo plano para “farmacias cercanas”? ¿Qué exige Google Play si lo pedís?**
- **¿Hace falta segundo plano?** **No**, en absoluto. Buscar farmacias cercanas ocurre mientras la persona usuaria está mirando la pantalla de la app, por lo que alcanza con ubicación en **primer plano** (`WhenInUse`).
- **¿Qué exige Google Play si pedís `ACCESS_BACKGROUND_LOCATION`?** Exige completar una **Declaración de ubicación en segundo plano** en Play Console, grabar un **video demostrativo** probando que la función principal de la app no puede existir sin rastreo continuo con la app cerrada, y mostrar un aviso destacado (*prominent disclosure*). Si se pide solo para buscar locales cercanos, **Google Play rechaza la app**.

---

### E3. Notificaciones mudas

**a) ¿Cuál es la causa más probable? ¿Qué hay que hacer antes de pedir el permiso?**
La causa más probable en Android 13+ (como Android 14) con `expo-notifications` es que **no se creó ningún canal de notificaciones (`setNotificationChannelAsync`) antes de llamar a `requestPermissionsAsync()`** (o falta el plugin/permiso `POST_NOTIFICATIONS`). En Android 13+, `expo-notifications` requiere que exista al menos un canal de notificación creado antes de mostrar el diálogo del permiso `POST_NOTIFICATIONS`.

**b) ¿Qué pasa con este permiso en Android 12 o anterior?**
En Android 12 (API 32) o anterior no existía el permiso en tiempo de ejecución `POST_NOTIFICATIONS`. Las notificaciones estaban concedidas automáticamente desde el momento en que se instalaba la app, y `requestPermissionsAsync()` devolvía `{ status: 'granted', granted: true }` de inmediato sin mostrar ningún diálogo.

**c) ¿Qué opción de iOS permite recibir notificaciones sin diálogo? ¿Cómo detectás en código ese estado?**
- La opción se llama **Notificaciones provisionales (*Provisional Notifications*)**, que entregan las notificaciones de forma silenciosa en el Centro de Notificaciones de iOS con un botón para que el usuario decida si quiere conservarlas o apagarlas.
- Se solicita pasando `{ ios: { allowProvisional: true } }` a `requestPermissionsAsync()` y se detecta en código verificando:
  ```ts
  const permiso = await Notifications.getPermissionsAsync();
  const esProvisional =
    permiso.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  ```

**d) ¿En qué momento conviene pedir este permiso? Dá un ejemplo de buen y de mal momento.**
- **Mal momento:** apenas se abre la app por primera vez en la pantalla de bienvenida (*splash* o `useEffect` del `index.tsx`), cuando el usuario todavía ni siquiera sabe qué hace la app.
- **Buen momento:** cuando el usuario realiza una acción concreta donde espera un aviso futuro, por ejemplo **al activar el interruptor *"Avisarme cuando se resuelva mi reporte"*** en `/ajustes-app` o justo después de enviar su primer reporte de mantenimiento.

---

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
| :--- | :--- | :--- |
| **Elegir una foto de perfil** | `ImagePicker.launchImageLibraryAsync()` (Photo Picker del sistema) | **Ninguno** (no requiere permiso de galería). |
| **Sacar una foto en el momento** | `ImagePicker.launchCameraAsync()` o `CameraView` de `expo-camera` | **Cámara** (`CAMERA` / `NSCameraUsageDescription`). |
| **Editor que muestra toda la galería** | `expo-media-library` (`getAssetsAsync`) | **`READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO`** (Android) y **`NSPhotoLibraryUsageDescription`** (iOS). |
| **Adjuntar la foto de un comprobante** | `ImagePicker.launchImageLibraryAsync()` (Photo Picker del sistema) | **Ninguno** (no requiere permiso de galería). |

**¿Por qué Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO`? ¿Desde cuándo? ¿Qué es “el mejor permiso”?**
- **¿Por qué los restringe?** Porque conceder `READ_MEDIA_IMAGES` le da acceso a la app a **miles de fotos privadas** del usuario (documentos, familia, capturas bancarias) cuando el 95 % de las apps solo necesitan que el usuario suba 1 o 2 fotos puntuales (como un avatar o la foto de un desperfecto).
- **¿Desde cuándo?** La política de Fotos y Videos de Google Play entró en vigencia obligatoria en **mayo de 2025** (exigida definitivamente para todas las apps desde mediados de 2025): solo las apps cuyo propósito principal sea gestionar, editar o hacer backup de toda la galería pueden declarar `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO`; el resto está obligado a usar el **Photo Picker del sistema** (`launchImageLibraryAsync`).
- **¿Qué es “el mejor permiso”?** **El mejor permiso es el que no necesitás pedir**, porque al usar herramientas delegadas al sistema (como el Photo Picker del sistema o compartir archivos), el usuario tiene control total, la app no puede espiar el resto de los datos y nunca puede bloquearse por un permiso denegado.

---

### E5. Volver de Ajustes

**Código completado:**

```ts
// src/hooks/useRevisarAlVolver.ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
```

**a) ¿Por qué los hooks de Expo no se enteran solos de que el permiso cambió en Ajustes?**
Porque los hooks de permisos de Expo (`useCameraPermissions`, `useForegroundPermissions`, etc.) solo consultan al sistema operativo **al montarse el componente** y **cuando se llama a sus funciones `pedirPermiso()` o `consultarPermiso()`**. El sistema operativo no emite un evento push automático hacia React cuando la app vuelve del segundo plano tras haber cambiado un interruptor en la app Ajustes.

**b) ¿Qué función del hook de cámara le pasarías a `useRevisarAlVolver`?**
Le pasaría el **tercer elemento** de la tupla que devuelve `useCameraPermissions()`, que es la función `getPermission` (`consultarPermiso`), porque refresca el estado leyendo del sistema operativo sin disparar ningún diálogo:
```ts
const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
useRevisarAlVolver(consultarPermiso);
```

**c) ¿Por qué no conviene guardar el estado del permiso en un store global “para siempre”?**
Porque **la fuente de verdad del permiso es el sistema operativo, no tu app**. El usuario puede ir a Ajustes en cualquier momento y revocar o conceder el permiso, o haber elegido *"Solo esta vez"* / *"Permitir una vez"* (que expira al cerrar la app). Si guardás `granted: true` en `AsyncStorage` o en un store persistente "para siempre", tu app va a creer que tiene permiso cuando en realidad el sistema operativo ya se lo quitó, provocando fallos o pantallas rotas.

---

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
| :--- | :--- | :--- |
| **Delivery · ubicación** | Cuando la persona toca el botón *"Usar mi ubicación actual"* para elegir dónde recibir el pedido. | Buscador / formulario para escribir la calle, número y barrio manualmente. |
| **Billetera virtual · cámara** | Cuando la persona toca el botón *"Escanear QR"* para pagar. | Ingresar el alias, CVU/CBU o código de pago manualmente, o elegir una imagen del QR desde el selector de fotos. |
| **Red social · contactos** | Cuando la persona entra a la sección opcional *"Encontrar amigos de mi agenda"* y toca *"Buscar contactos"*. | Buscador por nombre de usuario (`@usuario`) o compartir enlace/código QR de invitación. |
| **Mensajería · micrófono** | Cuando la persona mantiene presionado o toca el ícono del micrófono para grabar un audio. | Seguir enviando mensajes de texto, emojis o adjuntos normalmente. |
| **Turnos médicos · notificaciones** | Al confirmar un turno (o al activar el switch *"Recordarme mi turno 24 hs antes"*). | Bandeja de avisos/recordatorios dentro de la app, envío por correo electrónico o botón *"Agendar en mi calendario"*. |
| **Editor de fotos · galería completa** | Al tocar *"Explorar mis álbumes"* para editar (o mejor aún, usar el selector del sistema si edita de a una foto). | Abrir el selector de fotos del sistema (`launchImageLibraryAsync`) para elegir fotos puntuales sin pedir permiso de toda la galería. |

**¿Por qué pedir cuatro permisos apenas se abre la app “entrena el No permitir automático”?**
Porque cuando una persona recién abre una app, su objetivo es entrar y ver la pantalla principal, no leer cuatro carteles seguidos que interrumpen su paso sin contexto. Al aparecer una ráfaga de diálogos fuera de contexto (cámara, ubicación, contactos, notificaciones) sin saber para qué sirve cada uno, la persona los percibe como invasivos o molestos y toca **"No permitir" por reflejo en todos** para sacárselos de encima. Peor aún: en iOS ese primer rechazo ya **bloquea el permiso** definitivamente (`canAskAgain: false`).

---

### F2. La pantalla previa

**a) ¿Qué tres elementos tiene una buena pantalla previa al diálogo del sistema?**
1. **El beneficio concreto en una frase clara** (qué dato se pide y para qué le sirve a la persona en ese momento, por ejemplo: *"Usamos tu cámara para leer el QR pegado en la puerta del aula"*).
2. **Un único botón de acción principal que diga “Continuar”** (que dispara el diálogo oficial del sistema).
3. **La aclaración de que es opcional / se puede cambiar en Ajustes** en cualquier momento (y que siempre cuenta con una alternativa si decide no concederlo).

**b) ¿Por qué el botón debe decir “Continuar” y no “Permitir”?**
Porque tocar ese botón de tu pantalla previa **todavía no concede el permiso**: solo pasa a mostrar el diálogo real del sistema operativo. Si tu pantalla tiene un botón *"Permitir"* y un segundo después aparece el diálogo del sistema volviendo a preguntar *"¿Permitir?"*, el usuario siente que la app falló o que lo están engañando. Además, Apple rechaza pantallas previas que imitan el diálogo oficial.

**c) ¿Qué dice la pauta 5.1.1(iv) de Apple sobre botones como “Ahora no” o “Cerrar” en esa pantalla?**
La pauta **5.1.1(iv) (Access to User Data)** de las *App Store Review Guidelines* establece que las pantallas previas explicativas deben llevar directamente al diálogo de permiso del sistema con un único botón (como *"Continuar"*), **sin incluir botones de escape como *"Ahora no"*, *"Cancelar"* o *"No permitir"*** que eviten que aparezca el diálogo oficial de iOS (salvo navegación estándar de volver atrás), ya que Apple exige que la decisión de aceptar o denegar se tome en el diálogo oficial del sistema y que se respete esa respuesta.

**d) ¿Cómo cambia la pantalla si el permiso ya está bloqueado?**
Si el permiso ya está bloqueado (`canAskAgain: false`), llamar a `pedirPermiso()` ya no mostrará el diálogo del sistema. Por lo tanto:
- El texto cambia para explicar que el permiso está desactivado y **indica los pasos para habilitarlo en Ajustes** (en Android y en iOS).
- El botón principal pasa de decir *"Continuar"* a decir ***"Abrir Ajustes"*** (ejecutando `Linking.openSettings()`).
- Se mantiene visible el camino alternativo (como *"Escribir el aula a mano"*).

---

### F3. Mínimo privilegio

**a) Ubicación precisa o aproximada para “puntos de reciclaje de tu barrio”.**
- **Elección:** **Ubicación aproximada** (`ACCESS_COARSE_LOCATION` / precisión reducida).
- **Justificación:** Para saber en qué barrio está la persona y mostrarle los puntos verdes de su zona (~3 km²) alcanza perfectamente con la ubicación aproximada, protegiendo la privacidad de su domicilio exacto y ahorrando batería de GPS.

**b) Ubicación “en uso” o “siempre” para “registrar una carrera con el celular en el bolsillo”.**
- **Elección:** **Ubicación “en uso” con servicio en primer plano (*Foreground Service* con notificación activa)** o ubicación en segundo plano solo mientras dura el entrenamiento activo.
- **Justificación:** No hace falta rastrear al usuario las 24 horas del día cuando no está corriendo; solo se necesita leer el GPS mientras la actividad deportiva está iniciada, mostrando un indicador visible en la barra de estado.

**c) Selector del sistema o permiso de galería para “subir la foto del DNI”.**
- **Elección:** **Selector del sistema** (`ImagePicker.launchImageLibraryAsync()`) — **sin permiso de galería**.
- **Justificación:** La app solo necesita **una** imagen puntual que el usuario elige conscientemente. Pedir `READ_MEDIA_IMAGES` le daría acceso a todas las fotos privadas del teléfono y violaría la política de Google Play.

**d) `expo-camera` con o sin micrófono para “escanear el QR del aula”.**
- **Elección:** **`expo-camera` sin micrófono** (`microphonePermission: false`, `recordAudioAndroid: false` y `RECORD_AUDIO` en `blockedPermissions`).
- **Justificación:** Un código QR es puramente visual; pedir permiso de micrófono para leer un QR genera desconfianza en el usuario y viola el principio de mínimo privilegio.

---

### F4. Tiendas

**a) Nombrá dos requisitos de Google Play y dos de App Store relacionados con permisos y privacidad.**
- **Google Play:**
  1. **Restricción de Fotos y Videos (`READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO`):** prohibido declararlos para usos de selección puntual; es obligatorio usar el Photo Picker del sistema.
  2. **Aprobación especial de Ubicación en segundo plano (`ACCESS_BACKGROUND_LOCATION`):** requiere aviso destacado (*prominent disclosure*) en la app y formulario con video justificativo en Play Console.
- **App Store (Apple):**
  1. **Textos de propósito obligatorios y específicos (Pauta 5.1.1):** toda clave `NS...UsageDescription` debe explicar claramente con el molde *"Usamos tu [dato] para [beneficio concreto]"* y no se puede bloquear el uso de funciones no relacionadas si el usuario deniega un permiso.
  2. **Manifiesto de privacidad (`PrivacyInfo.xcprivacy`):** obligatorio declarar las APIs de razón requerida (*Required Reason APIs*) y los datos recolectados por la app y sus SDKs.

**b) ¿Qué es el manifiesto de privacidad (`PrivacyInfo.xcprivacy`) y dónde se configura en Expo?**
Es un archivo exigido por Apple desde mayo de 2024 donde la app y sus SDKs declaran qué datos recolectan, si se usan para rastreo y por qué razón legítima llaman a ciertas APIs del sistema (*Required Reason APIs*, como espacio en disco, `UserDefaults` o tiempos de inicio).
En Expo se configura directamente en `app.json` bajo la propiedad **`expo.ios.privacyManifests`**:
```json
{
  "expo": {
    "ios": {
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": []
      }
    }
  }
}
```

**c) ¿Qué suma Android 17 y qué va a exigir Google Play desde el 27/01/2027 a las apps que hoy piden `READ_CONTACTS`?**
Android 17 incorpora el **Selector de Contactos del sistema (*System Contacts Picker*)** mejorado y granular (similar al Photo Picker para fotos), que permite que la persona elija qué contacto(s) y qué campos puntuales (solo teléfono o solo email) quiere compartir con la app sin darle acceso a toda su agenda.
En línea con la política de Fotos y Videos, desde el **27/01/2027** Google Play **restringirá `READ_CONTACTS`** únicamente a las apps cuya función principal sea la gestión de contactos o comunicación telefónica/mensajería por defecto, exigiendo al resto de las apps usar el selector de contactos del sistema sin pedir `READ_CONTACTS`.

---

### F5. Errores comunes

**a) La consola de Xcode muestra: “This app has crashed because it attempted to access privacy-sensitive data without a usage description.”**
- **Causa:** La app intentó pedir un permiso o usar una API protegida en iOS sin tener declarada la clave `NS...UsageDescription` correspondiente en el archivo `Info.plist` del binario nativo.
- **Solución:** Agregar el plugin con el texto de propósito en `app.json` (por ejemplo, `"cameraPermission": "Usamos tu cámara para..."` en `expo-camera`) y **recompilar la development build** (`npx expo run:ios` o `eas build`), ya que los cambios en `Info.plist` requieren una nueva build nativa.

**b) “En Expo Go anda, en la build no”: en la development build la cámara se deniega sin mostrar ningún diálogo.**
- **Causa:** En Android, el permiso `android.permission.CAMERA` no quedó declarado en el `AndroidManifest.xml` de tu build (por ejemplo, porque lo pusiste por error en `blockedPermissions` o modificaste la configuración nativa sin el plugin), mientras que en Expo Go sí funcionaba porque el binario de Expo Go ya trae todos los permisos declarados.
- **Solución:** Configurar correctamente el plugin `"expo-camera"` en `app.json`, verificar que `android.permission.CAMERA` no esté en `blockedPermissions`, correr `npx expo prebuild --clean` para verificar el `AndroidManifest.xml` y recompilar la development build.

**c) Después de habilitar la ubicación en Ajustes, la app sigue diciendo “bloqueado”.**
- **Causa:** Cuando el usuario **concede** un permiso en Ajustes y vuelve a la app, el sistema operativo no reinicia la app, y el hook de permisos de Expo no vuelve a consultar el estado por sí solo cuando la app regresa del segundo plano.
- **Solución:** Suscribirse a `AppState.addEventListener('change', ...)` (como en nuestro hook `usePermiso` / `useRevisarAlVolver`) para que cada vez que el estado pase de `background`/`inactive` a `'active'`, se llame a `consultarPermiso()` (`getForegroundPermissionsAsync()`).

**d) La pantalla queda en “Pidiendo permiso…” para siempre porque el código llama a `request…()` cada vez que se renderiza.**
- **Causa:** Se llamó a `pedirPermiso()` suelto en el cuerpo del componente o dentro de un `useEffect` que se dispara en cada render cuando `permiso.granted` es `false`. Cuando el usuario rechaza o el permiso queda con `canAskAgain: false`, `request...()` resuelve de inmediato con `granted: false`, actualiza el estado, provoca otro render y vuelve a llamar a `request...()` en un bucle infinito.
- **Solución:** Nunca llamar a `request...()` automáticamente en cada render. Al montar la pantalla solo se debe **consultar** (`get...`), y `request...()` (`pedirPermiso()`) debe ejecutarse **únicamente en el evento `onPress`** del botón *"Continuar"* cuando `canAskAgain` es `true`.

**e) Una app de turnos no permite entrar a ninguna pantalla si se deniegan las notificaciones.**
- **Causa:** Mal diseño de permisos que trata un permiso opcional como un bloqueo total de la aplicación (violando la pauta 5.1.1 de Apple y las buenas prácticas de Android).
- **Solución:** **La app nunca debe bloquearse.** Si el usuario deniega las notificaciones, la app debe permitirle sacar, ver y cancelar sus turnos normalmente y ofrecerle una **alternativa dentro de la app** (por ejemplo, una pestaña *"Avisos"* o bandeja de notificaciones interna en `/avisos`).

