import { Platform } from 'react-native';

export const Colores = {
  light: {
    texto: '#0F2E33',
    textoSecundario: '#3D5A5E',
    fondo: '#F4FAFA',
    superficie: '#FFFFFF',
    borde: '#DCE9E9',
    primario: '#0A9484',
    primarioSuave: '#E0F2F1',
    exito: '#15803D',
    exitoSuave: '#ECFDF5',
    alerta: '#B45309',
    alertaSuave: '#FFFBEB',
    peligro: '#DC2626',
    peligroSuave: '#FEF2F2',
  },
  dark: {
    texto: '#E6F4F2',
    textoSecundario: '#8FB1B0',
    fondo: '#0A1A1C',
    superficie: '#112527',
    borde: '#1E3A3D',
    primario: '#2BB8A8',
    primarioSuave: '#0F3A3A',
    exito: '#4ADE80',
    exitoSuave: '#062E24',
    alerta: '#FBBF24',
    alertaSuave: '#2E2106',
    peligro: '#F87171',
    peligroSuave: '#3B0F12',
  },
};

export type Paleta = typeof Colores.light;

export const FuenteMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
});

export const Colors = {
  light: {
    text: Colores.light.texto,
    background: Colores.light.fondo,
    backgroundElement: Colores.light.superficie,
    backgroundSelected: Colores.light.primarioSuave,
    textSecondary: Colores.light.textoSecundario,
  },
  dark: {
    text: Colores.dark.texto,
    background: Colores.dark.fondo,
    backgroundElement: Colores.dark.superficie,
    backgroundSelected: Colores.dark.primarioSuave,
    textSecondary: Colores.dark.textoSecundario,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: 'normal',
  serif: 'serif',
  rounded: 'normal',
  mono: FuenteMono ?? 'monospace',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;