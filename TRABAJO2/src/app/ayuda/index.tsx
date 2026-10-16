import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';

export default function AyudaIndex() {
  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Centro de Ayuda' }} />
      <Titulo>Centro de Ayuda</Titulo>
      <Parrafo>Encontrá respuestas a las preguntas más frecuentes sobre el comedor.</Parrafo>

      <Subtitulo>Temas frecuentes</Subtitulo>
      
      <View style={styles.lista}>
        <Link href="/ayuda/pagos/efectivo" asChild>
          <Boton titulo="Formas de Pago" icono="card" variante="secundario" />
        </Link>
        
        <Link href="/ayuda/horarios" asChild>
          <Boton titulo="Horarios de Atención" icono="time" variante="secundario" />
        </Link>

        <Link href="/ayuda/pedidos/retiro" asChild>
          <Boton titulo="Cómo retirar tu pedido" icono="fast-food" variante="secundario" />
        </Link>
      </View>

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: 10,
  },
});