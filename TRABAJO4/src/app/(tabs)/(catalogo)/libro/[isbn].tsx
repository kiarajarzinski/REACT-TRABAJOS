import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../../../components/Boton';
import { Pantalla } from '../../../../components/Pantalla';
import { Parrafo } from '../../../../components/Parrafo';
import { Subtitulo } from '../../../../components/Subtitulo';
import { Titulo } from '../../../../components/Titulo';
import {
  Colores,
  Espaciados,
  FuenteMono,
  Radios,
  TamaniosTexto,
} from '../../../../constants/tema';
import { useBiblioteca } from '../../../../context/biblioteca';
import { LIBROS } from '../../../../data/libros';

const REGEX_ISBN_13 = /^\d{13}$/;

export default function DetalleLibroScreen() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const isbnNormalizado = typeof isbn === 'string' ? isbn.trim() : '';
  const formatoValido = REGEX_ISBN_13.test(isbnNormalizado);
  const libro = formatoValido
    ? LIBROS.find((item) => item.isbn === isbnNormalizado)
    : undefined;

  const {
    registrarVisto,
    calcularDisponibles,
    obtenerColaEspera,
    posicionEnEspera,
    tieneLibroReservadoOPrestado,
    prestamos,
  } = useBiblioteca();

  useEffect(() => {
    if (libro) {
      registrarVisto(libro);
    }
  }, [libro, registrarVisto]);

  if (!formatoValido || !libro) {
    return (
      <Pantalla>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <View style={styles.cajaError}>
          <Ionicons name="alert-circle-outline" size={36} color={Colores.peligro} />
          <Titulo>Libro no encontrado</Titulo>
          <Parrafo>
            {!formatoValido
              ? `El código "${isbnNormalizado}" no es un ISBN válido. Debe tener exactamente 13 dígitos numéricos sin guiones.`
              : `No encontramos ningún libro registrado en el catálogo con el ISBN ${isbnNormalizado}.`}
          </Parrafo>
          <Boton
            titulo="Volver al Catálogo"
            variante="primario"
            icono="book-outline"
            onPress={() => router.replace('/index')}
          />
        </View>
      </Pantalla>
    );
  }

  const disponibles = calcularDisponibles(libro);
  const colaEspera = obtenerColaEspera(libro.isbn);
  const miPosicion = posicionEnEspera(libro.isbn);
  const yaLoTengo = prestamos.some((p) => p.isbn === libro.isbn);
  const yaReservado = tieneLibroReservadoOPrestado(libro.isbn);

  return (
    <Pantalla>
      <Stack.Screen options={{ title: libro.titulo }} />

      <Titulo>{libro.titulo}</Titulo>
      <Parrafo>
        {libro.autor} · Publicado en {libro.anio}
      </Parrafo>

      <View style={styles.tarjeta}>
        <View style={styles.filaDato}>
          <Text style={styles.etiqueta}>ISBN-13</Text>
          <Text style={styles.valorMono}>{libro.isbn}</Text>
        </View>
        <View style={styles.filaDato}>
          <Text style={styles.etiqueta}>Ejemplares disponibles</Text>
          <Text
            style={[
              styles.valor,
              disponibles > 0 ? styles.textoExito : styles.textoAlerta,
            ]}>
            {disponibles} {disponibles === 1 ? 'ejemplar' : 'ejemplares'}
          </Text>
        </View>
        <View style={styles.filaDato}>
          <Text style={styles.etiqueta}>Personas en lista de espera</Text>
          <Text style={styles.valor}>{colaEspera.length}</Text>
        </View>
      </View>

      {yaLoTengo ? (
        <View style={styles.avisoCaja}>
          <Text style={styles.avisoTitulo}>Ya tenés este libro en préstamo</Text>
          <Parrafo>
            Podés ver la fecha de devolución o activar un recordatorio en la pestaña
            &quot;Mis reservas&quot;.
          </Parrafo>
          <Boton
            titulo="Ir a Mis reservas"
            variante="secundario"
            icono="bookmark-outline"
            onPress={() => router.push('/reservas')}
          />
        </View>
      ) : miPosicion !== null ? (
        <View style={styles.avisoCaja}>
          <Text style={styles.avisoTitulo}>
            Ya estás en la lista de espera (Posición #{miPosicion})
          </Text>
          <Parrafo>
            No podés reservar dos veces el mismo libro. Te avisaremos cuando sea tu turno
            de retiro.
          </Parrafo>
          <Boton
            titulo="Ver en Mis reservas"
            variante="secundario"
            icono="bookmark-outline"
            onPress={() => router.push('/reservas')}
          />
        </View>
      ) : (
        <View style={styles.bloqueAccion}>
          <Subtitulo>Disponibilidad</Subtitulo>
          <Parrafo>
            {disponibles > 0
              ? 'Hay ejemplares en el estante. Al reservar se registra un préstamo inmediato por 7 días.'
              : 'No hay ejemplares disponibles ahora. Al reservar ingresarás al final de la lista de espera.'}
          </Parrafo>
          <Boton
            titulo={disponibles > 0 ? 'Reservar ahora' : 'Anotarme en lista de espera'}
            variante="primario"
            icono="bookmark-outline"
            disabled={yaReservado}
            onPress={() =>
              router.push({
                pathname: '/reservar/[isbn]',
                params: { isbn: libro.isbn },
              })
            }
          />
        </View>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cajaError: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.peligro,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.xl,
    gap: Espaciados.md,
  },
  tarjeta: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.md,
  },
  filaDato: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Espaciados.sm,
  },
  etiqueta: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '600',
    color: Colores.textoSecundario,
  },
  valor: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
    color: Colores.texto,
  },
  valorMono: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '700',
    fontFamily: FuenteMono,
    color: Colores.texto,
  },
  textoExito: {
    color: Colores.exito,
  },
  textoAlerta: {
    color: Colores.alerta,
  },
  avisoCaja: {
    backgroundColor: Colores.primarioSuave,
    borderColor: Colores.primario,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.sm,
  },
  avisoTitulo: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
    color: Colores.primario,
  },
  bloqueAccion: {
    gap: Espaciados.sm,
  },
});
