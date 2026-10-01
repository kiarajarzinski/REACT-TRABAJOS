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