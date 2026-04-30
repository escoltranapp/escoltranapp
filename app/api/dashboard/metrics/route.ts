import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { startOfMonth, subMonths, endOfMonth } from "date-fns"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // 1. Total de Contatos & Crescimento
    const totalContacts = await prisma.contact.count({
      where: { userId: session.user.id },
    })
    const lastMonthContacts = await prisma.contact.count({
      where: { userId: session.user.id, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    })
    const contactsTrend =
      lastMonthContacts > 0
        ? `+${Math.round(((totalContacts - lastMonthContacts) / lastMonthContacts) * 100)}%`
        : "+0%"

    // 2. Deals Abertos & Valor em Pipeline
    const dealsAbertosCount = await prisma.deal.count({
      where: { userId: session.user.id, status: "OPEN" },
    })
    const pipelineValue = await prisma.deal.aggregate({
      where: { userId: session.user.id, status: "OPEN" },
      _sum: { valorEstimado: true },
    })

    // 3. Taxa de Conversão (Ganhos / (Ganhos + Perdas))
    const wonDeals = await prisma.deal.count({ where: { userId: session.user.id, status: "WON" } })
    const lostDeals = await prisma.deal.count({ where: { userId: session.user.id, status: "LOST" } })
    const conversionRate =
      wonDeals + lostDeals > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0

    // 4. Receita Fechada & Tendência
    const totalRevenue = await prisma.deal.aggregate({
      where: { userId: session.user.id, status: "WON" },
      _sum: { valorEstimado: true },
    })
    const lastMonthRevenue = await prisma.deal.aggregate({
      where: {
        userId: session.user.id,
        status: "WON",
        updatedAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { valorEstimado: true },
    })
    const revTotal = totalRevenue._sum.valorEstimado ?? 0
    const revLastMonth = lastMonthRevenue._sum.valorEstimado ?? 0
    const revenueTrend =
      revLastMonth > 0
        ? `+${Math.round(((revTotal - revLastMonth) / revLastMonth) * 100)}%`
        : "+0%"

    // 5. Deals Recentes
    const recentDeals = await prisma.deal.findMany({
      where: { userId: session.user.id },
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: { contact: true },
    })

    // 6. Performance UTM (Real counting from contacts)
    const utmSources = await prisma.contact.groupBy({
      by: ['canalOrigem'],
      where: { userId: session.user.id },
      _count: { _all: true },
    })

    const topCampanhas = utmSources.map(source => ({
      nome: source.canalOrigem || "Direto",
      valor: source._count._all
    })).sort((a, b) => b.valor - a.valor).slice(0, 3)

    const totalDeals = await prisma.deal.count({ where: { userId: session.user.id } })
    const utmPerformance = {
      leadsRastreados: totalContacts,
      dealsAtribuidos: totalDeals,
      conversao: `${totalContacts > 0 ? ((wonDeals / totalContacts) * 100).toFixed(1) : "0.0"}%`,
      receita: revTotal,
      topCampanhas,
    }

    return NextResponse.json({
      contacts: { total: totalContacts, trend: contactsTrend },
      deals: { total: dealsAbertosCount, value: pipelineValue._sum.valorEstimado ?? 0 },
      conversion: { rate: conversionRate, won: wonDeals, lost: lostDeals },
      revenue: { total: revTotal, trend: revenueTrend },
      recentDeals,
      utmPerformance,
    })
  } catch (error) {
    console.error("Dashboard Metrics Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
