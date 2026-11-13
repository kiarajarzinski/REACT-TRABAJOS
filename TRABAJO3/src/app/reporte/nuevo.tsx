import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import {
  actualizarBorrador,
  CategoriaReporte,
  crearReporte,
  useReportesStore,
} from '@/lib/reportes';

const CATEGORIAS: { clave: CategoriaReporte; etiqueta: string }[] = [
  { clave: 'electricidad', etiqueta: '⚡ Electricidad' },
  { clave: 'agua', etiqueta: '💧 Agua' },
  { clave: 'mobiliario', etiqueta: '🪑 Mobiliario' },
  { clave: 'equipos', etiqueta: '📽️ Equipos' },
];

/**
 * Ruta /reporte/nuevo
 * Requisito G1:
 * Formulario: título, descripción, aula y categoría.
 * Botones para escanear, adjuntar foto y marcar ubicación.
 * Ningún permiso al abrir: cada permiso se pide recién al tocar su función.
 */
export default function NuevoReporteScreen() {
  const colores = useColores();
  const { borrador } = useReportesStore();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [aula, setAula] = useState(borrador.aula);
  const [categoria, setCategoria] = useState<CategoriaReporte>('electricidad');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sincronizar cuando vuelve de /reporte/escanear con el código QR leído
  useEffect(() => {
    if (borrador.aula && borrador.aula !== aula) {
      setAula(borrador.aula);
    }
  }, [borrador.aula, aula]);

  const cambiarAulaManual = (texto: string) => {
    setAula(texto);
    actualizarBorrador({ aula: texto });
  };

  const guardarReporte = () => {
    if (!titulo.trim()) {
      setErrorMsg('Escribí un título breve para el desperfecto.');
      return;
    }
    if (!aula.trim()) {
      setErrorMsg('Indicá el aula (escaneando el QR o escribiéndola a mano).');
      return;
    }

    const creado = crearReporte({
      titulo,
      descripcion: descripcion.trim() || 'Sin descripción adicional.',
      aula,
      categoria,
    });

    router.replace(`/reporte/${creado.id}`);
  };

  return (
    <Pantalla>
      <Titulo>Nuevo reporte</Titulo>
      <Parrafo>
        Completá los datos del desperfecto. Ningún permiso se solicita al abrir esta
        pantalla: cada recurso se pide recién cuando tocás su botón.
      </Parrafo>

      {errorMsg ? (
        <View
          style={[
            styles.alertaBox,
            { backgroundColor: colores.peligroSuave, borderColor: colores.peligro },
          ]}>
          <Text style={[styles.alertaTexto, { color: colores.peligro }]}>{errorMsg}</Text>
        </View>
      ) : null}

      <Subtitulo>1. Categoría del problema</Subtitulo>
      <View style={styles.categoriasGrid}>
        {CATEGORIAS.map((cat) => {
          const activa = categoria === cat.clave;
          return (
            <Pressable
              key={cat.clave}
              onPress={() => setCategoria(cat.clave)}
              style={[
                styles.categoriaChip,
                {
                  backgroundColor: activa ? colores.primario : colores.superficie,
                  borderColor: activa ? colores.primario : colores.borde,
                },
              ]}>
              <Text
                style={[
                  styles.categoriaTexto,
                  { color: activa ? '#FFFFFF' : colores.texto },
                ]}>
                {cat.etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Subtitulo>2. Datos del desperfecto</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <Text style={[styles.label, { color: colores.texto }]}>Título *</Text>
        <TextInput
          value={titulo}
          onChangeText={(t) => {
            setTitulo(t);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="Ej: Luz quemada sobre el pizarrón"
          placeholderTextColor={colores.textoSecundario}
          style={[
            styles.input,
            {
              color: colores.texto,
              backgroundColor: colores.fondo,
              borderColor: colores.borde,
            },
          ]}
        />

        <Text style={[styles.label, { color: colores.texto }]}>Descripción</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Contá qué pasa para ayudar a mantenimiento..."
          placeholderTextColor={colores.textoSecundario}
          multiline
          numberOfLines={3}
          style={[
            styles.input,
            styles.textarea,
            {
              color: colores.texto,
              backgroundColor: colores.fondo,
              borderColor: colores.borde,
            },
          ]}
        />
      </View>

      <Subtitulo>3. Aula (QR o carga manual)</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <Text style={[styles.label, { color: colores.texto }]}>Código de aula *</Text>
        <TextInput
          value={aula}
          onChangeText={cambiarAulaManual}
          placeholder="Ej: AULA-204 o LAB-102"
          placeholderTextColor={colores.textoSecundario}
          style={[
            styles.input,
            {
              color: colores.texto,
              backgroundColor: colores.fondo,
              borderColor: colores.borde,
            },
          ]}
        />
        <Boton
          titulo="Escanear QR de la puerta (/reporte/escanear)"
          variante="secundario"
          icono="qr-code-outline"
          onPress={() => router.push('/reporte/escanear')}
        />
      </View>

      <Subtitulo>4. Foto y Ubicación (opcionales)</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        {borrador.fotoUri ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: borrador.fotoUri }} style={styles.previewImg} />
            <Text style={[styles.previewMeta, { color: colores.primario }]}>
              ✅ Foto adjunta (
              {borrador.fotoOrigen === 'camara'
                ? 'sacada con cámara'
                : 'elegida con el selector del sistema sin permiso'}
              )
            </Text>
          </View>
        ) : (
          <Text style={[styles.sinDato, { color: colores.textoSecundario }]}>
            Todavía no adjuntaste ninguna foto.
          </Text>
        )}
        <Boton
          titulo={borrador.fotoUri ? 'Cambiar foto (/reporte/foto)' : 'Adjuntar foto (/reporte/foto)'}
          variante="secundario"
          icono="camera-outline"
          onPress={() => router.push('/reporte/foto')}
        />

        <View style={[styles.divider, { backgroundColor: colores.borde }]} />

        {borrador.sector || borrador.ubicacionTexto ? (
          <View style={styles.ubicacionResumen}>
            {borrador.sector ? (
              <Text style={[styles.previewMeta, { color: colores.texto }]}>
                🏢 Sector: {borrador.sector}
              </Text>
            ) : null}
            {borrador.ubicacionTexto ? (
              <Text style={[styles.previewMeta, { color: colores.primario }]}>
                📍 {borrador.ubicacionTexto}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={[styles.sinDato, { color: colores.textoSecundario }]}>
            Todavía no marcaste el sector ni la ubicación.
          </Text>
        )}
        <Boton
          titulo="Marcar ubicación o sector (/reporte/ubicacion)"
          variante="secundario"
          icono="location-outline"
          onPress={() => router.push('/reporte/ubicacion')}
        />
      </View>

      <Boton
        titulo="Enviar reporte"
        variante="primario"
        icono="checkmark-circle-outline"
        onPress={guardarReporte}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  alertaBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertaTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoriaTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  previewBox: {
    gap: 8,
  },
  previewImg: {
    width: '100%',
    height: 170,
    borderRadius: 10,
  },
  previewMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  sinDato: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  ubicacionResumen: {
    gap: 4,
  },
});

