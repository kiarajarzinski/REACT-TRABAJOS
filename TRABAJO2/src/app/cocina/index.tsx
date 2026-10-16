import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { formatearPrecio } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export default function CocinaIndex() {
  const colores = useColores();
  const { pedidosEnCola, atenderSiguiente, cerrarSesion } = useComedor();

  const frente = pedidosEnCola.length > 0 ? pedidosEnCola[0] : null;

  return (
    <Pantalla>
      <View style={styles.encabezado}>
        <Subtitulo style={{ marginTop: 0 }}>
          En espera: {pedidosEnCola.length} {pedidosEnCola.length === 1 ? 'pedido' : 'pedidos'}
        </Subtitulo>
        <Boton titulo="Cerrar sesión" variante="peligro" icono="log-out" onPress={cerrarSesion} />
      </View>

      {frente ? (
        <View style={[styles.tarjetaPedido, { backgroundColor: colores.superficie, borderColor: colores.primario }]}>
          <Text style={[styles.turnoTexto, { color: colores.primario }]}>Turno #{frente.numero}</Text>

          <Subtitulo>Platos a preparar:</Subtitulo>
          {frente.items.map((item, i) => (
            <Text key={i} style={[styles.platoNombre, { color: colores.texto }]}>
              • {item.nombre} ({formatearPrecio(item.precio)})
            </Text>
          ))}

          {frente.nota !== '' && (
            <View style={[styles.notaCaja, { backgroundColor: colores.primarioSuave }]}>
              <Text style={[styles.notaTitulo, { color: colores.primario }]}>Nota del alumno:</Text>
              <Text style={{ color: colores.texto }}>{frente.nota}</Text>
            </View>
          )}

          <Text style={[styles.total, { color: colores.texto }]}>Total: {formatearPrecio(frente.total)}</Text>
        </View>
      ) : (
        <View style={[styles.vacioCaja, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
          <Titulo style={{ fontSize: 20 }}>Sin pedidos pendientes</Titulo>
          <Parrafo>La cola de la cocina está vacía en este momento.</Parrafo>
        </View>
      )}

      <Boton
        titulo="Atender siguiente"
        icono="checkmark-done"
        disabled={!frente}
        onPress={() => atenderSiguiente()}
      />

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tarjetaPedido: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  turnoTexto: {
    fontSize: 28,
    fontWeight: '900',
  },
  platoNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  notaCaja: {
    padding: 12,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  notaTitulo: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  total: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  vacioCaja: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    alignItems: 'center',
  },
});