import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Pantalla } from '@/components/pantalla';
import { ExplicacionPermiso } from '@/components/TarjetaPermiso';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import { usePermiso } from '@/hooks/usePermiso';
import { INFO_RECURSOS, RecursoPermiso } from '@/lib/permisos';

const RECURSOS_VALIDOS: RecursoPermiso[] = [
  'camara',
  'ubicacion',
  'notificaciones',
  'fotos',
];

/**
 * Ruta /permisos/[recurso] (presentation: "modal").
 * Requisito G2.6:
 * Antes de cada diálogo del sistema se muestra /permisos/[recurso] con un único botón
 * "Continuar", sin "Ahora no" ni "Cerrar". Si el permiso está bloqueado, explica cómo
 * habilitarlo y el botón pasa a ser "Abrir Ajustes".
 */
export default function PantallaPreviaModalScreen() {
  const colores = useColores();
  const { recurso } = useLocalSearchParams<{ recurso: string }>();
  const esValido = RECURSOS_VALIDOS.includes(recurso as RecursoPermiso);
  const recursoClave: RecursoPermiso = esValido ? (recurso as RecursoPermiso) : 'camara';

  const { estado, pedir, abrirAjustes } = usePermiso(recursoClave);

  if (!esValido) {
    return (
      <Pantalla>
        <Titulo>Recurso no válido</Titulo>
        <Parrafo>
          El recurso &quot;{String(recurso)}&quot; no corresponde a un permiso registrado.
        </Parrafo>
      </Pantalla>
    );
  }

  if (estado === 'cargando') {
    return (
      <Pantalla>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Parrafo>Consultando estado del permiso...</Parrafo>
        </View>
      </Pantalla>
    );
  }

  const info = INFO_RECURSOS[recursoClave];

  const manejarContinuar = async () => {
    const res = await pedir();
    if (res.estado === 'concedido' && router.canGoBack()) {
      router.back();
    }
  };

  return (
    <Pantalla>
      <Subtitulo>Pantalla previa al diálogo del sistema</Subtitulo>
      <Titulo>{info.titulo}</Titulo>

      <ExplicacionPermiso
        recurso={recursoClave}
        estado={estado}
        onContinuar={manejarContinuar}
        onAbrirAjustes={abrirAjustes}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
