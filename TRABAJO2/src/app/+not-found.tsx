import { Link, Stack, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Titulo } from '@/components/texto';

export default function NotFoundScreen() {
  const pathname = usePathname();

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Error 404' }} />

      <View style={styles.contenedor}>
        <Titulo>404 - Página no encontrada</Titulo>
        <Parrafo>
          La ruta <Parrafo style={{ fontWeight: '700' }}>"{pathname}"</Parrafo> no existe en la aplicación.
        </Parrafo>

        <Link href="/" asChild>
          <Boton titulo="Ir a la pantalla principal" icono="home" />
        </Link>
      </View>

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 12,
  },
});