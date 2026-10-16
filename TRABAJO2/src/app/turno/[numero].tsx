import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Titulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { useColores } from '@/hooks/use-colores';

export default function TurnoScreen() {
  const colores = useColores();
  const { numero } = useLocalSearchParams<{ numero: string }>();
  const { posicionEnCola } = useComedor();

  const numTurno = Number(numero);
  const posicion = posicionEnCola(numTurno);
  const enEspera = posicion !== -1;
  const minutosEstimados = enEspera ? (posicion + 1) * 3 : 0;

  return (
    <Pantalla>
      <View style={[styles.tarjetaTurno, { backgroundColor: colores.primarioSuave, borderColor: colores.primario }]}>
        <Text style={[styles.etiqueta, { color: colores.primario }]}>Tu número de turno</Text>
        <Text style={[styles.numero, { color: colores.primario }]}>#{numero}</Text>
      </View>

      {enEspera ? (
        <View style={[styles.infoCaja, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
          <Parrafo style={styles.textoCentro}>
            Hay <Text style={styles.resaltado}>{posicion}</Text> {posicion === 1 ? 'pedido' : 'pedidos'} adelante tuyo en la cola.
          </Parrafo>
          <Parrafo style={styles.textoCentro}>
            Tiempo estimado de espera: <Text style={styles.resaltado}>{minutosEstimados} minutos</Text>.
          </Parrafo>
        </View>
      ) : (
        <View style={[styles.infoCaja, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
          <Parrafo style={styles.textoCentro}>¡Tu pedido ya fue atendido o retirado!</Parrafo>
        </View>
      )}

      <Link href="/menu" asChild>
        <Boton titulo="Volver al menú" icono="restaurant" />
      </Link>

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjetaTurno: {
    borderWidth: 2,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  numero: {
    fontSize: 56,
    fontWeight: '900',
  },
  infoCaja: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  textoCentro: {
    textAlign: 'center',
  },
  resaltado: {
    fontWeight: '800',
  },
});