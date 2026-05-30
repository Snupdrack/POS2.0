import { NextRequest, NextResponse } from "next/server"

// GET /api/payments/success - Payment success callback
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const paymentId = url.searchParams.get("payment_id")
  const status = url.searchParams.get("status")

  return NextResponse.json({
    success: true,
    paymentId,
    status,
    message: "Pago procesado exitosamente"
  })
}
