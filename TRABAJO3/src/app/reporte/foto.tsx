import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { BadgeEstadoPermiso, ExplicacionPermiso } from '@/components/TarjetaPermiso';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador, useReportesStore } from '@/lib/reportes';

/**
 * Ruta /reporte/foto
 * Requisito G1 y G2.3:
 * Adjuntar foto del desperfecto: "Sacar foto" o "Elegir de la galería".
 * - Cámara para sacar (pide permiso en contexto solo al tocar "Sacar foto").
 * - Selector del sistema (ImagePicker.launchImageLibraryAsync) SIN permiso de galería
 *   (no declara READ_MEDIA_IMAGES ni pide acceso a la galería).
 */
export default function AdjuntarFotoScreen() {
  const colores = useColores();
  const { borrador } = useReportesStore();
  const { estado, pedir, abrirAjustes } = usePermiso('camara');

  const [mostrarPreviaCamara, setMostrarPreviaCamara] = useState(false);

  const elegirConSelectorSistema = async () => {
    // Requisito G2.3: No pide ningún permiso de galería; abre el Photo Picker del sistema
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0]?.uri) {
      actualizarBorrador({
        fotoUri: res.assets[0].uri,
        fotoOrigen: 'selector_sistema',
      });
    }
  };

  const abrirCamaraSistema = async () => {
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0]?.uri) {
      actualizarBorrador({
        fotoUri: res.assets[0].uri,
        fotoOrigen: 'camara',
      });
    }
  };

  const tocarSacarFoto = async () => {
    if (estado === 'concedido') {
      await abrirCamaraSistema();
      return;
    }
    // Requisito G2.6 y G2.8: Mostrar pantalla previa solo cuando el usuario toca la función
    setMostrarPreviaCamara(true);
  };

  const confirmarPermisoCamara = async () => {
    const detalle = await pedir();
    if (detalle.estado === 'concedido') {
      setMostrarPreviaCamara(false);
      await abrirCamaraSistema();
    }
  };

  return (
    <Pantalla>
      <Titulo>Adjuntar foto</Titulo>
      <Parrafo>
        Podés elegir una foto desde tu teléfono usando el selector del sistema (sin dar
        permiso a tu galería) o sacar una foto en el momento con la cámara.
      </Parrafo>

      {borrador.fotoUri ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colores.superficie, borderColor: colores.borde },
          ]}>
          <Image source={{ uri: borrador.fotoUri }} style={styles.preview} />
          <Text style={[styles.origenText, { color: colores.primario }]}>
            Origen:{' '}
            {borrador.fotoOrigen === 'camara'
              ? '📷 Cámara'
              : '🖼️ Selector del sistema (Photo Picker sin permiso)'}
          </Text>
          <Boton
            titulo="Confirmar y volver al reporte"
            variante="primario"
            icono="checkmark-circle-outline"
            onPress={() => router.back()}
          />
        </View>
      ) : null}

      <Subtitulo>Opción 1 · Sin pedir ningún permiso (Recomendada)</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <Text style={[styles.cardTitle, { color: colores.texto }]}>
          🖼️ Elegir de la galería (Photo Picker del sistema)
        </Text>
        <Text style={[styles.cardDesc, { color: colores.textoSecundario }]}>
          Usa ImagePicker.launchImageLibraryAsync. El sistema operativo abre su propio
          selector seguro y le entrega a la app únicamente la foto que elijas, sin declarar
          READ_MEDIA_IMAGES ni pedir acceso a toda tu galería.
        </Text>
        <Boton
          titulo="Elegir de la galería (sin permiso)"
          variante="primario"
          icono="images-outline"
          onPress={elegirConSelectorSistema}
        />
      </View>

      <Subtitulo>Opción 2 · Con permiso de cámara en contexto</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { color: colores.texto }]}>
            📷 Sacar foto ahora
          </Text>
          <BadgeEstadoPermiso estado={estado} />
        </View>
        <Text style={[styles.cardDesc, { color: colores.textoSecundario }]}>
          Requiere permiso de cámara (sin micrófono). Si lo rechazás, siempre podés usar el
          selector del sistema de arriba.
        </Text>
        <Boton
          titulo="Sacar foto"
          variante="secundario"
          icono="camera-outline"
          onPress={tocarSacarFoto}
        />
      </View>

      {mostrarPreviaCamara && estado !== 'concedido' ? (
        <ExplicacionPermiso
          recurso="camara"
          estado={estado}
          onContinuar={confirmarPermisoCamara}
          onAbrirAjustes={abrirAjustes}
        />
      ) : null}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  preview: {
    width: '100%',
    height: 210,
    borderRadius: 12,
  },
  origenText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

