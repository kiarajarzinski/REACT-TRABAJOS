import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colores, Espaciados } from '../constants/tema';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pantalla({ children, scroll = true, style }: Props) {
  if (!scroll) {
    return (
      <View style={styles.base}>
        <View style={[styles.contenido, styles.base, style]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.base}
      contentContainerStyle={[styles.contenido, style]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: Colores.fondo,
  },
  contenido: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: Espaciados.lg,
    paddingBottom: 40,
    gap: 14,
  },
});
