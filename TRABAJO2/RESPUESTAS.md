# RESPUESTAS – TP N° 2 

**Alumna:** _Jarzinski Kiara_

---

## Parte A · Estructuras de datos: la pila y la cola

### A1. Conceptos

**a)** LIFO significa *Last In, First Out*: el último en entrar es el primero en salir, y corresponde a la **pila**. FIFO significa *First In, First Out*: el primero en entrar es el primero en salir, y corresponde a la **cola**.

**b)**
- **Pila:** entra y sale por el mismo extremo, el tope.
- **Cola:** entra por el final y sale por el frente.

**c)**

| | Vida real | App móvil |
|---|---|---|
| Pila | Una pila de cubiertos | El historial de pantallas (botón atrás) |
| Cola | La fila de un banco | La cola en la reproducción de música |

---

### A2. Seguimiento de una pila

Paso a paso:
1. `push` x3 → `[Inicio, Productos, Detalle 3]`
2. `pop()` saca `Detalle 3` → `[Inicio, Productos]`
3. `push('Perfil')` → `[Inicio, Productos, Perfil]`

| Línea | Salida |
|---|---|
| (1) `tope()` | `'Perfil'` |
| (2) `pop()` | `'Perfil'` (la pila queda `[Inicio, Productos]`) |
| (3) `tope()` | `'Productos'` |
| (4) `vacia` | `false` |

**Estado final (base → tope):** `Inicio, Productos`

---

### A3. Seguimiento de una cola

1. `encolar` Ana, Beto → `[Ana, Beto]`
2. `desencolar()` saca a Ana → `[Beto]`
3. `encolar` Caro, Dani → `[Beto, Caro, Dani]`

| Línea | Salida |
|---|---|
| (1) `frente()` | `'Beto'` |
| (2) `desencolar()` | `'Beto'` (queda `[Caro, Dani]`) |
| (3) `vacia` | `false` |

**Estado final (frente → final):** `Caro, Dani`

---

### A4. Análisis de la implementación

**a)** El `#` declara un **campo privado** de la clase (estándar de JavaScript moderno). Solo se puede leer o modificar desde dentro de la clase. Evita que código externo manipule el array directamente, por ejemplo `pila.items.unshift(...)`, y rompa la regla LIFO/FIFO. Es **encapsulamiento**: la estructura solo se usa a través de sus métodos.

**b)** `shift()` tiene costo **O(n)**: al sacar el primer elemento, el motor debe reindexar y mover todos los demás un lugar. Con colas muy grandes, cada `desencolar` se vuelve más lento. Las colas "serias" lo resuelven con:
- un **índice de frente** que avanza sin mover nada (como en A5),
- una **lista enlazada**, o
- un **buffer circular**.

Así `desencolar` pasa a ser O(1).

**c)** La pila usa `pop()` (saca del **final** del array) y la cola usa `shift()` (saca del **inicio**). No pueden usar el mismo porque sacan por extremos distintos: en la pila entra y sale por el final (LIFO); en la cola entra por el final pero sale por el inicio (FIFO). Si la cola usara `pop()`, sacaría al último en llegar y se comportaría como una pila.

---

### A5. Programación: `ColaEficiente`

```js
class ColaEficiente {
  #items = [];
  #inicio = 0; // indice del frente

  encolar(x) {
    this.#items.push(x);
  }

  desencolar() {
    if (this.vacia) return undefined;
    const x = this.#items[this.#inicio];
    this.#items[this.#inicio] = undefined; 
    this.#inicio++;

    // Compactar cuando más de la mitad del array es espacio ya usado
    if (this.#inicio * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#inicio);
      this.#inicio = 0;
    }
    return x;
  }

  frente() {
    return this.vacia ? undefined : this.#items[this.#inicio];
  }

  get vacia() {
    return this.tamanio === 0;
  }

  get tamanio() {
    return this.#items.length - this.#inicio;
  }
}
```

---

### A6. Pila y cola dentro de Expo Router

**a)** El historial de un Stack es una **pila**. La pantalla visible es el **tope**. "Atrás" hace un **pop**: saca la pantalla del tope y queda visible la que estaba debajo.

