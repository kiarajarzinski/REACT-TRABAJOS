import React from 'react';
import { type ColorValue, Text } from 'react-native';

export type NombreIcono =
  | 'home'
  | 'construct'
  | 'mail'
  | 'mail-outline'
  | 'shield-checkmark'
  | 'shield-checkmark-outline'
  | 'notifications-outline'
  | 'notifications-circle-outline'
  | 'settings-outline'
  | 'arrow-forward'
  | 'chevron-forward'
  | 'lock-closed'
  | 'add-circle-outline'
  | 'images-outline'
  | 'help-circle-outline'
  | 'camera-outline'
  | 'qr-code-outline'
  | 'location-outline'
  | 'checkmark-circle-outline';

const MAPA_ICONOS: Record<NombreIcono, string> = {
  home: '🏠',
  construct: '🛠️',
  mail: '📬',
  'mail-outline': '✉️',
  'shield-checkmark': '🛡️',
  'shield-checkmark-outline': '🔐',
  'notifications-outline': '🔔',
  'notifications-circle-outline': '🔕',
  'settings-outline': '⚙️',
  'arrow-forward': '→',
  'chevron-forward': '›',
  'lock-closed': '🔒',
  'add-circle-outline': '＋',
  'images-outline': '🖼️',
  'help-circle-outline': '❓',
  'camera-outline': '📷',
  'qr-code-outline': '🔳',
  'location-outline': '📍',
  'checkmark-circle-outline': '✓',
};

export function Icono({
  name,
  size = 18,
  color,
}: {
  name: NombreIcono;
  size?: number;
  color?: ColorValue;
}) {
  return (
    <Text
      style={{
        fontSize: size,
        color,
        lineHeight: size + 4,
        fontWeight: '700',
      }}>
      {MAPA_ICONOS[name] ?? '•'}
    </Text>
  );
}
