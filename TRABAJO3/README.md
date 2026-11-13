# Trabajo Práctico N° 3 — Permisos móviles: Android, iOS y Expo
## Sistema: “Mantenimiento IPF”

Aplicación desarrollada con **React Native**, **Expo** y **Expo Router** para que estudiantes y docentes del **Instituto Politécnico Formosa (IPF)** reporten desperfectos edilicios (electricidad, agua, mobiliario, equipos) y reciban avisos cuando se resuelven, aplicando las buenas prácticas de permisos móviles en **Android** e **iOS**:

- **Pedidos en contexto**: ningún permiso se solicita al abrir la app ni al entrar al formulario; cada permiso se pide recién cuando la persona usuaria toca su función específica.
- **Pantallas previas (`rationale`)**: antes de disparar el diálogo nativo del sistema se muestra el beneficio concreto en una frase con un único botón **“Continuar”** (sin botones *“Ahora no”* ni *“Cerrar”*, cumpliendo la pauta 5.1.1(iv) de Apple).
- **Cuatro estados + `AppState`**: el hook unificado `usePermiso(recurso)` distingue `'cargando' | 'concedido' | 'preguntable' | 'bloqueado'`, detecta acceso `parcial` (ubicación aproximada o fotos limitadas) y re-consulta automáticamente al volver de los Ajustes del sistema.
- **Mínimo privilegio y Photo Picker del sistema**: para elegir una foto existente se utiliza `ImagePicker.launchImageLibraryAsync` **sin pedir permiso de galería ni declarar `READ_MEDIA_IMAGES`**.
- **La app nunca se bloquea**: cada permiso cuenta con su camino alternativo (código de aula a mano, foto desde el selector del sistema, sector elegido manualmente y bandeja interna de avisos en `/avisos`).

> 📄 Las respuestas teóricas y ejercicios de las **Partes A a F** se encuentran en el archivo [RESPUESTAS.md](./RESPUESTAS.md).

---

## 1. Árbol de carpetas de `src/app` y organización del proyecto (Requisito G1, G3 y G5.3)

```text
TRABAJO3/
├── app.json                         # Fuente de verdad de permisos, plugins y blockedPermissions
├── package.json                     # Dependencias instaladas con npx expo install
├── RESPUESTAS.md                    # Respuestas teóricas y ejercicios (Partes A a F)
├── README.md                        # Documentación técnica y tabla de permisos
└── src/
    ├── app/                         # Rutas de Expo Router (G1)
    │   ├── _layout.tsx              # Stack raíz (configura modales y cabeceras)
    │   ├── ajustes-app.tsx          # URL: /ajustes-app (interruptor de notificaciones)
    │   ├── (tabs)/                  # Grupo de pestañas (invisible en la URL)
    │   │   ├── _layout.tsx          # Tabs: "Reportes" (/), "Avisos" (/avisos), "Permisos" (/permisos)
    │   │   ├── index.tsx            # URL: / (lista de reportes propios y botón "Nuevo reporte")
    │   │   ├── avisos.tsx           # URL: /avisos (bandeja interna, alternativa a notificaciones)
    │   │   └── permisos.tsx         # URL: /permisos (panel en tiempo real con estado y matiz)
    │   ├── permisos/
    │   │   └── [recurso].tsx        # URL: /permisos/[recurso] (modal de pantalla previa / bloqueo)
    │   └── reporte/
    │       ├── nuevo.tsx            # URL: /reporte/nuevo (formulario sin permisos al abrir)
    │       ├── escanear.tsx         # URL: /reporte/escanear (lector QR con 4 estados + aula manual)
    │       ├── foto.tsx             # URL: /reporte/foto (cámara o selector del sistema sin permiso)
    │       ├── ubicacion.tsx        # URL: /reporte/ubicacion (GPS primer plano o sector manual)
    │       └── [id].tsx             # URL: /reporte/[id] (detalle, validación de ID y simular resolución)
    ├── components/                  # Componentes reutilizables de UI
    │   ├── TarjetaPermiso.tsx       # BadgeEstadoPermiso y ExplicacionPermiso (Continuar / Abrir Ajustes)
    │   ├── boton.tsx                # Botón reutilizable con variantes primario, secundario y peligro
    │   ├── icono.tsx                # Íconos tipados de interfaz
    │   ├── pantalla.tsx             # Contenedor adaptable con ScrollView y soporte claro/oscuro
    │   └── texto.tsx                # Tipografía base (Titulo, Subtitulo, Parrafo)
    ├── hooks/                       # Hooks personalizados
    │   ├── usePermiso.ts            # Hook unificado usePermiso(recurso) con los 4 estados + parcial
    │   ├── useRevisarAlVolver.ts    # Hook con AppState para refrescar al volver de Ajustes
    │   └── use-colores.ts           # Hook de paleta de colores claro/oscuro
    └── lib/                         # Lógica de permisos y estado del dominio
        ├── permisos.ts              # Consultas, solicitudes, canal Android "reportes" y ubicación respetuosa
        └── reportes.ts              # Store reactivo de reportes, borrador, avisos y simulación a 10s
```

