import { Link, Stack, useLocalSearchParams } from 'expo-router';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';

export default function AyudaArticulo() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();
  
  const rutaCompleta = Array.isArray(slug) ? slug.join(' / ') : slug;

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Artículo de Ayuda' }} />
      <Titulo>Ayuda</Titulo>
      <Subtitulo style={{ marginTop: 0 }}>Sección: {rutaCompleta}</Subtitulo>

      <Parrafo>
        Estás viendo el artículo de ayuda correspondiente a la ruta dynamic catch-all: <Parrafo style={{ fontWeight: '700' }}>/ayuda/{rutaCompleta}</Parrafo>.
      </Parrafo>

      <Link href="/ayuda" asChild>
        <Boton titulo="Volver al índice de ayuda" icono="arrow-back" variante="secundario" />
      </Link>

      <DondeEstoy />
    </Pantalla>
  );
}