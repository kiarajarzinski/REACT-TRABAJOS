import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type RecursoPermiso = 'camara' | 'ubicacion' | 'notificaciones' | 'fotos';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export interface DetallePermiso {
  recurso: RecursoPermiso;
  estado: EstadoPermiso;
  parcial: boolean;
  matiz: string | null;
  canAskAgain: boolean;
  rawStatus: string;
}

export interface InfoRecurso {
  recurso: RecursoPermiso;
  titulo: string;
  icono: string;
  moduloExpo: string;
  beneficio: string;
  cuandoSePide: string;
  alternativa: string;
}

export const INFO_RECURSOS: Record<RecursoPermiso, InfoRecurso> = {
  camara: {
    recurso: 'camara',
    titulo: 'Cámara',
    icono: '📷',
    moduloExpo: 'expo-camera',
    beneficio:
      'Usamos tu cámara para leer el código QR pegado en la puerta del aula y sacar fotos del desperfecto.',
    cuandoSePide:
      'Recién al tocar "Escanear QR del aula" o "Sacar foto" en un nuevo reporte.',
    alternativa:
      'Escribir el código del aula a mano o elegir una foto existente con el selector del sistema.',
  },
  ubicacion: {
    recurso: 'ubicacion',
    titulo: 'Ubicación (primer plano)',
    icono: '📍',
    moduloExpo: 'expo-location',
    beneficio:
      'Usamos tu ubicación para marcar en qué sector del edificio (patio, estacionamiento o pasillo) está el desperfecto.',
    cuandoSePide: 'Recién al tocar "Usar mi ubicación actual" en el formulario de reporte.',
    alternativa: 'Seleccionar el sector del edificio manualmente de la lista.',
  },
  notificaciones: {
    recurso: 'notificaciones',
    titulo: 'Notificaciones',
    icono: '🔔',
    moduloExpo: 'expo-notifications',
    beneficio:
      'Usamos las notificaciones para avisarte en tu teléfono cuando el equipo de mantenimiento resuelva tu reporte.',
    cuandoSePide:
      'Únicamente al activar el interruptor "Avisarme cuando se resuelva mi reporte" en Ajustes de la app.',
    alternativa: 'Consultar la pestaña "Avisos" (bandeja interna dentro de la app).',
  },
  fotos: {
    recurso: 'fotos',
    titulo: 'Fotos y Galería',
    icono: '🖼️',
    moduloExpo: 'expo-image-picker (Photo Picker)',
    beneficio:
      'Usamos el selector de fotos del sistema para que elijas la imagen del desperfecto sin pedir acceso a toda tu galería.',
    cuandoSePide:
      'No se pide permiso de galería: "Elegir de la galería" abre el Photo Picker nativo del sistema.',
    alternativa: 'Selector del sistema sin permisos.',
  },
};

// Configurar cómo se muestran las notificaciones cuando la app está abierta en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * En Android 13+ es obligatorio crear al menos un canal de notificación
 * antes de llamar a Notifications.requestPermissionsAsync() para que aparezca el diálogo.
 */
export async function asegurarCanalReportes(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reportes', {
      name: 'Resolución de reportes',
      description: 'Avisos cuando un desperfecto reportado cambia a estado resuelto',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0A9484',
    });
  }
}

function calcularEstado(granted: boolean, canAskAgain: boolean): EstadoPermiso {
  if (granted) return 'concedido';
  if (canAskAgain) return 'preguntable';
  return 'bloqueado';
}

