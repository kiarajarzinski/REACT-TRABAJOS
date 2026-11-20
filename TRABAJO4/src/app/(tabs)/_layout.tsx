import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Colores } from '../../constants/tema';
import { useBiblioteca } from '../../context/biblioteca';

export default function TabsLayout() {
  const { avisos, prestamos } = useBiblioteca();
  const avisosSinLeer = avisos.filter((av) => !av.leido).length;
  const badgeReservas = avisosSinLeer > 0 ? avisosSinLeer : prestamos.length;

  return (
    <Tabs
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: Colores.texto,
        headerTitleStyle: styles.headerTitulo,
        tabBarActiveTintColor: Colores.primario,
        tabBarInactiveTintColor: Colores.textoSecundario,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="book"
              size={size}
              color={typeof color === 'string' ? color : Colores.primario}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarBadge: badgeReservas > 0 ? badgeReservas : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="bookmark"
              size={size}
              color={typeof color === 'string' ? color : Colores.primario}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colores.superficie,
  },
  headerTitulo: {
    fontWeight: '700',
  },
  tabBar: {
    backgroundColor: Colores.superficie,
    borderTopColor: Colores.borde,
  },
});
