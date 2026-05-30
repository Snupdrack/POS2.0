import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/tables - List tables
export async function GET() {
  try {
    const tables = await db.table.findMany({
      include: { reservations: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } },
      orderBy: { number: "asc" }
    })
    return NextResponse.json(tables)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching tables" }, { status: 500 })
  }
}

// POST /api/tables - Create table (ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { number, capacity, area } = body

    const table = await db.table.create({
      data: { number: parseInt(number), capacity: parseInt(capacity || 4), area: area || "INDOOR" }
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error creating table" }, { status: 500 })
  }
}
