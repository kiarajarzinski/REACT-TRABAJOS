import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { TarjetaPlato } from '@/components/tarjeta-plato';
import { Parrafo, Titulo } from '@/components/texto';
import { categorias, platos } from '@/data/platos';
import { useColores } from '@/hooks/use-colores';

export default function BuscarScreen() {
  const colores = useColores();
  const params = useLocalSearchParams<{ q?: string; categoria?: string }>();

  const query = params.q || '';
  const categoriaFiltro = params.categoria || '';

  const setQuery = (texto: string) => {
    router.setParams({ q: texto });
  };

  const setCategoriaFiltro = (catId: string) => {
    router.setParams({ categoria: catId === categoriaFiltro ? '' : catId });
  };

  const resultados = platos.filter((plato) => {
    const coincideTexto =
      plato.nombre.toLowerCase().includes(query.toLowerCase()) ||
      plato.descripcion.toLowerCase().includes(query.toLowerCase());
    const coincideCategoria = !categoriaFiltro || plato.categoria === categoriaFiltro;
    return coincideTexto && coincideCategoria;
  });

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Buscador' }} />
      <Titulo>Buscador</Titulo>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por nombre o ingrediente…"
        placeholderTextColor={colores.textoSecundario}
        style={[
          styles.input,
          { color: colores.texto, backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}
      />

      <View style={styles.filtros}>
        {categorias.map((cat) => {
          const activa = cat.id === categoriaFiltro;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setCategoriaFiltro(cat.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: activa ? colores.primario : colores.superficie,
                  borderColor: colores.borde,
                },
              ]}>
              <Text
                style={[
                  styles.chipTexto,
                  { color: activa ? '#FFFFFF' : colores.texto },
                ]}>
                {cat.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {resultados.length === 0 ? (
        <Parrafo>No se encontraron platos que coincidan con la búsqueda.</Parrafo>
      ) : (
        resultados.map((plato) => <TarjetaPlato key={plato.id} plato={plato} />)
      )}

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
});