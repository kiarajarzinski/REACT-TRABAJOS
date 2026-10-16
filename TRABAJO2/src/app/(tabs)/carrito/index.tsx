import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { formatearPrecio } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export default function Carrito() {
  const colores = useColores();
  const { carrito, total, nota, puedeDeshacer, deshacerUltimo } = useComedor();

  const vacio = carrito.length === 0;

  return (
    <Pantalla>
      {vacio ? (
        <>
          <Parrafo>Todavía no agregaste ningún plato.</Parrafo>
          <Link href="/menu" asChild>
            <Boton titulo="Ver el menú" icono="restaurant" />
          </Link>
        </>
      ) : (
        <View style={[styles.lista, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
          {carrito.map((item) => (
            <View key={item.uid} style={styles.fila}>
              <Text style={[styles.nombre, { color: colores.texto }]}>{item.plato.nombre}</Text>
              <Text style={[styles.precio, { color: colores.textoSecundario }]}>
                {formatearPrecio(item.plato.precio)}
              </Text>
            </View>
          ))}
          <View style={[styles.fila, styles.filaTotal, { borderTopColor: colores.borde }]}>
            <Text style={[styles.total, { color: colores.texto }]}>Total</Text>
            <Text style={[styles.total, { color: colores.primario }]}>{formatearPrecio(total)}</Text>
          </View>
        </View>
      )}

      {nota !== '' && (
        <>
          <Subtitulo>Nota para la cocina</Subtitulo>
          <Parrafo>{nota}</Parrafo>
        </>
      )}

      <Boton
        titulo="Deshacer último"
        icono="arrow-undo"
        variante="secundario"
        disabled={!puedeDeshacer}
        onPress={deshacerUltimo}
      />

      <Link href="/carrito/nota" asChild>
        <Boton
          titulo={nota === '' ? 'Agregar nota para la cocina' : 'Editar nota'}
          icono="create"
          variante="secundario"
          disabled={vacio}
        />
      </Link>

      <Link href="/confirmar" asChild>
        <Boton titulo="Confirmar pedido" icono="checkmark-circle" disabled={vacio} />
      </Link>

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  lista: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  filaTotal: {
    borderTopWidth: 1,
  },
  nombre: {
    flex: 1,
    fontSize: 15,
  },
  precio: {
    fontSize: 15,
  },
  total: {
    fontSize: 17,
    fontWeight: '800',
  },
});