import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { LISTAS_ESPERA_INICIALES } from '../data/libros';
import { Cola } from '../estructuras/Cola';
import { Pila } from '../estructuras/Pila';
import {
  cancelarNotificacionProgramada,
  notificarTurnoDisponible,
  programarRecordatorioDevolucion,
} from '../lib/permisos';
import type { AvisoBiblioteca, Libro, Prestamo } from '../types';

export const NOMBRE_ESTUDIANTE = 'Vos (Estudiante IPF)';

export const CREDENCIALES_PERSONAL = {
  usuario: 'admin',
  clave: 'ipf2026',
} as const;

export type ResultadoReserva =
  | { tipo: 'prestamo'; fechaDevolucion: string }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'duplicado' };

export type ResultadoEntrega = {
  entregadoA: string | null;
  esUsuarioActual: boolean;
  viaNotificacion: boolean;
};

type BibliotecaContextValue = {
  prestamos: Prestamo[];
  listasEspera: Record<string, Cola<string>>;
  recientes: Libro[];
  avisos: AvisoBiblioteca[];
  personalLogueado: string | null;
  registrarVisto: (libro: Libro) => void;
  calcularDisponibles: (libro: Libro) => number;
  obtenerColaEspera: (isbn: string) => string[];
  posicionEnEspera: (isbn: string) => number | null;
  tieneLibroReservadoOPrestado: (isbn: string) => boolean;
  reservarLibro: (libro: Libro) => ResultadoReserva;
  devolverLibro: (isbn: string) => Promise<void>;
  activarRecordatorio: (isbn: string, tituloLibro: string) => Promise<boolean>;
  desactivarRecordatorio: (isbn: string) => Promise<void>;
  entregarAlSiguiente: (libro: Libro) => Promise<ResultadoEntrega>;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  marcarAvisoLeido: (id: string) => void;
};

const BibliotecaContext = createContext<BibliotecaContextValue | null>(null);

function crearColasIniciales(): Record<string, Cola<string>> {
  const mapa: Record<string, Cola<string>> = {};
  for (const [isbn, personas] of Object.entries(LISTAS_ESPERA_INICIALES)) {
    mapa[isbn] = new Cola<string>(personas);
  }
  return mapa;
}

