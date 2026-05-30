import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/delivery-zones - List delivery zones (public)
export async function GET() {
  try {
    const zones = await db.deliveryZone.findMany({
      where: { active: true },
      orderBy: { fee: "asc" }
    })
    return NextResponse.json(zones)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching delivery zones" }, { status: 500 })
  }
}

// POST /api/delivery-zones - Create zone (ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, fee, estimatedMinutes } = body

    const zone = await db.deliveryZone.create({
      data: { name, fee: parseFloat(fee), estimatedMinutes: parseInt(estimatedMinutes || 30) }
    })

    return NextResponse.json(zone, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error creating delivery zone" }, { status: 500 })
  }
}
