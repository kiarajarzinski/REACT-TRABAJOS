import { Drawer } from 'expo-router/drawer';

import { useColores } from '@/hooks/use-colores';

export default function CocinaLayout() {
  const colores = useColores();

  return (
    <Drawer
      screenOptions={{
        headerTintColor: colores.primario,
        drawerActiveTintColor: colores.primario,
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Pedidos en espera',
          title: 'Cocina - En espera',
        }}
      />
      <Drawer.Screen
        name="atendidos"
        options={{
          drawerLabel: 'Historial atendidos',
          title: 'Cocina - Pedidos atendidos',
        }}
      />
    </Drawer>
  );
}