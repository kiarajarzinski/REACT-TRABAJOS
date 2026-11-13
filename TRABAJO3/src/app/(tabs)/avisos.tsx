import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Icono } from '@/components/icono';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import { usePermiso } from '@/hooks/usePermiso';
import { AvisoInterno, marcarAvisoComoLeido, useReportesStore } from '@/lib/reportes';

export default function AvisosScreen() {
  const colores = useColores();
  const { avisos } = useReportesStore();
  const notifPermiso = usePermiso('notificaciones');

  const abrirAviso = (aviso: AvisoInterno) => {
    marcarAvisoComoLeido(aviso.id);
    router.push(`/reporte/${aviso.reporteId}` as Href);
  };

  return (
    <Pantalla>
      <Titulo>Bandeja de Avisos</Titulo>
      <Parrafo>
        Camino alternativo a las notificaciones del sistema. Si denegás el permiso de
        notificaciones (estado actual: {notifPermiso.estado}), los avisos de resolución se
        reciben en esta pantalla.
      </Parrafo>

      <Boton
        titulo="Configurar notificaciones en /ajustes-app"
        variante="secundario"
        icono="notifications-outline"
        onPress={() => router.push('/ajustes-app')}
      />

      <Subtitulo>Avisos recibidos ({avisos.length})</Subtitulo>

      {avisos.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => abrirAviso(item)}
          style={({ pressed }) => [
            styles.tarjeta,
            {
              backgroundColor: item.leido ? colores.superficie : colores.primarioSuave,
              borderColor: item.leido ? colores.borde : colores.primario,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <View style={styles.cuerpo}>
            <View style={styles.rowBetween}>
              <Text style={[styles.viaBadge, { color: colores.primario }]}>
                {item.via === 'notificacion_local'
                  ? '🔔 Notificación + Bandeja'
                  : '📬 Vía bandeja interna'}
              </Text>
              <Text style={[styles.fecha, { color: colores.textoSecundario }]}>
                {item.fecha}
              </Text>
            </View>
            <Text style={[styles.titulo, { color: colores.texto }]}>{item.titulo}</Text>
            <Text style={[styles.mensaje, { color: colores.textoSecundario }]}>
              {item.mensaje}
            </Text>
          </View>
          <Icono name="chevron-forward" size={20} color={colores.textoSecundario} />
        </Pressable>
      ))}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cuerpo: {
    flex: 1,
    gap: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viaBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  fecha: {
    fontSize: 12,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
  },
  mensaje: {
    fontSize: 13,
    lineHeight: 19,
  },
});
