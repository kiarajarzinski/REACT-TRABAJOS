import { LIBROS } from '../data/libros';
import type { Libro } from '../types';

const esperar = (ms: number) =>
  new Promise<void>((resolver) => setTimeout(resolver, ms));

// Simula una red lenta que a veces falla (1 de cada 5 veces).
// Como una API real, cada respuesta trae objetos nuevos.
export async function obtenerLibros(): Promise<Libro[]> {
  await esperar(800);
  if (Math.random() < 0.2) {
    throw new Error('No se pudo conectar con la biblioteca.');
  }
  return LIBROS.map((libro) => ({ ...libro }));
}

// La demora es variable a propósito: las respuestas pueden llegar desordenadas.
export async function buscarLibros(q: string): Promise<Libro[]> {
  await esperar(300 + Math.random() * 1200);
  const texto = q.trim().toLowerCase();
  return LIBROS.filter(
    (l) =>
      l.titulo.toLowerCase().includes(texto) ||
      l.autor.toLowerCase().includes(texto),
  ).map((libro) => ({ ...libro }));
}
