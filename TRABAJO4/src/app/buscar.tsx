import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Boton } from '../components/Boton';
import { Parrafo } from '../components/Parrafo';
import { Subtitulo } from '../components/Subtitulo';
import { TarjetaLibro } from '../components/TarjetaLibro';
import { Titulo } from '../components/Titulo';
import {
  AreaTactilMinima,
  Colores,
  Espaciados,
  Radios,
  TamaniosTexto,
} from '../constants/tema';
import { useBiblioteca } from '../context/biblioteca';
import { buscarLibros } from '../lib/api';
import type { Libro } from '../types';

/**
 * Ruta /buscar?q=
 * Requisito A3.3 y Parte B2:
 * - La búsqueda vive en la URL (useLocalSearchParams + router.setParams).
 * - La limpieza del efecto (`cancelado = true`) descarta respuestas viejas
 *   que lleguen desordenadas, evitando condiciones de carrera.
 */
export default function BuscarScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const consulta = typeof q === 'string' ? q : '';

  const [resultados, setResultados] = useState<Libro[]>([]);
  const [buscando, setBuscando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState<number>(0);

  const { calcularDisponibles, obtenerColaEspera } = useBiblioteca();

  const actualizarBusqueda = (nuevoTexto: string) => {
    router.setParams({ q: nuevoTexto });
  };

  const reintentar = useCallback(() => {
    setIntento((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function ejecutarBusqueda() {
      setBuscando(true);
      setError(null);
      try {
        const datos = await buscarLibros(consulta);
        if (!cancelado) {
          setResultados(datos);
          setBuscando(false);
        }
      } catch {
        if (!cancelado) {
          setError('No se pudo completar la búsqueda. Intentá nuevamente.');
          setBuscando(false);
        }
      }
    }

    void ejecutarBusqueda();

    return () => {
      cancelado = true;
    };
  }, [consulta, intento]);

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Titulo>Buscar libros</Titulo>
        <Parrafo>
          Buscá por título o autor. El texto de búsqueda se guarda directamente en la URL.
        </Parrafo>

        <View style={styles.barraBusqueda}>
          <Ionicons name="search-outline" size={20} color={Colores.textoSecundario} />
          <TextInput
            value={consulta}
            onChangeText={actualizarBusqueda}
            placeholder="Ej: Borges, Rayuela, Clean Code..."
            placeholderTextColor={Colores.textoSecundario}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Buscar por título o autor"
            style={styles.input}
          />
          {consulta.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              onPress={() => actualizarBusqueda('')}
              style={({ pressed }) => [
                styles.botonLimpiar,
                pressed ? styles.presionado : null,
              ]}>
              <Ionicons name="close-circle" size={20} color={Colores.textoSecundario} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {buscando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={Colores.primario} />
          <Parrafo>
            {consulta.trim()
              ? `Buscando "${consulta.trim()}"...`
              : 'Cargando todos los libros...'}
          </Parrafo>
        </View>
      ) : error ? (
        <View style={styles.centrado}>
          <View style={styles.cajaError}>
            <Text style={styles.tituloError}>Error al buscar</Text>
            <Parrafo style={styles.textoCentrado}>{error}</Parrafo>
            <Boton
              titulo="Reintentar"
              variante="primario"
              icono="refresh"
              onPress={reintentar}
            />
          </View>
        </View>
      ) : (
        <FlatList<Libro>
          data={resultados}
          keyExtractor={(item) => item.isbn}
          contentContainerStyle={styles.listaContenido}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          ListHeaderComponent={
            <View style={styles.encabezadoResultados}>
              <Subtitulo>
                Resultados ({resultados.length})
              </Subtitulo>
            </View>
          }
          renderItem={({ item }) => (
            <TarjetaLibro
              libro={item}
              disponibles={calcularDisponibles(item)}
              enEspera={obtenerColaEspera(item.isbn).length}
              onPress={() =>
                router.push({ pathname: '/libro/[isbn]', params: { isbn: item.isbn } })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.cajaVacia}>
              <Ionicons name="search-outline" size={32} color={Colores.textoSecundario} />
              <Text style={styles.tituloVacio}>Sin resultados</Text>
              <Parrafo style={styles.textoCentrado}>
                No encontramos libros que coincidan con &quot;{consulta.trim()}&quot;.
              </Parrafo>
              {consulta.length > 0 ? (
                <Boton
                  titulo="Ver todo el catálogo"
                  variante="secundario"
                  onPress={() => actualizarBusqueda('')}
                />
              ) : null}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondo,
  },
  cabecera: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: Espaciados.lg,
    paddingTop: Espaciados.lg,
    paddingBottom: Espaciados.sm,
    gap: Espaciados.sm,
  },
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.md,
    paddingLeft: Espaciados.md,
    paddingRight: Espaciados.xs,
    minHeight: AreaTactilMinima + 4,
    gap: Espaciados.sm,
  },
  input: {
    flex: 1,
    fontSize: TamaniosTexto.md,
    color: Colores.texto,
    paddingVertical: Espaciados.sm,
  },
  botonLimpiar: {
    minWidth: AreaTactilMinima,
    minHeight: AreaTactilMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: 0.75,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Espaciados.xl,
    gap: Espaciados.md,
  },
  cajaError: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    backgroundColor: Colores.superficie,
    borderColor: Colores.peligro,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.xl,
    gap: Espaciados.md,
  },
  tituloError: {
    fontSize: TamaniosTexto.lg,
    fontWeight: '700',
    color: Colores.peligro,
  },
  textoCentrado: {
    textAlign: 'center',
  },
  listaContenido: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: Espaciados.lg,
    paddingTop: Espaciados.sm,
    paddingBottom: 40,
  },
  encabezadoResultados: {
    marginBottom: Espaciados.sm,
  },
  separador: {
    height: Espaciados.md,
  },
  cajaVacia: {
    alignItems: 'center',
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.xl,
    gap: Espaciados.md,
  },
  tituloVacio: {
    fontSize: TamaniosTexto.lg,
    fontWeight: '700',
    color: Colores.texto,
  },
});
