import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Titulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { buscarPlato, categorias, formatearPrecio } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export default function DetallePlato() {
  const colores = useColores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { carrito, agregarAlCarrito } = useComedor();

  const plato = buscarPlato(id);

  if (!plato) {
    return (
      <Pantalla>
        <Stack.Screen options={{ title: 'No encontrado' }} />
        <Titulo>Plato no encontrado</Titulo>
        <Parrafo>No existe ningún plato con el código "{id}".</Parrafo>
        <Boton
          titulo="Volver al menú"
          icono="arrow-back"
          variante="secundario"
          onPress={() => router.dismissTo('/menu')}
        />
        <DondeEstoy />
      </Pantalla>
    );
  }

  const categoria = categorias.find((c) => c.id === plato.categoria);
  const cantidadEnCarrito = carrito.filter((item) => item.plato.id === plato.id).length;

  return (
    <Pantalla>
      <Stack.Screen options={{ title: plato.nombre }} />

      <View style={[styles.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        <Text style={[styles.categoria, { color: colores.primario }]}>{categoria?.nombre}</Text>
        <Titulo>{plato.nombre}</Titulo>
        <Parrafo>{plato.descripcion}</Parrafo>
        <Text style={[styles.precio, { color: colores.exito }]}>{formatearPrecio(plato.precio)}</Text>
      </View>

      <Boton
        titulo="Agregar al carrito"
        icono="cart"
        onPress={() => agregarAlCarrito(plato)}
      />

      {cantidadEnCarrito > 0 && (
        <Parrafo>
          Tenés {cantidadEnCarrito} {cantidadEnCarrito === 1 ? 'unidad' : 'unidades'} de este plato en el carrito.
        </Parrafo>
      )}

      <Link href="/carrito" asChild>
        <Boton titulo="Ir al carrito" icono="arrow-forward" variante="secundario" />
      </Link>

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  categoria: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  precio: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
});