### Correspondencia entre archivos y URLs requeridas (G1)

| URL requerida | Archivo en `src/app/` | Tipo de navegación |
| :--- | :--- | :--- |
| `/` | `src/app/(tabs)/index.tsx` | Tab **“Reportes”** |
| `/reporte/nuevo` | `src/app/reporte/nuevo.tsx` | Stack |
| `/reporte/escanear` | `src/app/reporte/escanear.tsx` | Stack |
| `/reporte/foto` | `src/app/reporte/foto.tsx` | Stack |
| `/reporte/ubicacion` | `src/app/reporte/ubicacion.tsx` | Stack |
| `/reporte/[id]` | `src/app/reporte/[id].tsx` | Stack dinámico |
| `/avisos` | `src/app/(tabs)/avisos.tsx` | Tab **“Avisos”** |
| `/permisos` | `src/app/(tabs)/permisos.tsx` | Tab **“Permisos”** |
| `/permisos/[recurso]` | `src/app/permisos/[recurso].tsx` | Modal (`presentation: "modal"`) |
| `/ajustes-app` | `src/app/ajustes-app.tsx` | Stack |

---

## 2. Configuración de `app.json` comentada y mínimo privilegio (Requisito G3 y G5.3)

A continuación se detalla el bloque de configuración de permisos en `app.json`, aplicando textos de propósito con el molde **“Usamos tu [dato] para [beneficio concreto]”** (pauta 5.1.1 de Apple) y el principio de **mínimo privilegio**:

```jsonc
{
  "expo": {
    "android": {
      "package": "com.ipf.mantenimiento",
      // Permisos bloqueados explícitamente (generan tools:node="remove" en AndroidManifest.xml):
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",              // No grabamos video con audio ni notas de voz
        "android.permission.SYSTEM_ALERT_WINDOW",       // No dibujamos ventanas flotantes sobre otras apps
        "android.permission.ACCESS_BACKGROUND_LOCATION",// Solo usamos ubicación en primer plano
        "android.permission.READ_MEDIA_IMAGES",         // Usamos el Photo Picker del sistema sin permiso de galería
        "android.permission.READ_MEDIA_VIDEO",          // No leemos videos de la galería del dispositivo
        "android.permission.READ_EXTERNAL_STORAGE",     // No leemos almacenamiento externo en Android <= 12
        "android.permission.WRITE_EXTERNAL_STORAGE"     // No escribimos fuera del sandbox de la app
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          // Texto de propósito para NSCameraUsageDescription en iOS:
          "cameraPermission": "Usamos tu cámara para escanear el código QR del aula y sacar fotos de los desperfectos a reportar.",
          // Mínimo privilegio: desactiva NSMicrophoneUsageDescription en iOS y RECORD_AUDIO en Android:
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          // Texto de propósito para NSLocationWhenInUseUsageDescription en iOS:
          "locationWhenInUsePermission": "Usamos tu ubicación para identificar el sector del instituto donde se encuentra el desperfecto.",
          // Mínimo privilegio: prohibimos ubicación en segundo plano ("Siempre") en ambas plataformas:
          "locationAlwaysAndWhenInUsePermission": false,
          "locationAlwaysPermission": false,
          "isAndroidBackgroundLocationEnabled": false,
          "isIosBackgroundLocationEnabled": false
        }
      ],
      [
        "expo-image-picker",
        {
          "cameraPermission": "Usamos tu cámara para sacar una foto del desperfecto que querés adjuntar al reporte.",
          "photosPermission": "Usamos tus fotos para adjuntar al reporte una imagen del desperfecto seleccionada desde tu teléfono.",
          "microphonePermission": false
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/images/android-icon-monochrome.png",
          "color": "#208AEF",
          // Canal por defecto requerido en Android 13+ antes de pedir POST_NOTIFICATIONS:
          "defaultChannel": "reportes"
        }
      ]
    ]
  }
}
```

