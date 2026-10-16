import { useLocalSearchParams, usePathname, useSegments } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FuenteMono } from '@/constants/theme';
import { useColores } from '@/hooks/use-colores';

const DEBUG = true;

export function DondeEstoy() {
  const colores = useColores();
  const pathname = usePathname();
  const segmentos = useSegments();
  const params = useLocalSearchParams();

  if (!DEBUG) return null;

  const filas = [
    { hook: 'usePathname()', valor: pathname },
    { hook: 'useSegments()', valor: JSON.stringify(segmentos) },
    { hook: 'useLocalSearchParams()', valor: JSON.stringify(params) },
  ];

  return (
    <View style={[styles.caja, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
      <Text style={[styles.titulo, { color: colores.primario }]}>¿Dónde estoy?</Text>
      {filas.map((fila) => (
        <View key={fila.hook} style={styles.fila}>
          <Text style={[styles.hook, { color: colores.textoSecundario }]}>{fila.hook}</Text>
          <Text style={[styles.valor, { color: colores.texto }]} selectable>
            {fila.valor}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 8,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fila: {
    gap: 2,
  },
  hook: {
    fontFamily: FuenteMono,
    fontSize: 12,
  },
  valor: {
    fontFamily: FuenteMono,
    fontSize: 13,
    fontWeight: '600',
  },
});