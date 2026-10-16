import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Boton } from '@/components/boton';
import { DondeEstoy } from '@/components/DondeEstoy';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Titulo } from '@/components/texto';
import { useComedor } from '@/context/comedor';
import { useColores } from '@/hooks/use-colores';

export default function LoginScreen() {
  const colores = useColores();
  const { iniciarSesion } = useComedor();

  const [usuarioInput, setUsuarioInput] = useState('');
  const [claveInput, setClaveInput] = useState('');
  const [error, setError] = useState('');

  const handleIngresar = () => {
    setError('');
    const ok = iniciarSesion(usuarioInput, claveInput);
    if (!ok) {
      setError('Usuario o clave incorrectos. (Prueba: cocina / ipf2026)');
    }
  };

  return (
    <Pantalla>
      <Titulo>Acceso Personal de Cocina</Titulo>
      <Parrafo>Ingresá tus credenciales para administrar los pedidos.</Parrafo>

      <View style={styles.form}>
        <TextInput
          value={usuarioInput}
          onChangeText={setUsuarioInput}
          placeholder="Usuario"
          autoCapitalize="none"
          placeholderTextColor={colores.textoSecundario}
          style={[
            styles.input,
            { color: colores.texto, backgroundColor: colores.superficie, borderColor: colores.borde },
          ]}
        />

        <TextInput
          value={claveInput}
          onChangeText={setClaveInput}
          placeholder="Contraseña"
          secureTextEntry
          placeholderTextColor={colores.textoSecundario}
          style={[
            styles.input,
            { color: colores.texto, backgroundColor: colores.superficie, borderColor: colores.borde },
          ]}
        />

        {error !== '' && <Parrafo style={{ color: colores.peligro }}>{error}</Parrafo>}

        <Boton titulo="Ingresar" icono="log-in" onPress={handleIngresar} />
      </View>

      <DondeEstoy />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});