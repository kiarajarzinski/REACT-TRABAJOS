import { Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { Colores } from '../constants/tema';
import type { EstadoPermiso, RecursoPermiso } from '../types';

export type DetallePermiso = {
  recurso: RecursoPermiso;
  estado: EstadoPermiso;
  status: string;
  canAskAgain: boolean;
};

export type InfoRecurso = {
  recurso: RecursoPermiso;
  titulo: string;
  beneficio: string;
  alternativa: string;
};

export const INFO_RECURSOS: Record<RecursoPermiso, InfoRecurso> = {
  camara: {
    recurso: 'camara',
    titulo: 'Cámara',
    beneficio:
      'Usamos tu cámara para leer el código de barras de los libros y abrir su ficha en el catálogo.',
    alternativa: 'Podés escribir el ISBN de 13 dígitos manualmente en el escáner.',
  },
  notificaciones: {
    recurso: 'notificaciones',
    titulo: 'Notificaciones',
    beneficio:
      'Usamos las notificaciones para recordarte antes de devolver un libro y avisarte cuando tu reserva esté lista.',
    alternativa: 'Podés ver todos tus avisos dentro de la pestaña "Mis reservas".',
  },
};

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * En Android 13+ (API 33+) es obligatorio crear el canal de notificaciones
 * antes de llamar a Notifications.requestPermissionsAsync().
 */
export async function asegurarCanalPrestamos(): Promise<void> {
  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('prestamos', {
      name: 'Préstamos y devoluciones',
      description: 'Recordatorios de devolución y avisos de lista de espera de Biblioteca IPF',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colores.primario,
    });
  }
}

export function calcularEstadoPermiso(
  granted: boolean,
  canAskAgain: boolean,
): EstadoPermiso {
  if (granted) return 'concedido';
  if (canAskAgain) return 'preguntable';
  return 'bloqueado';
}

export async function consultarPermisoRecurso(
  recurso: RecursoPermiso,
): Promise<DetallePermiso> {
  try {
    if (recurso === 'camara') {
      const res = await Camera.getCameraPermissionsAsync();
      return {
        recurso,
        estado: calcularEstadoPermiso(res.granted, res.canAskAgain),
        status: res.status,
        canAskAgain: res.canAskAgain,
      };
    }

    const res = await getPermissionsAsync();
    return {
      recurso,
      estado: calcularEstadoPermiso(res.granted, res.canAskAgain),
      status: res.status,
      canAskAgain: res.canAskAgain,
    };
  } catch {
    return {
      recurso,
      estado: 'preguntable',
      status: 'undetermined',
      canAskAgain: true,
    };
  }
}

export async function solicitarPermisoRecurso(
  recurso: RecursoPermiso,
): Promise<DetallePermiso> {
  if (recurso === 'camara') {
    await Camera.requestCameraPermissionsAsync();
    return consultarPermisoRecurso('camara');
  }

  await asegurarCanalPrestamos();
  await requestPermissionsAsync();
  return consultarPermisoRecurso('notificaciones');
}

export async function abrirAjustesSistema(): Promise<void> {
  await Linking.openSettings();
}

/**
 * Requisito A3.7:
 * En modo demostración programa la notificación local a los 15 segundos
 * en el canal "prestamos" y devuelve su identificador para poder cancelarla.
 */
export async function programarRecordatorioDevolucion(
  tituloLibro: string,
  isbn: string,
): Promise<string> {
  await asegurarCanalPrestamos();
  const id = await scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de devolución · Biblioteca IPF',
      body: `Recordá devolver "${tituloLibro}" antes de la fecha límite.`,
      data: { isbn },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 15,
      channelId: 'prestamos',
    },
  });
  return id;
}

export async function cancelarNotificacionProgramada(
  notificacionId: string,
): Promise<void> {
  try {
    await cancelScheduledNotificationAsync(notificacionId);
  } catch {
    // Si ya se disparó o no existe, ignoramos el error de cancelación
  }
}

/**
 * Requisito A3.8 y D2.d:
 * Consulta el permiso en vivo al sistema operativo en el momento de entregar
 * el libro. Si está concedido envía notificación local y devuelve true;
 * si no, devuelve false para registrar el aviso dentro de /reservas.
 */
export async function notificarTurnoDisponible(
  tituloLibro: string,
  isbn: string,
): Promise<boolean> {
  const permiso = await consultarPermisoRecurso('notificaciones');
  if (permiso.estado !== 'concedido') {
    return false;
  }

  try {
    await asegurarCanalPrestamos();
    await scheduleNotificationAsync({
      content: {
        title: 'Tu libro ya está disponible · Biblioteca IPF',
        body: `Ya podés pasar por el mostrador a retirar "${tituloLibro}".`,
        data: { isbn },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: 'prestamos',
      },
    });
    return true;
  } catch {
    return false;
  }
}
