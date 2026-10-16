# 🍽️ Comedor IPF - Sistema de Pedidos y Gestión de Cocina

**Tecnicatura Superior en Desarrollo de Software Multiplataforma**  
*Instituto Politécnico Formosa*  
**Materia:** Taller Complementario - React Native II  
**Trabajo Práctico N° 2:** Expo Router (SDK 57) - Rutas, navegación, pilas y colas  
**Alumna:** Kiara Jarzinski  

---

## Justificación de `replace` vs `push` en el Flujo de Confirmación

En el flujo de navegación de la aplicación, al pasar de la pantalla modal de confirmación (`/confirmar`) a la pantalla del estado del turno (`/turno/[numero]`), se utiliza estrictamente el método **`router.replace`** en lugar de `router.push`.

### 1. Prevención de Pedidos Duplicados
Si se utilizara `router.push`, la pantalla de confirmación (`/confirmar`) permanecería guardada en la pila del `Stack` de navegación, justo por debajo de `/turno/[numero]`. Si el usuario presionara el botón "Atrás" (por gesto, botón físico del dispositivo o el botón del header), regresaría a la pantalla de confirmación de un pedido que **ya fue procesado, confirmado y encolado en la cocina**. Esto permitiría que el usuario toque nuevamente el botón de confirmación, generando una orden duplicada por error.

### 2. Mantenimiento de un Historial de Navegación Lógico
La pantalla modal de confirmación es un paso transitorio dentro del proceso de compra. Una vez que el pedido es enviado y encolado con éxito, dicha pantalla pierde su utilidad en el historial. Al utilizar `router.replace`, la pantalla de confirmación es sustituida en la pila por la pantalla del turno. De esta manera, si el usuario decide volver atrás desde la pantalla de su turno, regresa a una pantalla principal o al menú sin pasar nuevamente por la confirmación, asegurando una experiencia de usuario (UX) limpia y segura.   

<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/174b0880-f4c7-4da3-b09b-dad54afa7ab6" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/a2c803aa-f4ae-460b-b7f6-f4669cb4d0fa" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/a0cfe034-65fc-4340-ab04-2225080d88e4" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/8a1a09ef-3b03-45f3-949d-06dc00a98d66" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/71f45d8c-b137-4684-a4c9-52ba575d453e" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/fa4340b1-d1f2-44fe-97c8-6e6f9fe4f11b" />
<img width="1501" height="612" alt="image" src="https://github.com/user-attachments/assets/9eb8f91a-62b2-4017-866a-d8ec8e5afce5" />

## Deep Link de Prueba 
exp://10.254.196.109:8081/--/menu/7
Este enlace me llevó al plato número 7 
<img width="720" height="1600" alt="WhatsApp Image 2026-10-16 at 2 29 22 PM" src="https://github.com/user-attachments/assets/893bc306-dbe0-48cb-8a1c-6754e5420083" />




## Árbol de Carpetas de `src/app` y Navegadores (`_layout`)

```text
src/
└── app/
    ├── _layout.tsx                     --> [Stack Raíz] (Controla modales, rutas y Stack.Protected para cocina)
    ├── (tabs)/                         --> [Group] Grupo de pestañas principales
    │   ├── _layout.tsx                 --> [Tabs] Navegador de solapas inferior (js-tabs)
    │   ├── index.tsx                   --> / (Tab "Inicio": Saludo y accesos rápidos)
    │   ├── menu/                       
    │   │   ├── _layout.tsx             --> [Stack] Navegador Stack propio para la pestaña Menú
    │   │   ├── index.tsx               --> /menu (Lista de platos por categoría)
    │   │   └── [id].tsx                --> /menu/[id] (Detalle del plato)
    │   └── carrito/                    
    │       ├── _layout.tsx             --> [Stack] Navegador Stack propio para la pestaña Carrito
    │       ├── index.tsx               --> /carrito (Items, total, botón deshacer por Pila)
    │       └── nota.tsx                --> /carrito/nota (Aclaración para la cocina)
    ├── categorias/
    │   └── [categoria].tsx             --> /categorias/[categoria] (Stack raíz)
    ├── buscar.tsx                      --> /buscar?q=&categoria= (Stack raíz, lectura/escritura de URL sin apilar)
    ├── confirmar.tsx                   --> /confirmar (Stack raíz, presentation: "modal")
    ├── turno/
    │   └── [numero].tsx                --> /turno/[numero] (Stack raíz: número de turno y cola de espera)
    ├── login.tsx                       --> /login (Stack raíz, presentation: "modal", solo sin sesión)
    ├── cocina/                         --> [Folder] Sección protegida para personal de cocina
    │   ├── _layout.tsx                 --> [Drawer] Menú lateral deslizable (solo existe con sesión)
    │   ├── index.tsx                   --> /cocina (Frente de la Cola FIFO y botón "Atender siguiente")
    │   └── atendidos.tsx               --> /cocina/atendidos (Pila de pedidos procesados: tope a base)
    ├── ayuda/
    │   ├── index.tsx                   --> /ayuda (Índice del centro de ayuda)
    │   └── [...slug].tsx               --> /ayuda/... (Catch-all para artículos con profundidad variable)
    ├── pedido.tsx                      --> /pedido (Ruta antigua que ejecuta <Redirect href="/carrito"/>)
    └── +not-found.tsx                  --> Pantalla 404 (Muestra la URL inexistente)










