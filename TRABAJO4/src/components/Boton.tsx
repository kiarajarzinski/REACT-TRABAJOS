import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import {
  AreaTactilMinima,
  Colores,
  Espaciados,
  Radios,
  TamaniosTexto,
} from '../constants/tema';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  titulo: string;
  variante?: Variante;
  icono?: ComponentProps<typeof Ionicons>['name'];
};

export function Boton({
  titulo,
  variante = 'primario',
  icono,
  disabled,
  accessibilityLabel,
  ...resto
}: Props) {
  const colorIcono =
    variante === 'primario'
      ? Colores.textoSobrePrimario
      : variante === 'peligro'
        ? Colores.peligro
        : Colores.primario;

  const estiloVariante =
    variante === 'primario'
      ? styles.fondoPrimario
      : variante === 'peligro'
        ? styles.fondoPeligro
        : styles.fondoSecundario;

  const estiloTexto =
    variante === 'primario'
      ? styles.textoPrimario
      : variante === 'peligro'
        ? styles.textoPeligro
        : styles.textoSecundario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      disabled={disabled}
      style={({ pressed }) => [
        styles.boton,
        estiloVariante,
        disabled ? styles.deshabilitado : null,
        pressed && !disabled ? styles.presionado : null,
      ]}
      {...resto}>
      {icono ? <Ionicons name={icono} size={18} color={colorIcono} /> : null}
      <Text style={[styles.texto, estiloTexto]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciados.sm,
    minHeight: AreaTactilMinima,
    minWidth: AreaTactilMinima,
    paddingVertical: Espaciados.md,
    paddingHorizontal: Espaciados.lg,
    borderRadius: Radios.md,
  },
  fondoPrimario: {
    backgroundColor: Colores.primario,
  },
  fondoSecundario: {
    backgroundColor: Colores.primarioSuave,
  },
  fondoPeligro: {
    backgroundColor: Colores.peligroSuave,
  },
  deshabilitado: {
    opacity: 0.45,
  },
  presionado: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  texto: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
  },
  textoPrimario: {
    color: Colores.textoSobrePrimario,
  },
  textoSecundario: {
    color: Colores.primario,
  },
  textoPeligro: {
    color: Colores.peligro,
  },
});
