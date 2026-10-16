import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { formatearPrecio, type Plato } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export function TarjetaPlato({ plato }: { plato: Plato }) {
  return (
    <Link href={{ pathname: '/menu/[id]', params: { id: plato.id } }} asChild>
      <Contenido plato={plato} />
    </Link>
  );
}

function Contenido({ plato, ...pressableProps }: { plato: Plato } & PressableProps) {
  const colores = useColores();

  return (
    <Pressable
      {...pressableProps}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: colores.superficie, borderColor: colores.borde, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.textos}>
        <Text style={[styles.nombre, { color: colores.texto }]}>{plato.nombre}</Text>
        <Text style={[styles.precio, { color: colores.primario }]}>{formatearPrecio(plato.precio)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  precio: {
    fontSize: 14,
    fontWeight: '700',
  },
});