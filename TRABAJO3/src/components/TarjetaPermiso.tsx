import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { EstadoPermiso, INFO_RECURSOS, RecursoPermiso } from '../lib/permisos';

interface BadgeEstadoProps {
  estado: EstadoPermiso;
  parcial?: boolean;
  provisional?: boolean;
}

export function BadgeEstadoPermiso({ estado, parcial, provisional }: BadgeEstadoProps) {
  let texto = 'Cargando...';
  let bg = '#E2E8F0';
  let color = '#334155';

  if (estado === 'concedido') {
    if (provisional) {
      texto = 'Provisional (iOS)';
      bg = '#E0F2FE';
      color = '#0369A1';
    } else if (parcial) {
      texto = 'Parcial / Limitado';
      bg = '#FEF3C7';
      color = '#B45309';
    } else {
      texto = 'Concedido';
      bg = '#DCFCE7';
      color = '#15803D';
    }
  } else if (estado === 'preguntable') {
    texto = 'Preguntable';
    bg = '#DBEAFE';
    color = '#1D4ED8';
  } else if (estado === 'bloqueado') {
    texto = 'Bloqueado';
    bg = '#FEE2E2';
    color = '#B91C1C';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{texto}</Text>
    </View>
  );
}

interface ExplicacionPermisoProps {
  recurso: RecursoPermiso;
  estado: EstadoPermiso;
  onContinuar: () => void;
  onAbrirAjustes: () => void;
  children?: React.ReactNode;
}

/**
 * Componente reutilizable de pantalla/bloque previo y estado bloqueado.
 * Cumple G2.6 y G6.1:
 * - Si el estado es 'preguntable' (canAskAgain: true) -> muestra el beneficio,
 *   un único botón "Continuar" (sin "Ahora no" ni "Cerrar") y la aclaración de Ajustes.
 * - Si el estado es 'bloqueado' (canAskAgain: false) -> muestra cómo habilitarlo en Ajustes
 *   según la plataforma actual (Android o iOS) y el botón cambia a "Abrir Ajustes".
 */
export function ExplicacionPermiso({
  recurso,
  estado,
  onContinuar,
  onAbrirAjustes,
  children,
}: ExplicacionPermisoProps) {
  const info = INFO_RECURSOS[recurso];
  const esBloqueado = estado === 'bloqueado';
  const caminoExacto =
    Platform.OS === 'ios' ? info.caminoAjustesIOS : info.caminoAjustesAndroid;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icono}>{info.icono}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{info.titulo}</Text>
          <Text style={styles.modulo}>{info.moduloExpo}</Text>
        </View>
        <BadgeEstadoPermiso estado={estado} />
      </View>

      <Text style={styles.beneficio}>{info.beneficio}</Text>

      {esBloqueado ? (
        <View style={styles.bloqueadoBox}>
          <Text style={styles.bloqueadoTitulo}>
            🔒 El permiso está bloqueado en este dispositivo ({Platform.OS})
          </Text>
          <Text style={styles.bloqueadoTexto}>
            El diálogo del sistema ya no puede mostrarse automáticamente. Para habilitarlo,
            seguí este camino en los Ajustes de tu teléfono:
          </Text>
          <Text style={styles.caminoTexto}>{caminoExacto}</Text>
          <Pressable style={[styles.boton, styles.botonAjustes]} onPress={onAbrirAjustes}>
            <Text style={styles.botonTexto}>Abrir Ajustes</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.previaBox}>
          <Text style={styles.aclaracionAjustes}>
            Podés cambiar esta decisión en cualquier momento desde los Ajustes del sistema.
          </Text>
          <Pressable style={styles.boton} onPress={onContinuar}>
            <Text style={styles.botonTexto}>Continuar</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.alternativaBox}>
        <Text style={styles.alternativaLabel}>Camino alternativo (sin permiso):</Text>
        <Text style={styles.alternativaTexto}>{info.alternativa}</Text>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icono: {
    fontSize: 30,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modulo: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  beneficio: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1E293B',
    fontWeight: '500',
  },
  previaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aclaracionAjustes: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  bloqueadoBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bloqueadoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  bloqueadoTexto: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  caminoTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
  },
  boton: {
    backgroundColor: '#0284C7',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonAjustes: {
    backgroundColor: '#DC2626',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  alternativaBox: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 2,
  },
  alternativaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  alternativaTexto: {
    fontSize: 13,
    color: '#334155',
  },
});

