import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components/Boton';
import { Parrafo } from '../components/Parrafo';
import { Subtitulo } from '../components/Subtitulo';
import { Titulo } from '../components/Titulo';
import { Colores, Espaciados, Radios, TamaniosTexto } from '../constants/tema';
import { useBiblioteca } from '../context/biblioteca';
import { LIBROS } from '../data/libros';
import type { Libro } from '../types';

/**
 * Ruta /mostrador (controlada por Stack.Protected guard={conSesion}).
 * Requisito A1, A3.8 y E3:
 * - Muestra libros con lista de espera: quién está al frente y cuántos esperan.
 * - "Entregar al siguiente" desencola a la persona del frente de la Cola.
 * - Si la cola está vacía, avisa claramente y deshabilita el botón.
 * - Al cerrar sesión, Stack.Protected elimina /mostrador del historial.
 */
export default function MostradorScreen() {
  const {
    listasEspera,
    personalLogueado,
    entregarAlSiguiente,
    cerrarSesion,
  } = useBiblioteca();

  const [mensajeEntrega, setMensajeEntrega] = useState<string | null>(null);

  const librosMostrador: Libro[] = LIBROS.filter(
    (libro) => libro.ejemplares === 0 || (listasEspera[libro.isbn]?.tamanio ?? 0) > 0,
  );

  const manejarEntregar = async (libro: Libro) => {
    const res = await entregarAlSiguiente(libro);

    if (!res.entregadoA) {
      setMensajeEntrega(
        `No hay personas en lista de espera para "${libro.titulo}".`,
      );
      return;
    }

    if (res.esUsuarioActual) {
      setMensajeEntrega(
        res.viaNotificacion
          ? `Se entregó "${libro.titulo}" a ${res.entregadoA}. Se envió notificación local.`
          : `Se entregó "${libro.titulo}" a ${res.entregadoA}. Sin permiso de notificaciones: se creó un aviso en /reservas.`,
      );
      return;
    }

    setMensajeEntrega(
      `Se entregó "${libro.titulo}" a ${res.entregadoA} (primera persona de la cola).`,
    );
  };

  return (
    <View style={styles.contenedor}>
      <FlatList<Libro>
        data={librosMostrador}
        keyExtractor={(item) => item.isbn}
        contentContainerStyle={styles.listaContenido}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        ListHeaderComponent={
          <View style={styles.encabezado}>
            <Titulo>Mostrador</Titulo>
            <Parrafo>
              Sesión activa: {personalLogueado ?? 'Personal'}. Entregá los libros
              respetando el orden de llegada (Cola FIFO).
            </Parrafo>

            {mensajeEntrega ? (
              <View style={styles.feedbackCaja}>
                <Text style={styles.feedbackTexto}>{mensajeEntrega}</Text>
              </View>
            ) : null}

            <Boton
              titulo="Cerrar sesión"
              variante="peligro"
              icono="log-out-outline"
              onPress={cerrarSesion}
            />

            <Subtitulo>Listas de espera ({librosMostrador.length})</Subtitulo>
          </View>
        }
        renderItem={({ item }) => {
          const cola = listasEspera[item.isbn];
          const frente = cola?.frente();
          const cantidad = cola?.tamanio ?? 0;
          const sinEspera = cantidad === 0;

          return (
            <View style={styles.tarjeta}>
              <Text style={styles.tituloLibro}>{item.titulo}</Text>
              <Text style={styles.autor}>{item.autor}</Text>

              <View style={styles.datosCaja}>
                <Text style={styles.datoTexto}>
                  Al frente:{' '}
                  <Text style={styles.datoFuerte}>
                    {frente ?? 'Lista de espera vacía'}
                  </Text>
                </Text>
                <Text style={styles.datoTexto}>
                  Personas esperando:{' '}
                  <Text style={styles.datoFuerte}>{cantidad}</Text>
                </Text>
              </View>

              <Boton
                titulo={
                  sinEspera
                    ? 'Sin personas en espera'
                    : 'Entregar al siguiente'
                }
                variante={sinEspera ? 'secundario' : 'primario'}
                icono="checkmark-done-outline"
                disabled={sinEspera}
                onPress={() => void manejarEntregar(item)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.cajaVacia}>
            <Parrafo>No hay libros con lista de espera en este momento.</Parrafo>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondo,
  },
  listaContenido: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: Espaciados.lg,
    paddingBottom: 40,
  },
  encabezado: {
    gap: Espaciados.md,
    marginBottom: Espaciados.md,
  },
  feedbackCaja: {
    backgroundColor: Colores.exitoSuave,
    borderColor: Colores.exito,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
  },
  feedbackTexto: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '600',
    color: Colores.exito,
    lineHeight: 19,
  },
  separador: {
    height: Espaciados.md,
  },
  tarjeta: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.sm,
  },
  tituloLibro: {
    fontSize: TamaniosTexto.md + 1,
    fontWeight: '700',
    color: Colores.texto,
  },
  autor: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
  },
  datosCaja: {
    backgroundColor: Colores.fondo,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
    gap: Espaciados.xs,
  },
  datoTexto: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
  },
  datoFuerte: {
    fontWeight: '700',
    color: Colores.texto,
  },
  cajaVacia: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.xl,
    alignItems: 'center',
  },
});
