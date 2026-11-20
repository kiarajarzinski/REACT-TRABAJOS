import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Boton } from '../components/Boton';
import { ExplicacionPermiso } from '../components/ExplicacionPermiso';
import { Pantalla } from '../components/Pantalla';
import { Parrafo } from '../components/Parrafo';
import { Subtitulo } from '../components/Subtitulo';
import { Titulo } from '../components/Titulo';
import {
  AreaTactilMinima,
  Colores,
  Espaciados,
  FuenteMono,
  Radios,
  TamaniosTexto,
} from '../constants/tema';
import { LIBROS } from '../data/libros';
import { usePermiso } from '../hooks/usePermiso';

const REGEX_ISBN_13 = /^\d{13}$/;

/**
 * Ruta /escanear
 * Requisitos A3.6 y Parte C2:
 * - Antes del diálogo del sistema se muestra /permisos/camara.
 * - Maneja los 4 estados: cargando -> concedido -> preguntable -> bloqueado.
 * - Usa useRef (`bloqueoNavegacionRef`) para garantizar que navega una sola vez
 *   con router.replace aunque onBarcodeScanned se dispare muchas veces por segundo.
 * - Si el ISBN leído no está en el catálogo, avisa una sola vez por código y
 *   deja seguir escaneando.
 * - Siempre permite escribir el ISBN a mano.
 */
