import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { BadgeEstadoPermiso, ExplicacionPermiso } from '@/components/TarjetaPermiso';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import { usePermiso } from '@/hooks/usePermiso';
import { setAvisarmeAlResolver, useReportesStore } from '@/lib/reportes';

/**
 * Ruta /ajustes-app
 * Requisito G1 y G2.5:
 * Interruptor "Avisarme cuando se resuelva mi reporte".
 * El permiso de notificaciones se pide únicamente al activar el interruptor.
 * En Android crea el canal "reportes" antes de pedir.
 */
export default function AjustesAppScreen() {
  const colores = useColores();
  const { avisarmeAlResolver } = useReportesStore();
  const { estado, parcial, matiz, pedir, abrirAjustes } = usePermiso('notificaciones');
  const [mostrarPrevia, setMostrarPrevia] = useState(false);

  const interruptorActivo = avisarmeAlResolver && estado === 'concedido';

  const cambiarInterruptor = async (nuevoValor: boolean) => {
    if (!nuevoValor) {
      setAvisarmeAlResolver(false);
      setMostrarPrevia(false);
      return;
    }

    if (estado === 'concedido') {
      setAvisarmeAlResolver(true);
      return;
    }

    setMostrarPrevia(true);
  };

  const confirmarPedidoNotificaciones = async () => {
    const res = await pedir();
    if (res.estado === 'concedido') {
      setAvisarmeAlResolver(true);
      setMostrarPrevia(false);
    }
  };

  return (
    <Pantalla>
      <Titulo>Notificaciones</Titulo>
      <Parrafo>
        Configurá cómo querés enterarte cuando el equipo de mantenimiento resuelva un
        desperfecto que reportaste.
      </Parrafo>

      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.switchTitle, { color: colores.texto }]}>
              Avisarme cuando se resuelva mi reporte
            </Text>
            <Text style={[styles.switchSub, { color: colores.textoSecundario }]}>
              El permiso de notificaciones se solicita recién cuando activás este
              interruptor.
            </Text>
          </View>
          <Switch
            value={interruptorActivo}
            onValueChange={cambiarInterruptor}
            trackColor={{ false: colores.borde, true: colores.primarioSuave }}
            thumbColor={interruptorActivo ? colores.primario : '#F8FAFC'}
          />
        </View>

        <View style={[styles.statusRow, { borderTopColor: colores.borde }]}>
          <Text style={[styles.statusLabel, { color: colores.textoSecundario }]}>
            Estado del permiso:
          </Text>
          <BadgeEstadoPermiso estado={estado} parcial={parcial} />
        </View>
        {matiz ? (
          <Text style={[styles.matizText, { color: colores.primario }]}>
            Detalle: {matiz}
          </Text>
        ) : null}
      </View>

      {mostrarPrevia && estado !== 'concedido' ? (
        <ExplicacionPermiso
          recurso="notificaciones"
          estado={estado}
          onContinuar={confirmarPedidoNotificaciones}
          onAbrirAjustes={abrirAjustes}
        />
      ) : null}

      <Subtitulo>Camino alternativo</Subtitulo>
      <View
        style={[
          styles.card,
          { backgroundColor: colores.superficie, borderColor: colores.borde },
        ]}>
        <Text style={[styles.switchTitle, { color: colores.texto }]}>
          📬 Bandeja interna de avisos
        </Text>
        <Text style={[styles.switchSub, { color: colores.textoSecundario }]}>
          Si preferís no activar notificaciones o si el permiso está bloqueado, todos los
          avisos de resolución se guardan igual en la pestaña &quot;Avisos&quot; (/avisos).
        </Text>
        <Boton
          titulo="Ir a la Bandeja de Avisos (/avisos)"
          variante="secundario"
          icono="mail-outline"
          onPress={() => router.push('/avisos')}
        />
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  matizText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
