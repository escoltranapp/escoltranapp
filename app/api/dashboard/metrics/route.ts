import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalContacts,
      thisMonthContacts,
      lastMonthContacts,
      openDeals,
      lastMonthDeals,
      pipelineData,
      lastMonthPipeline,
      wonDeals,
      totalDeals,
    ] = await Promise.all([
      prisma.contact.count({ where: { userId } }),
      prisma.contact.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
      prisma.contact.count({ where: { userId, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.deal.count({ where: { userId, status: "OPEN" } }),
      prisma.deal.count({ where: { userId, status: "OPEN", createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.deal.aggregate({ where: { userId, status: "OPEN" }, _sum: { valorEstimado: true } }),
      prisma.deal.aggregate({ where: { userId, status: "OPEN", createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { valorEstimado: true } }),
      prisma.deal.count({ where: { userId, status: "WON", createdAt: { gte: startOfMonth } } }),
      prisma.deal.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
    ])

    const pipelineValue = pipelineData._sum.valorEstimado || 0
    const lastPipelineValue = lastMonthPipeline._sum.valorEstimado || 0
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0

    const growth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return NextResponse.json({
      totalContacts,
      contactsGrowth: growth(thisMonthContacts, lastMonthContacts),
      openDeals,
      dealsGrowth: growth(openDeals, lastMonthDeals),
      pipelineValue,
      pipelineGrowth: growth(pipelineValue, lastPipelineValue),
      conversionRate,
      conversionGrowth: 0,
    })
  } catch (error) {
    console.error("GET /api/dashboard/metrics error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
