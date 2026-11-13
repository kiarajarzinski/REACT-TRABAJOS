import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColores } from '@/hooks/use-colores';

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavegacionRaiz() {
  const colores = useColores();

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="reporte/nuevo" options={{ title: 'Nuevo reporte' }} />
      <Stack.Screen name="reporte/escanear" options={{ title: 'Escanear QR del aula' }} />
      <Stack.Screen name="reporte/foto" options={{ title: 'Adjuntar foto' }} />
      <Stack.Screen
        name="reporte/ubicacion"
        options={{ title: 'Ubicación del desperfecto' }}
      />
      <Stack.Screen name="reporte/[id]" options={{ title: 'Detalle del reporte' }} />
      <Stack.Screen
        name="permisos/[recurso]"
        options={{
          title: 'Permiso requerido',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ajustes-app"
        options={{ title: 'Ajustes de notificaciones' }}
      />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavegacionRaiz />
    </GestureHandlerRootView>
  );
}
