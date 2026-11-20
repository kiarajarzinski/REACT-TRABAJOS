/**
 * Estructura FIFO (First In, First Out):
 * Se agrega por el final y se saca por el frente sin usar shift().
 */
export class Cola<T> {
  #items: (T | undefined)[];
  #inicio = 0;

  constructor(inicial: T[] = []) {
    this.#items = [...inicial];
  }

  /** Agrega un elemento al final de la cola */
  encolar(x: T): void {
    this.#items.push(x);
  }

  /** Saca y devuelve el elemento del frente en O(1) amortizado (sin shift()) */
  desencolar(): T | undefined {
    if (this.vacia) return undefined;
    const x = this.#items[this.#inicio];
    this.#items[this.#inicio] = undefined;
    this.#inicio++;

    if (this.#inicio * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#inicio);
      this.#inicio = 0;
    }
    return x;
  }

  /** Devuelve el elemento del frente sin sacarlo */
  frente(): T | undefined {
    return this.vacia ? undefined : this.#items[this.#inicio];
  }

  get vacia(): boolean {
    return this.tamanio === 0;
  }

  get tamanio(): number {
    return this.#items.length - this.#inicio;
  }

  /** Devuelve una copia del contenido del frente al final */
  aArray(): T[] {
    return this.#items.slice(this.#inicio) as T[];
  }

  /** Crea una nueva instancia con los mismos elementos (útil para estado inmutable en React) */
  clonar(): Cola<T> {
    return new Cola<T>(this.aArray());
  }
}
