import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { useColores } from '@/hooks/use-colores';

type Props = { children: ReactNode; style?: StyleProp<TextStyle> };

export function Titulo({ children, style }: Props) {
  const colores = useColores();
  return <Text style={[styles.titulo, { color: colores.texto }, style]}>{children}</Text>;
}

export function Subtitulo({ children, style }: Props) {
  const colores = useColores();
  return <Text style={[styles.subtitulo, { color: colores.texto }, style]}>{children}</Text>;
}

export function Parrafo({ children, style }: Props) {
  const colores = useColores();
  return <Text style={[styles.parrafo, { color: colores.textoSecundario }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  parrafo: {
    fontSize: 15,
    lineHeight: 22,
  },
});