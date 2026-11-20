import { useCallback, useEffect, useState } from 'react';

import {
  abrirAjustesSistema,
  consultarPermisoRecurso,
  type DetallePermiso,
  solicitarPermisoRecurso,
} from '../lib/permisos';
import type { EstadoPermiso, RecursoPermiso } from '../types';
import { useRevisarAlVolver } from './useRevisarAlVolver';

export type ResultadoUsePermiso = {
  estado: EstadoPermiso;
  status: string;
  canAskAgain: boolean;
  pedir: () => Promise<DetallePermiso>;
  abrirAjustes: () => Promise<void>;
  recargar: () => Promise<DetallePermiso>;
};

export function usePermiso(recurso: RecursoPermiso): ResultadoUsePermiso {
  const [detalle, setDetalle] = useState<DetallePermiso>({
    recurso,
    estado: 'cargando',
    status: 'undetermined',
    canAskAgain: true,
  });

  const recargar = useCallback(async () => {
    const actualizado = await consultarPermisoRecurso(recurso);
    setDetalle(actualizado);
    return actualizado;
  }, [recurso]);

  useEffect(() => {
    let activo = true;

    consultarPermisoRecurso(recurso).then((actualizado) => {
      if (activo) {
        setDetalle(actualizado);
      }
    });

    return () => {
      activo = false;
    };
  }, [recurso]);

  useRevisarAlVolver(() => {
    void recargar();
  });

  const pedir = useCallback(async () => {
    const resultado = await solicitarPermisoRecurso(recurso);
    setDetalle(resultado);
    return resultado;
  }, [recurso]);

  const abrirAjustes = useCallback(async () => {
    await abrirAjustesSistema();
  }, []);

  const esMismoRecurso = detalle.recurso === recurso;

  return {
    estado: esMismoRecurso ? detalle.estado : 'cargando',
    status: esMismoRecurso ? detalle.status : 'undetermined',
    canAskAgain: esMismoRecurso ? detalle.canAskAgain : true,
    pedir,
    abrirAjustes,
    recargar,
  };
}
