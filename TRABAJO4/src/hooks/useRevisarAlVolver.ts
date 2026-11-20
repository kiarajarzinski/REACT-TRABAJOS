import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Ejecuta `revisar` cuando la app regresa al primer plano ('active')
 * tras haber estado en segundo plano o inactiva (por ejemplo, al volver de Ajustes).
 */
export function useRevisarAlVolver(revisar: () => void): void {
  const anterior = useRef<string>(AppState.currentState ?? 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera =
        anterior.current === 'inactive' || anterior.current === 'background';
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