### Justificación de cada permiso en `blockedPermissions` (G3)

1. **`android.permission.RECORD_AUDIO`**: `expo-camera` e `expo-image-picker` suelen incluirlo por defecto por si la app graba video con sonido. Como “Mantenimiento IPF” solo lee códigos QR y toma fotografías estáticas, se elimina por mínimo privilegio.
2. **`android.permission.SYSTEM_ALERT_WINDOW`**: permiso especial para superponer vistas sobre otras aplicaciones; innecesario en nuestra app.
3. **`android.permission.ACCESS_BACKGROUND_LOCATION`**: para ubicar en qué sector del instituto está un desperfecto alcanza con ubicación en primer plano (`WhenInUse`).
4. **`android.permission.READ_MEDIA_IMAGES` y `android.permission.READ_MEDIA_VIDEO`**: desde mayo de 2025 Google Play restringe estos permisos a apps cuya función principal sea gestionar toda la galería. Para adjuntar la foto de un desperfecto usamos el **Photo Picker del sistema** (`ImagePicker.launchImageLibraryAsync`), que no requiere ningún permiso.
5. **`android.permission.READ_EXTERNAL_STORAGE` y `android.permission.WRITE_EXTERNAL_STORAGE`**: permisos heredados de almacenamiento masivo que no se necesitan gracias al selector del sistema y al *sandbox* propio de la app.

---

## 3. Tabla de permisos del sistema (Requisito G5.3)

| Recurso | Módulo de Expo | ¿Cuándo se pide? (En contexto) | Camino alternativo si se deniega o bloquea |
| :--- | :--- | :--- | :--- |
| **Cámara (Escanear QR)** | `expo-camera` | Recién cuando la persona entra a `/reporte/escanear` y toca **“Continuar”** en la tarjeta previa. | Escribir el código del aula a mano o tocar uno de los botones rápidos (`AULA-204`, `LAB-102`, etc.). |
| **Cámara (Sacar foto)** | `expo-image-picker` / `expo-camera` | Recién cuando la persona toca **“Sacar foto”** en `/reporte/foto` y confirma con **“Continuar”**. | Usar **“Elegir de la galería”** con el selector del sistema (`launchImageLibraryAsync`), que no requiere permisos. |
| **Fotos (Elegir existente)** | `expo-image-picker` (*Photo Picker*) | **Nunca pide permiso.** Delega la selección al selector nativo del sistema operativo. | El propio selector del sistema funciona siempre sin permisos. |
| **Ubicación (Primer plano)** | `expo-location` | Recién cuando la persona toca **“Usar mi ubicación actual”** en `/reporte/ubicacion` y toca **“Continuar”**. | Elegir manualmente el sector del edificio (*Patio Central*, *Estacionamiento*, *Pasillo*, etc.). Si la ubicación es aproximada (`coarse`/`reduced`), no muestra coordenadas exactas sino *“Ubicación aproximada”*. |
| **Notificaciones** | `expo-notifications` | Únicamente cuando la persona activa el interruptor **“Avisarme cuando se resuelva mi reporte”** en `/ajustes-app` (creando antes el canal `"reportes"` en Android). | Todos los avisos de resolución se envían a la **Bandeja interna de Avisos** en la pestaña `/avisos`. |

