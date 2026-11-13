import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import {
  CategoriaReporte,
  EstadoReporte,
  simularResolucionReporte,
  useReportesStore,
} from '@/lib/reportes';

const ETIQUETA_CATEGORIA: Record<CategoriaReporte, string> = {
  electricidad: '⚡ Electricidad',
  agua: '💧 Agua / Plomería',
  mobiliario: '🪑 Mobiliario',
  equipos: '📽️ Equipos / Proyector',
};

/**
 * Ruta /reporte/[id]
 * Requisito G1 y G2.5:
 * Detalle del reporte: datos, foto, ubicación o sector y estado.
 * Validar el id; mensaje si no existe.
 * Botón de prueba "Simular resolución": programa una notificación local a los 10 segundos;
 * si el permiso está denegado, el aviso aparece en /avisos.
 */
export default function DetalleReporteScreen() {
  const colores = useColores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reportes } = useReportesStore();

  const [mensajeSimulacion, setMensajeSimulacion] = useState<string | null>(null);
  const [simulando, setSimulando] = useState(false);

  const reporte = reportes.find((r) => r.id === id);

  // Requisito G1: Validar el id; mensaje si no existe
  if (!reporte) {
    return (
      <Pantalla>
        <Titulo>Reporte no encontrado</Titulo>
        <Parrafo>
          No existe ningún reporte con el identificador &quot;{String(id)}&quot;. Verificá
          el enlace o volvé al listado principal.
        </Parrafo>
        <Boton
          titulo="Volver a la lista de reportes (/)"
          variante="primario"
          icono="home"
          onPress={() => router.replace('/')}
        />
      </Pantalla>
    );
  }

  const estiloEstado = (estado: EstadoReporte) => {
    if (estado === 'resuelto') {
      return { texto: 'Resuelto', bg: colores.exitoSuave, color: colores.exito };
    }
    if (estado === 'en_curso') {
      return { texto: 'En curso', bg: colores.primarioSuave, color: colores.primario };
    }
    return { texto: 'Pendiente', bg: colores.alertaSuave, color: colores.alerta };
  };

  const est = estiloEstado(reporte.estado);

  const manejarSimularResolucion = async () => {
    setSimulando(true);
    const res = await simularResolucionReporte(reporte.id);
    setSimulando(false);
    setMensajeSimulacion(res.mensajeResultado);
  };

  return (
    <Pantalla>
      <View style={styles.headerRow}>
        <Text style={[styles.categoria, { color: colores.primario }]}>
          {ETIQUETA_CATEGORIA[reporte.categoria]}
        </Text>
        <View style={[styles.badge, { backgroundColor: est.bg }]}>
          <Text style={[styles.badgeText, { color: est.color }]}>{est.texto}</Text>
        </View>
      </View>

      <Titulo>{reporte.titulo}</Titulo>
      <Parrafo>{reporte.descripcion}</Parrafo>

      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <View style={styles.datoFila}>
          <Text style={[styles.datoLabel, { color: colores.textoSecundario }]}>
            ID del reporte:
          </Text>
          <Text style={[styles.datoValor, { color: colores.texto }]}>{reporte.id}</Text>
        </View>
        <View style={styles.datoFila}>
          <Text style={[styles.datoLabel, { color: colores.textoSecundario }]}>Aula:</Text>
          <Text style={[styles.datoValor, { color: colores.texto }]}>
            🚪 {reporte.aula}
          </Text>
        </View>
        <View style={styles.datoFila}>
          <Text style={[styles.datoLabel, { color: colores.textoSecundario }]}>
            Sector:
          </Text>
          <Text style={[styles.datoValor, { color: colores.texto }]}>
            🏢 {reporte.sector || 'No especificado'}
          </Text>
        </View>
        {reporte.ubicacionTexto ? (
          <View style={styles.datoFila}>
            <Text style={[styles.datoLabel, { color: colores.textoSecundario }]}>
              Ubicación:
            </Text>
            <Text style={[styles.datoValor, { color: colores.primario }]}>
              📍 {reporte.ubicacionTexto}
            </Text>
          </View>
        ) : null}
        <View style={styles.datoFila}>
          <Text style={[styles.datoLabel, { color: colores.textoSecundario }]}>
            Creado:
          </Text>
          <Text style={[styles.datoValor, { color: colores.texto }]}>
            {reporte.creadoEn}
          </Text>
        </View>
      </View>

      {reporte.fotoUri ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colores.superficie, borderColor: colores.borde },
          ]}>
          <Subtitulo style={{ marginTop: 0 }}>Foto del desperfecto</Subtitulo>
          <Image source={{ uri: reporte.fotoUri }} style={styles.foto} />
          <Text style={[styles.fotoMeta, { color: colores.textoSecundario }]}>
            Adjuntada mediante:{' '}
            {reporte.fotoOrigen === 'camara'
              ? 'Cámara'
              : 'Selector del sistema (sin permiso de galería)'}
          </Text>
        </View>
      ) : null}

      <Subtitulo>Prueba de resolución y notificaciones</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <Text style={[styles.simDesc, { color: colores.textoSecundario }]}>
          Al tocar &quot;Simular resolución&quot;, si el permiso de notificaciones está
          concedido se programa una notificación local a los 10 segundos en el canal
          &quot;reportes&quot;. Si está denegado, el aviso se envía directo a /avisos.
        </Text>

        {mensajeSimulacion ? (
          <View
            style={[
              styles.resultadoBox,
              {
                backgroundColor: colores.primarioSuave,
                borderColor: colores.primario,
              },
            ]}>
            <Text style={[styles.resultadoTexto, { color: colores.texto }]}>
              {mensajeSimulacion}
            </Text>
          </View>
        ) : null}

        <Boton
          titulo={simulando ? 'Programando...' : 'Simular resolución'}
          variante="primario"
          icono="notifications-outline"
          disabled={simulando}
          onPress={manejarSimularResolucion}
        />

        <Boton
          titulo="Ver bandeja de avisos (/avisos)"
          variante="secundario"
          icono="mail-outline"
          onPress={() => router.push('/avisos')}
        />
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoria: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  datoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  datoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  datoValor: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  foto: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  fotoMeta: {
    fontSize: 12,
  },
  simDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  resultadoBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultadoTexto: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});

