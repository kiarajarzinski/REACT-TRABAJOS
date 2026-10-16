import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { TarjetaAcceso } from '@/components/tarjeta-acceso';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';

export default function Inicio() {
  const { usuario } = useComedor();

  return (
    <Pantalla>
      <Titulo>Comedor IPF</Titulo>
      <Parrafo>
        Pedí tu comida desde el celular y retirala cuando te toque el turno.
      </Parrafo>

      <Subtitulo>Acceso rápido</Subtitulo>
      <TarjetaAcceso
        href="/menu"
        titulo="Menú"
        descripcion="Mirá los platos y agregalos al carrito."
        icono="restaurant"
      />
      <TarjetaAcceso
        href="/buscar"
        titulo="Buscar"
        descripcion="Encontrá un plato por nombre o categoría."
        icono="search"
      />
      <TarjetaAcceso
        href="/ayuda"
        titulo="Ayuda"
        descripcion="Cómo pedir, formas de pago y horarios."
        icono="help-circle"
      />
      <TarjetaAcceso
        href={usuario ? '/cocina' : '/login'}
        titulo="Cocina"
        descripcion={usuario ? 'Atendé los pedidos en orden de llegada.' : 'Ingreso del personal de cocina.'}
        icono="flame"
      />

      <DondeEstoy />
    </Pantalla>
  );
}