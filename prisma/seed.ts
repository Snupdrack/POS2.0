import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.table.deleteMany()
  await prisma.deliveryZone.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const admin = await prisma.user.create({
    data: { email: "admin@nitopos.com", name: "Administrador", password: "admin123", role: "ADMIN" }
  })
  const caja = await prisma.user.create({
    data: { email: "caja@nitopos.com", name: "Cajero", password: "caja123", role: "CAJA" }
  })
  const cocina = await prisma.user.create({
    data: { email: "cocina@nitopos.com", name: "Chef Cocina", password: "cocina123", role: "KITCHEN" }
  })
  console.log("✅ Users created")

  // Create Categories
  const pizzas = await prisma.category.create({ data: { name: "Pizzas", icon: "🍕", sortOrder: 1 } })
  const especialidades = await prisma.category.create({ data: { name: "Especialidades", icon: "⭐", sortOrder: 2 } })
  const combos = await prisma.category.create({ data: { name: "Combos", icon: "🎁", sortOrder: 3 } })
  const bebidas = await prisma.category.create({ data: { name: "Bebidas", icon: "🥤", sortOrder: 4 } })
  const postres = await prisma.category.create({ data: { name: "Postres", icon: "🍰", sortOrder: 5 } })
  console.log("✅ Categories created")

  // Helper: create pizza with size variants
  async function createPizza(name: string, description: string, image: string, indPrice: number, medPrice: number, granPrice: number, famPrice: number, featured = false, popular = false) {
    return prisma.product.create({
      data: {
        name, description, image, categoryId: pizzas.id, price: medPrice, featured, popular,
        variants: {
          create: [
            { name: "Individual", extraPrice: indPrice - medPrice },
            { name: "Mediana", extraPrice: 0 },
            { name: "Grande", extraPrice: granPrice - medPrice },
            { name: "Familiar", extraPrice: famPrice - medPrice },
          ]
        }
      }
    })
  }

  // Pizzas
  await createPizza("Margarita", "Salsa de tomate, mozzarella y albahaca fresca", "🍕", 89, 139, 179, 219, true, true)
  await createPizza("Pepperoni", "Clásica pizza de pepperoni con mozzarella", "🍕", 99, 149, 189, 229, true, true)
  await createPizza("Hawaiana", "Jamón, piña y mozzarella", "🍕", 99, 149, 189, 229, false, true)
  await createPizza("4 Quesos", "Mozzarella, parmesano, gorgonzola y provolone", "🧀", 109, 159, 199, 249, true)
  await createPizza("Mexicana", "Chorizo, jalapeño, cebolla y cilantro", "🌶️", 109, 159, 199, 249, false, true)
  await createPizza("Suprema", "Pepperoni, salchicha, pimiento, cebolla y champiñones", "🍕", 119, 169, 209, 259)
  await createPizza("Vegetariana", "Champiñones, pimientos, cebolla, aceitunas y tomate", "🥬", 99, 149, 189, 229, false, false)
  await createPizza("3 Carnes", "Pepperoni, jamón y salchicha", "🥩", 119, 169, 209, 259, true)
  await createPizza("Nito's Special", "Nuestra pizza estrella: pastor, piña, cilantro y salsa especial", "🔥", 119, 179, 219, 289, true, true)
  await createPizza("Pastor", "Carne al pastor, piña, cebolla y cilantro", "🌮", 109, 159, 199, 249, false, true)
  console.log("✅ Pizzas created")

  // Especialidades
  const alitas = await prisma.product.create({
    data: {
      name: "Alitas BBQ", description: "12 alitas bañadas en salsa BBQ con aderezo ranch", image: "🍗",
      categoryId: especialidades.id, price: 149, featured: true, popular: true,
      variants: { create: [{ name: "6 piezas", extraPrice: -60 }, { name: "12 piezas", extraPrice: 0 }, { name: "24 piezas", extraPrice: 130 }] }
    }
  })
  await prisma.product.create({
    data: {
      name: "Empanadas de Carne", description: "4 empanadas rellenas de carne sazonada", image: "🥟",
      categoryId: especialidades.id, price: 99, popular: true,
      variants: { create: [{ name: "4 piezas", extraPrice: 0 }, { name: "8 piezas", extraPrice: 80 }] }
    }
  })
  await prisma.product.create({
    data: {
      name: "Nachos Supremos", description: "Nachos con queso, jalapeño, guacamole y crema", image: "🧀",
      categoryId: especialidades.id, price: 119, featured: true,
      variants: { create: [{ name: "Regular", extraPrice: 0 }, { name: "Con carne", extraPrice: 40 }] }
    }
  })
  await prisma.product.create({
    data: {
      name: "Ensalada César", description: "Lechuga, crutones, parmesano y aderezo César", image: "🥗",
      categoryId: especialidades.id, price: 89,
      variants: { create: [{ name: "Regular", extraPrice: 0 }, { name: "Con pollo", extraPrice: 30 }] }
    }
  })
  await prisma.product.create({
    data: {
      name: "Papas a la Francesa", description: "Papas crujientes con salsa ketchup y mayo", image: "🍟",
      categoryId: especialidades.id, price: 69, popular: true,
      variants: { create: [{ name: "Regular", extraPrice: 0 }, { name: "Grande", extraPrice: 25 }] }
    }
  })
  console.log("✅ Especialidades created")

  // Combos
  await prisma.product.create({
    data: {
      name: "Combo Personal", description: "Pizza individual + Refresco", image: "🎁",
      categoryId: combos.id, price: 129, featured: true, popular: true,
      variants: { create: [{ name: "Coca-Cola", extraPrice: 0 }, { name: "Fanta", extraPrice: 0 }, { name: "Sprite", extraPrice: 0 }] }
    }
  })
  await prisma.product.create({
    data: {
      name: "Combo Pareja", description: "Pizza mediana + 2 Refrescos", image: "💑",
      categoryId: combos.id, price: 219, featured: true,
      variants: { create: [{ name: "Coca-Cola", extraPrice: 0 }, { name: "Fanta", extraPrice: 0 }] }
    }
  })
  await prisma.product.create({
    data: {
      name: "Combo Familiar", description: "Pizza familiar + Papas + 4 Refrescos", image: "👨‍👩‍👧‍👦",
      categoryId: combos.id, price: 349, featured: true, popular: true,
      variants: { create: [{ name: "Coca-Cola", extraPrice: 0 }, { name: "Variado", extraPrice: 0 }] }
    }
  })
  await prisma.product.create({
    data: {
      name: "Combo Mega", description: "2 Pizzas grandes + Alitas + Papas + 4 Refrescos", image: "🚀",
      categoryId: combos.id, price: 499, featured: true,
      variants: { create: [{ name: "Coca-Cola", extraPrice: 0 }, { name: "Variado", extraPrice: 0 }] }
    }
  })
  console.log("✅ Combos created")

  // Bebidas
  await prisma.product.create({
    data: { name: "Coca-Cola", description: "Refresco 600ml", image: "🥤", categoryId: bebidas.id, price: 30, popular: true }
  })
  await prisma.product.create({
    data: { name: "Fanta", description: "Refresco 600ml", image: "🍊", categoryId: bebidas.id, price: 30 }
  })
  await prisma.product.create({
    data: { name: "Sprite", description: "Refresco 600ml", image: "🥤", categoryId: bebidas.id, price: 30 }
  })
  await prisma.product.create({
    data: { name: "Agua Mineral", description: "Agua mineral 500ml", image: "💧", categoryId: bebidas.id, price: 20 }
  })
  await prisma.product.create({
    data: { name: "Agua de Fruta", description: "Agua fresca del día (Horchata, Jamaica, Tamarindo)", image: "🥛", categoryId: bebidas.id, price: 35, popular: true }
  })
  await prisma.product.create({
    data: { name: "Cerveza", description: "Cerveza nacional 355ml", image: "🍺", categoryId: bebidas.id, price: 45,
      variants: { create: [{ name: "Indio", extraPrice: 0 }, { name: "Modelo", extraPrice: 10 }, { name: "Corona", extraPrice: 15 }] }
    }
  })
  console.log("✅ Bebidas created")

  // Postres
  await prisma.product.create({
    data: { name: "Churros", description: "6 churros con azúcar y canela", image: "🍩", categoryId: postres.id, price: 59, popular: true,
      variants: { create: [{ name: "Sin chocolate", extraPrice: 0 }, { name: "Con chocolate", extraPrice: 15 }] }
    }
  })
  await prisma.product.create({
    data: { name: "Flan Napolitano", description: "Flan casero con caramelo", image: "🍮", categoryId: postres.id, price: 49 }
  })
  await prisma.product.create({
    data: { name: "Helado", description: "Helado de vainilla, chocolate o fresa", image: "🍦", categoryId: postres.id, price: 45,
      variants: { create: [{ name: "Vainilla", extraPrice: 0 }, { name: "Chocolate", extraPrice: 0 }, { name: "Fresa", extraPrice: 0 }] }
    }
  })
  await prisma.product.create({
    data: { name: "Brownie con Helado", description: "Brownie caliente con helado de vainilla", image: "🍫", categoryId: postres.id, price: 79, featured: true }
  })
  console.log("✅ Postres created")

  // Tables
  await prisma.table.create({ data: { number: 1, capacity: 4, status: "AVAILABLE", area: "INDOOR" } })
  await prisma.table.create({ data: { number: 2, capacity: 4, status: "AVAILABLE", area: "INDOOR" } })
  await prisma.table.create({ data: { number: 3, capacity: 4, status: "AVAILABLE", area: "INDOOR" } })
  await prisma.table.create({ data: { number: 4, capacity: 4, status: "AVAILABLE", area: "INDOOR" } })
  await prisma.table.create({ data: { number: 5, capacity: 6, status: "AVAILABLE", area: "OUTDOOR" } })
  await prisma.table.create({ data: { number: 6, capacity: 6, status: "AVAILABLE", area: "OUTDOOR" } })
  await prisma.table.create({ data: { number: 7, capacity: 8, status: "AVAILABLE", area: "TERRACE" } })
  await prisma.table.create({ data: { number: 8, capacity: 2, status: "AVAILABLE", area: "BAR" } })
  console.log("✅ Tables created")

  // Delivery Zones
  await prisma.deliveryZone.create({ data: { name: "Centro de Tlacolula", fee: 20, estimatedMinutes: 20 } })
  await prisma.deliveryZone.create({ data: { name: "Colonias Aledañas", fee: 30, estimatedMinutes: 30 } })
  await prisma.deliveryZone.create({ data: { name: "Foráneo", fee: 50, estimatedMinutes: 45 } })
  console.log("✅ Delivery Zones created")

  // Business Info
  await prisma.business.create({
    data: {
      name: "Nito's Pizza",
      phone: "(951) 725-0827",
      whatsapp: "+52 1 951 461 8850",
      address: "Carretera Cristóbal Colón km 30.1 crucero de Tlacolula, Tlacolula de Matamoros, Oaxaca, C.P. 70400",
      facebook: "https://www.facebook.com/profile.php?id=100086304049257",
      hours: "Lunes – Domingo 12:00 PM – 10:00 PM",
      promo: "2x1 Martes y Jueves",
      deliveryFee: 20,
      minOrder: 150,
      taxRate: 0.16
    }
  })
  console.log("✅ Business info created")

  // Sample Orders
  const today = new Date().toISOString()
  const maxOrder = await prisma.order.findFirst({ orderBy: { orderNumber: 'desc' }, select: { orderNumber: true } })
  let orderNum = (maxOrder?.orderNumber || 1000) + 1

  const pepperoni = await prisma.product.findFirst({ where: { name: "Pepperoni" } })
  const margarita = await prisma.product.findFirst({ where: { name: "Margarita" } })
  const coca = await prisma.product.findFirst({ where: { name: "Coca-Cola" } })
  const comboFam = await prisma.product.findFirst({ where: { name: "Combo Familiar" } })

  if (pepperoni && margarita && coca) {
    await prisma.order.create({
      data: {
        orderNumber: orderNum++,
        type: "LOCAL",
        status: "CONFIRMED",
        customerName: "Mesa 3",
        total: 368,
        tax: 0,
        userId: caja.id,
        tableId: (await prisma.table.findFirst({ where: { number: 3 } }))!.id,
        paymentMethod: "CASH",
        paymentStatus: "PAID",
        items: {
          create: [
            { productId: pepperoni.id, quantity: 1, price: 189, variants: JSON.stringify([{ name: "Grande", extraPrice: 40 }]) },
            { productId: margarita.id, quantity: 1, price: 179, variants: JSON.stringify([{ name: "Grande", extraPrice: 40 }]) },
          ]
        }
      }
    })
  }

  if (comboFam && coca) {
    await prisma.order.create({
      data: {
        orderNumber: orderNum++,
        type: "DELIVERY",
        status: "PREPARING",
        customerName: "María García",
        customerPhone: "9511234567",
        address: "Calle Morelos 123, Centro",
        total: 369,
        deliveryFee: 20,
        deliveryZone: "Centro de Tlacolula",
        userId: caja.id,
        paymentMethod: "CASH",
        paymentStatus: "PENDING",
        items: {
          create: [
            { productId: comboFam.id, quantity: 1, price: 349, variants: JSON.stringify([{ name: "Coca-Cola", extraPrice: 0 }]) },
          ]
        }
      }
    })
  }

  if (margarita && coca) {
    await prisma.order.create({
      data: {
        orderNumber: orderNum++,
        type: "TAKEOUT",
        status: "PENDING",
        customerName: "Juan López",
        customerPhone: "9519876543",
        total: 169,
        userId: caja.id,
        paymentMethod: "CARD",
        paymentStatus: "PAID",
        items: {
          create: [
            { productId: margarita.id, quantity: 1, price: 139, variants: JSON.stringify([{ name: "Mediana", extraPrice: 0 }]) },
            { productId: coca.id, quantity: 1, price: 30 },
          ]
        }
      }
    })
  }
  console.log("✅ Sample orders created")

  // Sample Reservations
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  await prisma.reservation.create({
    data: {
      customerName: "Roberto Martínez",
      customerPhone: "9515551234",
      date: tomorrowStr,
      time: "19:00",
      guests: 4,
      tableId: (await prisma.table.findFirst({ where: { number: 2 } }))!.id,
      status: "CONFIRMED",
      notes: "Cumpleaños, traer pastel"
    }
  })

  await prisma.reservation.create({
    data: {
      customerName: "Ana Hernández",
      customerPhone: "9515559876",
      date: tomorrowStr,
      time: "20:30",
      guests: 6,
      tableId: (await prisma.table.findFirst({ where: { number: 5 } }))!.id,
      status: "PENDING"
    }
  })
  console.log("✅ Sample reservations created")

  console.log("🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
