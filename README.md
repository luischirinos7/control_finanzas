# Sistema de Finanzas Personales

## Descripción del Proyecto
El Sistema de Finanzas Personales es una aplicación web tipo SPA (Single Page Application) desarrollada con HTML, CSS y JavaScript. Permite gestionar ingresos, gastos, categorías y movimientos, almacenando todo localmente mediante IndexedDB.

Su objetivo es ofrecer una herramienta ligera, rápida y completamente funcional sin uso de frameworks externos.

## Funcionalidades Principales

### Panel Principal (Dashboard)
- Muestra ingresos totales, gastos totales y balance general.
- Gráfico de distribución de gastos por categoría mediante Chart.js.
- Lista de últimos movimientos.
- Accesos rápidos a diferentes secciones.

### Gestión de Categorías
- Crear categorías con nombre, color y tipo (Ingreso o Gasto).
- Visualización con color asignado y tipo resaltado.
- Filtros: todas, solo ingresos, solo gastos y búsqueda textual.
- Eliminación de categorías y de sus movimientos asociados.

### Gestión de Movimientos
- Registrar ingresos o gastos con tipo, monto, fecha, categoría y descripción.
- Modal para crear y editar movimientos.
- Filtros por tipo, por categoría y por búsqueda.
- Actualización automática del dashboard al modificar los movimientos.

### Presupuestos
- Sección estructurada pero aún en desarrollo para implementar límites mensuales.

## Arquitectura y Modularización

El proyecto está dividido en módulos JavaScript independientes:

- **db.js** — Manejo de IndexedDB (crear, leer, actualizar, eliminar).
- **categorias.js** — Lógica relacionada con categorías.
- **movimientos.js** — Control del modal, creación, edición y filtrado de movimientos.
- **dashboard.js** — Cálculos y gráficos del panel principal.
- **navegacion.js** — Cambios entre secciones del sitio tipo SPA.
- **Style.css** — Estilos generales.

Cada archivo maneja una parte específica del sistema para mantener claridad y facilidad de mantenimiento.

## Base de Datos — IndexedDB

La aplicación usa una base de datos llamada **FinanzasDB** con tres almacenes:

- categorias
- movimientos
- presupuestos

Proporciona operaciones básicas CRUD sin requerir conexión a un servidor.

## Cómo Ejecutarlo
1. Clonar el repositorio:
   git clone https://github.com/luischirinos7/control_finanzas

2. Abrir el archivo:
   index.html

3. Tambien puedes usar el link de vercel: https://vercel.com/luis-chirinos-projects/control-finanzas

No requiere instalación adicional ni servidor.