export default function EscanearScreen() {
  const { estado, abrirAjustes, recargar } = usePermiso('camara');

  const [isbnManual, setIsbnManual] = useState<string>('');
  const [avisoEscaneo, setAvisoEscaneo] = useState<string | null>(null);
  const [errorManual, setErrorManual] = useState<string | null>(null);

  const bloqueoNavegacionRef = useRef<boolean>(false);
  const ultimoDesconocidoRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      bloqueoNavegacionRef.current = false;
      void recargar();
    }, [recargar]),
  );

  const manejarCodigoEscaneado = (resultado: BarcodeScanningResult) => {
    if (bloqueoNavegacionRef.current) {
      return;
    }

    const codigo = resultado.data.trim();
    const existe = LIBROS.some((libro) => libro.isbn === codigo);

    if (existe) {
      bloqueoNavegacionRef.current = true;
      ultimoDesconocidoRef.current = null;
      setAvisoEscaneo(null);
      router.replace({ pathname: '/libro/[isbn]', params: { isbn: codigo } });
      return;
    }

    if (ultimoDesconocidoRef.current !== codigo) {
      ultimoDesconocidoRef.current = codigo;
      setAvisoEscaneo(
        `El código ${codigo} no está en el catálogo de Biblioteca IPF. Podés seguir escaneando otro libro.`,
      );
    }
  };

  const buscarIsbnManual = (codigoIngresado?: string) => {
    const limpio = (codigoIngresado ?? isbnManual).replace(/\D/g, '');
    if (!REGEX_ISBN_13.test(limpio)) {
      setErrorManual('Ingresá un ISBN válido de exactamente 13 dígitos numéricos.');
      return;
    }
    setErrorManual(null);
    router.replace({ pathname: '/libro/[isbn]', params: { isbn: limpio } });
  };

  return (
    <Pantalla>
      <Titulo>Escanear libro</Titulo>
      <Parrafo>
        Apuntá al código de barras EAN-13 de la contratapa del libro o escribí el ISBN de
        13 dígitos a mano.
      </Parrafo>

      {estado === 'cargando' ? (
        <View style={styles.cajaCargando}>
          <ActivityIndicator size="large" color={Colores.primario} />
          <Parrafo>Consultando permiso de cámara...</Parrafo>
        </View>
      ) : null}

      {estado === 'concedido' ? (
        <View style={styles.tarjetaCamara}>
          <View style={styles.visorCamara}>
            <CameraView
              style={styles.camara}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
              onBarcodeScanned={manejarCodigoEscaneado}
            />
          </View>
          {avisoEscaneo ? (
            <View style={styles.avisoDesconocido}>
              <Text style={styles.avisoDesconocidoTexto}>{avisoEscaneo}</Text>
            </View>
          ) : (
            <Text style={styles.ayudaCamara}>
              Cámara activa (sin permiso de micrófono). Escaneá un código EAN-13.
            </Text>
          )}
        </View>
      ) : null}

      {estado === 'preguntable' ? (
        <ExplicacionPermiso
          recurso="camara"
          estado="preguntable"
          onContinuar={() =>
            router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } })
          }
          onAbrirAjustes={() => void abrirAjustes()}
        />
      ) : null}

      {estado === 'bloqueado' ? (
        <ExplicacionPermiso
          recurso="camara"
          estado="bloqueado"
          onContinuar={() =>
            router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } })
          }
          onAbrirAjustes={() => void abrirAjustes()}
        />
      ) : null}

      <Subtitulo>Ingresar ISBN a mano (sin cámara)</Subtitulo>
      <View style={styles.tarjetaManual}>
        <Text style={styles.etiqueta}>ISBN de 13 dígitos (sin guiones)</Text>
        <TextInput
          value={isbnManual}
          onChangeText={(texto) => {
            setIsbnManual(texto);
            if (errorManual) setErrorManual(null);
          }}
          placeholder="Ej: 9789877801576"
          placeholderTextColor={Colores.textoSecundario}
          keyboardType="number-pad"
          maxLength={13}
          accessibilityLabel="Ingresar ISBN de 13 dígitos"
          style={styles.input}
        />

        {errorManual ? <Text style={styles.textoError}>{errorManual}</Text> : null}

        <View style={styles.ejemplosFila}>
          {LIBROS.slice(0, 2).map((libro) => (
            <Pressable
              key={libro.isbn}
              accessibilityRole="button"
              accessibilityLabel={`Cargar ISBN de prueba para ${libro.titulo}`}
              onPress={() => setIsbnManual(libro.isbn)}
              style={({ pressed }) => [
                styles.chipEjemplo,
                pressed ? styles.presionado : null,
              ]}>
              <Text style={styles.chipEjemploTexto}>{libro.titulo}</Text>
            </Pressable>
          ))}
        </View>

        <Boton
          titulo="Abrir ficha del libro"
          variante="primario"
          icono="search-outline"
          onPress={() => buscarIsbnManual()}
        />
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cajaCargando: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.xl,
    alignItems: 'center',
    gap: Espaciados.md,
  },
  tarjetaCamara: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.md,
    gap: Espaciados.md,
  },
  visorCamara: {
    height: 260,
    borderRadius: Radios.md,
    overflow: 'hidden',
  },
  camara: {
    flex: 1,
  },
  ayudaCamara: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
  },
  avisoDesconocido: {
    backgroundColor: Colores.alertaSuave,
    borderColor: Colores.alerta,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
  },
  avisoDesconocidoTexto: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '600',
    color: Colores.alerta,
    lineHeight: 19,
  },
  tarjetaManual: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.md,
  },
  etiqueta: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '700',
    color: Colores.texto,
  },
  input: {
    borderWidth: 1,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondo,
    borderRadius: Radios.md,
    paddingHorizontal: Espaciados.md,
    paddingVertical: Espaciados.md,
    fontSize: TamaniosTexto.md,
    fontFamily: FuenteMono,
    color: Colores.texto,
  },
  textoError: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '600',
    color: Colores.peligro,
  },
  ejemplosFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Espaciados.sm,
  },
  chipEjemplo: {
    minHeight: AreaTactilMinima,
    justifyContent: 'center',
    paddingHorizontal: Espaciados.md,
    borderRadius: Radios.md,
    backgroundColor: Colores.primarioSuave,
  },
  chipEjemploTexto: {
    fontSize: TamaniosTexto.xs,
    fontWeight: '700',
    color: Colores.primario,
  },
  presionado: {
    opacity: 0.8,
  },
});
