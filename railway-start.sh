#!/bin/bash
# ============================================
# Nito's Pizza - Script de inicio para Railway
# ============================================
# REGLA 1: PORT siempre desde process.env.PORT
# REGLA 2: Host siempre 0.0.0.0

set -e

echo "============================================"
echo "  NITO'S PIZZA - Iniciando en Railway"
echo "============================================"
echo "PORT: ${PORT:-3000}"
echo "HOST: 0.0.0.0"
echo "NODE_ENV: ${NODE_ENV:-production}"
echo "============================================"

# Generar cliente Prisma
echo "[1/3] Generando cliente Prisma..."
npx prisma generate

# Hacer push del esquema a la base de datos
echo "[2/3] Sincronizando base de datos..."
npx prisma db push --skip-generate

# Si no hay productos, hacer seed
echo "[3/3] Verificando datos iniciales..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.count().then(count => {
  if (count === 0) {
    console.log('No hay productos, ejecutando seed...');
    process.exit(2);
  } else {
    console.log('Base de datos ya tiene ' + count + ' productos.');
    process.exit(0);
  }
}).catch(() => process.exit(1));
" || SEED_NEEDED=$?

if [ "$SEED_NEEDED" = "2" ]; then
  echo "Ejecutando seed..."
  npx tsx prisma/seed.ts
fi

# Compilar Next.js y Tailwind CSS para producción antes del inicio
echo "Compilando aplicación para producción (Next.js & Tailwind)..."
npx next build

# Iniciar el servidor personalizado con soporte TypeScript integrado
echo "Iniciando servidor en 0.0.0.0:${PORT:-3000}..."
exec npx tsx server.ts
