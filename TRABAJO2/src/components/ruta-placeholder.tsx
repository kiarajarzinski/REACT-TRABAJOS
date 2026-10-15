import { Pantalla } from '@/components/pantalla';
import { Titulo } from '@/components/texto';

export function RutaPlaceholder({ titulo }: { titulo: string }) {
  return (
    <Pantalla>
      <Titulo>{titulo}</Titulo>
    </Pantalla>
  );
}
