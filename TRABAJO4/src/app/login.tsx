import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Boton } from '../components/Boton';
import { Pantalla } from '../components/Pantalla';
import { Parrafo } from '../components/Parrafo';
import { Titulo } from '../components/Titulo';
import {
  Colores,
  Espaciados,
  FuenteMono,
  Radios,
  TamaniosTexto,
} from '../constants/tema';
import { CREDENCIALES_PERSONAL, useBiblioteca } from '../context/biblioteca';

/**
 * Ruta /login (modal, controlada por Stack.Protected guard={!conSesion}).
 * Requisito A1, A3.8 y E3:
 * Ingreso del personal de biblioteca con usuario y clave fijos.
 * Si la clave es incorrecta muestra un mensaje claro.
 * Al iniciar sesión, el login se cierra solo y abre /mostrador.
 */
export default function LoginPersonalScreen() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState<string>('');
  const [clave, setClave] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const manejarIngreso = () => {
    const ok = iniciarSesion(usuario, clave);
    if (!ok) {
      setError('Usuario o clave incorrectos. Revisá las credenciales e intentá nuevamente.');
      return;
    }
    setError(null);
    router.replace('/mostrador');
  };

  return (
    <Pantalla>
      <Titulo>Acceso personal</Titulo>
      <Parrafo>
        Ingresá con las credenciales del personal de biblioteca para gestionar las
        entregas del mostrador.
      </Parrafo>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Usuario</Text>
        <TextInput
          value={usuario}
          onChangeText={(texto) => {
            setUsuario(texto);
            if (error) setError(null);
          }}
          placeholder="Ingresá tu usuario"
          placeholderTextColor={Colores.textoSecundario}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Usuario del personal"
          style={styles.input}
        />

        <Text style={styles.etiqueta}>Clave</Text>
        <TextInput
          value={clave}
          onChangeText={(texto) => {
            setClave(texto);
            if (error) setError(null);
          }}
          placeholder="Ingresá tu clave"
          placeholderTextColor={Colores.textoSecundario}
          secureTextEntry
          accessibilityLabel="Clave del personal"
          style={styles.input}
        />

        {error ? (
          <View style={styles.errorCaja}>
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        ) : null}

        <Boton
          titulo="Iniciar sesión"
          variante="primario"
          icono="log-in-outline"
          onPress={manejarIngreso}
        />

        <Boton
          titulo="Cancelar"
          variante="secundario"
          onPress={() => router.back()}
        />
      </View>

      <View style={styles.pistaCaja}>
        <Text style={styles.pistaTitulo}>Credenciales de demostración</Text>
        <Text style={styles.pistaTexto}>
          Usuario: {CREDENCIALES_PERSONAL.usuario} · Clave: {CREDENCIALES_PERSONAL.clave}
        </Text>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.md,
  },
  etiqueta: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '700',
    color: Colores.texto,
  },
  input: {
    borderWidth: 1,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondo,
    borderRadius: Radios.md,
    paddingHorizontal: Espaciados.md,
    paddingVertical: Espaciados.md,
    fontSize: TamaniosTexto.md,
    color: Colores.texto,
  },
  errorCaja: {
    backgroundColor: Colores.peligroSuave,
    borderColor: Colores.peligro,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
  },
  errorTexto: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '600',
    color: Colores.peligro,
  },
  pistaCaja: {
    backgroundColor: Colores.primarioSuave,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
    gap: Espaciados.xs,
  },
  pistaTitulo: {
    fontSize: TamaniosTexto.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colores.primario,
  },
  pistaTexto: {
    fontSize: TamaniosTexto.sm,
    fontFamily: FuenteMono,
    color: Colores.texto,
  },
});
