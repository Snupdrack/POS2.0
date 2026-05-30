import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/products - List all products with category and variants
export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { active: true },
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

// POST /api/products - Create product (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, image, imageUrl, categoryId, featured, popular, isAvailable, variants } = body

    const product = await db.product.create({
      data: {
        name, description: description || "", price: parseFloat(price),
        image: image || "🍕", imageUrl, categoryId,
        featured: featured || false, popular: popular || false,
        isAvailable: isAvailable !== false,
        variants: variants ? {
          create: variants.map((v: any) => ({ name: v.name, extraPrice: parseFloat(v.extraPrice || 0) }))
        } : undefined
      },
      include: { category: true, variants: true }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
