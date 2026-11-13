import { useCallback, useEffect, useState } from 'react';
import {
  abrirAjustesSistema,
  consultarPermisoRecurso,
  DetallePermiso,
  EstadoPermiso,
  RecursoPermiso,
  solicitarPermisoRecurso,
} from '../lib/permisos';
import { useRevisarAlVolver } from './useRevisarAlVolver';

export interface ResultadoUsePermiso {
  estado: EstadoPermiso;
  parcial: boolean;
  provisional: boolean;
  matiz: string | null;
  canAskAgain: boolean;
  rawStatus: string;
  pedir: (opciones?: { provisionalIOS?: boolean }) => Promise<DetallePermiso>;
  abrirAjustes: () => Promise<void>;
  recargar: () => Promise<DetallePermiso>;
}

/**
 * Requisito G2.1: Hook unificado usePermiso(recurso)
 * Devuelve:
 * - estado: 'cargando' | 'concedido' | 'preguntable' | 'bloqueado'
 * - parcial: boolean (fotos limitadas o ubicación aproximada)
 * - pedir(): solicita el permiso al sistema operativo y actualiza el estado
 * - abrirAjustes(): abre la pantalla de Ajustes del sistema para la app
 * Se actualiza automáticamente al volver de Ajustes usando AppState.
 */
export function usePermiso(recurso: RecursoPermiso): ResultadoUsePermiso {
  const [detalle, setDetalle] = useState<DetallePermiso>({
    recurso,
    estado: 'cargando',
    parcial: false,
    provisional: false,
    matiz: null,
    canAskAgain: true,
    rawStatus: 'undetermined',
  });

  const recargar = useCallback(async () => {
    const actualizado = await consultarPermisoRecurso(recurso);
    setDetalle(actualizado);
    return actualizado;
  }, [recurso]);

  useEffect(() => {
    setDetalle((prev) => ({ ...prev, recurso, estado: 'cargando' }));
    recargar();
  }, [recurso, recargar]);

  // Actualizar automáticamente cuando la persona usuaria vuelve desde Ajustes del sistema
  useRevisarAlVolver(() => {
    recargar();
  });

  const pedir = useCallback(
    async (opciones?: { provisionalIOS?: boolean }) => {
      const resultado = await solicitarPermisoRecurso(recurso, opciones);
      setDetalle(resultado);
      return resultado;
    },
    [recurso]
  );

  const abrirAjustes = useCallback(async () => {
    await abrirAjustesSistema();
  }, []);

  return {
    estado: detalle.estado,
    parcial: detalle.parcial,
    provisional: detalle.provisional,
    matiz: detalle.matiz,
    canAskAgain: detalle.canAskAgain,
    rawStatus: detalle.rawStatus,
    pedir,
    abrirAjustes,
    recargar,
  };
}