export async function consultarPermisoRecurso(
  recurso: RecursoPermiso
): Promise<DetallePermiso> {
  try {
    if (recurso === 'camara') {
      const res = await Camera.getCameraPermissionsAsync();
      return {
        recurso,
        estado: calcularEstado(res.granted, res.canAskAgain),
        parcial: false,
        matiz: res.granted ? 'acceso completo a cámara' : null,
        canAskAgain: res.canAskAgain,
        rawStatus: res.status,
      };
    }

    if (recurso === 'ubicacion') {
      const res = await Location.getForegroundPermissionsAsync();
      const androidAccuracy = res.android?.accuracy; // 'fine' | 'coarse' | 'none'
      const iosAccuracy = (res as any).ios?.accuracy; // 'full' | 'reduced'
      const esAproximada =
        res.granted && (androidAccuracy === 'coarse' || iosAccuracy === 'reduced');

      let matiz: string | null = null;
      if (res.granted) {
        if (Platform.OS === 'android' && androidAccuracy) {
          matiz = `accuracy: ${androidAccuracy} (${
            androidAccuracy === 'coarse' ? 'aproximada' : 'precisa'
          })`;
        } else if (Platform.OS === 'ios' && iosAccuracy) {
          matiz = `accuracy: ${iosAccuracy} (${
            iosAccuracy === 'reduced' ? 'aproximada' : 'precisa'
          })`;
        } else {
          matiz = esAproximada ? 'ubicación aproximada' : 'ubicación precisa';
        }
      }

      return {
        recurso,
        estado: calcularEstado(res.granted, res.canAskAgain),
        parcial: Boolean(esAproximada),
        matiz,
        canAskAgain: res.canAskAgain,
        rawStatus: res.status,
      };
    }

    if (recurso === 'notificaciones') {
      const res = await Notifications.getPermissionsAsync();
      let matiz: string | null = null;
      if (res.granted) {
        matiz = Platform.OS === 'android' ? 'canal: "reportes" activo' : 'alertas activas';
      }

      return {
        recurso,
        estado: calcularEstado(res.granted, res.canAskAgain),
        parcial: false,
        matiz,
        canAskAgain: res.canAskAgain,
        rawStatus: res.status,
      };
    }

    // recurso === 'fotos'
    const res = await ImagePicker.getMediaLibraryPermissionsAsync();
    const privileges = res.accessPrivileges; // 'all' | 'limited' | 'none'
    const esLimitado = res.granted && privileges === 'limited';

    let matiz: string | null = 'Photo Picker del sistema (no requiere permiso)';
    if (res.granted && privileges) {
      matiz = `accessPrivileges: ${privileges} (${
        esLimitado ? 'fotos seleccionadas' : 'todas las fotos'
      })`;
    }

    return {
      recurso,
      estado: calcularEstado(res.granted, res.canAskAgain),
      parcial: Boolean(esLimitado),
      matiz,
      canAskAgain: res.canAskAgain,
      rawStatus: res.status,
    };
  } catch {
    return {
      recurso,
      estado: 'preguntable',
      parcial: false,
      matiz: null,
      canAskAgain: true,
      rawStatus: 'undetermined',
    };
  }
}

export async function solicitarPermisoRecurso(
  recurso: RecursoPermiso
): Promise<DetallePermiso> {
  if (recurso === 'camara') {
    await Camera.requestCameraPermissionsAsync();
    return consultarPermisoRecurso('camara');
  }

  if (recurso === 'ubicacion') {
    await Location.requestForegroundPermissionsAsync();
    return consultarPermisoRecurso('ubicacion');
  }

  if (recurso === 'notificaciones') {
    // Requisito G2.5: En Android crear el canal "reportes" ANTES de pedir el permiso
    await asegurarCanalReportes();
    await Notifications.requestPermissionsAsync();
    return consultarPermisoRecurso('notificaciones');
  }

  await ImagePicker.requestMediaLibraryPermissionsAsync();
  return consultarPermisoRecurso('fotos');
}

export async function abrirAjustesSistema(): Promise<void> {
  await Linking.openSettings();
}

export interface ResultadoUbicacionReporte {
  aproximada: boolean;
  textoMostrar: string;
  latitud?: number;
  longitud?: number;
}

/**
 * Requisito G2.4: Ubicación respetuosa.
 * Pide solo primer plano. Si es aproximada, NO muestra coordenadas exactas
 * sino "Ubicación aproximada".
 */
export async function obtenerUbicacionActualRespetuosa(): Promise<ResultadoUbicacionReporte | null> {
  try {
    const detalle = await consultarPermisoRecurso('ubicacion');
    if (detalle.estado !== 'concedido') {
      return null;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: detalle.parcial ? Location.Accuracy.Balanced : Location.Accuracy.High,
    });

    const radioIncertidumbre = pos.coords.accuracy ?? 0;
    const esAproximada = detalle.parcial || radioIncertidumbre > 1000;

    if (esAproximada) {
      return {
        aproximada: true,
        textoMostrar: 'Ubicación aproximada',
      };
    }

    const lat = pos.coords.latitude.toFixed(5);
    const lng = pos.coords.longitude.toFixed(5);
    return {
      aproximada: false,
      textoMostrar: `Coordenadas exactas: ${lat}, ${lng}`,
      latitud: pos.coords.latitude,
      longitud: pos.coords.longitude,
    };
  } catch {
    return null;
  }
}
