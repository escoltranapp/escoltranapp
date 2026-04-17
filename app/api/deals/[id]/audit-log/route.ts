import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify deal belongs to this user
    const deal = await prisma.deal.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    })
    if (!deal) {
      return NextResponse.json({ error: "Deal não encontrado" }, { status: 404 })
    }

    const logs = await prisma.dealAuditLog.findMany({
      where: { dealId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
