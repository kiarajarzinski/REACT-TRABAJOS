/**
 * Se agrega por el final y se saca por el frente.
 */
export class Cola<T> {
  #items: (T | undefined)[] = [];
  #inicio = 0; // indice del frente

  /** Agrega un elemento al final */
  encolar(x: T): void {
    this.#items.push(x);
  }

  /** Saca y devuelve el elemento del frente  */
  desencolar(): T | undefined {
    if (this.vacia) return undefined;
    const x = this.#items[this.#inicio];
    this.#items[this.#inicio] = undefined; // libera la referencia
    this.#inicio++;

    // Compactar cuando la mitad o más del array es espacio ya usado
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

  /** Copia del contenido, del frente al final */
  aArray(): T[] {
    return this.#items.slice(this.#inicio) as T[];
  }
}