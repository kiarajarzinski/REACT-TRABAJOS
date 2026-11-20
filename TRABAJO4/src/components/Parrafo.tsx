import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Colores, TamaniosTexto } from '../constants/tema';

type Props = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Parrafo({ children, style }: Props) {
  return <Text style={[styles.parrafo, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  parrafo: {
    fontSize: TamaniosTexto.md,
    lineHeight: 22,
    color: Colores.textoSecundario,
  },
});