**b)** Las acciones de navegación se procesan en una **cola** (FIFO). Si el usuario toca dos links muy rápido, las dos acciones se encolan y se ejecutan **en orden de llegada**: primero se resuelve la primera y después la segunda. No se pisan ni se pierde ninguna.

---

## Parte B · Rutas basadas en archivos

### B1. Del archivo a la URL

| Archivo | URL que genera / función |
|---|---|
| `src/app/(tabs)/index.tsx` | `/`. El grupo `(tabs)` no aparece en la URL, así que es la pantalla de inicio (tab "Inicio"). |
| `src/app/acerca.tsx` | `/acerca` |
| `src/app/(tabs)/perfil.tsx` | `/perfil` (otra vez sin `(tabs)` en la URL) |
| `src/app/(tabs)/productos/index.tsx` | `/productos` (el `index` representa la raíz de la carpeta) |
| `src/app/(tabs)/productos/[id].tsx` | `/productos/3`, `/productos/mate`, etc. Ruta dinámica: `id` llega como parámetro. |
| `src/app/docs/[...slug].tsx` | `/docs/react`, `/docs/react/hooks/useState`, etc. Catch-all: captura cualquier cantidad de segmentos después de `/docs`. |
| `src/app/_layout.tsx` | **No genera URL.** Define el navegador (por ejemplo un `Stack`) que envuelve a las pantallas de esa carpeta. |
| `src/app/+not-found.tsx` | **No tiene URL propia.** Es la pantalla 404 que se muestra cuando ninguna ruta coincide. |
| `src/app/Boton.tsx` | **Problema.** Todo archivo dentro de `app` se convierte en ruta, así que esto crea `/Boton`. Un componente va en `src/components/Boton.tsx`. |

### B2. De la URL al archivo

| URL | Archivo |
|---|---|
| `/categorias/bebidas` (y cualquier otra categoría) | `src/app/categorias/[categoria].tsx` |
| `/buscar?q=mate&categoria=kiosco` | `src/app/buscar.tsx`. Los parámetros de búsqueda (`?q=...`) no necesitan carpeta ni corchetes. |
| `/ayuda/pagos/tarjeta` y `/ayuda/horarios` | `src/app/ayuda/[...slug].tsx` |
| `/ayuda` (con una pantalla propia) | `src/app/ayuda/index.tsx` |


### B3. Verdadero o falso

- **a) Falso** Expo Router usa rutas basadas en archivos: crear el archivo en `src/app` alcanza, no hay tabla de registro.
- **b) Falso** Los `_layout.tsx` no son pantallas; definen el navegador (Stack, Tabs, Drawer) que contiene a las pantallas.
- **c) Verdadero** 
- **d) Falso** Conviene `npx expo install`, que elige la versión compatible con el SDK instalado. `npm install` trae la última, que puede ser incompatible con el SDK.
- **e) Verdadero** 
- **f) Verdadero** 
- **g) Verdadero** 
- **h) Verdadero**

---

## Parte C · Navegar: `<Link>`, `router` y la pila

### C1. Métodos de `router`

| Método | Qué le hace a la pila |
|---|---|
| `router.push(href)` | Apila una pantalla nueva encima del tope, **siempre**, aunque esa misma ruta ya exista en la pila. |
| `router.navigate(href)` | Va a la ruta evitando duplicados: si esa URL ya está en la pila, vuelve a ella (descarta las de arriba); si no está, la apila. |
| `router.replace(href)` | **Reemplaza** la pantalla del tope por la nueva. La pila mantiene el mismo tamaño y no se puede volver a la reemplazada. |
| `router.back()` | Hace `pop`: saca la pantalla del tope y queda visible la de abajo. |
| `router.dismissTo(href)` | Desapila hasta llegar a la pantalla indicada si ya está en la pila; si no está, la apila. |
| `router.dismissAll()` | Descarta todas las pantallas y deja solo la primera (la base) de la pila. |
| `router.canGoBack()` | **No modifica la pila.** Devuelve `true` si hay una pantalla debajo a la que volver. |
| `router.setParams({...})` | **No modifica la pila.** Cambia los parámetros de la pantalla actual sin apilar nada. |

