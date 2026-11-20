# Trabajo Práctico N° 4 — App integradora: “Biblioteca IPF”
## Análisis Técnico sobre el Código Propio (Partes B a E)

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

Archivo analizado: `src/hooks/useLibros.ts` (líneas 19 a 55).

**a) Render por render desde que se monta el Catálogo hasta que aparece la lista (y cuando falla y se toca “Reintentar”):**

- **Caso exitoso (`obtenerLibros()` resuelve a los 800 ms):**
  1. **Render 1 (montaje inicial):** `libros = []`, `cargando = true`, `error = null`, `intento = 0`. Lo provoca el montaje inicial del componente `CatalogoScreen` (`src/app/(tabs)/(catalogo)/index.tsx`). En pantalla se ve el `ActivityIndicator` (*"Cargando catálogo de la biblioteca..."*).
  2. **Ejecución del `useEffect` (línea 30):** luego del primer commit en pantalla, React ejecuta el efecto y llama a `cargarCatalogo()`. Aunque adentro llama a `setCargando(true)` y `setError(null)`, como ya tenían esos mismos valores iniciales, React no dispara un render extra innecesario y espera los 800 ms de `obtenerLibros()`.
  3. **Render 2 (llegan los datos):** `obtenerLibros()` resuelve, `cancelado` sigue en `false`, y se ejecuta `setLibros(datos)` + `setCargando(false)` (líneas 38-39). Gracias al *automatic batching* de React 19, ambos `setState` se agrupan en **un único render** donde `libros = [16 libros]`, `cargando = false`, `error = null`. En pantalla se renderiza la `FlatList` con el catálogo.

- **Caso de error + toque en “Reintentar”:**
  1. **Render 1 (montaje):** `libros = []`, `cargando = true`, `error = null`, `intento = 0`.
  2. **Render 2 (falla `obtenerLibros()`):** entra al `catch` (líneas 41-46) y agrupa `setError('No se pudo conectar...')` + `setCargando(false)`. Ahora `libros = []`, `cargando = false`, `error = 'No se pudo conectar...'`. En pantalla aparece la caja de error con el botón **“Reintentar”**.
  3. **Render 3 (la persona toca “Reintentar”):** se ejecuta `setIntento((n) => n + 1)` (línea 27), `intento` pasa a `1`. React re-renderiza con `cargando = false`, `error = '...'` y al detectar que cambió `[intento]` ejecuta la limpieza del efecto anterior (`cancelado = true`) y lanza nuevamente `cargarCatalogo()`.
  4. **Render 4 (arranca el nuevo pedido):** `setCargando(true)` y `setError(null)` (líneas 34-35) pasan la pantalla de nuevo al `ActivityIndicator`.
  5. **Render 5 (resuelve el segundo intento):** `setLibros(datos)` + `setCargando(false)` → aparece la `FlatList` con los 16 libros.

**b) ¿Se desmonta el Catálogo al cambiar a la pestaña “Mis reservas”? ¿Y al abrir un detalle? ¿Cuándo se ejecuta realmente la limpieza?**
- **Al cambiar a la pestaña “Mis reservas”:** **no se desmonta**. React Navigation / Expo Router mantiene montadas las pestañas ya visitadas para preservar su estado y scroll.
- **Al abrir un detalle (`/libro/[isbn]`):** **tampoco se desmonta**, porque el detalle se apila *encima* del Catálogo dentro del mismo `Stack` (`src/app/(tabs)/(catalogo)/_layout.tsx`), dejando al Catálogo debajo en la pila.
- **¿En qué situaciones reales se ejecuta la limpieza (`return () => { cancelado = true; }`, líneas 50-52)?**
  1. Cada vez que cambia `intento` al tocar **“Reintentar”** (React limpia el efecto anterior antes de correr el nuevo).
  2. Cuando se navega con `router.replace` o un deep link reemplaza completamente el árbol de `(tabs)`.
  3. Durante el desarrollo (Fast Refresh) o si el componente se desmonta por un cambio de árbol superior.

**c) ¿Por qué no se puede pasar una función `async` directamente a `useEffect`? Cómo lo resolvimos:**
Una función `async` siempre devuelve una **`Promise`**, pero `useEffect` espera que el valor de retorno sea estrictamente `undefined` o una **función de limpieza síncrona** `() => void`. Si le pasáramos `useEffect(async () => ...)`, React recibiría una `Promise` en vez de la función de limpieza (y TypeScript además marca error).
En `src/hooks/useLibros.ts` (líneas 30-53) definimos una función `async` interna `cargarCatalogo()`, la invocamos con `void cargarCatalogo()` y devolvemos la función de limpieza síncrona:
```ts
useEffect(() => {
  let cancelado = false;

  async function cargarCatalogo() {
    // ...
    const datos = await obtenerLibros();
    if (!cancelado) {
      setLibros(datos);
      setCargando(false);
    }
  }

  void cargarCatalogo();
  return () => {
    cancelado = true;
  };
}, [intento]);
```

**d) Cómo implementamos `reintentar` y por qué `intento` está en el array de dependencias:**
Creamos un contador `const [intento, setIntento] = useState<number>(0)` y `const reintentar = useCallback(() => setIntento((n) => n + 1), [])` (`src/hooks/useLibros.ts`, líneas 24-28). Colocamos `[intento]` como única dependencia del `useEffect` porque es un número que **siempre cambia** con cada toque en “Reintentar” (a diferencia de un booleano que requeriría alternar o `error` que podría disparar bucles si no se controla con cuidado).

---

### B2. La condición de carrera del buscador

Archivo analizado: `src/app/buscar.tsx` (líneas 60 a 86).

