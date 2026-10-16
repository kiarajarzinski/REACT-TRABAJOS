import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { useColores } from '@/hooks/use-colores';

export default function NotaCocina() {
  const colores = useColores();
  const { nota, setNota } = useComedor();
  const [texto, setTexto] = useState(nota);

  const guardar = () => {
    setNota(texto);
    router.back();
  };

  return (
    <Pantalla>
      <Parrafo>Aclaraciones para la cocina, por ejemplo: "sin sal" o "sin cebolla".</Parrafo>

      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Escribí tu nota…"
        placeholderTextColor={colores.textoSecundario}
        multiline
        style={[
          styles.input,
          { color: colores.texto, backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}
      />

      <Boton titulo="Guardar nota" icono="save" onPress={guardar} />

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
    minHeight: 110,
    textAlignVertical: 'top',
  },
});