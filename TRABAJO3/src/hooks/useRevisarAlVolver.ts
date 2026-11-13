import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Ejecuta la función `revisar` cada vez que la aplicación vuelve al primer plano ('active')
 * después de haber estado en segundo plano o inactiva (por ejemplo, al volver de Ajustes).
 */
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef<string>(AppState.currentState ?? 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') {
        revisar();
      }
      anterior.current = nuevo;
    });

    return () => {
      sub.remove();
    };
  }, [revisar]);
}