| Momento | Qué pasa | Sin limpieza: qué se ve | Con nuestro código (`cancelado = true`): qué se ve |
| :--- | :--- | :--- | :--- |
| **t = 0 ms** | Escribe “bor” → se pide `buscarLibros("bor")` (tarda 1400 ms). | Indicador de carga (*Buscando "bor"...*). | Indicador de carga (*Buscando "bor"...*). |
| **t = 200 ms** | Escribe “borges” → se pide `buscarLibros("borges")` (tarda 300 ms). | Indicador de carga (*Buscando "borges"...*). | Se ejecuta la limpieza del efecto de `"bor"` (`cancelado = true`) y arranca el nuevo efecto de `"borges"` (indicador de carga). |
| **t = 500 ms** | Llega la respuesta de “borges”. | Se ven los libros de **Borges** (*Ficciones*, *El Aleph*). | Se ven los libros de **Borges** (*Ficciones*, *El Aleph*) porque el `cancelado` de este efecto sigue en `false`. |
| **t = 1400 ms** | Llega la respuesta de “bor”. | **Error de carrera:** sobrescribe la pantalla con los resultados viejos de `"bor"`, aunque el input dice `"borges"`. | **Siguen viéndose los libros de Borges.** La respuesta de `"bor"` encuentra su bandera `cancelado === true` y se descarta silenciosamente. |

**a) Qué hace exactamente la limpieza de nuestro efecto y cuándo se ejecuta:**
En `src/app/buscar.tsx` (líneas 60-86), cada ejecución del `useEffect([consulta, intento])` crea su propia variable local `let cancelado = false` dentro de la clausura del efecto y devuelve `() => { cancelado = true; }`. React ejecuta esa limpieza **justo antes de lanzar el nuevo efecto cuando cambia `consulta`** (en t = 200 ms) o al desmontar la pantalla. Así, cuando el `await buscarLibros("bor")` termina en t = 1400 ms, su propio `cancelado` ya vale `true` y no llama a `setResultados`.

**b) La propuesta del compañero (`if (texto === q) setResultados(datos)`):**
**No funciona.** En JavaScript, la función flecha pasada al `.then()` forma una **clausura (*closure*)** sobre el entorno léxico del render en el que se creó el efecto. Por lo tanto, tanto `texto` como `q` dentro de ese `.then()` guardan **el valor de `q` de aquel render viejo (`"bor"`)**, no el valor actual (`"borges"`). La comparación `"bor" === "bor"` siempre da `true` y la respuesta vieja sobrescribe igual a la nueva.

**c) Qué pasa con la URL y el botón atrás al escribir con `router.setParams` vs `router.push`:**
Con `router.setParams({ q: nuevoTexto })` (`src/app/buscar.tsx`, línea 53), se actualiza el parámetro `q` de la pantalla **actual** en la URL (`/buscar?q=b` → `/buscar?q=bo` → `/buscar?q=borges`) **sin apilar nuevas entradas** en el Stack. Al tocar atrás una sola vez, volvés directo al Catálogo.
Si hubiéramos usado `router.push('/buscar?q=' + nuevoTexto)`, cada letra tipeada apilaría una pantalla nueva en el historial y el usuario tendría que tocar atrás 6 veces para salir de `"borges"`.

---

### B3. Mutar o reemplazar

**a) La persona toca “Anotarme” tres veces en el fragmento del enunciado. ¿Qué muestra el texto y por qué?**
Muestra **`Personas en espera: 0`**. Porque `espera.encolar('Ana')` muta internamente el array privado `#items` del objeto `Cola`, pero nunca llama a un `setState` con una **referencia nueva**, de modo que React no se entera de que hubo un cambio y **no vuelve a renderizar** el componente.

**b) Luego escribe en un `TextInput` controlado y el número “salta” a 3. ¿Por qué pasa y por qué es peor un error intermitente?**
Al escribir en el `TextInput` controlado, el `setState` de ese input sí dispara un re-render del componente. Durante ese render, JSX vuelve a leer `espera.tamanio` (que internamente ya valía `3` por las 3 mutaciones previas) y el número "salta" de 0 a 3 de golpe.
Un error que aparece “a veces” (solo cuando no hay otro re-render cercano) es mucho peor que un crash constante porque **pasa desapercibido en pruebas rápidas** y se manifiesta recién en producción cuando el usuario interactúa en otro orden, volviéndose muy difícil de reproducir y depurar.

**c) Cómo lo resolvimos en nuestro Context y comparación con otras alternativas:**
En `src/context/biblioteca.tsx` (líneas 178-186 y 242-250) y en `src/estructuras/Cola.ts` (líneas 48-50), implementamos el método `clonar()` y **reemplazamos la instancia completa** en el estado:
```ts
const colaActual = listasEspera[libro.isbn];
const nuevaCola = colaActual ? colaActual.clonar() : new Cola<string>();
nuevaCola.encolar(NOMBRE_ESTUDIANTE);

setListasEspera((prev) => ({
  ...prev,
  [libro.isbn]: nuevaCola,
}));
```
- **Comparación con contador de versión (`const [version, setVersion] = useState(0)`):**
  - *Clonar la instancia (nuestra elección):* respeta la inmutabilidad de React, funciona bien con `useMemo` y React Compiler sin depender de variables artificiales. Costo: copiar el array interno (`O(n)`), totalmente despreciable para listas de espera de decenas de personas.
  - *Contador de versión:* evita clonar (`O(1)`), pero rompe el modelo inmutable de React (la referencia de `Cola` sigue siendo la misma, lo que puede engañar a `React.memo` o `useEffect([listasEspera])`).

