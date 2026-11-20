import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colores } from '../constants/tema';
import { BibliotecaProvider, useBiblioteca } from '../context/biblioteca';

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavegacionRaiz() {
  const { personalLogueado } = useBiblioteca();
  const conSesion = personalLogueado !== null;

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: styles.header,
        headerTintColor: Colores.texto,
        headerTitleStyle: styles.headerTitulo,
        contentStyle: styles.contenido,
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscar libros' }} />
      <Stack.Screen name="escanear" options={{ title: 'Escanear ISBN' }} />
      <Stack.Screen
        name="reservar/[isbn]"
        options={{
          title: 'Confirmar reserva',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="permisos/[recurso]"
        options={{
          title: 'Permiso requerido',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="reserva" options={{ headerShown: false }} />

      <Stack.Protected guard={!conSesion}>
        <Stack.Screen
          name="login"
          options={{
            title: 'Acceso personal',
            presentation: 'modal',
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={conSesion}>
        <Stack.Screen
          name="mostrador"
          options={{
            title: 'Mostrador de biblioteca',
          }}
        />
      </Stack.Protected>

      <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <GestureHandlerRootView style={styles.raiz}>
      <StatusBar style="dark" />
      <BibliotecaProvider>
        <NavegacionRaiz />
      </BibliotecaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
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