### C2. Simulación de la pila

| # | Instrucción | Pila resultante |
|---|---|---|
| 1 | `router.push("/productos/1")` | `/productos`, `/productos/1` |
| 2 | `router.push("/productos/2")` | `/productos`, `/productos/1`, `/productos/2` |
| 3 | `router.navigate("/productos/5")` | `/productos`, `/productos/1`, `/productos/2`, `/productos/5` |
| 4 | `router.push("/perfil")` | `/productos`, `/productos/1`, `/productos/2`, `/productos/5`, `/perfil` |
| 5 | `router.replace("/buscar")` | `/productos`, `/productos/1`, `/productos/2`, `/productos/5`, `/buscar` |
| 6 | `router.back()` | `/productos`, `/productos/1`, `/productos/2`, `/productos/5` |
| 7 | `router.dismissTo("/productos")` | `/productos` |
| 8 | `router.canGoBack()` | Devuelve `false`: queda una sola pantalla, no hay a dónde volver. |


### C3. ¿`<Link>` o `router`?

**a)** `<Link>`: el usuario toca algo y no hay lógica previa. Con href como objeto: `<Link href={{ pathname: "/productos/[id]", params: { id } }}>`.

**b)** `router.replace("/exito")`: la navegación ocurre **después de una lógica** (guardar y esperar la API). Con `replace`, el botón atrás no vuelve a un formulario ya enviado.

**c)** `router.back()`: no se va a una ruta concreta, se vuelve a la pantalla anterior (en un modal, también sirve `router.dismiss()`).

**d)** `router.replace("/")`: la navegación ocurre después de la lógica de login y no queremos que "atrás" vuelva a la pantalla de login.

**e)** `router.dismissTo("/pedidos")`: desapila de una sola vez hasta la lista de pedidos, en lugar de llamar a `back()` tres veces.

### C4. Escribí el código

**a)** Link al producto con id 8, con href como objeto:

```tsx
<Link href={{ pathname: "/productos/[id]", params: { id: "8" } }}>
  Ver producto 8
</Link>
```

**b)** Link a `/perfil` que siempre apile, aunque la pantalla ya exista:

```tsx
<Link href="/perfil" push>
  Ir al perfil
</Link>
```

**c)** Botón propio (`Pressable`) que funciona como link a `/carrito` usando `asChild`:

```tsx
<Link href="/carrito" asChild>
  <Pressable>
    <Text>Ir al carrito</Text>
  </Pressable>
</Link>
```

### C5. Pensar

En la web, cada `<Link>` se convierte en un `<a href>` real. La ventaja concreta para el usuario es que puede hacer clic derecho y abrirlo en otra pestaña, copiar la dirección, compartirla, guardarla en marcadores y usar el botón atrás del navegador; además los buscadores pueden indexar la página.

En el celular no hay barra de direcciones, pero la misma URL sigue sirviendo: permite **deep links** (por ejemplo `comedoripf://menu/7`) para abrir una pantalla concreta desde otra app, una notificación o un link compartido, y mantiene la navegación consistente entre web y móvil.

---

## Parte D · Navegadores: Stack, Tabs y Drawer

### D1. Comparación

| | Stack | Tabs | Drawer |
|---|---|---|---|
| ¿Apila pantallas? | Sí. Cada pantalla nueva se apila sobre la anterior. | No. Cambiar de pestaña no apila: cada pestaña es una sección independiente. | No. Cambiar de opción del menú no apila. |
| ¿Cómo cambia de pantalla el usuario? | Navegando con `<Link>` / `router` y volviendo con el botón "atrás" del header o el gesto. | Tocando una pestaña de la barra (inferior). | Deslizando desde el borde o tocando el ícono de menú y eligiendo una opción. |
| ¿Desde dónde se importa en SDK 57? | `expo-router` | `expo-router` | `expo-router/drawer` |
| Un caso de uso típico | Lista de platos → detalle de un plato. | Secciones principales de la app (Inicio, Menú, Carrito). | Menú lateral con secciones de gestión (por ejemplo, la cocina). |