---

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en nuestra app | Por qué ahí y no en otro lugar |
| :--- | :--- | :--- |
| **Texto del buscador (`q`)** | **URL** (`useLocalSearchParams` + `router.setParams` en `src/app/buscar.tsx`, líneas 41-54). | Permite deep links directos (`bibliotecaipf://buscar?q=borges`) y conserva la búsqueda como parte de la ruta. |
| **Préstamos y reservas** | **Context** (`BibliotecaContext` en `src/context/biblioteca.tsx`, línea 81). | Se leen y modifican desde varias pantallas (`/libro/[isbn]`, `/reservar/[isbn]`, `/reservas`, `/mostrador`). |
| **Listas de espera** | **Context** (`listasEspera` en `src/context/biblioteca.tsx`, líneas 82-84). | Las consulta el Catálogo, el Detalle, `/reservar`, `/reservas` y las desencola `/mostrador`. |
| **Vistos recientemente** | **Context** (`pilaRecientes` en `src/context/biblioteca.tsx`, líneas 85-87). | Se apila desde `/libro/[isbn]` y se muestra arriba en el Catálogo (`/`). |
| **Sesión del personal** | **Context** (`personalLogueado` en `src/context/biblioteca.tsx`, línea 89). | La lee el layout raíz (`_layout.tsx`) para `Stack.Protected`, el header del Catálogo, `/login` y `/mostrador`. |
| **Ejemplares disponibles de un libro** | **Se calcula** (`calcularDisponibles` en `src/context/biblioteca.tsx`, líneas 118-124). | Deriva de `libro.ejemplares` menos los préstamos activos; evita duplicar estado y desincronizaciones. |
| **Estado del permiso de cámara** | **Sistema operativo** (consultado por `usePermiso('camara')` en `src/hooks/usePermiso.ts`). | El usuario puede cambiarlo fuera de la app en Ajustes; el SO es la única fuente de verdad. |
| **Identificador de la notificación programada** | **Context** (campo `notificacionId` dentro de cada `Prestamo` en `src/context/biblioteca.tsx`, línea 208). | Se necesita tanto al apagar el interruptor “Recordarme” como al devolver el libro para cancelar la notificación. |

**Cuando cambia el `value` de tu Context, ¿qué componentes se vuelven a renderizar? ¿Vale la pena optimizarlo en esta app?**
- Cada vez que cambia el objeto `value` de `BibliotecaContext`, **todos los componentes que llaman a `useBiblioteca()`** se vuelven a renderizar. Por ejemplo, aunque `CatalogoScreen` solo use `recientes`, `personalLogueado`, `calcularDisponibles` y `obtenerColaEspera`, al activar un recordatorio en `/reservas` cambia `prestamos`, cambia `value` y el Catálogo se re-renderiza.
- **Cómo se podría evitar:** dividiendo en contextos más chicos por dominio (por ejemplo, `SesionContext`, `RecientesContext`, `PrestamosContext`) o usando un store con selectores (como Zustand).
- **¿Vale la pena en esta app?** Con 16 libros y 5 pantallas, un re-render tarda menos de 1 ms; separar en 4 providers agregaría complejidad innecesaria sin beneficio perceptible para el usuario.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

| # | Acción | Pilas resultantes (de base a tope) |
| :-: | :--- | :--- |
| **1** | Abre la app. | **Stack raíz:** `[(tabs)]` · **Stack tab Catálogo:** `[/]` |
| **2** | Toca un libro del Catálogo. | **Stack raíz:** `[(tabs)]` · **Stack tab Catálogo:** `[/, /libro/[isbn]]` |
| **3** | Toca “Reservar”. | **Stack raíz:** `[(tabs), /reservar/[isbn] (modal)]` · **Stack tab Catálogo:** `[/, /libro/[isbn]]` |
| **4** | Toca “Confirmar”. | **Stack raíz:** `[(tabs)]` (tab activa: `reservas`) · **Stack tab Catálogo:** `[/, /libro/[isbn]]` |
| **5** | Toca atrás (Android). | **Stack raíz:** `[(tabs)]` (vuelve a la tab anterior: Catálogo, mostrando `/libro/[isbn]`, o sale si es la primera tab según la plataforma). |
| **6** | Toca la tab “Catálogo”. | **Stack raíz:** `[(tabs)]` (tab activa: `(catalogo)`) · **Stack tab Catálogo:** `[/, /libro/[isbn]]` |

**a) Qué método usamos en el paso 4 y comparación con `push`, `replace` y `dismissTo`:**
En `src/app/reservar/[isbn].tsx` (línea 63) usamos **`router.dismissTo('/reservas')`**:
- Con **`push('/reservas')`**: dejaría el modal `/reservar/[isbn]` vivo debajo en la pila y al tocar atrás volveríamos a la confirmación (error grave).
- Con **`replace('/reservas')`**: en algunos casos de modal sobre Tabs puede apilar una instancia duplicada de `/reservas` en el Stack raíz en lugar de cerrar el modal y activar la pestaña.
- Con **`dismissTo('/reservas')`**: descarta (cierra) el modal del Stack raíz y navega a la pestaña `/reservas`, garantizando que “atrás” **nunca** vuelva a la confirmación.

**b) En el paso 6, qué pantalla ve la persona y por qué:**
Ve el **detalle del libro (`/libro/[isbn]`)**, porque la tab Catálogo tiene su propio `Stack` (`src/app/(tabs)/(catalogo)/_layout.tsx`) y al cambiar de tab React Navigation conserva intacta la pila de esa pestaña. Es un comportamiento correcto porque le permite ver su ficha actualizada (ahora diciendo *“Ya tenés este libro en préstamo”*) y volver al catálogo con un toque atrás o tocando de nuevo la tab Catálogo.

---

### C2. El escáner que dispara de más

Archivo analizado: `src/app/escanear.tsx` (líneas 50 a 82).

**a) Qué pasaría si llamáramos a `router.push` sin protección dentro de `onBarcodeScanned`:**
Mientras el código EAN-13 está frente a la cámara, el sensor nativo dispara `onBarcodeScanned` entre 10 y 30 veces por segundo. Cada disparo encolaría una acción de navegación `PUSH /libro/[isbn]` en la cola interna del navegador, apilando decenas de pantallas de detalle idénticas una encima de la otra (el usuario tendría que tocar atrás 15 veces para volver al Catálogo).

**b) Por qué usamos `useRef` (`bloqueoNavegacionRef`) y no `useState`:**
En `src/app/escanear.tsx` (líneas 50 y 60-74) usamos `const bloqueoNavegacionRef = useRef<boolean>(false)`. Un `useState` puesto en `true` en el primer escaneo **no alcanza** porque `setEscaneado(true)` es **asíncrono** (programa un próximo render): antes de que React re-renderice el componente, el sensor de cámara ya disparó 2 o 3 llamadas más a `manejarCodigoEscaneado` viendo todavía `escaneado === false`. En cambio, mutar `bloqueoNavegacionRef.current = true` es **síncrono e inmediato**, bloqueando cualquier llamada posterior en el mismo milisegundo.

