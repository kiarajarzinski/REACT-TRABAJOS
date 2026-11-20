import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Colores, Espaciados, Radios, TamaniosTexto } from '../constants/tema';
import { INFO_RECURSOS } from '../lib/permisos';
import type { EstadoPermiso, RecursoPermiso } from '../types';
import { Boton } from './Boton';
import { Parrafo } from './Parrafo';

type Props = {
  recurso: RecursoPermiso;
  estado: EstadoPermiso;
  onContinuar: () => void;
  onAbrirAjustes: () => void;
};

/**
 * Tarjeta previa al diálogo del sistema o aviso de permiso bloqueado.
 * Si el permiso está preguntable -> único botón "Continuar".
 * Si el permiso está bloqueado (canAskAgain === false) -> botón "Abrir Ajustes".
 */
export function ExplicacionPermiso({
  recurso,
  estado,
  onContinuar,
  onAbrirAjustes,
}: Props) {
  const info = INFO_RECURSOS[recurso];
  const esBloqueado = estado === 'bloqueado';

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Ionicons
          name={recurso === 'camara' ? 'camera-outline' : 'notifications-outline'}
          size={24}
          color={Colores.primario}
        />
        <Text style={styles.titulo}>{info.titulo}</Text>
      </View>

      <Parrafo style={styles.beneficio}>{info.beneficio}</Parrafo>

      {esBloqueado ? (
        <View style={styles.bloqueadoCaja}>
          <Text style={styles.bloqueadoTitulo}>Permiso bloqueado</Text>
          <Text style={styles.bloqueadoTexto}>
            El sistema no volverá a mostrar el diálogo automáticamente. Podés habilitar
            este permiso desde los Ajustes de la aplicación.
          </Text>
          <Boton
            titulo="Abrir Ajustes"
            variante="peligro"
            icono="settings-outline"
            onPress={onAbrirAjustes}
          />
        </View>
      ) : (
        <View style={styles.previaCaja}>
          <Text style={styles.aclaracion}>
            Podés cambiar esta decisión en cualquier momento desde los Ajustes del sistema.
          </Text>
          <Boton
            titulo="Continuar"
            variante="primario"
            icono="arrow-forward"
            onPress={onContinuar}
          />
        </View>
      )}

      <View style={styles.alternativaCaja}>
        <Text style={styles.alternativaEtiqueta}>Alternativa sin permiso</Text>
        <Text style={styles.alternativaTexto}>{info.alternativa}</Text>
      </View>
    </View>
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
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciados.sm,
  },
  titulo: {
    fontSize: TamaniosTexto.lg,
    fontWeight: '700',
    color: Colores.texto,
  },
  beneficio: {
    color: Colores.texto,
    fontWeight: '500',
  },
  previaCaja: {
    backgroundColor: Colores.fondo,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
    gap: Espaciados.md,
  },
  aclaracion: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
    lineHeight: 19,
  },
  bloqueadoCaja: {
    backgroundColor: Colores.peligroSuave,
    borderColor: Colores.peligro,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
    gap: Espaciados.sm,
  },
  bloqueadoTitulo: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
    color: Colores.peligro,
  },
  bloqueadoTexto: {
    fontSize: TamaniosTexto.sm,
    color: Colores.texto,
    lineHeight: 19,
  },
  alternativaCaja: {
    borderTopWidth: 1,
    borderTopColor: Colores.borde,
    paddingTop: Espaciados.sm,
    gap: Espaciados.xs,
  },
  alternativaEtiqueta: {
    fontSize: TamaniosTexto.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colores.primario,
  },
  alternativaTexto: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
    lineHeight: 19,
  },
});
