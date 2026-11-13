import * as Notifications from 'expo-notifications';
import { useSyncExternalStore } from 'react';
import { asegurarCanalReportes, consultarPermisoRecurso } from './permisos';

export type CategoriaReporte = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';
export type EstadoReporte = 'pendiente' | 'en_curso' | 'resuelto';

export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: CategoriaReporte;
  estado: EstadoReporte;
  creadoEn: string;
  fotoUri?: string;
  fotoOrigen?: 'camara' | 'selector_sistema';
  sector?: string;
  ubicacionTexto?: string;
  ubicacionAproximada?: boolean;
}

export interface AvisoInterno {
  id: string;
  reporteId: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  via: 'notificacion_local' | 'bandeja_interna';
}

export interface BorradorReporte {
  aula: string;
  fotoUri?: string;
  fotoOrigen?: 'camara' | 'selector_sistema';
  sector?: string;
  ubicacionTexto?: string;
  ubicacionAproximada?: boolean;
}

interface EstadoSistema {
  reportes: Reporte[];
  avisos: AvisoInterno[];
  borrador: BorradorReporte;
  avisarmeAlResolver: boolean;
}

let estadoActual: EstadoSistema = {
  reportes: [
    {
      id: 'rep-101',
      titulo: 'Tubo fluorescente parpadeando',
      descripcion: 'El tubo sobre el pizarrón titila y hace ruido al encender la llave 2.',
      aula: 'AULA-204',
      categoria: 'electricidad',
      estado: 'en_curso',
      creadoEn: 'Hoy, 08:30',
      sector: 'Pasillo Planta Alta',
      ubicacionTexto: 'Ubicación aproximada (zona del Instituto)',
      ubicacionAproximada: true,
    },
    {
      id: 'rep-102',
      titulo: 'Canilla pierde agua en lavamanos',
      descripcion: 'La segunda canilla del baño no cierra del todo y gotea constante.',
      aula: 'LAB-102',
      categoria: 'agua',
      estado: 'pendiente',
      creadoEn: 'Ayer, 17:15',
      sector: 'Patio Central',
    },
    {
      id: 'rep-103',
      titulo: 'Cable HDMI del proyector sin señal',
      descripcion: 'Al conectar la notebook al proyector la imagen se corta al mover la ficha.',
      aula: 'AULA-105',
      categoria: 'equipos',
      estado: 'resuelto',
      creadoEn: 'Hace 2 días',
      sector: 'Pasillo Planta Baja',
    },
  ],
  avisos: [
    {
      id: 'av-1',
      reporteId: 'rep-103',
      titulo: 'Reporte resuelto: Cable HDMI del proyector sin señal',
      mensaje:
        'El equipo de mantenimiento reemplazó el cable HDMI en AULA-105. ¡Gracias por reportarlo!',
      fecha: 'Hace 1 día',
      leido: false,
      via: 'bandeja_interna',
    },
  ],
  borrador: {
    aula: '',
  },
  avisarmeAlResolver: false,
};

const oyentes = new Set<() => void>();