**c) Por qué conviene `router.replace` para ir del escáner al detalle:**
Porque `router.replace({ pathname: '/libro/[isbn]', params: { isbn: codigo } })` (línea 72) quita `/escanear` de la pila y pone el detalle en su lugar. Si usáramos `router.push`, al tocar atrás desde la ficha del libro la persona volvería a la cámara abierta apuntando probablemente al mismo libro (volviendo a abrirlo en bucle).

**d) Cómo manejamos un ISBN que no está en el catálogo sin repetir el aviso 10 veces:**
Guardamos `const ultimoDesconocidoRef = useRef<string | null>(null)` (línea 51). Cuando llega un código que no existe en `LIBROS` (líneas 76-81), comparamos `if (ultimoDesconocidoRef.current !== codigo)`. Solo si es distinto actualizamos el `ref` y mostramos el banner en pantalla (*“El código X no está en el catálogo...”*), dejando la cámara abierta para seguir escaneando otro libro sin inundar al usuario con alertas repetidas.

---

### C3. Deep links y rutas protegidas

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte de nuestro código lo decide |
| :--- | :--- | :--- | :--- |
| `bibliotecaipf://libro/9789877801576` | Ficha de **Almendra** (Won-Pyung Sohn) con botón “Reservar”. | `/` (Catálogo) dentro de la tab Catálogo. | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx` (líneas 23-29) + `anchor: '(tabs)'` en `src/app/_layout.tsx` (línea 9). |
| `bibliotecaipf://libro/123` | Pantalla **“Libro no encontrado”** avisando que `123` no tiene 13 dígitos + botón “Volver al Catálogo”. | `/` (Catálogo). | Validación `REGEX_ISBN_13` en `src/app/(tabs)/(catalogo)/libro/[isbn].tsx` (líneas 21, 26 y 46-67). |
| `bibliotecaipf://buscar?q=borges` | Buscador con `"borges"` precargado y los resultados (*Ficciones*, *El Aleph*). | `(tabs)` (pestañas de la app). | `src/app/buscar.tsx` (líneas 41-42) + `unstable_settings = { anchor: '(tabs)' }` en `src/app/_layout.tsx` (línea 9). |
| `bibliotecaipf://mostrador` (sin sesión) | No puede acceder a `/mostrador` (Expo Router impide entrar a la ruta protegida y redirige a la pantalla ancla `(tabs)`). | `(tabs)`. | `<Stack.Protected guard={conSesion}>` en `src/app/_layout.tsx` (líneas 56-63). |
| `bibliotecaipf://reserva` | Pestaña **“Mis reservas”** (`/reservas`). | `(tabs)`. | `<Redirect href="/reservas" />` en `src/app/reserva.tsx` (línea 8). |
| `bibliotecaipf://escanear` (cámara bloqueada) | Pantalla **Escanear libro** mostrando la tarjeta **“Permiso bloqueado”** con botón **“Abrir Ajustes”** y abajo el campo manual de ISBN. | `(tabs)`. | `usePermiso('camara')` + bloque `estado === 'bloqueado'` en `src/app/escanear.tsx` (líneas 44 y 137-146). |

**¿Por qué `/libro/123` llega a la pantalla de detalle aunque no exista ese ISBN y de quién es la responsabilidad?**
Porque Expo Router hace coincidencia de **patrón de ruta** (`/libro/[isbn]` coincide con cualquier texto después de `/libro/`), no valida reglas de negocio ni consulta el catálogo. La responsabilidad de validar el formato de 13 dígitos y comprobar si el libro existe es exclusivamente de **nuestra pantalla de detalle** (`src/app/(tabs)/(catalogo)/libro/[isbn].tsx`, líneas 21-67).

---

### C4. Foco, montaje y primer plano

**a) Qué evento detecta cada herramienta:**
- **`useEffect` con `[]`:** se ejecuta **una sola vez al montarse** el componente en memoria (y su limpieza al desmontarse).
- **`useFocusEffect`:** se ejecuta cada vez que la pantalla **gana el foco** dentro del navegador (por ejemplo, al volver de otra pestaña o al cerrar un modal encima).
- **`AppState` (`addEventListener('change', ...)`):** detecta transiciones del estado de la aplicación entera a nivel de sistema operativo (`active`, `background`, `inactive`), como salir a la app **Ajustes** del teléfono y volver.

**b) Quién se entera en cada escenario:**
- **La persona sale a Ajustes, habilita notificaciones y vuelve a la app:** **solo `AppState` se entera.** La pantalla nunca se desmontó ni perdió foco de navegación, por lo que ni `useEffect([])` ni `useFocusEffect` se disparan.
- **La persona va a la pestaña Catálogo y vuelve a “Mis reservas”:** **solo `useFocusEffect` se entera.** La app nunca pasó a segundo plano (`AppState` siguió `'active'`) y la pestaña ya estaba montada (`useEffect([])` no vuelve a correr).

**c) Cuál o cuáles usamos en nuestra app y por qué:**
Usamos **ambas combinadas**:
1. `AppState` encapsulado dentro de `usePermiso` mediante `useRevisarAlVolver` (`src/hooks/usePermiso.ts`, líneas 46-48) para detectar el regreso desde los Ajustes del teléfono.
2. `useFocusEffect` en `src/app/(tabs)/reservas.tsx` (líneas 46-50) y en `src/app/escanear.tsx` (líneas 53-58) para refrescar el estado al volver de otra pestaña o al cerrarse el modal `/permisos/[recurso]`.
Si hubiéramos usado solo `AppState`, al conceder el permiso dentro del modal `/permisos/camara` y cerrarlo, la pantalla de abajo mostraría un estado viejo; si hubiéramos usado solo `useFocusEffect`, al volver de los Ajustes del sistema operativo seguiría diciendo “bloqueado”.

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara

