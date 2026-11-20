import { Platform } from 'react-native';

export const Colores = {
  texto: '#0F2E33',
  textoSecundario: '#3D5A5E',
  textoSobrePrimario: '#FFFFFF',
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
} as const;

export const Espaciados = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radios = {
  sm: 8,
  md: 12,
  lg: 14,
  pill: 999,
} as const;

export const TamaniosTexto = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  titulo: 26,
} as const;

export const AreaTactilMinima = 44;

export const FuenteMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});
