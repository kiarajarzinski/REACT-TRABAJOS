import { router, Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Icono } from '@/components/icono';
import { useColores } from '@/hooks/use-colores';
import { useReportesStore } from '@/lib/reportes';

export default function TabsLayout() {
  const colores = useColores();
  const { avisos } = useReportesStore();
  const sinLeer = avisos.filter((a) => !a.leido).length;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
        },
        headerRight: () => (
          <Pressable
            style={({ pressed }) => [
              styles.headerBtn,
              {
                backgroundColor: colores.primarioSuave,
                borderColor: colores.borde,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.push('/ajustes-app')}>
            <Icono name="notifications-outline" size={15} color={colores.primario} />
            <Text style={[styles.headerBtnText, { color: colores.primario }]}>
              Ajustes
            </Text>
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <Icono name="construct" size={size - 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarBadge: sinLeer > 0 ? sinLeer : undefined,
          tabBarIcon: ({ color, size }) => (
            <Icono name="mail" size={size - 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="permisos"
        options={{
          title: 'Permisos',
          tabBarIcon: ({ color, size }) => (
            <Icono name="shield-checkmark" size={size - 4} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    marginRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
