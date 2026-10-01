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