function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function calcularFechaEnDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return formatearFecha(fecha);
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [listasEspera, setListasEspera] = useState<Record<string, Cola<string>>>(
    crearColasIniciales,
  );
  const [pilaRecientes, setPilaRecientes] = useState<Pila<Libro>>(
    () => new Pila<Libro>(),
  );
  const [avisos, setAvisos] = useState<AvisoBiblioteca[]>([]);
  const [personalLogueado, setPersonalLogueado] = useState<string | null>(null);

  /**
   * Requisito A3.2:
   * Cada vez que se abre un detalle se hace push del libro en la Pila.
   * Si el libro ya está en el tope, no se apila de nuevo.
   */
  const registrarVisto = useCallback((libro: Libro) => {
    setPilaRecientes((prev) => {
      if (prev.tope()?.isbn === libro.isbn) {
        return prev;
      }
      const nueva = prev.clonar();
      nueva.push(libro);
      return nueva;
    });
  }, []);

  /**
   * Los 3 libros del tope de la Pila, del más reciente al más antiguo.
   */
  const recientes = useMemo(() => {
    return pilaRecientes.aArray().slice(-3).reverse();
  }, [pilaRecientes]);

  /**
   * Requisito B4 y E4.d:
   * Los ejemplares disponibles se calculan a partir del catálogo y los préstamos activos
   * para evitar duplicar estado y desincronizaciones.
   */
  const calcularDisponibles = useCallback(
    (libro: Libro): number => {
      const prestadoPorMi = prestamos.some((p) => p.isbn === libro.isbn) ? 1 : 0;
      return Math.max(0, libro.ejemplares - prestadoPorMi);
    },
    [prestamos],
  );

  const obtenerColaEspera = useCallback(
    (isbn: string): string[] => {
      const cola = listasEspera[isbn];
      return cola ? cola.aArray() : [];
    },
    [listasEspera],
  );

  const posicionEnEspera = useCallback(
    (isbn: string): number | null => {
      const cola = listasEspera[isbn];
      if (!cola) return null;
      const indice = cola.aArray().indexOf(NOMBRE_ESTUDIANTE);
      return indice >= 0 ? indice + 1 : null;
    },
    [listasEspera],
  );

  const tieneLibroReservadoOPrestado = useCallback(
    (isbn: string): boolean => {
      const enPrestamo = prestamos.some((p) => p.isbn === isbn);
      const enEspera = posicionEnEspera(isbn) !== null;
      return enPrestamo || enEspera;
    },
    [prestamos, posicionEnEspera],
  );

  /**
   * Requisito A3.5:
   * Si hay ejemplares -> préstamo por 7 días.
   * Si no hay -> se encola en la Cola (clonada para disparar re-render en React).
   * No permite reservar dos veces el mismo libro.
   */
  const reservarLibro = useCallback(
    (libro: Libro): ResultadoReserva => {
      if (tieneLibroReservadoOPrestado(libro.isbn)) {
        return { tipo: 'duplicado' };
      }

      const disponibles = calcularDisponibles(libro);
      if (disponibles > 0) {
        const hoy = formatearFecha(new Date());
        const fechaDevolucion = calcularFechaEnDias(7);
        const nuevoPrestamo: Prestamo = {
          isbn: libro.isbn,
          fechaPrestamo: hoy,
          fechaDevolucion,
          recordatorioActivo: false,
          notificacionId: null,
        };
        setPrestamos((prev) => [nuevoPrestamo, ...prev]);
        return { tipo: 'prestamo', fechaDevolucion };
      }

      const colaActual = listasEspera[libro.isbn];
      const nuevaCola = colaActual ? colaActual.clonar() : new Cola<string>();
      nuevaCola.encolar(NOMBRE_ESTUDIANTE);
      const posicion = nuevaCola.tamanio;

      setListasEspera((prev) => ({
        ...prev,
        [libro.isbn]: nuevaCola,
      }));

      return { tipo: 'espera', posicion };
    },
    [tieneLibroReservadoOPrestado, calcularDisponibles, listasEspera],
  );

  /**
   * Requisito A3.7 y D2.a:
   * Al devolver un libro, si tenía una notificación programada, la cancela primero.
   */
  const devolverLibro = useCallback(
    async (isbn: string): Promise<void> => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      if (prestamo?.notificacionId) {
        await cancelarNotificacionProgramada(prestamo.notificacionId);
      }
      setPrestamos((prev) => prev.filter((p) => p.isbn !== isbn));
    },
    [prestamos],
  );

  const activarRecordatorio = useCallback(
    async (isbn: string, tituloLibro: string): Promise<boolean> => {
      try {
        const notificacionId = await programarRecordatorioDevolucion(
          tituloLibro,
          isbn,
        );
        setPrestamos((prev) =>
          prev.map((p) =>
            p.isbn === isbn
              ? { ...p, recordatorioActivo: true, notificacionId }
              : p,
          ),
        );
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const desactivarRecordatorio = useCallback(
    async (isbn: string): Promise<void> => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      if (prestamo?.notificacionId) {
        await cancelarNotificacionProgramada(prestamo.notificacionId);
      }
      setPrestamos((prev) =>
        prev.map((p) =>
          p.isbn === isbn
            ? { ...p, recordatorioActivo: false, notificacionId: null }
            : p,
        ),
      );
    },
    [prestamos],
  );

  /**
   * Requisito A3.8 y D2.d:
   * Desencola a la persona del frente de la Cola del libro.
   * Si esa persona es el estudiante actual, pasa a préstamo y consulta el permiso
   * de notificaciones en vivo: si está concedido envía notificación, si no crea
   * un aviso dentro de /reservas.
   */
  const entregarAlSiguiente = useCallback(
    async (libro: Libro): Promise<ResultadoEntrega> => {
      const colaActual = listasEspera[libro.isbn];
      if (!colaActual || colaActual.vacia) {
        return { entregadoA: null, esUsuarioActual: false, viaNotificacion: false };
      }

      const nuevaCola = colaActual.clonar();
      const siguiente = nuevaCola.desencolar() ?? null;

      setListasEspera((prev) => ({
        ...prev,
        [libro.isbn]: nuevaCola,
      }));

      if (!siguiente) {
        return { entregadoA: null, esUsuarioActual: false, viaNotificacion: false };
      }

      const esUsuarioActual = siguiente === NOMBRE_ESTUDIANTE;
      if (!esUsuarioActual) {
        return { entregadoA: siguiente, esUsuarioActual: false, viaNotificacion: false };
      }

      const hoy = formatearFecha(new Date());
      const fechaDevolucion = calcularFechaEnDias(7);
      setPrestamos((prev) => {
        if (prev.some((p) => p.isbn === libro.isbn)) return prev;
        return [
          {
            isbn: libro.isbn,
            fechaPrestamo: hoy,
            fechaDevolucion,
            recordatorioActivo: false,
            notificacionId: null,
          },
          ...prev,
        ];
      });

      const viaNotificacion = await notificarTurnoDisponible(
        libro.titulo,
        libro.isbn,
      );

      if (!viaNotificacion) {
        const nuevoAviso: AvisoBiblioteca = {
          id: `aviso-${Date.now()}`,
          isbn: libro.isbn,
          titulo: `Libro disponible: ${libro.titulo}`,
          mensaje: `El personal de mostrador te asignó "${libro.titulo}". Devolución límite: ${fechaDevolucion}.`,
          fecha: hoy,
          leido: false,
        };
        setAvisos((prev) => [nuevoAviso, ...prev]);
      }

      return { entregadoA: siguiente, esUsuarioActual: true, viaNotificacion };
    },
    [listasEspera],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string): boolean => {
    const ok =
      usuario.trim().toLowerCase() === CREDENCIALES_PERSONAL.usuario &&
      clave === CREDENCIALES_PERSONAL.clave;
    if (ok) {
      setPersonalLogueado('Personal de Biblioteca');
    }
    return ok;
  }, []);

  const cerrarSesion = useCallback(() => {
    setPersonalLogueado(null);
  }, []);

  const marcarAvisoLeido = useCallback((id: string) => {
    setAvisos((prev) =>
      prev.map((av) => (av.id === id ? { ...av, leido: true } : av)),
    );
  }, []);

  const value = useMemo<BibliotecaContextValue>(
    () => ({
      prestamos,
      listasEspera,
      recientes,
      avisos,
      personalLogueado,
      registrarVisto,
      calcularDisponibles,
      obtenerColaEspera,
      posicionEnEspera,
      tieneLibroReservadoOPrestado,
      reservarLibro,
      devolverLibro,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      marcarAvisoLeido,
    }),
    [
      prestamos,
      listasEspera,
      recientes,
      avisos,
      personalLogueado,
      registrarVisto,
      calcularDisponibles,
      obtenerColaEspera,
      posicionEnEspera,
      tieneLibroReservadoOPrestado,
      reservarLibro,
      devolverLibro,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      marcarAvisoLeido,
    ],
  );

  return (
    <BibliotecaContext.Provider value={value}>
      {children}
    </BibliotecaContext.Provider>
  );
}

export function useBiblioteca(): BibliotecaContextValue {
  const ctx = useContext(BibliotecaContext);
  if (!ctx) {
    throw new Error('useBiblioteca debe usarse dentro de un BibliotecaProvider.');
  }
  return ctx;
}
