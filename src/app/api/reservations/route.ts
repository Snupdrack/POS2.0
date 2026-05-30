import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/reservations - List reservations (ADMIN)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const reservations = await db.reservation.findMany({
      include: { table: true },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(reservations)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching reservations" }, { status: 500 })
  }
}

// POST /api/reservations - Create reservation (public or staff)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, customerEmail, date, time, guests, tableId, notes } = body

    const reservation = await db.reservation.create({
      data: {
        customerName, customerPhone, customerEmail,
        date, time, guests: parseInt(guests),
        tableId, notes, status: "PENDING"
      },
      include: { table: true }
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Error creating reservation", details: error.message }, { status: 500 })
  }
}