**Tabla en Android 14 (app recién instalada):**

| # | Acción | Qué muestra nuestra app | `status` | `canAskAgain` |
| :-: | :--- | :--- | :--- | :--- |
| **1** | Toca “Escanear” por primera vez. | En `/escanear` se ve la tarjeta `ExplicacionPermiso` con el beneficio y botón **“Continuar”** (+ campo manual abajo). | `'undetermined'` | `true` |
| **2** | Toca “Continuar” (abre `/permisos/camara`), toca “Continuar” → en el diálogo elige **“No permitir”**. | Permanece en `/permisos/camara` con botón **“Continuar”** (y al volver a `/escanear` sigue el campo manual). | `'denied'` | `true` |
| **3** | Toca “Escanear” otra vez. | Muestra nuevamente la tarjeta previa con botón **“Continuar”** porque en Android aún queda una oportunidad. | `'denied'` | `true` |
| **4** | “Continuar” → en el diálogo elige **“No permitir”** por segunda vez. | Cambia inmediatamente a la tarjeta **“Permiso bloqueado”** con el botón **“Abrir Ajustes”**. | `'denied'` | `false` |
| **5** | Toca “Escanear” otra vez. | Muestra directamente la tarjeta **“Permiso bloqueado”** con **“Abrir Ajustes”** y la carga manual de ISBN. | `'denied'` | `false` |
| **6** | Toca “Abrir Ajustes” → habilita cámara → vuelve a la app. | `useRevisarAlVolver` (`AppState`) refresca `usePermiso('camara')` y en pantalla aparece automáticamente la **`CameraView`** lista para escanear. | `'granted'` | `true` |

**a) Recorrido en iOS — en qué paso cambia:**
Cambia en el **Paso 2**: en iOS el sistema operativo muestra el diálogo de permiso **una sola vez**. Apenas el usuario toca *“No permitir”* en el Paso 2, `status` pasa a `'denied'` y **`canAskAgain` pasa inmediatamente a `false`**, por lo que ya desde el Paso 2 nuestra app muestra la tarjeta **“Permiso bloqueado”** con el botón **“Abrir Ajustes”**.

**b) Línea de código que decide entre “Continuar” y “Abrir Ajustes” y por qué no alcanza mirar `status`:**
- En `src/lib/permisos.ts` (líneas 74-81):
  ```ts
  export function calcularEstadoPermiso(granted: boolean, canAskAgain: boolean): EstadoPermiso {
    if (granted) return 'concedido';
    if (canAskAgain) return 'preguntable';
    return 'bloqueado';
  }
  ```
- Y en `src/components/ExplicacionPermiso.tsx` (línea 30): `const esBloqueado = estado === 'bloqueado';`.
- **Por qué no alcanza con mirar `status`:** porque en Android después del 1° rechazo y después del 2° rechazo, `status` vale exactamente lo mismo (`'denied'`). El único campo que distingue si todavía se puede abrir el diálogo del sistema (`'preguntable'` → *“Continuar”*) o si ya está bloqueado (`'bloqueado'` → *“Abrir Ajustes”*) es **`canAskAgain`**.

**c) Qué parte del código se entera en el Paso 6:**
`useRevisarAlVolver` (`src/hooks/useRevisarAlVolver.ts`, líneas 8-22) invocado desde `usePermiso` (`src/hooks/usePermiso.ts`, líneas 46-48). Si esa parte no existiera, al volver de Ajustes tras habilitar la cámara, `usePermiso` mantendría en memoria el estado anterior (`'bloqueado'`) y la pantalla seguiría mostrando **“Permiso bloqueado / Abrir Ajustes”** hasta que el usuario saliera y volviera a entrar a la pantalla.

---

### D2. Notificaciones y consistencia

**a) La persona activa “Recordarme” y antes de los 15 segundos toca “Devolver”:**
Si no canceláramos la notificación programada, a los 15 segundos le llegaría al teléfono una notificación recordándole *“Recordá devolver el libro...”* cuando **ya lo devolvió**, rompiendo la consistencia y la confianza en la app. En `src/context/biblioteca.tsx` (líneas 195-202), `devolverLibro` verifica `if (prestamo?.notificacionId)` y ejecuta `await cancelarNotificacionProgramada(prestamo.notificacionId)` antes de borrar el préstamo.

**b) Dónde guardamos el identificador y qué problema aparece si se cierra la app:**
El `notificacionId` se guarda en memoria dentro de cada objeto `Prestamo` en `BibliotecaContext` (`src/context/biblioteca.tsx`, línea 214).
- **Si la app se cierra antes de los 15 segundos:** la notificación **sigue programada en el sistema operativo** y llegará igual a los 15 segundos, pero el `notificacionId` en memoria **se pierde** al reiniciarse la app. Si luego la persona reabre la app y quiere cancelar esa notificación, la app ya no conoce su ID.
- **Cómo se resolvería:** persistiendo los préstamos (incluyendo su `notificacionId`) con `@react-native-async-storage/async-storage`, o consultando al abrir las notificaciones pendientes con `Notifications.getAllScheduledNotificationsAsync()`.

**c) Por qué en Android 13+ el canal se crea antes de pedir el permiso y qué cambia en Android 12:**
En Android 13 (API 33) o superior, el sistema operativo **no muestra el diálogo de `POST_NOTIFICATIONS`** si la app aún no registró al menos un canal de notificación (`setNotificationChannelAsync('prestamos', ...)`, en `src/lib/permisos.ts`, líneas 62-72 y 122-123). En **Android 12 (API 32) o anterior**, `POST_NOTIFICATIONS` no existía como permiso en tiempo de ejecución: las notificaciones quedaban habilitadas al instalar y `requestPermissionsAsync()` resolvía directamente como concedido sin diálogo (aunque el canal igual se crea para clasificar la notificación).

