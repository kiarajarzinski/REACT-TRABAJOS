import type { Libro } from '../types';

/**
 * Catálogo inicial de la Biblioteca IPF (16 libros reales).
 * Podés reemplazar los dos primeros ISBN por los códigos de barras (EAN-13)
 * reales de dos libros físicos que tengas a mano para probar el escáner.
 */
export const LIBROS: Libro[] = [
  {
    isbn: '9789877801576',
    titulo: 'Almendra',
    autor: 'Won-Pyung Sohn',
    anio: 2017,
    ejemplares: 2,
  },
  {
    isbn: '9788467033397',
    titulo: 'Romeo y Julieta',
    autor: 'William Shakespeare',
    anio: 1597,
    ejemplares: 3,
  },
  {
    isbn: '9789877950052',
    titulo: 'Los siete maridos de Evelyn Hugo',
    autor: 'Taylor Jenkins Reid',
    anio: 2017,
    ejemplares: 0,
  },
  {
    isbn: '9789875666481',
    titulo: 'Ficciones',
    autor: 'Jorge Luis Borges',
    anio: 1944,
    ejemplares: 2,
  },
  {
    isbn: '9789875666474',
    titulo: 'El Aleph',
    autor: 'Jorge Luis Borges',
    anio: 1949,
    ejemplares: 0,
  },
  {
    isbn: '9788498387087',
    titulo: 'Harry Potter y la piedra filosofal',
    autor: 'J. K. Rowling',
    anio: 1997,
    ejemplares: 2,
  },
  {
    isbn: '9789876091725',
    titulo: 'Los juegos del hambre',
    autor: 'Suzanne Collins',
    anio: 2008,
    ejemplares: 0,
  },
  {
    isbn: '9789871783144',
    titulo: 'Bajo la misma estrella',
    autor: 'John Green',
    anio: 2012,
    ejemplares: 3,
  },
  {
    isbn: '9788418173004',
    titulo: 'La canción de Aquiles',
    autor: 'Madeline Miller',
    anio: 2011,
    ejemplares: 0,
  },
  {
    isbn: '9789500440424',
    titulo: 'Antes de que se enfríe el café',
    autor: 'Toshikazu Kawaguchi',
    anio: 2015,
    ejemplares: 2,
  },
  {
    isbn: '9788491050834',
    titulo: 'Orgullo y prejuicio',
    autor: 'Jane Austen',
    anio: 1813,
    ejemplares: 2,
  },
  {
    isbn: '9789876129374',
    titulo: 'El Principito',
    autor: 'Antoine de Saint-Exupéry',
    anio: 1943,
    ejemplares: 4,
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
    ejemplares: 1,
  },
  {
    isbn: '9788497592208',
    titulo: '1984',
    autor: 'George Orwell',
    anio: 1949,
    ejemplares: 2,
  },
  {
    isbn: '9789500757058',
    titulo: 'El túnel',
    autor: 'Ernesto Sabato',
    anio: 1948,
    ejemplares: 3,
  },
];

/**
 * Listas de espera iniciales (Requisito A2):
 * Tres libros con ejemplares: 0 arrancan con personas en cola.
 */
export const LISTAS_ESPERA_INICIALES: Record<string, string[]> = {
  '9789877950052': ['Lucía Gómez', 'Mateo Benítez'],
  '9789875666474': ['Sofía Fernández'],
  '9789876091725': ['Tomás Ramírez', 'Valentina Acosta'],
};
