import { router, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components/Boton';
import { Pantalla } from '../components/Pantalla';
import { Parrafo } from '../components/Parrafo';
import { Titulo } from '../components/Titulo';
import { Colores, Espaciados, FuenteMono, Radios, TamaniosTexto } from '../constants/tema';

/**
 * Requisito A1:
 * Pantalla 404 que muestra la URL inexistente y ofrece volver al Catálogo.
 */
export default function PaginaNoEncontrada() {
  const pathname = usePathname();

  return (
    <Pantalla>
      <View style={styles.caja}>
        <Text style={styles.codigo}>404</Text>
        <Titulo>Página no encontrada</Titulo>
        <Parrafo>
          La dirección que intentaste abrir no existe en Biblioteca IPF:
        </Parrafo>
        <Text style={styles.url} selectable>
          {pathname}
        </Text>
        <Boton
          titulo="Volver al Catálogo"
          variante="primario"
          icono="book-outline"
          onPress={() => router.replace('/')}
        />
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.xl,
    gap: Espaciados.md,
  },
  codigo: {
    fontSize: 40,
    fontWeight: '800',
    color: Colores.primario,
  },
  url: {
    fontFamily: FuenteMono,
    fontSize: TamaniosTexto.sm,
    color: Colores.peligro,
    backgroundColor: Colores.peligroSuave,
    padding: Espaciados.md,
    borderRadius: Radios.sm,
  },
});
