import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/categories - List categories with products
export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { active: true },
      include: { products: { where: { active: true }, include: { variants: true } } },
      orderBy: { sortOrder: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}

// POST /api/categories - Create category (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, icon, sortOrder } = body

    const category = await db.category.create({
      data: { name, icon: icon || "🍕", sortOrder: sortOrder || 0 }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error creating category" }, { status: 500 })
  }
}
