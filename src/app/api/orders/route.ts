import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const role = (session.user as any)?.role
    const userId = (session.user as any)?.id

    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    const where: any = {}
    if (role === "CAJA") where.userId = userId
    if (status && status !== "ALL") where.status = status

    const orders = await db.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      type, customerName, customerPhone, customerEmail, address, notes,
      items, discount, tax, tip, tableId, paymentMethod,
      deliveryZone, deliveryFee, userId: bodyUserId
    } = body

    const orderUserId = session ? (session.user as any).id : bodyUserId
    if (!orderUserId) {
      return NextResponse.json({ error: "Usuario requerido" }, { status: 400 })
    }

    // Calculate total
    let total = 0
    for (const item of items) {
      let itemPrice = item.price
      if (item.variants) {
        try {
          const variants = typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants
          for (const v of variants) {
            itemPrice += (v.extraPrice || 0)
          }
        } catch {}
      }
      total += itemPrice * item.quantity
    }

    total = total - (discount || 0) + (tax || 0) + (tip || 0) + (deliveryFee || 0)

    // Get next order number
    const maxOrder = await db.order.findFirst({
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true }
    })
    const orderNumber = (maxOrder?.orderNumber || 1000) + 1

    const order = await db.order.create({
      data: {
        orderNumber,
        type: type || "LOCAL",
        status: "PENDING",
        customerName, customerPhone, customerEmail, address, notes,
        total, discount: discount || 0, tax: tax || 0, tip: tip || 0,
        tableId, userId: orderUserId,
        paymentMethod: paymentMethod || "CASH",
        paymentStatus: "PENDING",
        deliveryZone, deliveryFee: deliveryFee || 0,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variants: typeof item.variants === 'string' ? item.variants : JSON.stringify(item.variants || []),
            notes: item.notes
          }))
        }
      },
      include: { items: { include: { product: true } }, user: { select: { name: true } } }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Error creating order", details: error.message }, { status: 500 })
  }
}
