import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: { items: { include: { product: { include: { variants: true } } } }, user: { select: { name: true } } }
    })
    if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const role = (session.user as any)?.role
    const { status, paymentStatus, paymentRef } = body

    // Role-based status update rules
    if (status) {
      if (role === "CAJA" && status === "CANCELLED") {
        // CAJA can only request cancellation
        const updated = await db.order.update({
          where: { id },
          data: { status: "CANCEL_REQUESTED" },
          include: { items: { include: { product: true } }, user: { select: { name: true } } }
        })
        return NextResponse.json(updated)
      }

      if (role === "ADMIN" && status === "CANCELLED") {
        // ADMIN can cancel directly
        const updated = await db.order.update({
          where: { id },
          data: { status: "CANCELLED" },
          include: { items: { include: { product: true } }, user: { select: { name: true } } }
        })
        return NextResponse.json(updated)
      }
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (paymentRef) updateData.paymentRef = paymentRef

    const updated = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: { include: { product: true } }, user: { select: { name: true } } }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Error updating order" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado - Solo ADMIN" }, { status: 401 })
    }

    const { id } = await params
    await db.orderItem.deleteMany({ where: { orderId: id } })
    await db.order.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting order" }, { status: 500 })
  }
}
