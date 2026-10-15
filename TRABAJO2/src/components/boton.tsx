import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { useColores } from '@/hooks/use-colores';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  titulo: string;
  variante?: Variante;
  icono?: ComponentProps<typeof Ionicons>['name'];
};

export function Boton({ titulo, variante = 'primario', icono, disabled, ...resto }: Props) {
  const colores = useColores();

  const fondo = {
    primario: colores.primario,
    secundario: colores.primarioSuave,
    peligro: colores.peligroSuave,
  }[variante];

  const texto = {
    primario: '#FFFFFF',
    secundario: colores.primario,
    peligro: colores.peligro,
  }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: fondo, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        pressed && styles.presionado,
      ]}
      {...resto}>
      {icono && <Ionicons name={icono} size={18} color={texto} />}
      <Text style={[styles.texto, { color: texto }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  presionado: {
    transform: [{ scale: 0.98 }],
  },
  texto: {
    fontSize: 15,
    fontWeight: '700',
  },
});