import { Stack } from 'expo-router';

export default function CarritoLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Carrito' }} />
      <Stack.Screen name="nota" options={{ title: 'Nota para la cocina' }} />
    </Stack>
  );
}