/**
  Se agrega y se saca por el mismo extremo: el tope
 */
export class Pila<T> {
  #items: T[] = [];

  /** Agrega un elemento en el tope */
  push(x: T): void {
    this.#items.push(x);
  }

  /** Saca y devuelve el elemento del tope  */
  pop(): T | undefined {
    return this.#items.pop();
  }

  /** Devuelve el elemento del tope sin sacarlo */
  tope(): T | undefined {
    return this.#items.at(-1);
  }

  get vacia(): boolean {
    return this.#items.length === 0;
  }

  get tamanio(): number {
    return this.#items.length;
  }

  /** copia del contenido de la base al tope*/
  aArray(): T[] {
    return [...this.#items];
  }
}