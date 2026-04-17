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
    const currentMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // 1. Total de Contatos & Crescimento
    const totalContacts = await prisma.contato.count()
    const lastMonthContacts = await prisma.contato.count({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
    })
    const contactsTrend = lastMonthContacts > 0 
      ? `+${Math.round(((totalContacts - lastMonthContacts) / lastMonthContacts) * 100)}%` 
      : "+0%"

    // 2. Deals Abertos & Valor em Pipeline
    const dealsAbertosCount = await prisma.deal.count({
      where: { status: "OPEN" }
    })
    const pipelineValue = await prisma.deal.aggregate({
      where: { status: "OPEN" },
      _sum: { valor: true }
    })

    // 3. Taxa de Conversão (Ganhos / (Ganhos + Perdas))
    const wonDeals = await prisma.deal.count({ where: { status: "WON" } })
    const lostDeals = await prisma.deal.count({ where: { status: "LOST" } })
    const conversionRate = (wonDeals + lostDeals) > 0 
      ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) 
      : 0

    // 4. Receita Fechada & Tendência
    const totalRevenue = await prisma.deal.aggregate({
      where: { status: "WON" },
      _sum: { valor: true }
    })
    const lastMonthRevenue = await prisma.deal.aggregate({
      where: { 
        status: "WON",
        updatedAt: { gte: lastMonthStart, lte: lastMonthEnd } 
      },
      _sum: { valor: true }
    })
    const revenueTrend = (lastMonthRevenue._sum.valor || 0) > 0
      ? `+${Math.round((((totalRevenue._sum.valor || 0) - (lastMonthRevenue._sum.valor || 0)) / (lastMonthRevenue._sum.valor || 0)) * 100)}%`
      : "+0%"

    // 5. Deals Recentes
    const recentDeals = await prisma.deal.findMany({
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: { contact: true }
    })

    // 6. Performance UTM (Mock por enquanto até termos a tabela de UTM completa)
    // Se o sistema já tiver campos de UTM no Lead, podemos contar aqui.
    const utmPerformance = {
      leadsRastreados: totalContacts,
      dealsAtribuidos: await prisma.deal.count(),
      conversao: `${((wonDeals / totalContacts) * 100 || 0).toFixed(1)}%`,
      receita: totalRevenue._sum.valor || 0,
      topCampanhas: [
        { nome: "Direto", valor: totalRevenue._sum.valor ? totalRevenue._sum.valor * 0.6 : 0 },
        { nome: "Google Ads", valor: totalRevenue._sum.valor ? totalRevenue._sum.valor * 0.3 : 0 },
        { nome: "Facebook", valor: totalRevenue._sum.valor ? totalRevenue._sum.valor * 0.1 : 0 },
      ]
    }

    return NextResponse.json({
      contacts: { total: totalContacts, trend: contactsTrend },
      deals: { total: dealsAbertosCount, value: pipelineValue._sum.valor || 0 },
      conversion: { rate: conversionRate, won: wonDeals, lost: lostDeals },
      revenue: { total: totalRevenue._sum.valor || 0, trend: revenueTrend },
      recentDeals,
      utmPerformance
    })

  } catch (error) {
    console.error("Dashboard Metrics Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
