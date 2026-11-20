import { Redirect } from 'expo-router';

/**
 * Requisito A1:
 * URL vieja (/reserva) de la versión anterior: redirige a /reservas.
 */
export default function RedireccionReservaVieja() {
  return <Redirect href="/reservas" />;
}