**d) Cómo te enterás si te entregan un libro desde el mostrador con notificaciones denegadas:**
En `src/lib/permisos.ts` (líneas 172-198):
```ts
export async function notificarTurnoDisponible(tituloLibro: string, isbn: string): Promise<boolean> {
  const permiso = await consultarPermisoRecurso('notificaciones');
  if (permiso.estado !== 'concedido') {
    return false;
  }
  // ... programa notificación local y devuelve true
}
```
Y en `src/context/biblioteca.tsx` (líneas 273-290): si `notificarTurnoDisponible` devuelve `false`, crea un `AvisoBiblioteca` dentro de `avisos` que aparece en la pestaña **`/reservas`** (*“Avisos dentro de la app”*).
**Consulta el permiso en vivo** (`consultarPermisoRecurso('notificaciones')`) en ese instante y no usa un valor guardado en el Context, porque el usuario pudo haber revocado o habilitado las notificaciones en Ajustes hace unos segundos; consultar al SO garantiza que la decisión sea siempre fiel al estado real.

---

### D3. Lo que tu app pide y lo que no

| Plataforma | Permiso o clave declarada | Función de la app que lo justifica | ¿Quién lo agrega? |
| :--- | :--- | :--- | :--- |
| **Android** | `android.permission.INTERNET` | Carga y funcionamiento estándar de la app / Expo. | Plantilla base de Expo / React Native. |
| **Android** | `android.permission.CAMERA` | Leer códigos de barras EAN-13 en `/escanear`. | Plugin `expo-camera` (`app.json`). |
| **Android** | `android.permission.POST_NOTIFICATIONS` | Recordatorios de devolución (15s) y aviso de turno en mostrador (Android 13+). | Plugin `expo-notifications` (`app.json`). |
| **Android** | `android.permission.VIBRATE` | Vibración al recibir una notificación local en el canal `"prestamos"`. | Plugin `expo-notifications`. |
| **iOS** | `NSCameraUsageDescription` | Texto de propósito para escanear códigos de barras en `/escanear`. | Plugin `expo-camera` (`app.json`). |
| **iOS** | *(Notificaciones sin clave en `Info.plist`)* | Recordatorios y avisos de biblioteca mediante `UNUserNotificationCenter`. | `expo-notifications` por código en tiempo de ejecución. |

**a) Por qué nuestra app no declara `RECORD_AUDIO` aunque usa `expo-camera`:**
Porque en `app.json` (líneas 23-26 y 44-51) desactivamos explícitamente el micrófono en el plugin y además lo bloqueamos en `blockedPermissions`:
```json
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
      "cameraPermission": "Usamos tu cámara para leer el código de barras de los libros y abrir su ficha en el catálogo.",
      "microphonePermission": false,
      "recordAudioAndroid": false
    }
  ]
]
```

**b) Si mañana nos piden “elegir una foto de portada desde la galería”:**
- **Paquete:** `expo-image-picker` (usando `ImagePicker.launchImageLibraryAsync()`).
- **Permiso necesario:** **ninguno** de galería (`READ_MEDIA_IMAGES` no se declara ni se pide), porque el Photo Picker nativo del sistema permite a la persona elegir una foto puntual de forma segura.
- **¿Alcanza con OTA o hace falta build nueva?** **Hace falta una build nueva**, porque instalar `expo-image-picker` incorpora código nativo (Java/Kotlin y Swift/Objective-C) que no existe dentro del binario ya compilado; una OTA solo actualiza JavaScript y assets.

**c) Qué partes no se pueden verificar del todo en Expo Go y cómo se verifican:**
En **Expo Go** no se pueden verificar los **textos de propósito propios en iOS** (`NSCameraUsageDescription`) ni el efecto real de **`blockedPermissions`** en `AndroidManifest.xml` (ni notificaciones push remotas en Android), porque Expo Go es un binario precompilado por Expo con su propio `Info.plist` y `AndroidManifest.xml`. Para verificarlos se debe correr `npx expo prebuild --clean` (para auditar los archivos nativos generados) y compilar una **development build** (`npx expo run:android` / `npx expo run:ios` o `eas build --profile development`).

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Nueve problemas encontrados en el fragmento del compañero (`src/app/(tabs)/index.tsx`):**

1. **Línea 10 (`useState<any[]>([])`) y línea 22 (`{ libro: any }`)** — *Mala práctica (TypeScript)*: usa `any`, perdiendo verificación de tipos y autocompletado. *Corrección:* tipar con `Libro[]` y `{ libro: Libro }` desde `src/types`.
2. **Líneas 13-16 (`useEffect(() => { pedirPermiso(); Notifications.requestPermissionsAsync(); }, [])`)** — *Mala práctica (UX / Permisos)*: pide dos permisos al abrir la app sin contexto ni pantalla previa, entrenando el “No permitir” automático. *Corrección:* pedir cámara recién en `/escanear` vía `/permisos/camara` y notificaciones recién al activar “Recordarme” en `/reservas`.
3. **Línea 15 (`Notifications.requestPermissionsAsync()` sin crear canal)** — *Error de ejecución en Android 13+*: en Android 13+ no aparece el diálogo de notificaciones si no se crea antes un canal (`setNotificationChannelAsync`). *Corrección:* llamar a `asegurarCanalPrestamos()` antes de pedir el permiso.
4. **Líneas 18-20 (`useEffect(() => { obtenerLibros().then(...); })` sin array de dependencias ni `.catch()` ni limpieza)** — *Rendimiento crítico + Error de ejecución*: provoca un bucle infinito de llamadas a `obtenerLibros()`, no maneja el 20 % de fallos (promesa rechazada sin capturar) y no tiene limpieza al desmontar. *Corrección:* usar nuestro hook `useLibros()` con `[intento]`, `try/catch` y bandera `cancelado`.
5. **Líneas 22-30 (`function Fila` declarada dentro de `Catalogo`)** — *Rendimiento / Mala práctica*: en cada render React crea un tipo de componente nuevo, desmontando y volviendo a montar cada fila desde cero. *Corrección:* mover a un archivo propio a nivel de módulo (`src/components/TarjetaLibro.tsx`).
6. **Línea 25 (`style={{ fontSize: 16, color: '#333', padding: 12 }}`)** — *Mala práctica / Rendimiento*: estilo en línea con valores mágicos repetidos. *Corrección:* `StyleSheet.create` usando constantes de `src/constants/tema.ts`.
7. **Líneas 33-36 (`<ScrollView>` con `.map()` y `key={i}`)** — *Rendimiento y Advertencia*: `ScrollView` renderiza todos los ítems de golpe sin virtualización, y usar el índice `i` como `key` rompe la reconciliación si cambia el orden. *Corrección:* usar `FlatList` con `keyExtractor={(item) => item.isbn}` y `ListEmptyComponent`.
8. **Líneas 37-39 (`<Pressable>` con solo un ícono `<Ionicons name="camera" size={28} />`)** — *Mala práctica (Accesibilidad)*: no tiene `accessibilityRole="button"`, le falta `accessibilityLabel` para lectores de pantalla y su área táctil es de `28 × 28` (menor al mínimo de `44 × 44`). *Corrección:* usar nuestro componente `Boton` con área mínima `44 × 44` y etiquetas de accesibilidad.
9. **Línea 24 (`router.push('/libro/' + libro.isbn)`)** — *Mala práctica*: concatenar strings rompe el chequeo de `typedRoutes`. *Corrección:* usar `router.push({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } })`.

