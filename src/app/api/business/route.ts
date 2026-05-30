import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/business - Get business info (public)
export async function GET() {
  try {
    const business = await db.business.findFirst()
    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching business info" }, { status: 500 })
  }
}

// PUT /api/business - Update business info (ADMIN)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const current = await db.business.findFirst()

    if (!current) {
      const business = await db.business.create({ data: body })
      return NextResponse.json(business)
    }

    const business = await db.business.update({
      where: { id: current.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.whatsapp !== undefined && { whatsapp: body.whatsapp }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.facebook !== undefined && { facebook: body.facebook }),
        ...(body.hours !== undefined && { hours: body.hours }),
        ...(body.promo !== undefined && { promo: body.promo }),
        ...(body.deliveryFee !== undefined && { deliveryFee: parseFloat(body.deliveryFee) }),
        ...(body.minOrder !== undefined && { minOrder: parseFloat(body.minOrder) }),
        ...(body.taxRate !== undefined && { taxRate: parseFloat(body.taxRate) }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      }
    })

    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json({ error: "Error updating business" }, { status: 500 })
  }
}
