export type Categoria = 'desayuno' | 'almuerzo' | 'bebidas' | 'kiosco';

export type Plato = {
  id: string;
  nombre: string;
  categoria: Categoria;
  precio: number;
  descripcion: string;
};

export const categorias: { id: Categoria; nombre: string }[] = [
  { id: 'desayuno', nombre: 'Desayuno' },
  { id: 'almuerzo', nombre: 'Almuerzo' },
  { id: 'bebidas', nombre: 'Bebidas' },
  { id: 'kiosco', nombre: 'Kiosco' },
];

export const platos: Plato[] = [
  // ---- Desayuno ----
  { id: '1', nombre: 'Café con leche y medialunas', categoria: 'desayuno', precio: 2800, descripcion: 'Café con leche y dos medialunas de manteca.' },
  { id: '2', nombre: 'Tostado de jamón y queso', categoria: 'desayuno', precio: 3500, descripcion: 'Pan de miga tostado con jamón cocido y queso.' },
  { id: '3', nombre: 'Yogur con cereales', categoria: 'desayuno', precio: 2200, descripcion: 'Yogur natural con cereales y un toque de miel.' },

  // ---- Almuerzo ----
  { id: '4', nombre: 'Milanesa con puré', categoria: 'almuerzo', precio: 6500, descripcion: 'Milanesa de pechuga con puré de papas casero.' },
  { id: '5', nombre: 'Fideos con tuco', categoria: 'almuerzo', precio: 5200, descripcion: 'Fideos al dente con salsa de tomate y queso rallado.' },
  { id: '6', nombre: 'Empanadas (3 unidades)', categoria: 'almuerzo', precio: 4500, descripcion: 'Horneadas, de carne molida.' },
  { id: '7', nombre: 'Ensalada completa', categoria: 'almuerzo', precio: 4000, descripcion: 'Lechuga, tomate, zanahoria, huevo y choclo.' },

  // ---- Bebidas ----
  { id: '8', nombre: 'Agua mineral', categoria: 'bebidas', precio: 1200, descripcion: 'Botella de 500 ml, sin gas.' },
  { id: '9', nombre: 'Jugo de naranja', categoria: 'bebidas', precio: 1800, descripcion: 'Exprimido en el momento.' },
  { id: '10', nombre: 'Gaseosa', categoria: 'bebidas', precio: 1500, descripcion: 'Línea cola o lima-limón, vaso de 400 ml.' },
  { id: '11', nombre: 'Mate cocido', categoria: 'bebidas', precio: 1000, descripcion: 'Caliente, con o sin azúcar.' },

  // ---- Kiosco ----
  { id: '12', nombre: 'Alfajor', categoria: 'kiosco', precio: 1000, descripcion: 'Alfajor de dulce de leche.' },
  { id: '13', nombre: 'Chipá (porción)', categoria: 'kiosco', precio: 2000, descripcion: 'Seis chipás recién horneados.' },
  { id: '14', nombre: 'Barrita de cereal', categoria: 'kiosco', precio: 900, descripcion: 'Barrita de cereal con frutos secos.' },
];

export const formatearPrecio = (precio: number) => `$ ${precio.toLocaleString('es-AR')}`;

export const esCategoria = (valor: unknown): valor is Categoria =>
  categorias.some((c) => c.id === valor);

export const buscarPlato = (id: string | undefined) => platos.find((p) => p.id === id);