import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { startOfDay, startOfWeek, subDays } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const today = startOfDay(now)
    const sevenDaysAgo = subDays(now, 7)

    const [totalGoogle, leadsHoje, naSemana, conversoes] = await Promise.all([
      prisma.contact.count({
        where: { userId: session.user.id, canalOrigem: "Google" }
      }),
      prisma.contact.count({
        where: { userId: session.user.id, createdAt: { gte: today } }
      }),
      prisma.contact.count({
        where: { userId: session.user.id, createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.deal.count({
        where: { userId: session.user.id, status: "WON" }
      })
    ])

    return NextResponse.json({
      totalGoogle,
      leadsHoje,
      naSemana,
      conversoes
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
