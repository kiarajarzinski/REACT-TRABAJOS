import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { BadgeEstadoPermiso } from '@/components/TarjetaPermiso';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { FuenteMono } from '@/constants/theme';
import { useColores } from '@/hooks/use-colores';
import { usePermiso } from '@/hooks/usePermiso';
import { INFO_RECURSOS, RecursoPermiso } from '@/lib/permisos';

function FilaRecursoPermiso({ recurso }: { recurso: RecursoPermiso }) {
  const colores = useColores();
  const { estado, parcial, provisional, matiz, canAskAgain, abrirAjustes, recargar } =
    usePermiso(recurso);
  const info = INFO_RECURSOS[recurso];

  const manejarAccion = () => {
    if (estado === 'bloqueado') {
      abrirAjustes();
      return;
    }
    router.push({ pathname: '/permisos/[recurso]', params: { recurso } });
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colores.superficie, borderColor: colores.borde },
      ]}>
      <View style={styles.headerRow}>
        <Text style={styles.icono}>{info.icono}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, { color: colores.texto }]}>{info.titulo}</Text>
          <Text style={[styles.modulo, { color: colores.textoSecundario }]}>
            {info.moduloExpo}
          </Text>
        </View>
        <BadgeEstadoPermiso
          estado={estado}
          parcial={parcial}
          provisional={provisional}
        />
      </View>

      <View style={styles.metaGrid}>
        <View
          style={[
            styles.metaChip,
            { backgroundColor: colores.fondo, borderColor: colores.borde },
          ]}>
          <Text style={[styles.metaLabel, { color: colores.textoSecundario }]}>
            Plataforma:
          </Text>
          <Text style={[styles.metaVal, { color: colores.texto }]}>{Platform.OS}</Text>
        </View>
        <View
          style={[
            styles.metaChip,
            { backgroundColor: colores.fondo, borderColor: colores.borde },
          ]}>
          <Text style={[styles.metaLabel, { color: colores.textoSecundario }]}>
            canAskAgain:
          </Text>
          <Text style={[styles.metaVal, { color: colores.texto }]}>
            {String(canAskAgain)}
          </Text>
        </View>
        {matiz ? (
          <View
            style={[
              styles.metaChip,
              {
                backgroundColor: colores.primarioSuave,
                borderColor: colores.borde,
              },
            ]}>
            <Text style={[styles.metaLabel, { color: colores.primario }]}>Matiz:</Text>
            <Text style={[styles.metaVal, { color: colores.primario }]}>{matiz}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.detalle, { color: colores.textoSecundario }]}>
        {info.cuandoSePide}
      </Text>

      <View style={styles.actionsRow}>
        {recurso === 'fotos' ? (
          <View style={{ flex: 1 }}>
            <Boton
              titulo="Ver detalle (Photo Picker sin permiso)"
              variante="secundario"
              icono="images-outline"
              onPress={() =>
                router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'fotos' } })
              }
            />
          </View>
        ) : estado === 'concedido' ? (
          <View style={{ flex: 1 }}>
            <Boton
              titulo="Gestionar en Ajustes"
              variante="secundario"
              icono="settings-outline"
              onPress={abrirAjustes}
            />
          </View>
        ) : estado === 'bloqueado' ? (
          <View style={{ flex: 1, gap: 8 }}>
            <Boton
              titulo="Abrir Ajustes"
              variante="peligro"
              icono="settings-outline"
              onPress={abrirAjustes}
            />
            <Boton
              titulo="Ver guía de desbloqueo"
              variante="secundario"
              icono="help-circle-outline"
              onPress={() =>
                router.push({ pathname: '/permisos/[recurso]', params: { recurso } })
              }
            />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Boton
              titulo="Pedir permiso (Pantalla previa)"
              variante="primario"
              icono="shield-checkmark-outline"
              onPress={manejarAccion}
            />
          </View>
        )}

        <Boton
          titulo="↻"
          variante="secundario"
          onPress={recargar}
        />
      </View>
    </View>
  );
}

export default function PanelPermisosScreen() {
  const recursos: RecursoPermiso[] = ['camara', 'ubicacion', 'notificaciones', 'fotos'];

  return (
    <Pantalla>
      <Titulo>Panel de Permisos</Titulo>
      <Parrafo>
        Estado en tiempo real en {Platform.OS.toUpperCase()} usando usePermiso(recurso) y
        AppState. Si modificás un permiso en Ajustes y volvés a la app, se actualiza
        automáticamente.
      </Parrafo>

      <Subtitulo>Recursos de la aplicación</Subtitulo>

      {recursos.map((r) => (
        <FilaRecursoPermiso key={r} recurso={r} />
      ))}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icono: {
    fontSize: 26,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
  },
  modulo: {
    fontSize: 12,
    fontFamily: FuenteMono,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FuenteMono,
  },
  detalle: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 2,
  },
});
