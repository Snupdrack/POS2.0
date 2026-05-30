import { NextRequest, NextResponse } from "next/server"

// POST /api/payments/webhook - MercadoPago webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process MercadoPago webhook notifications
    console.log("Webhook received:", body.type, body.data?.id)

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
