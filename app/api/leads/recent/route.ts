import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await prisma.contact.findMany({
      where: {
        canalOrigem: "Google"
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
