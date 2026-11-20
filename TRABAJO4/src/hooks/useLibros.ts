import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '../lib/api';
import type { Libro } from '../types';

export type ResultadoUseLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

/**
 * Requisito A3.1 y Parte B1:
 * Consulta el catálogo mediante obtenerLibros(), maneja carga, error y reintento,
 * y limpia el efecto con una bandera `cancelado` para evitar actualizar estado
 * si el componente se desmonta o se dispara un nuevo intento.
 */
export function useLibros(): ResultadoUseLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState<number>(0);

  const reintentar = useCallback(() => {
    setIntento((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function cargarCatalogo() {
      setCargando(true);
      setError(null);
      try {
        const datos = await obtenerLibros();
        if (!cancelado) {
          setLibros(datos);
          setCargando(false);
        }
      } catch {
        if (!cancelado) {
          setError('No se pudo conectar con la biblioteca. Revisá tu conexión e intentá nuevamente.');
          setCargando(false);
        }
      }
    }

    void cargarCatalogo();

    return () => {
      cancelado = true;
    };
  }, [intento]);

  return { libros, cargando, error, reintentar };
}
