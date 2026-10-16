import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { formatearPrecio } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export default function ConfirmarScreen() {
  const colores = useColores();
  const { carrito, total, nota, confirmarPedido } = useComedor();

  const handleConfirmar = () => {
    const numeroTurno = confirmarPedido();
    if (numeroTurno !== null) {
      router.replace(`/turno/${numeroTurno}`);
    }
  };

  return (
    <Pantalla>
      <Titulo>Resumen del pedido</Titulo>
      <Parrafo>Revisá los ítems antes de confirmar tu pedido a la cocina.</Parrafo>

      <View style={[styles.caja, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        {carrito.map((item) => (
          <View key={item.uid} style={styles.fila}>
            <Text style={[styles.nombre, { color: colores.texto }]}>{item.plato.nombre}</Text>
            <Text style={[styles.precio, { color: colores.textoSecundario }]}>
              {formatearPrecio(item.plato.precio)}
            </Text>
          </View>
        ))}

        {nota !== '' && (
          <View style={[styles.notaContenedor, { borderTopColor: colores.borde }]}>
            <Subtitulo style={styles.subTituloNota}>Nota para cocina:</Subtitulo>
            <Text style={{ color: colores.textoSecundario }}>{nota}</Text>
          </View>
        )}

        <View style={[styles.fila, styles.filaTotal, { borderTopColor: colores.borde }]}>
          <Text style={[styles.total, { color: colores.texto }]}>Total a pagar</Text>
          <Text style={[styles.total, { color: colores.primario }]}>{formatearPrecio(total)}</Text>
        </View>
      </View>

      <Boton titulo="Confirmar pedido" icono="checkmark-done" onPress={handleConfirmar} />
      <Boton titulo="Cancelar" variante="secundario" icono="close" onPress={() => router.back()} />

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  caja: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filaTotal: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  nombre: {
    fontSize: 15,
  },
  precio: {
    fontSize: 15,
  },
  total: {
    fontSize: 18,
    fontWeight: '800',
  },
  notaContenedor: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  subTituloNota: {
    marginTop: 0,
    fontSize: 11,
  },
});