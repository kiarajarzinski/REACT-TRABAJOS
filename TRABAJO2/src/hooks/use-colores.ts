import { useColorScheme } from 'react-native';

import { Colores } from '@/constants/theme';

export function useColores() {
  const esquema = useColorScheme();
  return esquema === 'dark' ? Colores.dark : Colores.light;
}