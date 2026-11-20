import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Boton } from '../../components/Boton';
import { ExplicacionPermiso } from '../../components/ExplicacionPermiso';
import { Pantalla } from '../../components/Pantalla';
import { Parrafo } from '../../components/Parrafo';
import { Subtitulo } from '../../components/Subtitulo';
import { Titulo } from '../../components/Titulo';
import { Colores, Espaciados } from '../../constants/tema';
import { usePermiso } from '../../hooks/usePermiso';
import { INFO_RECURSOS } from '../../lib/permisos';
import type { RecursoPermiso } from '../../types';

const RECURSOS_VALIDOS: RecursoPermiso[] = ['camara', 'notificaciones'];

/**
 * Ruta /permisos/[recurso] (presentation: "modal").
 * Requisito A1 y A3.6:
 * Muestra el beneficio en una frase y un único botón "Continuar"
 * (o "Abrir Ajustes" si el permiso está bloqueado).
 */
export default function PantallaPreviaPermisoScreen() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();
  const esValido = RECURSOS_VALIDOS.includes(recurso as RecursoPermiso);
  const recursoClave: RecursoPermiso = esValido
    ? (recurso as RecursoPermiso)
    : 'camara';

  const { estado, pedir, abrirAjustes } = usePermiso(recursoClave);

  if (!esValido) {
    return (
      <Pantalla>
        <Titulo>Recurso no válido</Titulo>
        <Parrafo>
          El permiso &quot;{String(recurso)}&quot; no existe en Biblioteca IPF.
        </Parrafo>
        <Boton
          titulo="Volver"
          variante="primario"
          onPress={() => router.back()}
        />
      </Pantalla>
    );
  }

  if (estado === 'cargando') {
    return (
      <Pantalla>
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={Colores.primario} />
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
      <Subtitulo>Permiso en contexto</Subtitulo>
      <Titulo>{info.titulo}</Titulo>
      <ExplicacionPermiso
        recurso={recursoClave}
        estado={estado}
        onContinuar={() => void manejarContinuar()}
        onAbrirAjustes={() => void abrirAjustes()}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  centrado: {
    paddingVertical: Espaciados.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciados.md,
  },
});
