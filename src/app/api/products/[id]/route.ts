import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true, variants: true }
    })
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 })
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
    const { name, description, price, image, imageUrl, categoryId, active, featured, popular, isAvailable, variants } = body

    // Delete existing variants and recreate
    if (variants !== undefined) {
      await db.variant.deleteMany({ where: { productId: id } })
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(image !== undefined && { image }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(categoryId !== undefined && { categoryId }),
        ...(active !== undefined && { active }),
        ...(featured !== undefined && { featured }),
        ...(popular !== undefined && { popular }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(variants !== undefined && {
          variants: {
            create: variants.map((v: any) => ({ name: v.name, extraPrice: parseFloat(v.extraPrice || 0) }))
          }
        })
      },
      include: { category: true, variants: true }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Error updating product" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    await db.variant.deleteMany({ where: { productId: id } })
    await db.orderItem.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
  }
}
