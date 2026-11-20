import type { Libro } from '../types';

/**
 * Catálogo inicial de la Biblioteca IPF (16 libros).
 * Podés reemplazar los dos primeros ISBN por los códigos de barras (EAN-13)
 * reales de dos libros físicos que tengas a mano para probar el escáner.
 */
export const LIBROS: Libro[] = [
  {
    isbn: '9789875666481',
    titulo: 'Ficciones',
    autor: 'Jorge Luis Borges',
    anio: 1944,
    ejemplares: 3,
  },
  {
    isbn: '9789875666474',
    titulo: 'El Aleph',
    autor: 'Jorge Luis Borges',
    anio: 1949,
    ejemplares: 0,
  },
  {
    isbn: '9788420471839',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    anio: 1967,
    ejemplares: 2,
  },
  {
    isbn: '9789875809826',
    titulo: 'Rayuela',
    autor: 'Julio Cortázar',
    anio: 1963,
    ejemplares: 0,
  },
  {
    isbn: '9780132350884',
    titulo: 'Código Limpio (Clean Code)',
    autor: 'Robert C. Martin',
    anio: 2008,
    ejemplares: 2,
  },
  {
    isbn: '9780135957059',
    titulo: 'El Programador Pragmático',
    autor: 'David Thomas y Andrew Hunt',
    anio: 2019,
    ejemplares: 0,
  },
  {
    isbn: '9780201633610',
    titulo: 'Patrones de Diseño',
    autor: 'Erich Gamma y otros',
    anio: 1994,
    ejemplares: 1,
  },
  {
    isbn: '9780262046305',
    titulo: 'Introducción a los Algoritmos',
    autor: 'Thomas H. Cormen',
    anio: 2022,
    ejemplares: 2,
  },
  {
    isbn: '9789500757058',
    titulo: 'El túnel',
    autor: 'Ernesto Sabato',
    anio: 1948,
    ejemplares: 4,
  },
  {
    isbn: '9789877381146',
    titulo: 'Bestiario',
    autor: 'Julio Cortázar',
    anio: 1951,
    ejemplares: 2,
  },
  {
    isbn: '9780596517748',
    titulo: 'JavaScript: The Good Parts',
    autor: 'Douglas Crockford',
    anio: 2008,
    ejemplares: 1,
  },
  {
    isbn: '9781492078005',
    titulo: 'Diseño de Sistemas de Datos',
    autor: 'Martin Kleppmann',
    anio: 2017,
    ejemplares: 0,
  },
  {
    isbn: '9789875666504',
    titulo: 'El libro de arena',
    autor: 'Jorge Luis Borges',
    anio: 1975,
    ejemplares: 2,
  },
  {
    isbn: '9788497592208',
    titulo: '1984',
    autor: 'George Orwell',
    anio: 1949,
    ejemplares: 3,
  },
  {
    isbn: '9789871138142',
    titulo: 'Operación Masacre',
    autor: 'Rodolfo Walsh',
    anio: 1957,
    ejemplares: 2,
  },
  {
    isbn: '9780134494166',
    titulo: 'Arquitectura Limpia',
    autor: 'Robert C. Martin',
    anio: 2017,
    ejemplares: 1,
  },
];

/**
 * Listas de espera iniciales (Requisito A2):
 * Al menos dos libros con ejemplares: 0 arrancan con personas en cola.
 */
export const LISTAS_ESPERA_INICIALES: Record<string, string[]> = {
  '9789875666474': ['Lucía Gómez', 'Mateo Benítez'],
  '9789875809826': ['Sofía Fernández'],
  '9780135957059': ['Tomás Ramírez', 'Valentina Acosta'],
};
