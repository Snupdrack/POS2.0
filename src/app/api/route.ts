import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ status: "ok", service: "Nito's Pizza POS 2.0" })
}
