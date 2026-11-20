import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Colores, TamaniosTexto } from '../constants/tema';

type Props = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Titulo({ children, style }: Props) {
  return <Text style={[styles.titulo, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: TamaniosTexto.titulo,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: Colores.texto,
  },
});