### D2. Cada tab tiene su pila

Ve el detalle del producto 4. Cada pestaña que tiene su propio Stack conserva su propia pila: al cambiar a Inicio, la pila de Productos no se destruye, queda como estaba; al volver, aparece la pantalla que se había dejado (el detalle del 4), no la lista. Se comporta así, por ejemplo, Instagram: si entrás al perfil de alguien desde "Buscar", te vas a "Inicio" y volvés a "Buscar", seguís en ese perfil.

### D3. ¿Dónde va cada pantalla?

Regla práctica: si la pantalla debe **mantener visible** la barra de pestañas, va **dentro de la tab**; si debe **taparla**, va en el **Stack raíz**.

- **a)** Detalle de un producto con la barra visible: **dentro de la tab** (en el Stack propio de Productos).
- **b)** Modal de confirmación de compra que tapa la barra: **Stack raíz** (con `presentation: "modal"`).
- **c)** Login que se abre como modal: **Stack raíz**, por la misma razón.
- **d)** "Mis pedidos anteriores" dentro de Perfil: **dentro de la tab Perfil**, que necesita su propio Stack, para que la barra siga visible.

### D4. Configurar el Stack

**a)** `screenOptions` define opciones por defecto para todas las pantallas de ese Stack. Las `options` de un `Stack.Screen` valen solo para esa pantalla y tienen prioridad sobre `screenOptions`.

**b)** Porque `(tabs)` es otro navegador (con sus propias pestañas y headers) metido dentro del Stack raíz. Si no se oculta el header del Stack para esa pantalla, aparecería un header duplicado ("(tabs)") encima del de las pestañas.

**c)** Sí existe: todo archivo dentro de `src/app` es una ruta, esté o no declarada, y se muestra con las opciones por defecto. Declararla sirve para configurarla: título, etc.

**d)** Valores posibles de `presentation`: `card`, `modal`, `transparentModal`, `fullScreenModal`, `formSheet`. Para una hoja inferior que se abre al 50% usaría `formSheet` con `sheetAllowedDetents: [0.5]`.

**e)** Desde la propia pantalla de detalle, con un `Stack.Screen` dentro del JSX:

```tsx
<Stack.Screen options={{ title: `Producto ${id}` }} />
```

### D5. Tabs y Drawer en SDK 57

**a)** `Tabs` ya no se importa desde `expo-router`, sino desde **`expo-router/js-tabs`** (tabs implementadas en JavaScript). La alternativa experimental son las **tabs nativas** (`NativeTabs`, en `expo-router/unstable-native-tabs`), que usan la barra de pestañas propia de cada sistema operativo.

**b)** Necesita `react-native-gesture-handler` y `react-native-reanimated`. En el layout raíz conviene poner un **`GestureHandlerRootView`** (con `style={{ flex: 1 }}`) envolviendo todo, para que funcionen los gestos.

**c)** **No.** Desde SDK 56 el navegador Drawer viene incluido dentro de `expo-router` y se importa desde `expo-router/drawer`; además, el código de la app ya no debe importar desde paquetes externos `@react-navigation/*`.

**d)** `router.back()` actúa en el navegador **más interno que está en foco** (el activo). Si ese navegador no puede retroceder (está en su primera pantalla), la acción pasa al navegador padre.

---
## Parte E · Rutas dinámicas, parámetros y hooks

### E1. Encontrá el error

**Por qué falla:** los parámetros de ruta siempre llegan como texto. `id` vale `"3"` (string), pero en los productos `p.id` es el número `3`. Como `===` no convierte tipos, `3 === "3"` es `false` y `find` nunca encuentra nada. Por la misma razón, `id === 3` nunca se cumple.

**Corrección:** convertir el parámetro a número antes de comparar.

```tsx
export default function DetalleProducto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idNumero = Number(id);
  const producto = productos.find((p) => p.id === idNumero);

  if (idNumero === 3) console.log('Es el chipá');
  if (!producto) return <Text>No existe el producto {id}</Text>;
  return <Text>{producto.nombre}</Text>;
}
```

