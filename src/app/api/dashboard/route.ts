import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/dashboard - Dashboard stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "CAJA"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Today's orders
    const todayOrders = await db.order.findMany({
      where: { createdAt: { gte: today, lt: tomorrow }, status: { notIn: ["CANCELLED"] } }
    })

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
    const todayOrderCount = todayOrders.length
    const pendingOrders = await db.order.count({ where: { status: "PENDING" } })
    const cancelRequested = await db.order.count({ where: { status: "CANCEL_REQUESTED" } })

    // Today's reservations
    const todayReservations = await db.reservation.count({
      where: { date: today.toISOString().split('T')[0] }
    })

    // Yesterday's revenue
    const yesterdayOrders = await db.order.findMany({
      where: { createdAt: { gte: yesterday, lt: today }, status: { notIn: ["CANCELLED"] } }
    })
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0)

    // Last 7 days chart data
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const nextD = new Date(d)
      nextD.setDate(nextD.getDate() + 1)

      const dayOrders = await db.order.findMany({
        where: { createdAt: { gte: d, lt: nextD }, status: { notIn: ["CANCELLED"] } }
      })

      last7Days.push({
        date: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('es-MX', { weekday: 'short' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length
      })
    }

    // Order type distribution
    const localCount = await db.order.count({ where: { type: "LOCAL", createdAt: { gte: today } } })
    const deliveryCount = await db.order.count({ where: { type: "DELIVERY", createdAt: { gte: today } } })
    const takeoutCount = await db.order.count({ where: { type: "TAKEOUT", createdAt: { gte: today } } })

    // Top products
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _avg: { price: true },
      where: { order: { createdAt: { gte: today }, status: { notIn: ["CANCELLED"] } } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })

    const topProductsWithName = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({ where: { id: item.productId } })
        return {
          name: product?.name || "Desconocido",
          quantity: item._sum.quantity || 0,
          avgPrice: item._avg.price || 0
        }
      })
    )

    // Average ticket
    const avgTicket = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0

    // Total orders all time
    const totalOrders = await db.order.count()

    return NextResponse.json({
      todayRevenue,
      todayOrderCount,
      pendingOrders,
      cancelRequested,
      todayReservations,
      yesterdayRevenue,
      avgTicket,
      totalOrders,
      last7Days,
      orderTypes: { LOCAL: localCount, DELIVERY: deliveryCount, TAKEOUT: takeoutCount },
      topProducts: topProductsWithName
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Error fetching dashboard" }, { status: 500 })
  }
}