function emitirCambio() {
  oyentes.forEach((fn) => fn());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

function obtenerSnapshot(): EstadoSistema {
  return estadoActual;
}

export function useReportesStore(): EstadoSistema {
  return useSyncExternalStore(suscribir, obtenerSnapshot, obtenerSnapshot);
}

export function actualizarBorrador(parcial: Partial<BorradorReporte>) {
  estadoActual = {
    ...estadoActual,
    borrador: {
      ...estadoActual.borrador,
      ...parcial,
    },
  };
  emitirCambio();
}

export function limpiarBorrador() {
  estadoActual = {
    ...estadoActual,
    borrador: {
      aula: '',
    },
  };
  emitirCambio();
}

export function setAvisarmeAlResolver(valor: boolean) {
  estadoActual = {
    ...estadoActual,
    avisarmeAlResolver: valor,
  };
  emitirCambio();
}

export function crearReporte(datos: {
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: CategoriaReporte;
}): Reporte {
  const nuevo: Reporte = {
    id: `rep-${Date.now().toString().slice(-4)}`,
    titulo: datos.titulo.trim(),
    descripcion: datos.descripcion.trim(),
    aula: datos.aula.trim() || estadoActual.borrador.aula.trim() || 'SIN-AULA',
    categoria: datos.categoria,
    estado: 'pendiente',
    creadoEn: 'Recién',
    fotoUri: estadoActual.borrador.fotoUri,
    fotoOrigen: estadoActual.borrador.fotoOrigen,
    sector: estadoActual.borrador.sector,
    ubicacionTexto: estadoActual.borrador.ubicacionTexto,
    ubicacionAproximada: estadoActual.borrador.ubicacionAproximada,
  };

  estadoActual = {
    ...estadoActual,
    reportes: [nuevo, ...estadoActual.reportes],
    borrador: { aula: '' },
  };
  emitirCambio();
  return nuevo;
}

export function marcarAvisoComoLeido(id: string) {
  estadoActual = {
    ...estadoActual,
    avisos: estadoActual.avisos.map((av) => (av.id === id ? { ...av, leido: true } : av)),
  };
  emitirCambio();
}

/**
 * Requisito G2.5:
 * "Simular resolución" programa una notificación local a los 10 segundos;
 * si el permiso está denegado, el aviso aparece en /avisos.
 */
export async function simularResolucionReporte(
  reporteId: string
): Promise<{ programadaNotificacion: boolean; mensajeResultado: string }> {
  const reporte = estadoActual.reportes.find((r) => r.id === reporteId);
  if (!reporte) {
    return {
      programadaNotificacion: false,
      mensajeResultado: 'El reporte indicado no existe.',
    };
  }

  // Pasar a "en_curso" mientras corren los 10 segundos de simulación (o resolver)
  estadoActual = {
    ...estadoActual,
    reportes: estadoActual.reportes.map((r) =>
      r.id === reporteId ? { ...r, estado: 'en_curso' } : r
    ),
  };
  emitirCambio();

  const permisoNotif = await consultarPermisoRecurso('notificaciones');
  const tienePermiso = permisoNotif.estado === 'concedido';

  const registrarResolucionEnBandeja = (via: 'notificacion_local' | 'bandeja_interna') => {
    const nuevoAviso: AvisoInterno = {
      id: `av-${Date.now()}`,
      reporteId: reporte.id,
      titulo: `Reporte resuelto: ${reporte.titulo}`,
      mensaje: `Mantenimiento IPF resolvió el desperfecto en ${reporte.aula} (${
        reporte.sector || 'Edificio IPF'
      }).`,
      fecha: 'Recién',
      leido: false,
      via,
    };

    estadoActual = {
      ...estadoActual,
      reportes: estadoActual.reportes.map((r) =>
        r.id === reporteId ? { ...r, estado: 'resuelto' } : r
      ),
      avisos: [nuevoAviso, ...estadoActual.avisos],
    };
    emitirCambio();
  };

  if (tienePermiso) {
    try {
      await asegurarCanalReportes();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Reporte resuelto — Mantenimiento IPF',
          body: `Se solucionó "${reporte.titulo}" en ${reporte.aula}.`,
          data: { reporteId: reporte.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
          channelId: 'reportes',
        },
      });

      setTimeout(() => {
        registrarResolucionEnBandeja('notificacion_local');
      }, 10000);

      return {
        programadaNotificacion: true,
        mensajeResultado:
          'Notificación local programada para dentro de 10 segundos (y se actualizará en /avisos).',
      };
    } catch {
      registrarResolucionEnBandeja('bandeja_interna');
      return {
        programadaNotificacion: false,
        mensajeResultado:
          'No se pudo programar la notificación del sistema; el aviso se envió a la bandeja /avisos.',
      };
    }
  }

  // Si el permiso de notificaciones está denegado o sin conceder: camino alternativo inmediato en /avisos
  registrarResolucionEnBandeja('bandeja_interna');
  return {
    programadaNotificacion: false,
    mensajeResultado:
      'El permiso de notificaciones no está activo. El reporte se marcó como resuelto y el aviso ya está disponible en la pestaña /avisos.',
  };
}

