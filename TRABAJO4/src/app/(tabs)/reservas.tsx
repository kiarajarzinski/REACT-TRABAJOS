import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Boton } from '../../components/Boton';
import { ExplicacionPermiso } from '../../components/ExplicacionPermiso';
import { Pantalla } from '../../components/Pantalla';
import { Parrafo } from '../../components/Parrafo';
import { Subtitulo } from '../../components/Subtitulo';
import { Titulo } from '../../components/Titulo';
import {
  AreaTactilMinima,
  Colores,
  Espaciados,
  Radios,
  TamaniosTexto,
} from '../../constants/tema';
import { NOMBRE_ESTUDIANTE, useBiblioteca } from '../../context/biblioteca';
import { LIBROS } from '../../data/libros';
import { usePermiso } from '../../hooks/usePermiso';

/**
 * Ruta /reservas (Tab "Mis reservas").
 * Requisitos A1, A3.7, A3.8 y Parte C4:
 * - Muestra préstamos activos (fecha de devolución, interruptor "Recordarme" y "Devolver").
 * - El permiso de notificaciones se pide únicamente al activar "Recordarme".
 * - Muestra reservas en lista de espera con la posición actual en la Cola.
 * - Muestra los avisos internos cuando el permiso de notificaciones está denegado.
 * - Usa AppState (dentro de usePermiso) + useFocusEffect para mantener actualizado el permiso.
 */
