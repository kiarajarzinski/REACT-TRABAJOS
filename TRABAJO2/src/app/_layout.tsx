import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ComedorProvider, useComedor } from '@/context/comedor';

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavegacionRaiz() {
  const { usuario } = useComedor();
  const conSesion = usuario !== null;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="categorias/[categoria]" options={{ title: 'Categoría' }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscador' }} />
      <Stack.Screen name="turno/[numero]" options={{ title: 'Estado del turno' }} />
      <Stack.Screen name="ayuda/index" options={{ title: 'Ayuda' }} />
      <Stack.Screen name="ayuda/[...slug]" options={{ title: 'Ayuda' }} />
      <Stack.Screen name="pedido" options={{ headerShown: false }} />

      <Stack.Screen name="confirmar" options={{ presentation: 'modal', title: 'Confirmar pedido' }} />

      <Stack.Protected guard={conSesion}>
        <Stack.Screen name="cocina" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="login" options={{ presentation: 'modal', title: 'Acceso cocina' }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ComedorProvider>
        <NavegacionRaiz />
      </ComedorProvider>
    </GestureHandlerRootView>
  );
}