import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { BadgeEstadoPermiso, ExplicacionPermiso } from '@/components/TarjetaPermiso';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import { usePermiso } from '@/hooks/usePermiso';
import { obtenerUbicacionActualRespetuosa } from '@/lib/permisos';
import { actualizarBorrador, useReportesStore } from '@/lib/reportes';

const SECTORES_EDIFICIO = [
  'Patio Central',
  'Estacionamiento',
  'Pasillo Planta Baja',
  'Pasillo Planta Alta',
  'Sector Laboratorios',
  'SUM / Comedor',
];

/**
 * Ruta /reporte/ubicacion
 * Requisito G1 y G2.4:
 * Marca dónde está el problema (patio, estacionamiento, pasillo) con la ubicación actual.
 * - Ubicación en primer plano únicamente.
 * - Si es aproximada, NO muestra coordenadas exactas sino "Ubicación aproximada".
 * - Si se deniega, el reporte se carga con el sector elegido a mano.
 */
export default function UbicacionReporteScreen() {
  const colores = useColores();
  const { borrador } = useReportesStore();
  const { estado, parcial, matiz, pedir, abrirAjustes } = usePermiso('ubicacion');

  const [sectorSeleccionado, setSectorSeleccionado] = useState<string>(
    borrador.sector || 'Patio Central'
  );
  const [ubicacionTexto, setUbicacionTexto] = useState<string | undefined>(
    borrador.ubicacionTexto
  );
  const [esAproximada, setEsAproximada] = useState<boolean>(
    Boolean(borrador.ubicacionAproximada)
  );
  const [mostrarPrevia, setMostrarPrevia] = useState(false);
  const [obteniendoGps, setObteniendoGps] = useState(false);

  const leerPosicionActual = async () => {
    setObteniendoGps(true);
    const resultado = await obtenerUbicacionActualRespetuosa();
    setObteniendoGps(false);

    if (resultado) {
      setUbicacionTexto(resultado.textoMostrar);
      setEsAproximada(resultado.aproximada);
      actualizarBorrador({
        sector: sectorSeleccionado,
        ubicacionTexto: resultado.textoMostrar,
        ubicacionAproximada: resultado.aproximada,
      });
    }
  };

  const tocarObtenerUbicacion = async () => {
    if (estado === 'concedido') {
      await leerPosicionActual();
      return;
    }
    setMostrarPrevia(true);
  };

  const confirmarPedidoUbicacion = async () => {
    const res = await pedir();
    if (res.estado === 'concedido') {
      setMostrarPrevia(false);
      await leerPosicionActual();
    }
  };

  const guardarSectorYVolver = () => {
    actualizarBorrador({
      sector: sectorSeleccionado,
      ubicacionTexto,
      ubicacionAproximada: esAproximada,
    });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/reporte/nuevo');
    }
  };

  return (
    <Pantalla>
      <View style={styles.rowBetween}>
        <Titulo>Ubicación</Titulo>
        <BadgeEstadoPermiso estado={estado} parcial={parcial} />
      </View>
      <Parrafo>
        Podés usar tu ubicación en primer plano o seleccionar manualmente en qué sector del
        instituto está el desperfecto.
      </Parrafo>

      <Subtitulo>1. Elegir sector del edificio (Manual / Alternativa)</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <Text style={[styles.cardDesc, { color: colores.textoSecundario }]}>
          Seleccioná el sector del edificio (funciona siempre, incluso con permiso de
          ubicación denegado o aproximado):
        </Text>
        <View style={styles.sectoresGrid}>
          {SECTORES_EDIFICIO.map((sec) => {
            const activo = sectorSeleccionado === sec;
            return (
              <Pressable
                key={sec}
                onPress={() => setSectorSeleccionado(sec)}
                style={[
                  styles.sectorChip,
                  {
                    backgroundColor: activo ? colores.primario : colores.fondo,
                    borderColor: activo ? colores.primario : colores.borde,
                  },
                ]}>
                <Text
                  style={[
                    styles.sectorText,
                    { color: activo ? '#FFFFFF' : colores.texto },
                  ]}>
                  {sec}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Subtitulo>2. Ubicación GPS en primer plano (Opcional)</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        {matiz ? (
          <Text style={[styles.matizInfo, { color: colores.primario }]}>
            Matiz detectado: {matiz}
          </Text>
        ) : null}

        {obteniendoGps ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colores.primario} />
            <Text style={{ color: colores.textoSecundario }}>
              Obteniendo posición en primer plano...
            </Text>
          </View>
        ) : ubicacionTexto ? (
          <View
            style={[
              styles.resultadoBox,
              {
                backgroundColor: esAproximada
                  ? colores.alertaSuave
                  : colores.exitoSuave,
                borderColor: esAproximada ? colores.alerta : colores.exito,
              },
            ]}>
            <Text
              style={[
                styles.resultadoTitulo,
                { color: esAproximada ? colores.alerta : colores.exito },
              ]}>
              {esAproximada ? '⚠️ Ubicación aproximada' : '✅ Ubicación precisa'}
            </Text>
            <Text style={[styles.resultadoValor, { color: colores.texto }]}>
              {ubicacionTexto}
            </Text>
            {esAproximada ? (
              <Text style={[styles.resultadoNota, { color: colores.textoSecundario }]}>
                Como elegiste precisión aproximada (~3 km²), no mostramos coordenadas
                exactas y combinamos el dato con el sector elegido arriba.
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={[styles.cardDesc, { color: colores.textoSecundario }]}>
            Tocá el botón si querés adjuntar tu ubicación actual al reporte.
          </Text>
        )}

        <Boton
          titulo="Usar mi ubicación actual"
          variante="secundario"
          icono="location-outline"
          onPress={tocarObtenerUbicacion}
        />
      </View>

      {mostrarPrevia && estado !== 'concedido' ? (
        <ExplicacionPermiso
          recurso="ubicacion"
          estado={estado}
          onContinuar={confirmarPedidoUbicacion}
          onAbrirAjustes={abrirAjustes}
        />
      ) : null}

      <Boton
        titulo={`Guardar sector "${sectorSeleccionado}" y volver`}
        variante="primario"
        icono="checkmark-circle-outline"
        onPress={guardarSectorYVolver}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectorText: {
    fontSize: 13,
    fontWeight: '700',
  },
  matizInfo: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  resultadoBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  resultadoTitulo: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultadoValor: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultadoNota: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});

