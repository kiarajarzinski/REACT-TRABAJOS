import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useColores } from '@/hooks/use-colores';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pantalla({ children, scroll = true, style }: Props) {
  const colores = useColores();

  if (!scroll) {
    return (
      <View style={[styles.base, { backgroundColor: colores.fondo }]}>
        <View style={[styles.contenido, styles.base, style]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.base, { backgroundColor: colores.fondo }]}
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
  },
  contenido: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
});