**b) Qué pasa durante el primer minuto con el `useEffect` sin array de dependencias (líneas 18-20):**
Al montarse, dispara `obtenerLibros()` (tarda 800 ms). Al resolver, `setLibros(datos)` guarda un **array nuevo** y dispara un nuevo render; como el `useEffect` no tiene array de dependencias, vuelve a correr tras ese render y llama a `obtenerLibros()` otra vez. En 60 segundos se disparan aproximadamente **75 pedidos seguidos** (uno cada 800 ms), y aproximadamente **15 de ellos fallarán** con *Unhandled Promise Rejection* (20 % de probabilidad), consumiendo batería y red sin parar.
- **¿Cambiaría algo si `obtenerLibros()` devolviera siempre el mismo array?** Sí: a partir de la segunda vez que recibe la **misma referencia** de array, `Object.is(estadoAnterior, estadoNuevo)` da `true`, React omite el re-render y el bucle se detendría tras los primeros 2 ciclos (aunque seguiría siendo un bug grave porque cualquier otro render volvería a dispararlo).

**c) Reescritura de la pantalla usando nuestros hooks, componentes y constantes:**
Está implementada completa en `src/app/(tabs)/(catalogo)/index.tsx`, usando `useLibros()`, `useBiblioteca()`, `FlatList` con `keyExtractor={(item) => item.isbn}`, `TarjetaLibro`, `Boton`, `Titulo`, `Subtitulo`, `Parrafo` y `StyleSheet.create` con `Colores`, `Espaciados` y `Radios` de `src/constants/tema.ts`.

**d) Qué problema provocaría rechazo en la tienda y cuál haría que el usuario desinstale primero:**
- **Rechazo en App Store / Play Store:** pedir cámara y notificaciones al arrancar sin pantalla previa explicativa ni motivo en contexto (viola la pauta **5.1.1** de Apple), sumado a posibles crashes por promesas rechazadas sin `.catch()`.
- **Desinstalación inmediata por la persona usuaria:** el bombardeo de dos diálogos de permiso apenas abre la app + el bucle infinito que congela/calienta el teléfono y falla 1 de cada 5 segundos sin mostrarle un mensaje claro ni botón de reintento.

---

### E2. Organización y acoplamiento

**a) Mapa de dependencias entre carpetas:**
```text
src/app ──▶ components, hooks, context, data, lib, constants, types
src/components ──▶ constants, lib, types
src/hooks ──▶ lib, types
src/context ──▶ data, estructuras, lib, types
src/lib ──▶ data, constants, types
src/data ──▶ types
src/estructuras ──▶ (sin dependencias internas)
src/constants ──▶ (sin dependencias internas)
src/types ──▶ (sin dependencias internas)
```
No existe **ninguna importación “hacia arriba”** (ningún hook, componente ni archivo de `lib` importa nada de `src/app`). Una importación hacia arriba crearía dependencias circulares y acoplaría la lógica reutilizable a una pantalla concreta, impidiendo testearla o reutilizarla en otra ruta.

**b) Si el catálogo pasara a venir de una API real (`fetch`), qué archivos cambiarían:**
Solo cambiaría **1 archivo**: **`src/lib/api.ts`** (reemplazando la simulación de `obtenerLibros()` y `buscarLibros()` por `fetch(...)`), y eventualmente se quitaría la lectura estática de `LIBROS` en `detalle`/`reservas` para leer el libro desde el catálogo cargado. Que la fuente de datos esté encapsulada en `src/lib/api.ts` demuestra **bajo acoplamiento**: ni `useLibros.ts`, ni `buscar.tsx`, ni `TarjetaLibro.tsx` tienen que enterarse de si los datos vienen de un array local o de un servidor HTTP.

**c) Reemplazar `usePermiso` y la pantalla previa por `<ConPermiso recurso="camara">…</ConPermiso>`:**
- **Qué ganarías:** menos código repetido en pantallas dedicadas a un sensor (como `/escanear`), porque el wrapper ya renderizaría los 4 estados automáticamente.
- **Qué perderías:** flexibilidad para mostrar el **camino alternativo** (como el campo de ISBN manual debajo de la cámara) al mismo tiempo que el estado del permiso, y control fino sobre cuándo mostrar la explicación.
- **¿Serviría para las notificaciones?** **No.** Las notificaciones en `/reservas` no bloquean una pantalla completa, sino que se piden **al accionar un `Switch` (“Recordarme”)** dentro de un ítem de una lista. Un wrapper visual `<ConPermiso>` ocultaría toda la pantalla de préstamos en lugar de reaccionar al evento del interruptor.

