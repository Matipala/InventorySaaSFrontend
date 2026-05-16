# InventorySaaS - Frontend

Plataforma moderna de gestión de inventarios y ventas diseñada para ofrecer una experiencia fluida y eficiente en la administración de activos empresariales.

## Descripción breve
El frontend de **InventorySaaS** es una Single Page Application (SPA) responsiva que permite a las empresas gestionar sus almacenes, productos, movimientos de stock y realizar ventas a través de un Punto de Venta (PDV) integrado, todo con actualizaciones en tiempo real y una interfaz intuitiva.

## Alcance funcional implementado
El sistema cubre el ciclo de vida completo de la gestión de inventarios, desde la recepción de mercancía hasta la venta final al cliente, incluyendo procesos de auditoría y visualización de datos clave.

## Lista de funcionalidades desarrolladas
- **Dashboard Operativo:** Visualización de métricas clave y alertas de stock bajo.
- **Gestión Multi-almacén:** Control centralizado de múltiples ubicaciones físicas.
- **Punto de Venta (PDV):** Interfaz optimizada para facturación rápida y gestión de pedidos.
- **Kitchen Display System (KDS):** Monitorización de pedidos en tiempo real para entornos de producción/cocina.
- **Control de Inventario:**
  - Gestión de productos, categorías y unidades de medida.
  - Registro de movimientos de entrada, salida y transferencias entre almacenes.
- **Administración de Clientes:** Directorio centralizado para seguimiento de ventas.
- **Configuración de Empresa:** Personalización de datos fiscales y parámetros del sistema.

## 🛠️ Tecnologías utilizadas
- **Framework:** [Next.js 15](https://nextjs.org/)
- **Lenguaje:** JavaScript / React 19
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)

## Instrucciones de ejecución

### Requisitos previos
- Node.js 18.x o superior
- NPM o Yarn

### Backends (Docker)
Si vas a consumir las APIs locales, levanta los backends con Docker desde la raiz del workspace:
```bash
docker compose up --build
```
Esto publica Inventario en http://localhost:0000 y Ventas en http://localhost:0000.

### Pasos para iniciar el proyecto
1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env.local` y configura las URLs de las APIs correspondientes.
   ```bash
   cp .env.example .env.local
   ```
3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 📂 Estructura general del repositorio
```text
src/
├── app/            # Rutas y layouts (Next.js App Router)
│   ├── (main)/     # Vistas principales del sistema
│   └── globals.css # Estilos globales
├── components/     # Componentes de UI reutilizables
├── hooks/          # Hooks personalizados de React
├── services/       # Llamadas a la API y lógica de comunicación
├── lib/            # Funciones de utilidad y configuración
└── public/         # Archivos estáticos y activos
```
