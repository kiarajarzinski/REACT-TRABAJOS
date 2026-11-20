import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Colores } from '../../../constants/tema';

export default function CatalogoStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: styles.header,
        headerTintColor: Colores.texto,
        headerTitleStyle: styles.headerTitulo,
        contentStyle: styles.contenido,
      }}>
      <Stack.Screen name="index" options={{ title: 'Biblioteca IPF' }} />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Detalle del libro' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colores.superficie,
  },
  headerTitulo: {
    fontWeight: '700',
  },
  contenido: {
    backgroundColor: Colores.fondo,
  },
});
