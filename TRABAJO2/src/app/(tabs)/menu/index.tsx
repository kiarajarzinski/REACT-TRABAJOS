import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Subtitulo } from '@/components/texto';
import { TarjetaPlato } from '@/components/tarjeta-plato';
import { categorias, platos } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export default function Menu() {
  const colores = useColores();

  return (
    <Pantalla>
      {categorias.map((categoria) => (
        <View key={categoria.id} style={styles.seccion}>
          <View style={styles.encabezado}>
            <Subtitulo>{categoria.nombre}</Subtitulo>
            <Link
              href={{ pathname: '/categorias/[categoria]', params: { categoria: categoria.id } }}
              style={[styles.verTodo, { color: colores.primario }]}>
              Ver todo
            </Link>
          </View>

          {platos
            .filter((plato) => plato.categoria === categoria.id)
            .map((plato) => (
              <TarjetaPlato key={plato.id} plato={plato} />
            ))}
        </View>
      ))}

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  seccion: {
    gap: 10,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  verTodo: {
    fontSize: 14,
    fontWeight: '700',
  },
});