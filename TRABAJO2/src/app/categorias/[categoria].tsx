import { Stack, useLocalSearchParams } from 'expo-router';

import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { TarjetaPlato } from '@/components/tarjeta-plato';
import { Parrafo, Titulo } from '@/components/texto';
import { categorias, platos } from '@/data/platos';

export default function CategoriaScreen() {
  const { categoria } = useLocalSearchParams<{ categoria: string }>();

  const catEncontrada = categorias.find((c) => c.id === categoria);

  if (!catEncontrada) {
    return (
      <Pantalla>
        <Stack.Screen options={{ title: 'Categoría no encontrada' }} />
        <Titulo>Categoría no encontrada</Titulo>
        <Parrafo>No existe la categoría "{categoria}".</Parrafo>
        <DondeEstoy />
      </Pantalla>
    );
  }

  const platosCategoria = platos.filter((p) => p.categoria === catEncontrada.id);

  return (
    <Pantalla>
      <Stack.Screen options={{ title: catEncontrada.nombre }} />
      <Titulo>{catEncontrada.nombre}</Titulo>

      {platosCategoria.map((plato) => (
        <TarjetaPlato key={plato.id} plato={plato} />
      ))}

      <DondeEstoy />
    </Pantalla>
  );
}