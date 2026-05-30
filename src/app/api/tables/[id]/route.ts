import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, capacity, area, number } = body

    const table = await db.table.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(area !== undefined && { area }),
        ...(number !== undefined && { number: parseInt(number) }),
      }
    })

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: "Error updating table" }, { status: 500 })
  }
}
