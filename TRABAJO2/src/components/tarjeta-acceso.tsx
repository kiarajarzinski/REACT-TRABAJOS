import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useColores } from '@/hooks/use-colores';

type Props = {
  href: Href;
  titulo: string;
  descripcion: string;
  icono: ComponentProps<typeof Ionicons>['name'];
};

export function TarjetaAcceso({ href, ...contenido }: Props) {
  return (
    <Link href={href} asChild>
      <Contenido {...contenido} />
    </Link>
  );
}

function Contenido({
  titulo,
  descripcion,
  icono,
  ...pressableProps
}: Omit<Props, 'href'> & PressableProps) {
  const colores = useColores();

  return (
    <Pressable
      {...pressableProps}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: colores.superficie, borderColor: colores.borde, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.icono, { backgroundColor: colores.primarioSuave }]}>
        <Ionicons name={icono} size={24} color={colores.primario} />
      </View>
      <View style={styles.textos}>
        <Text style={[styles.titulo, { color: colores.texto }]}>{titulo}</Text>
        <Text style={[styles.descripcion, { color: colores.textoSecundario }]}>{descripcion}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  icono: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
  },
  descripcion: {
    fontSize: 13,
    lineHeight: 18,
  },
});