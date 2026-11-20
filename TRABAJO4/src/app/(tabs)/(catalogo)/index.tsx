import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Boton } from '../../../components/Boton';
import { Parrafo } from '../../../components/Parrafo';
import { Subtitulo } from '../../../components/Subtitulo';
import { TarjetaLibro } from '../../../components/TarjetaLibro';
import { Titulo } from '../../../components/Titulo';
import {
  AreaTactilMinima,
  Colores,
  Espaciados,
  Radios,
  TamaniosTexto,
} from '../../../constants/tema';
import { useBiblioteca } from '../../../context/biblioteca';
import { useLibros } from '../../../hooks/useLibros';
import type { Libro } from '../../../types';

export default function CatalogoScreen() {
  const { libros, cargando, error, reintentar } = useLibros();
  const {
    recientes,
    personalLogueado,
    calcularDisponibles,
    obtenerColaEspera,
  } = useBiblioteca();

  const abrirPersonal = () => {
    if (personalLogueado) {
      router.push('/mostrador');
    } else {
      router.push('/login');
    }
  };

  const abrirDetalle = (isbn: string) => {
    router.push({ pathname: '/libro/[isbn]', params: { isbn } });
  };

  return (
    <View style={styles.contenedor}>
      <Stack.Screen
        options={{
          title: 'Catálogo',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Acceso para personal de biblioteca"
              onPress={abrirPersonal}
              style={({ pressed }) => [
                styles.botonPersonal,
                pressed ? styles.presionado : null,
              ]}>
              <Ionicons
                name={personalLogueado ? 'shield-checkmark' : 'person-outline'}
                size={16}
                color={Colores.primario}
              />
              <Text style={styles.textoPersonal}>Personal</Text>
            </Pressable>
          ),
        }}
      />

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={Colores.primario} />
          <Parrafo>Cargando catálogo de la biblioteca...</Parrafo>
        </View>
      ) : error ? (
        <View style={styles.centrado}>
          <View style={styles.cajaError}>
            <Ionicons name="alert-circle-outline" size={32} color={Colores.peligro} />
            <Text style={styles.tituloError}>No pudimos cargar el catálogo</Text>
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
          data={libros}
          keyExtractor={(item) => item.isbn}
          contentContainerStyle={styles.listaContenido}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          ListHeaderComponent={
            <View style={styles.encabezadoLista}>
              <Titulo>Biblioteca IPF</Titulo>
              <Parrafo>
                Consultá el catálogo, reservá tus libros y activá recordatorios de
                devolución.
              </Parrafo>

              <View style={styles.filaAccesos}>
                <View style={styles.botonFlexible}>
                  <Boton
                    titulo="Buscar"
                    variante="primario"
                    icono="search-outline"
                    onPress={() => router.push('/buscar')}
                  />
                </View>
                <View style={styles.botonFlexible}>
                  <Boton
                    titulo="Escanear"
                    variante="secundario"
                    icono="barcode-outline"
                    onPress={() => router.push('/escanear')}
                  />
                </View>
              </View>

              {recientes.length > 0 ? (
                <View style={styles.seccionRecientes}>
                  <Subtitulo>Vistos recientemente</Subtitulo>
                  <View style={styles.listaRecientes}>
                    {recientes.map((libro) => (
                      <Pressable
                        key={libro.isbn}
                        accessibilityRole="button"
                        accessibilityLabel={`Abrir libro reciente ${libro.titulo}`}
                        onPress={() => abrirDetalle(libro.isbn)}
                        style={({ pressed }) => [
                          styles.chipReciente,
                          pressed ? styles.presionado : null,
                        ]}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={Colores.primario}
                        />
                        <Text style={styles.chipRecienteTexto} numberOfLines={1}>
                          {libro.titulo}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Subtitulo>Catálogo completo ({libros.length})</Subtitulo>
            </View>
          }
          renderItem={({ item }) => (
            <TarjetaLibro
              libro={item}
              disponibles={calcularDisponibles(item)}
              enEspera={obtenerColaEspera(item.isbn).length}
              onPress={() => abrirDetalle(item.isbn)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.cajaVacia}>
              <Ionicons name="book-outline" size={32} color={Colores.textoSecundario} />
              <Text style={styles.tituloVacio}>Catálogo vacío</Text>
              <Parrafo style={styles.textoCentrado}>
                No hay libros disponibles en este momento.
              </Parrafo>
              <Boton
                titulo="Volver a cargar"
                variante="secundario"
                icono="refresh"
                onPress={reintentar}
              />
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
  botonPersonal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: AreaTactilMinima,
    minWidth: AreaTactilMinima,
    paddingHorizontal: Espaciados.md,
    borderRadius: Radios.pill,
    backgroundColor: Colores.primarioSuave,
  },
  textoPersonal: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '700',
    color: Colores.primario,
  },
  presionado: {
    opacity: 0.8,
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
    textAlign: 'center',
  },
  textoCentrado: {
    textAlign: 'center',
  },
  listaContenido: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: Espaciados.lg,
    paddingBottom: 40,
  },
  encabezadoLista: {
    gap: Espaciados.md,
    marginBottom: Espaciados.md,
  },
  filaAccesos: {
    flexDirection: 'row',
    gap: Espaciados.md,
  },
  botonFlexible: {
    flex: 1,
  },
  seccionRecientes: {
    gap: Espaciados.sm,
  },
  listaRecientes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Espaciados.sm,
  },
  chipReciente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: AreaTactilMinima,
    paddingHorizontal: Espaciados.md,
    borderRadius: Radios.md,
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    maxWidth: '100%',
  },
  chipRecienteTexto: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '600',
    color: Colores.texto,
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