export default function MisReservasScreen() {
  const {
    prestamos,
    listasEspera,
    avisos,
    devolverLibro,
    activarRecordatorio,
    desactivarRecordatorio,
    marcarAvisoLeido,
  } = useBiblioteca();

  const { estado, pedir, abrirAjustes, recargar } = usePermiso('notificaciones');
  const [isbnPendientePermiso, setIsbnPendientePermiso] = useState<string | null>(
    null,
  );
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  const misReservasEspera = Object.entries(listasEspera)
    .map(([isbn, cola]) => {
      const posicion = cola.aArray().indexOf(NOMBRE_ESTUDIANTE);
      if (posicion === -1) return null;
      const libro = LIBROS.find((l) => l.isbn === isbn);
      if (!libro) return null;
      return { libro, posicion: posicion + 1, total: cola.tamanio };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const manejarSwitchRecordatorio = async (
    isbn: string,
    tituloLibro: string,
    nuevoValor: boolean,
  ) => {
    setMensajeEstado(null);

    if (!nuevoValor) {
      await desactivarRecordatorio(isbn);
      setIsbnPendientePermiso(null);
      setMensajeEstado(`Recordatorio cancelado para "${tituloLibro}".`);
      return;
    }

    if (estado === 'concedido') {
      const ok = await activarRecordatorio(isbn, tituloLibro);
      if (ok) {
        setMensajeEstado(
          `Recordatorio programado para "${tituloLibro}" (modo demo: llegará en 15 segundos).`,
        );
      }
      return;
    }

    setIsbnPendientePermiso(isbn);
  };

  const confirmarPermisoNotificaciones = async () => {
    const res = await pedir();
    if (res.estado === 'concedido' && isbnPendientePermiso) {
      const libro = LIBROS.find((l) => l.isbn === isbnPendientePermiso);
      if (libro) {
        await activarRecordatorio(libro.isbn, libro.titulo);
        setMensajeEstado(
          `Recordatorio programado para "${libro.titulo}" (modo demo: llegará en 15 segundos).`,
        );
      }
      setIsbnPendientePermiso(null);
    }
  };

  const manejarDevolver = async (isbn: string, tituloLibro: string) => {
    await devolverLibro(isbn);
    if (isbnPendientePermiso === isbn) {
      setIsbnPendientePermiso(null);
    }
    setMensajeEstado(
      `Devolviste "${tituloLibro}". Si tenía un recordatorio activo, también fue cancelado.`,
    );
  };

  return (
    <Pantalla>
      <Titulo>Mis reservas</Titulo>
      <Parrafo>
        Gestioná tus préstamos activos, tu lugar en las listas de espera y los avisos de
        la biblioteca.
      </Parrafo>

      <View style={styles.estadoNotifCaja}>
        <Text style={styles.estadoNotifTexto}>
          Permiso de notificaciones:{' '}
          <Text style={styles.estadoNotifValor}>{estado}</Text>
        </Text>
      </View>

      {mensajeEstado ? (
        <View style={styles.feedbackCaja}>
          <Text style={styles.feedbackTexto}>{mensajeEstado}</Text>
        </View>
      ) : null}

      {isbnPendientePermiso && estado !== 'concedido' ? (
        <ExplicacionPermiso
          recurso="notificaciones"
          estado={estado}
          onContinuar={confirmarPermisoNotificaciones}
          onAbrirAjustes={abrirAjustes}
        />
      ) : null}

      <Subtitulo>Mis préstamos ({prestamos.length})</Subtitulo>
      {prestamos.length === 0 ? (
        <View style={styles.cajaVacia}>
          <Parrafo>Todavía no tenés libros en préstamo.</Parrafo>
          <Boton
            titulo="Explorar Catálogo"
            variante="secundario"
            icono="book-outline"
            onPress={() => router.push('/index')}
          />
        </View>
      ) : (
        prestamos.map((prestamo) => {
          const libro = LIBROS.find((l) => l.isbn === prestamo.isbn);
          if (!libro) return null;

          return (
            <View key={prestamo.isbn} style={styles.tarjeta}>
              <Text style={styles.tituloLibro}>{libro.titulo}</Text>
              <Text style={styles.subdato}>
                {libro.autor} · Devolver antes del {prestamo.fechaDevolucion}
              </Text>

              <View style={styles.filaSwitch}>
                <View style={styles.switchTextos}>
                  <Text style={styles.switchTitulo}>Recordarme</Text>
                  <Text style={styles.switchDetalle}>
                    Notificación local en 15 segundos (canal &quot;prestamos&quot;)
                  </Text>
                </View>
                <Switch
                  value={prestamo.recordatorioActivo}
                  onValueChange={(val) =>
                    void manejarSwitchRecordatorio(libro.isbn, libro.titulo, val)
                  }
                  accessibilityLabel={`Activar recordatorio para ${libro.titulo}`}
                  trackColor={{
                    false: Colores.borde,
                    true: Colores.primarioSuave,
                  }}
                  thumbColor={
                    prestamo.recordatorioActivo ? Colores.primario : Colores.superficie
                  }
                />
              </View>

              <Boton
                titulo="Devolver libro"
                variante="secundario"
                icono="return-down-back-outline"
                onPress={() => void manejarDevolver(libro.isbn, libro.titulo)}
              />
            </View>
          );
        })
      )}

      <Subtitulo>En lista de espera ({misReservasEspera.length})</Subtitulo>
      {misReservasEspera.length === 0 ? (
        <View style={styles.cajaVacia}>
          <Parrafo>No estás anotado en ninguna lista de espera.</Parrafo>
        </View>
      ) : (
        misReservasEspera.map(({ libro, posicion, total }) => (
          <Pressable
            key={libro.isbn}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${libro.titulo}, posición ${posicion} de ${total}`}
            onPress={() =>
              router.push({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } })
            }
            style={({ pressed }) => [styles.tarjeta, pressed ? styles.presionada : null]}>
            <Text style={styles.tituloLibro}>{libro.titulo}</Text>
            <Text style={styles.subdato}>{libro.autor}</Text>
            <View style={styles.badgePosicion}>
              <Text style={styles.badgePosicionTexto}>
                Tu posición en la cola: #{posicion} de {total}
              </Text>
            </View>
          </Pressable>
        ))
      )}

      <Subtitulo>Avisos dentro de la app ({avisos.length})</Subtitulo>
      {avisos.length === 0 ? (
        <View style={styles.cajaVacia}>
          <Parrafo>
            No tenés avisos pendientes. Si desactivás las notificaciones, los avisos de
            entrega del mostrador aparecerán acá.
          </Parrafo>
        </View>
      ) : (
        avisos.map((aviso) => (
          <Pressable
            key={aviso.id}
            accessibilityRole="button"
            accessibilityLabel={`Marcar como leído el aviso ${aviso.titulo}`}
            onPress={() => marcarAvisoLeido(aviso.id)}
            style={({ pressed }) => [
              styles.tarjetaAviso,
              !aviso.leido ? styles.avisoNoLeido : null,
              pressed ? styles.presionada : null,
            ]}>
            <Text style={styles.tituloLibro}>{aviso.titulo}</Text>
            <Text style={styles.subdato}>{aviso.mensaje}</Text>
            <Text style={styles.fechaAviso}>{aviso.fecha}</Text>
          </Pressable>
        ))
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  estadoNotifCaja: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
  },
  estadoNotifTexto: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
  },
  estadoNotifValor: {
    fontWeight: '700',
    color: Colores.primario,
  },
  feedbackCaja: {
    backgroundColor: Colores.exitoSuave,
    borderColor: Colores.exito,
    borderWidth: 1,
    borderRadius: Radios.md,
    padding: Espaciados.md,
  },
  feedbackTexto: {
    fontSize: TamaniosTexto.sm,
    fontWeight: '600',
    color: Colores.exito,
  },
  tarjeta: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.sm,
  },
  tarjetaAviso: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    minHeight: AreaTactilMinima,
    gap: Espaciados.xs,
  },
  avisoNoLeido: {
    backgroundColor: Colores.primarioSuave,
    borderColor: Colores.primario,
  },
  presionada: {
    opacity: 0.85,
  },
  tituloLibro: {
    fontSize: TamaniosTexto.md + 1,
    fontWeight: '700',
    color: Colores.texto,
  },
  subdato: {
    fontSize: TamaniosTexto.sm,
    color: Colores.textoSecundario,
    lineHeight: 19,
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Espaciados.md,
    paddingVertical: Espaciados.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colores.borde,
  },
  switchTextos: {
    flex: 1,
    gap: 2,
  },
  switchTitulo: {
    fontSize: TamaniosTexto.md,
    fontWeight: '700',
    color: Colores.texto,
  },
  switchDetalle: {
    fontSize: TamaniosTexto.xs,
    color: Colores.textoSecundario,
  },
  badgePosicion: {
    alignSelf: 'flex-start',
    backgroundColor: Colores.alertaSuave,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radios.pill,
  },
  badgePosicionTexto: {
    fontSize: TamaniosTexto.xs,
    fontWeight: '700',
    color: Colores.alerta,
  },
  fechaAviso: {
    fontSize: TamaniosTexto.xs,
    color: Colores.textoSecundario,
    marginTop: Espaciados.xs,
  },
  cajaVacia: {
    backgroundColor: Colores.superficie,
    borderColor: Colores.borde,
    borderWidth: 1,
    borderRadius: Radios.lg,
    padding: Espaciados.lg,
    gap: Espaciados.md,
  },
});