---

## 4. Guía rápida para la Defensa Oral (Requisito G6)

1. **¿Qué código decide entre “Continuar” y “Abrir Ajustes” y qué campo de la respuesta lo decide?**
   - En `src/lib/permisos.ts` (`calcularEstado`) y `src/components/TarjetaPermiso.tsx` (`ExplicacionPermiso`): cuando `granted` es `false`, el campo que lo decide es **`canAskAgain`**. Si `canAskAgain === true`, el estado es `'preguntable'` y el botón dice **“Continuar”** (`pedir()`); si `canAskAgain === false`, el estado es `'bloqueado'` y el botón dice **“Abrir Ajustes”** (`Linking.openSettings()`).
2. **Si revocás la cámara desde Ajustes con la app abierta y volvés, ¿qué hace Android con la app? ¿Cómo se entera tu código cuando se habilita un permiso en Ajustes?**
   - Al **revocar** un permiso en Ajustes, Android **mata el proceso de la app** por seguridad y al volver se reinicia limpia. En cambio, al **conceder** un permiso en Ajustes y volver, Android no reinicia la app; nuestro hook `usePermiso` se entera gracias a `useRevisarAlVolver` (`AppState.addEventListener('change', ...)`), que detecta el paso de `inactive|background` a `'active'` y vuelve a ejecutar `consultarPermisoRecurso()`.
3. **¿Por qué tu app no pide permiso para elegir una foto, pero sí para sacarla?**
   - Porque para elegir una foto existente usa el **Photo Picker del sistema** (`ImagePicker.launchImageLibraryAsync()`): es el propio sistema operativo quien abre una ventana segura fuera de la app y entrega solo el archivo elegido. En cambio, para sacar una foto nueva la app necesita acceder al sensor de hardware de la **cámara** en vivo.
4. **¿Qué cambia en la app si la persona elige ubicación aproximada? ¿Y si la deniega?**
   - Si elige **ubicación aproximada** (`android.accuracy === 'coarse'` o `ios.accuracy === 'reduced'`), `obtenerUbicacionActualRespetuosa()` detecta `parcial = true` y **no muestra coordenadas exactas**, sino el texto *“Ubicación aproximada”*. Si la **deniega**, la app no se bloquea y guarda el reporte con el **sector del edificio elegido a mano**.
5. **¿Por qué tus textos de propósito no aparecían en Expo Go?**
   - Porque iOS lee las claves `NS...UsageDescription` del archivo `Info.plist` compilado dentro del binario nativo. Expo Go es un binario precompilado por Expo con sus propios textos en inglés; nuestros textos de `app.json` recién se inyectan en el `Info.plist` al compilar una **development build** (`npx expo run:ios` / `eas build`).
6. **Si mañana agregás la nota de voz, ¿alcanza con publicar una actualización OTA? ¿Por qué?**
   - **No alcanza con una actualización OTA.** Una OTA solo actualiza el código JavaScript y assets, pero agregar grabación de voz requiere declarar `NSMicrophoneUsageDescription` en `Info.plist` y `android.permission.RECORD_AUDIO` en `AndroidManifest.xml` (además de incluir el módulo nativo `expo-audio`), lo cual modifica el binario nativo y exige compilar una **nueva build**.

---

## 5. Ejecución del proyecto y capturas (G5.3 y G5.4)

```bash
cd TRABAJO3
npx expo start
```

### Capturas de prueba
- [ ] Escáner en sus cuatro estados (`cargando`, `preguntable`, `concedido`, `bloqueado`).
- [ ] Ubicación concedida (precisa / aproximada) y denegada (sector elegido a mano).
- [ ] Foto elegida desde el selector del sistema sin permiso de galería.
- [ ] Notificación local recibida a los 10 segundos al tocar *“Simular resolución”*.
- [ ] Panel de permisos (`/permisos`) antes y después de volver de Ajustes.
- [ ] Captura del diálogo del sistema en una *development build* mostrando el texto de propósito propio.
