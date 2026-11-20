export type Libro = {
  isbn: string; // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number; // ejemplares en el estante al iniciar la app
};

export type Prestamo = {
  isbn: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  recordatorioActivo: boolean;
  notificacionId: string | null;
};

export type AvisoBiblioteca = {
  id: string;
  isbn: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
};

export type RecursoPermiso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';
