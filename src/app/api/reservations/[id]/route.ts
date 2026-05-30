import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reservation = await db.reservation.findUnique({ where: { id }, include: { table: true } })
    if (!reservation) return NextResponse.json({ error: "Reservación no encontrada" }, { status: 404 })
    return NextResponse.json(reservation)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching reservation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { customerName, customerPhone, customerEmail, date, time, guests, tableId, status, notes, depositPaid, depositAmount } = body

    const reservation = await db.reservation.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(customerPhone !== undefined && { customerPhone }),
        ...(customerEmail !== undefined && { customerEmail }),
        ...(date !== undefined && { date }),
        ...(time !== undefined && { time }),
        ...(guests !== undefined && { guests: parseInt(guests) }),
        ...(tableId !== undefined && { tableId }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(depositPaid !== undefined && { depositPaid }),
        ...(depositAmount !== undefined && { depositAmount: parseFloat(depositAmount) }),
      },
      include: { table: true }
    })

    return NextResponse.json(reservation)
  } catch (error) {
    return NextResponse.json({ error: "Error updating reservation" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    await db.reservation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting reservation" }, { status: 500 })
  }
}