### E2. Catch-all

Para `src/app/docs/[...slug].tsx`:

| URL | `slug` |
|---|---|
| `/docs/react` | `["react"]` |
| `/docs/react/hooks/useState` | `["react", "hooks", "useState"]` |
| `/docs` | No hay segmentos que capturar: esa URL la atiende `docs/index.tsx` (si existe). |

### E3. Anatomía de una URL

URL: `rutasipf://buscar?q=mate&categoria=bebidas`

**a)**
- **Scheme:** `rutasipf`
- **Ruta:** `/buscar`
- **Parámetros de búsqueda:** `q=mate` y `categoria=bebidas`

**b)** `useLocalSearchParams()` devuelve `{ q: "mate", categoria: "bebidas" }` (valores como texto).

**c)** No hacen falta corchetes. Los corchetes sirven para **segmentos dinámicos de la ruta** (la parte del path). Los parámetros de búsqueda van después del `?`, no forman parte de la ruta y llegan a cualquier pantalla.

**d)** Dos razones para usar `router.setParams` en lugar de `router.push`:
1. **No apila pantallas:** con `push`, cada letra tipeada agregaría una pantalla a la pila y el usuario tendría que tocar "atrás" decenas de veces para salir del buscador. Con `setParams` se actualiza la misma pantalla.
2. **Mantiene la pantalla y la URL sincronizadas:** el campo de texto no se vuelve a montar (no pierde el foco) y la URL siempre refleja la búsqueda actual, por lo que se puede compartir como link.

### E4. ¿Dónde estoy?

`buscar.tsx` está en el Stack raíz; el detalle está en `(tabs)/productos/[id].tsx`.

| Hook | En `/productos/3` | En `/buscar?q=chipa` |
|---|---|---|
| `usePathname()` | `"/productos/3"` | `"/buscar"` |
| `useSegments()` | `["(tabs)", "productos", "[id]"]` | `["buscar"]` |
| `useLocalSearchParams()` | `{ id: "3" }` | `{ q: "chipa" }` |

### E5. Local vs global

**a)** `useLocalSearchParams` devuelve los parámetros de la pantalla donde se la llama y solo se actualiza cuando esa pantalla está en foco. `useGlobalSearchParams` devuelve los parámetros de la URL actual de toda la app, y cambia aunque la pantalla no esté enfocada. La opción por defecto es `useLocalSearchParams`, porque en un Stack las pantallas de abajo siguen montadas: con la versión global se volverían a renderizar (y podrían confundirse) cada vez que cambia la URL de otra pantalla.

**b)** `useFocusEffect` ejecuta un efecto cada vez que la pantalla gana el foco, no solo cuando se monta, y limpia al perder el foco. Sirve porque en Stack y Tabs las pantallas quedan montadas aunque no se vean. Ejemplo: volver a pedir la lista de pedidos cada vez que el usuario entra a la tab "Carrito".   

**c)** No es un error de Expo Router. `[id].tsx` acepta cualquier valor en ese segmento, porque el router solo sabe que la URL coincide con el patrón. La responsabilidad es del desarrollador: validar el parámetro dentro de la pantalla y mostrar un mensaje si el producto no existe.

## Parte F · Redirecciones, rutas protegidas y deep links

### F1. Redirect

**a)** `<Redirect href="/productos" />` navega automáticamente a esa ruta apenas se renderiza. Equivale a `router.replace("/productos")`.

**b)** Porque si apilara (`push`), la pantalla que redirige quedaría en la pila. Al tocar "atrás" el usuario volvería a esa pantalla, que se redirigiría otra vez al mismo lugar: quedaría atrapado en un bucle sin poder retroceder. Con `replace`, la pantalla que redirige desaparece de la pila y "atrás" lleva a donde corresponde.

### F2. `Stack.Protected`

```tsx
function NavegacionRaiz() {
  const { usuario } = useAuth();
  const conSesion = usuario !== null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Protected guard={conSesion}>
        <Stack.Screen name="privado" />
      </Stack.Protected>
      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}
```

