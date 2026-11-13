import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Icono } from '@/components/icono';
import { Pantalla } from '@/components/pantalla';
import { Parrafo, Subtitulo, Titulo } from '@/components/texto';
import { useColores } from '@/hooks/use-colores';
import {
  CategoriaReporte,
  EstadoReporte,
  limpiarBorrador,
  Reporte,
  useReportesStore,
} from '@/lib/reportes';

const ICONO_CATEGORIA: Record<CategoriaReporte, string> = {
  electricidad: '⚡ Electricidad',
  agua: '💧 Agua / Plomería',
  mobiliario: '🪑 Mobiliario',
  equipos: '📽️ Equipos / Proyector',
};

export default function InicioReportesScreen() {
  const colores = useColores();
  const { reportes } = useReportesStore();

  const irANuevoReporte = () => {
    limpiarBorrador();
    router.push('/reporte/nuevo' as Href);
  };

  const obtenerEstiloEstado = (estado: EstadoReporte) => {
    if (estado === 'resuelto') {
      return { texto: 'Resuelto', bg: colores.exitoSuave, color: colores.exito };
    }
    if (estado === 'en_curso') {
      return { texto: 'En curso', bg: colores.primarioSuave, color: colores.primario };
    }
    return { texto: 'Pendiente', bg: colores.alertaSuave, color: colores.alerta };
  };

  return (
    <Pantalla>
      <Titulo>Mantenimiento IPF</Titulo>
      <Parrafo>
        Reportá desperfectos del edificio (aulas, laboratorios y sectores) y recibí un
        aviso cuando se resuelvan. Ningún permiso se pide al abrir la app.
      </Parrafo>

      <Boton
        titulo="Nuevo reporte"
        variante="primario"
        icono="add-circle-outline"
        onPress={irANuevoReporte}
      />

      <Subtitulo>Mis reportes ({reportes.length})</Subtitulo>

      {reportes.map((item: Reporte) => {
        const est = obtenerEstiloEstado(item.estado);
        return (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/reporte/${item.id}` as Href)}
            style={({ pressed }) => [
              styles.tarjeta,
              {
                backgroundColor: colores.superficie,
                borderColor: colores.borde,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <View style={styles.cuerpo}>
              <View style={styles.cardHeader}>
                <Text style={[styles.categoriaTag, { color: colores.primario }]}>
                  {ICONO_CATEGORIA[item.categoria]}
                </Text>
                <View style={[styles.estadoBadge, { backgroundColor: est.bg }]}>
                  <Text style={[styles.estadoText, { color: est.color }]}>
                    {est.texto}
                  </Text>
                </View>
              </View>

              <Text style={[styles.nombre, { color: colores.texto }]}>{item.titulo}</Text>
              <Text
                style={[styles.descripcion, { color: colores.textoSecundario }]}
                numberOfLines={2}>
                {item.descripcion}
              </Text>

              <View style={[styles.metaRow, { borderTopColor: colores.borde }]}>
                <Text
                  style={[
                    styles.metaItem,
                    {
                      backgroundColor: colores.primarioSuave,
                      color: colores.primario,
                    },
                  ]}>
                  🚪 {item.aula}
                </Text>
                {item.sector ? (
                  <Text
                    style={[
                      styles.metaItem,
                      {
                        backgroundColor: colores.fondo,
                        color: colores.textoSecundario,
                      },
                    ]}>
                    📍 {item.sector}
                  </Text>
                ) : null}
                <Text style={[styles.fecha, { color: colores.textoSecundario }]}>
                  {item.creadoEn}
                </Text>
              </View>
            </View>
            <Icono name="chevron-forward" size={20} color={colores.textoSecundario} />
          </Pressable>
        );
      })}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cuerpo: {
    flex: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriaTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  metaItem: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fecha: {
    fontSize: 12,
    marginLeft: 'auto',
  },
});
