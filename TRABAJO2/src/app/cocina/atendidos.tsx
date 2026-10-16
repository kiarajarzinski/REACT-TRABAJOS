import { StyleSheet, Text, View } from 'react-native';

import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { formatearPrecio } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export default function CocinaAtendidos() {
  const colores = useColores();
  const { atendidos } = useComedor();

  return (
    <Pantalla>
      <Titulo>Pedidos Atendidos</Titulo>
      <Parrafo>Historial de pedidos procesados (del más reciente al más antiguo).</Parrafo>

      {atendidos.length === 0 ? (
        <Parrafo>Todavía no se atendió ningún pedido.</Parrafo>
      ) : (
        atendidos.map((pedido) => (
          <View
            key={pedido.numero}
            style={[styles.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
            <View style={styles.filaHeader}>
              <Text style={[styles.numero, { color: colores.primario }]}>Turno #{pedido.numero}</Text>
              <Text style={[styles.total, { color: colores.texto }]}>{formatearPrecio(pedido.total)}</Text>
            </View>

            <Subtitulo style={{ marginTop: 4 }}>Platos:</Subtitulo>
            {pedido.items.map((item, idx) => (
              <Text key={idx} style={{ color: colores.textoSecundario }}>
                • {item.nombre}
              </Text>
            ))}
          </View>
        ))
      )}

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  filaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numero: {
    fontSize: 20,
    fontWeight: '800',
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
  },
});