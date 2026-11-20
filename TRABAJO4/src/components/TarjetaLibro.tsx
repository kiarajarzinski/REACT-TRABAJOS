import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AreaTactilMinima,
  Colores,
  Espaciados,
  Radios,
  TamaniosTexto,
} from '../constants/tema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
  disponibles: number;
  enEspera: number;
  onPress: () => void;
};

export function TarjetaLibro({ libro, disponibles, enEspera, onPress }: Props) {
  const hayEjemplares = disponibles > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${libro.titulo} de ${libro.autor}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tarjeta, pressed ? styles.presionada : null]}>
      <View style={styles.cuerpo}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.autor}>
          {libro.autor} · {libro.anio}
        </Text>
        <View style={styles.filaEstado}>
          <View
            style={[
              styles.badge,
              hayEjemplares ? styles.badgeDisponible : styles.badgeAgotado,
            ]}>
            <Text
              style={[
                styles.badgeTexto,
                hayEjemplares ? styles.textoDisponible : styles.textoAgotado,
              ]}>
              {hayEjemplares
                ? `${disponibles} ${disponibles === 1 ? 'ejemplar' : 'ejemplares'}`
                : 'Sin ejemplares'}
            </Text>
          </View>
          {enEspera > 0 ? (
            <View style={styles.badgeEspera}>
              <Text style={styles.textoEspera}>
                {enEspera} en espera
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colores.textoSecundario} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciados.md,
    minHeight: AreaTactilMinima,
    padding: 14,
    borderRadius: Radios.lg,
    borderWidth: 1,
    borderColor: Colores.borde,
    backgroundColor: Colores.superficie,
  },
  presionada: {
    opacity: 0.85,
  },
  cuerpo: {
    flex: 1,
    gap: Espaciados.xs,
  },
  titulo: {
    fontSize: TamaniosTexto.md + 1,
    fontWeight: '700',
    color: Colores.texto,
  },
  autor: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
  },
  filaEstado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Espaciados.sm,
    marginTop: Espaciados.xs,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radios.pill,
  },
  badgeDisponible: {
    backgroundColor: Colores.exitoSuave,
  },
  badgeAgotado: {
    backgroundColor: Colores.alertaSuave,
  },
  badgeEspera: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radios.pill,
    backgroundColor: Colores.primarioSuave,
  },
  badgeTexto: {
    fontSize: TamaniosTexto.xs,
    fontWeight: '700',
  },
  textoDisponible: {
    color: Colores.exito,
  },
  textoAgotado: {
    color: Colores.alerta,
  },
  textoEspera: {
    fontSize: TamaniosTexto.xs,
    fontWeight: '700',
    color: Colores.primario,
  },
});
