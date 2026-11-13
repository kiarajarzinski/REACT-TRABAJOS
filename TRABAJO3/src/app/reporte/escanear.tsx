import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { BadgeEstadoPermiso, ExplicacionPermiso } from '@/components/TarjetaPermiso';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador, useReportesStore } from '@/lib/reportes';

const AULAS_RAPIDAS = ['AULA-101', 'AULA-204', 'LAB-102', 'LAB-REDES', 'SUM-IPF'];

/**
 * Ruta /reporte/escanear
 * Requisito G1 y G2.2:
 * Escáner con cuatro estados: 'cargando' | 'concedido' | 'preguntable' | 'bloqueado'.
 * Muestra el indicador de carga, la cámara, la explicación con "Continuar" o el aviso
 * de bloqueado con "Abrir Ajustes".
 * Si la cámara se deniega, se puede escribir el código del aula a mano.
 */
export default function EscanearAulaScreen() {
  const colores = useColores();
  const { borrador } = useReportesStore();
  const { estado, pedir, abrirAjustes } = usePermiso('camara');

  const [aulaManual, setAulaManual] = useState(borrador.aula);
  const [escaneado, setEscaneado] = useState(false);

  const confirmarAula = (codigo: string) => {
    const limpio = codigo.trim().toUpperCase();
    if (!limpio) return;
    actualizarBorrador({ aula: limpio });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/reporte/nuevo');
    }
  };

  return (
    <Pantalla>
      <View style={styles.headerRow}>
        <Titulo>Escanear QR</Titulo>
        <BadgeEstadoPermiso estado={estado} />
      </View>
      <Parrafo>
        Apuntá al código QR pegado en la puerta del aula, o cargá el código a mano si
        preferís no usar la cámara.
      </Parrafo>

      {/* 1. Estado: CARGANDO */}
      {estado === 'cargando' ? (
        <View
          style={[
            styles.loadingCard,
            { backgroundColor: colores.superficie, borderColor: colores.borde },
          ]}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Parrafo>Consultando estado del permiso de cámara...</Parrafo>
        </View>
      ) : null}

      {/* 2. Estado: CONCEDIDO */}
      {estado === 'concedido' ? (
        <View
          style={[
            styles.cameraCard,
            { backgroundColor: colores.superficie, borderColor: colores.borde },
          ]}>
          <View style={styles.cameraWrapper}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={
                escaneado
                  ? undefined
                  : (resultado) => {
                      if (resultado?.data) {
                        setEscaneado(true);
                        confirmarAula(resultado.data);
                      }
                    }
              }
            />
          </View>
          <Text style={[styles.cameraHint, { color: colores.textoSecundario }]}>
            📷 Cámara activa (sin permiso de micrófono). Apuntá a un QR o simulá una lectura
            para probar en emulador:
          </Text>
          <Boton
            titulo="Simular lectura QR: AULA-204"
            variante="secundario"
            icono="qr-code-outline"
            onPress={() => confirmarAula('AULA-204')}
          />
        </View>
      ) : null}

      {/* 3 y 4. Estado: PREGUNTABLE ("Continuar") o BLOQUEADO ("Abrir Ajustes") */}
      {estado === 'preguntable' || estado === 'bloqueado' ? (
        <ExplicacionPermiso
          recurso="camara"
          estado={estado}
          onContinuar={pedir}
          onAbrirAjustes={abrirAjustes}
        />
      ) : null}

      {/* CAMINO ALTERNATIVO SIEMPRE DISPONIBLE (Requisito G2.2 y G2.7) */}
      <Subtitulo>Alternativa manual (sin cámara)</Subtitulo>
      <View
        style={[
          styles.manualCard,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <Text style={[styles.label, { color: colores.texto }]}>
          Escribí o elegí el código del aula a mano:
        </Text>
        <TextInput
          value={aulaManual}
          onChangeText={setAulaManual}
          placeholder="Ej: AULA-204"
          placeholderTextColor={colores.textoSecundario}
          autoCapitalize="characters"
          style={[
            styles.input,
            {
              color: colores.texto,
              backgroundColor: colores.fondo,
              borderColor: colores.borde,
            },
          ]}
        />

        <View style={styles.chipsRow}>
          {AULAS_RAPIDAS.map((codigo) => (
            <Pressable
              key={codigo}
              onPress={() => setAulaManual(codigo)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    aulaManual === codigo ? colores.primarioSuave : colores.fondo,
                  borderColor:
                    aulaManual === codigo ? colores.primario : colores.borde,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      aulaManual === codigo
                        ? colores.primario
                        : colores.textoSecundario,
                  },
                ]}>
                {codigo}
              </Text>
            </Pressable>
          ))}
        </View>

        <Boton
          titulo="Guardar aula escrita a mano"
          variante="primario"
          icono="checkmark-circle-outline"
          disabled={!aulaManual.trim()}
          onPress={() => confirmarAula(aulaManual)}
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
  loadingCard: {
    borderRadius: 14,
    padding: 28,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  cameraCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  cameraWrapper: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  manualCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