---

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja (archivo y línea) |
| :--- | :--- | :--- |
| **`obtenerLibros()` falla** | Caja de error con ícono de alerta, mensaje en español y botón **“Reintentar”**. | `src/hooks/useLibros.ts` (líneas 41-46) y `src/app/(tabs)/(catalogo)/index.tsx` (líneas 74-86). |
| **Se abre `/libro/abc`** | Pantalla **“Libro no encontrado”** explicando que el ISBN debe tener 13 dígitos + botón **“Volver al Catálogo”**. | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx` (líneas 21, 26 y 46-67). |
| **Se escanea un ISBN que no está en el catálogo** | Banner amarillo debajo del visor avisando que ese código no existe (una sola vez por código) y deja seguir escaneando. | `src/app/escanear.tsx` (líneas 76-81 y 117-121). |
| **La cámara está bloqueada** | Tarjeta **“Permiso bloqueado”** con botón **“Abrir Ajustes”** + formulario de ISBN manual abajo. | `src/app/escanear.tsx` (líneas 137-146) y `src/components/ExplicacionPermiso.tsx` (líneas 44-59). |
| **Las notificaciones están denegadas** | Tarjeta con explicación y **“Abrir Ajustes”** si activa “Recordarme”, y los avisos de entrega aparecen igual en **“Avisos dentro de la app”** en `/reservas`. | `src/app/(tabs)/reservas.tsx` (líneas 133-141 y 225-248) y `src/context/biblioteca.tsx` (líneas 273-290). |
| **Se intenta reservar un libro ya reservado** | En el detalle desaparece el botón “Reservar” y avisa que ya lo tenés (o tu posición); además `reservarLibro` devuelve `{ tipo: 'duplicado' }` y `/reservar/[isbn]` bloquea la acción. | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx` (líneas 108-137), `src/context/biblioteca.tsx` (líneas 158-160) y `src/app/reservar/[isbn].tsx` (líneas 75-87). |
| **“Entregar al siguiente” con la lista de espera vacía** | El botón aparece deshabilitado con el texto **“Sin personas en espera”**, y `entregarAlSiguiente` además retorna `entregadoA: null` mostrando un aviso si se invocara. | `src/app/mostrador.tsx` (líneas 35-42 y 108-119) y `src/context/biblioteca.tsx` (líneas 238-241). |
| **Login con clave incorrecta** | Mensaje rojo claro (*“Usuario o clave incorrectos. Revisá las credenciales e intentá nuevamente.”*) y se mantiene abierto el modal `/login`. | `src/app/login.tsx` (líneas 32-37 y 86-90) y `src/context/biblioteca.tsx` (líneas 295-303). |

---

### E4. Decisiones con argumentos

**a) Identificador: ¿ISBN o ID numérico propio?**
- **Postura:** en una biblioteca universitaria real conviene usar un **ID interno propio** (como `libroId` o UUID) como clave primaria y parámetro de ruta, guardando el `isbn` como un atributo indexado para el escáner. En esta app usamos `isbn` porque lo exige el contrato de la consigna (`Libro`, `/libro/[isbn]`).
- **Argumentos:** existen libros antiguos o apuntes de cátedra **sin ISBN**, dos ediciones distintas de *Almendra* tienen ISBN distintos pero representan la misma obra, y en Expo Router `useLocalSearchParams` **siempre devuelve `string | string[] | undefined`** (por eso un ISBN de 13 dígitos como `string` evita problemas de `Number()` o pérdida de ceros a la izquierda, pero exige validarlo con regex `/^\d{13}$/` antes de buscarlo).

**b) Estructuras: ¿Clase `Pila` con `#items` o array en el estado con `[...pila, x]` y `slice`?**
- **Postura:** para enseñar y garantizar la disciplina LIFO/FIFO encapsulada, las clases `Pila` y `Cola` con `#items` privado son excelentes porque impiden que cualquier pantalla haga `items.splice(...)` o `items.shift()` rompiendo las invariantes de la estructura.
- **Qué nos complicó al combinarla con React:** React detecta cambios por **referencia de objeto**, no por mutación interna. Por eso tuvimos que agregar `clonar()` (`src/estructuras/Pila.ts`, línea 41 y `src/estructuras/Cola.ts`, línea 48) para crear una nueva instancia en cada actualización. En un proyecto de producción simple donde solo se necesitan “los últimos 3 vistos”, un array inmutable con `[libro, ...prev.filter(...)].slice(0, 3)` es más directo y idiomático en React.

**c) Memorización (`useMemo` y `useCallback`):**
- **Dónde aportan:** en `src/context/biblioteca.tsx` (líneas 315-355), memorizar el objeto `value` con `useMemo` y las acciones con `useCallback` evita que el `Provider` cree un objeto nuevo cuando su padre (`LayoutRaiz`) se re-renderice sin que haya cambiado el estado de la biblioteca. También en `useFocusEffect` (`src/app/(tabs)/reservas.tsx`, línea 47), `useCallback` es obligatorio para no re-suscribir el foco en cada render.
- **Dónde serían ruido:** memorizar un cálculo trivial como `const sinEspera = cantidad === 0` o el texto de un botón en `TarjetaLibro.tsx` cuesta más en memoria y legibilidad que calcularlo directo.
- **Cómo comprobarlo en lugar de suponerlo:** midiendo con el **React DevTools Profiler** (grabando una interacción y mirando cuántos ms tarda cada commit y qué componentes se marcaron con *"Why did this render?"*) antes y después de memorizar.

**d) Datos duplicados (`ejemplares disponibles`):**
- **Postura:** **los calculamos**, nunca los guardamos duplicados en el estado (`calcularDisponibles` en `src/context/biblioteca.tsx`, líneas 118-124).
- **Error que evitamos:** si guardáramos una copia mutable de `ejemplaresDisponibles` en un estado y la lista de `prestamos` en otro, bastaría olvidar actualizar uno de los dos al devolver un libro o al entregar desde el mostrador para que la app muestre *"0 ejemplares"* cuando nadie tiene el libro, o *"2 ejemplares"* cuando ya están todos prestados. Al derivar el número de una única fuente de verdad (`libro.ejemplares` y `prestamos`), esa inconsistencia es imposible por construcción.
