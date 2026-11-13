import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Icono } from '@/components/icono';
import { Parrafo } from '@/components/texto';
import { FuenteMono } from '@/constants/theme';
import { useColores } from '@/hooks/use-colores';
import { EstadoPermiso, INFO_RECURSOS, RecursoPermiso } from '@/lib/permisos';

interface BadgeEstadoProps {
  estado: EstadoPermiso;
  parcial?: boolean;
}

export function BadgeEstadoPermiso({ estado, parcial }: BadgeEstadoProps) {
  const colores = useColores();

  let texto = 'Cargando...';
  let bg = colores.borde;
  let color = colores.textoSecundario;

  if (estado === 'concedido') {
    if (parcial) {
      texto = 'Parcial / Limitado';
      bg = colores.alertaSuave;
      color = colores.alerta;
    } else {
      texto = 'Concedido';
      bg = colores.exitoSuave;
      color = colores.exito;
    }
  } else if (estado === 'preguntable') {
    texto = 'Preguntable';
    bg = colores.primarioSuave;
    color = colores.primario;
  } else if (estado === 'bloqueado') {
    texto = 'Bloqueado';
    bg = colores.peligroSuave;
    color = colores.peligro;
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
 * - Si el estado es 'bloqueado' (canAskAgain: false) -> explica cómo habilitarlo en Ajustes
 *   y el botón pasa a ser "Abrir Ajustes".
 */
export function ExplicacionPermiso({
  recurso,
  estado,
  onContinuar,
  onAbrirAjustes,
  children,
}: ExplicacionPermisoProps) {
  const colores = useColores();
  const info = INFO_RECURSOS[recurso];
  const esBloqueado = estado === 'bloqueado';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colores.superficie, borderColor: colores.borde },
      ]}>
      <View style={styles.headerRow}>
        <Text style={styles.icono}>{info.icono}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, { color: colores.texto }]}>{info.titulo}</Text>
          <Text style={[styles.modulo, { color: colores.textoSecundario }]}>
            {info.moduloExpo}
          </Text>
        </View>
        <BadgeEstadoPermiso estado={estado} />
      </View>

      <Parrafo style={{ color: colores.texto, fontWeight: '500' }}>
        {info.beneficio}
      </Parrafo>

      {esBloqueado ? (
        <View
          style={[
            styles.bloqueadoBox,
            { backgroundColor: colores.peligroSuave, borderColor: colores.peligro },
          ]}>
          <View style={styles.rowIcon}>
            <Icono name="lock-closed" size={16} color={colores.peligro} />
            <Text style={[styles.bloqueadoTitulo, { color: colores.peligro }]}>
              Permiso bloqueado
            </Text>
          </View>
          <Text style={[styles.bloqueadoTexto, { color: colores.texto }]}>
            El permiso fue denegado y el diálogo del sistema ya no se mostrará
            automáticamente. Podés habilitarlo manualmente entrando a los Ajustes de la
            aplicación en tu teléfono.
          </Text>
          <Boton
            titulo="Abrir Ajustes"
            variante="peligro"
            icono="settings-outline"
            onPress={onAbrirAjustes}
          />
        </View>
      ) : (
        <View
          style={[
            styles.previaBox,
            { backgroundColor: colores.fondo, borderColor: colores.borde },
          ]}>
          <Text style={[styles.aclaracionAjustes, { color: colores.textoSecundario }]}>
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

      <View style={[styles.alternativaBox, { borderTopColor: colores.borde }]}>
        <Text style={[styles.alternativaLabel, { color: colores.primario }]}>
          Camino alternativo (sin permiso):
        </Text>
        <Text style={[styles.alternativaTexto, { color: colores.textoSecundario }]}>
          {info.alternativa}
        </Text>
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
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icono: {
    fontSize: 28,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
  },
  modulo: {
    fontSize: 12,
    fontFamily: FuenteMono,
  },
  previaBox: {
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  aclaracionAjustes: {
    fontSize: 13,
    lineHeight: 18,
  },
  bloqueadoBox: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  bloqueadoTitulo: {
    fontSize: 14,
    fontWeight: '700',
  },
  bloqueadoTexto: {
    fontSize: 13,
    lineHeight: 18,
  },
  alternativaBox: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 2,
  },
  alternativaLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alternativaTexto: {
    fontSize: 13,
    lineHeight: 19,
  },
});
