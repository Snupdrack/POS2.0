# 🍕 Nito's Pizza - POS 2.0

Sistema completo de gestión para restaurante con 4 subsistemas interconectados:
- **Menú Digital** (PWA para clientes)
- **Panel de Administración** (gestión completa)
- **Punto de Venta (POS)** (caja y cocina)
- **Base de Datos** (Prisma + SQLite)

## 🚀 Despliegue

### Local
```bash
bun install
bun run db:push
bun run db:seed
bun run dev
```

### Railway
1. Subir repositorio a GitHub
2. Conectar en [railway.app](https://railway.app)
3. Variables de entorno:
```
DATABASE_URL=file:./db/nitos.db
NEXTAUTH_SECRET=nitos-pizza-secret-key-2026
NEXTAUTH_URL=https://tu-app.up.railway.app
PORT=3000
MERCADOPAGO_ACCESS_TOKEN=tu_token
MERCADOPAGO_PUBLIC_KEY=tu_key
```

## 🔐 Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@nitopos.com | admin123 |
| Caja | caja@nitopos.com | caja123 |
| Cocina | cocina@nitopos.com | cocina123 |

## 📋 Rutas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Landing page | Público |
| `/menu` | Menú digital (sin acceso a POS) | Público |
| `/login` | Inicio de sesión | Personal |
| `/pos` | Punto de Venta (Caja) | Admin + Caja |
| `/kitchen` | Pantalla de Cocina (KDS) | Admin + Cocina |
| `/admin` | Dashboard Administrativo | Solo Admin |

## 🧩 Módulos

### A. Menú Digital (Frontend Cliente)
- Catálogo de productos con imágenes y precios
- Variantes (tamaños: Individual/Mediana/Grande/Familiar)
- Filtros por categoría
- Carrito de compras con edición
- Pedido por WhatsApp
- Sistema de reservas (fecha, hora, mesa, personas)
- QR dinámico por mesa
- Sin acceso al POS o administración

### B. Panel de Administración
- Dashboard con estadísticas y gráficas
- Gestión de productos con variantes y disponibilidad
- Gestión de categorías
- Gestión de pedidos (estados, cancelaciones)
- Gestión de reservas (confirmar, cancelar, no-show)
- Gestión de mesas (estados, áreas)
- Gestión de usuarios (ADMIN, CAJA, KITCHEN)
- Configuración del negocio (datos, zonas de reparto, impuestos)
- Reportes de ventas

### C. Punto de Venta (POS)
- **Módulo Caja**: Pedidos rápidos, categorías, carrito, tipos de orden, métodos de pago, descuentos, selección de mesa
- **Módulo Cocina (KDS)**: 3 columnas (Pendientes/Preparación/Listos), alertas sonoras, actualización de estado
- Cancelaciones: Caja solicita, Admin aprueba
- Eliminación de órdenes: Solo Admin

### D. Base de Datos
- Products, Variants, Categories
- Orders, OrderItems
- Tables, Reservations
- Users (3 roles)
- Business, DeliveryZones

## 🔌 Integraciones
- **MercadoPago**: Pasarela de pagos
- **Socket.io**: Actualizaciones en tiempo real
- **WhatsApp**: Pedidos directos
- **Impresión térmica**: Preparado para esc-pos

## 🛠️ Tech Stack
- Next.js 16 + React 19 + TypeScript
- Prisma ORM + SQLite
- NextAuth v4 (JWT)
- shadcn/ui + Tailwind CSS 4
- Framer Motion + Recharts
- Socket.io + Zustand
- MercadoPago SDK

## 📞 Contacto
- Teléfono: (951) 725-0827
- WhatsApp: +52 1 951 461 8850
- Diseño y Software por [SynkData](https://synkdata.online)
