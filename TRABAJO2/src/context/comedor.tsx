import { createContext, use, useRef, useState, type ReactNode } from 'react';

import type { Plato } from '@/data/platos';
import { Cola } from '@/estructuras/Cola';
import { Pila } from '@/estructuras/Pila';

const USUARIO_COCINA = 'cocina';
const CLAVE_COCINA = 'ipf2026';

export type ItemCarrito = { uid: number; plato: Plato };

export type Pedido = {
  numero: number;
  items: Plato[];
  total: number;
  nota: string;
};

type Comedor = {
  usuario: string | null;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  carrito: ItemCarrito[];
  total: number;
  nota: string;
  setNota: (texto: string) => void;
  agregarAlCarrito: (plato: Plato) => void;
  puedeDeshacer: boolean;
  deshacerUltimo: () => void;
  confirmarPedido: () => number | null;
  pedidosEnCola: Pedido[];
  atenderSiguiente: () => Pedido | null;
  posicionEnCola: (numero: number) => number;
  atendidos: Pedido[];
};

const ComedorContext = createContext<Comedor | null>(null);

export function ComedorProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [nota, setNota] = useState('');

  const [pilaDeshacer] = useState(() => new Pila<ItemCarrito>());
  const [colaPedidos] = useState(() => new Cola<Pedido>());
  const [pilaAtendidos] = useState(() => new Pila<Pedido>());

  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [deshacerTamanio, setDeshacerTamanio] = useState(0);
  const [pedidosEnCola, setPedidosEnCola] = useState<Pedido[]>([]);
  const [atendidos, setAtendidos] = useState<Pedido[]>([]);

  const contadorItems = useRef(0);
  const contadorPedidos = useRef(0);

  const total = carrito.reduce((suma, item) => suma + item.plato.precio, 0);

  const iniciarSesion = (nombre: string, clave: string) => {
    if (nombre.trim().toLowerCase() === USUARIO_COCINA && clave === CLAVE_COCINA) {
      setUsuario(USUARIO_COCINA);
      return true;
    }
    return false;
  };

  const cerrarSesion = () => setUsuario(null);

  const agregarAlCarrito = (plato: Plato) => {
    const item: ItemCarrito = { uid: ++contadorItems.current, plato };
    setCarrito((anterior) => [...anterior, item]);
    pilaDeshacer.push(item);
    setDeshacerTamanio(pilaDeshacer.tamanio);
  };

  const deshacerUltimo = () => {
    const ultimo = pilaDeshacer.pop();
    if (!ultimo) return;
    setCarrito((anterior) => anterior.filter((item) => item.uid !== ultimo.uid));
    setDeshacerTamanio(pilaDeshacer.tamanio);
  };

  const confirmarPedido = () => {
    if (carrito.length === 0) return null;

    const pedido: Pedido = {
      numero: ++contadorPedidos.current,
      items: carrito.map((item) => item.plato),
      total,
      nota: nota.trim(),
    };

    colaPedidos.encolar(pedido);
    setPedidosEnCola(colaPedidos.aArray());

    while (!pilaDeshacer.vacia) pilaDeshacer.pop();
    setDeshacerTamanio(0);
    setCarrito([]);
    setNota('');

    return pedido.numero;
  };

  const atenderSiguiente = () => {
    const pedido = colaPedidos.desencolar();
    if (!pedido) return null;

    pilaAtendidos.push(pedido);
    setPedidosEnCola(colaPedidos.aArray());
    setAtendidos(pilaAtendidos.aArray().reverse());
    return pedido;
  };

  const posicionEnCola = (numero: number) =>
    pedidosEnCola.findIndex((pedido) => pedido.numero === numero);

  const valor: Comedor = {
    usuario,
    iniciarSesion,
    cerrarSesion,
    carrito,
    total,
    nota,
    setNota,
    agregarAlCarrito,
    puedeDeshacer: deshacerTamanio > 0,
    deshacerUltimo,
    confirmarPedido,
    pedidosEnCola,
    atenderSiguiente,
    posicionEnCola,
    atendidos,
  };

  return <ComedorContext value={valor}>{children}</ComedorContext>;
}

export function useComedor() {
  const comedor = use(ComedorContext);
  if (!comedor) {
    throw new Error('useComedor debe usarse dentro de <ComedorProvider>');
  }
  return comedor;
}