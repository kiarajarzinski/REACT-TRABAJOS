import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../components/Boton';
import { Pantalla } from '../../components/Pantalla';
import { Parrafo } from '../../components/Parrafo';
import { Titulo } from '../../components/Titulo';
import { Colores, Espaciados, Radios, TamaniosTexto } from '../../constants/tema';
import { useBiblioteca } from '../../context/biblioteca';
import { LIBROS } from '../../data/libros';

const REGEX_ISBN_13 = /^\d{13}$/;

/**
 * Ruta /reservar/[isbn] (presentation: "modal").
 * Requisito A3.5 y C1.a:
 * - Si hay ejemplares -> préstamo por 7 días.
 * - Si no hay ejemplares -> ingresa a la Cola de espera mostrando su posición.
 * - No permite reservar dos veces el mismo libro.
 * - Al confirmar, usa router.dismissTo('/reservas') para cerrar el modal y
 *   llevar a /reservas sin que el botón "atrás" vuelva a la confirmación.
 */
export default function ConfirmarReservaScreen() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const isbnNormalizado = typeof isbn === 'string' ? isbn.trim() : '';
  const libro = REGEX_ISBN_13.test(isbnNormalizado)
    ? LIBROS.find((item) => item.isbn === isbnNormalizado)
    : undefined;

  const {
    calcularDisponibles,
    obtenerColaEspera,
    tieneLibroReservadoOPrestado,
    reservarLibro,
  } = useBiblioteca();

  if (!libro) {
    return (
      <Pantalla>
        <View style={styles.caja}>
          <Ionicons name="alert-circle-outline" size={32} color={Colores.peligro} />
          <Titulo>Libro no encontrado</Titulo>
          <Parrafo>
            No podemos confirmar la reserva porque el ISBN indicado no existe en el
            catálogo.
          </Parrafo>
          <Boton
            titulo="Volver al Catálogo"
            variante="primario"
            onPress={() => router.dismissTo('/')}
          />
        </View>
      </Pantalla>
    );
  }

  const disponibles = calcularDisponibles(libro);
  const enEspera = obtenerColaEspera(libro.isbn).length;
  const yaReservado = tieneLibroReservadoOPrestado(libro.isbn);

  const confirmar = () => {
    const res = reservarLibro(libro);
    if (res.tipo !== 'duplicado') {
      router.dismissTo('/reservas');
    }
  };

  return (
    <Pantalla>
      <View style={styles.caja}>
        <Titulo>Confirmar reserva</Titulo>
        <Text style={styles.tituloLibro}>{libro.titulo}</Text>
        <Parrafo>
          {libro.autor} · {libro.anio}
        </Parrafo>

        {yaReservado ? (
          <View style={styles.alertaCaja}>
            <Text style={styles.alertaTitulo}>Ya reservaste este libro</Text>
            <Parrafo>
              No se puede reservar dos veces el mismo libro. Revisá su estado en Mis
              reservas.
            </Parrafo>
            <Boton
              titulo="Ir a Mis reservas"
              variante="secundario"
              onPress={() => router.dismissTo('/reservas')}
            />
          </View>
        ) : disponibles > 0 ? (
          <View style={styles.infoCaja}>
            <Text style={styles.infoTitulo}>Préstamo inmediato (7 días)</Text>
            <Parrafo>
              Hay {disponibles} {disponibles === 1 ? 'ejemplar' : 'ejemplares'}{' '}
              disponibles. Al confirmar se registrará tu préstamo con vencimiento en 7
              días.
            </Parrafo>
            <Boton
              titulo="Confirmar préstamo"
              variante="primario"
              icono="checkmark-circle-outline"
              onPress={confirmar}
            />
          </View>
        ) : (
          <View style={styles.esperaCaja}>
            <Text style={styles.esperaTitulo}>
              Ingreso a lista de espera · Posición #{enEspera + 1}
            </Text>
            <Parrafo>
              Actualmente no quedan ejemplares en el estante. Al confirmar quedarás en la
              posición #{enEspera + 1} de la cola de espera.
            </Parrafo>
            <Boton
              titulo={`Confirmar lugar #${enEspera + 1}`}
              variante="primario"
              icono="people-outline"
              onPress={confirmar}
            />
          </View>
        )}

        <Boton
          titulo="Cancelar"
          variante="secundario"
          onPress={() => router.back()}
        />
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.md,
  },
  tituloLibro: {
    fontSize: TamaniosTexto.lg,
    fontWeight: '700',
    color: Colores.primario,
  },
  infoCaja: {
    backgroundColor: Colores.exitoSuave,
    borderColor: Colores.exito,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
    gap: Espaciados.sm,
  },
  infoTitulo: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
    color: Colores.exito,
  },
  esperaCaja: {
    backgroundColor: Colores.alertaSuave,
    borderColor: Colores.alerta,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
    gap: Espaciados.sm,
  },
  esperaTitulo: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
    color: Colores.alerta,
  },
  alertaCaja: {
    backgroundColor: Colores.peligroSuave,
    borderColor: Colores.peligro,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
    gap: Espaciados.sm,
  },
  alertaTitulo: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
    color: Colores.peligro,
  },
});
