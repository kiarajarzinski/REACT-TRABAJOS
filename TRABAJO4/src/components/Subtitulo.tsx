import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Colores, Espaciados, TamaniosTexto } from '../constants/tema';

type Props = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Subtitulo({ children, style }: Props) {
  return <Text style={[styles.subtitulo, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  subtitulo: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Espaciados.sm,
    color: Colores.texto,
  },
});