**a)** Cuando su `guard` es `false`, la pantalla deja de existir en el navegador: no se puede navegar a ella y, si estaba en la pila, se elimina.

**b)** Al iniciar sesión, `conSesion` pasa a `true`, por lo que el `guard` de `login` pasa a `false` y esa pantalla desaparece del navegador. El modal se cierra solo porque la pantalla ya no existe, sin necesidad de llamar a `router.back()`.

**c)** Lo causa navegar a una pantalla protegida cuyo guard está en `false` (por ejemplo, `router.push("/privado")` sin sesión, o ir a `/login` estando logueado): ningún navegador sabe manejar esa acción. Se evita no ofreciendo esa navegación cuando el guard es `false` (por ejemplo, mostrar el botón solo si hay sesión) y navegando únicamente a rutas que estén habilitadas.

**d)** Centraliza la protección en un solo lugar(el layout raíz) en vez de repetir un `<Redirect>` condicional en cada pantalla. Además la pantalla protegida ni siquiera se monta (no hay parpadeo de contenido) y el historial se limpia solo cuando cambia la sesión.

### F3. 404, anchor y rutas tipadas

**a)** `+not-found.tsx`: es la pantalla que se muestra cuando la URL no coincide con ninguna ruta (el 404). Se define en `src/app/+not-found.tsx`.

**b)** `export const unstable_settings = { anchor: "(tabs)" }`: indica qué ruta queda como **base de la pila** cuando se entra directamente a una pantalla por un deep link. Así, si se abre `/categorias/bebidas`, las pestañas quedan debajo y "atrás" tiene a dónde volver. Se define en el `_layout.tsx` raíz (`src/app/_layout.tsx`).

**c)** `typedRoutes` genera tipos de TypeScript con todas las rutas existentes, de modo que cada `href` se valida. `<Link href="/prodcutos" />` da **error de TypeScript** porque esa ruta no existe. Los tipos se generan automáticamente en la carpeta oculta del proyecto, dentro del archivo `.expo/types/router.d.ts`.

### F4. Deep links

Scheme `comedoripf`, IP de la compu `192.168.1.20`, plato 7 (`/menu/7`):

| Dónde | URL |
|---|---|
| App instalada (build propia) | `comedoripf://menu/7` |
| Expo Go en desarrollo | `exp://192.168.1.20:8081/--/menu/7` |
| Web (`npx expo start --web`) | `http://localhost:8081/menu/7` |

**¿Qué significa `/--/`?** Es el separador entre la dirección del servidor de desarrollo (`exp://IP:puerto`) y la ruta interna de la app. Lo que viene después de `/--/` es la ruta que Expo Router debe abrir.

**¿Por qué no funciona el scheme propio en Expo Router dentro de Expo Go?** Porque la app no está instalada como aplicación independiente: corre **dentro de Expo Go**, y el sistema operativo solo asocia el scheme `exp://` con Expo Go. El scheme `comedoripf://` recién existe cuando se hace una build propia de la app.

### F5. Errores comunes

**a)** **Causa:** `<Link asChild>` pasa sus propiedades al hijo mediante un `Slot`, y el `Slot` no acepta un **array de estilos** en `style`. **Solución:** aplanar los estilos en un único objeto con `StyleSheet.flatten([...])`.

**b)** **Causa:** todo archivo dentro de `src/app` se convierte en una ruta, así que `TarjetaProducto.tsx` creó la ruta `/TarjetaProducto`. **Solución:** mover el componente a `src/components/TarjetaProducto.tsx`.

**c)** **Causa:** `router.push("/")` **apila** la pantalla principal encima del login, así que "atrás" vuelve al login. **Solución:** usar `router.replace("/")`, o dejar que `Stack.Protected` cierre el login solo cuando cambia la sesión.

**d)** **Causa:** `npm install` trajo la última versión del paquete, que puede ser **incompatible con el SDK** de Expo (y con Expo Go). **Solución:** desinstalarlo y volver a instalarlo con `npx expo install <paquete>`, que elige la versión compatible.