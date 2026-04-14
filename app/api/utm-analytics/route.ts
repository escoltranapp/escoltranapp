import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const UTM_COLORS: Record<string, string> = {
  "google": "#f97316",
  "google ads": "#f97316",
  "facebook": "#f59e0b",
  "instagram": "#ec4899",
  "orgânico": "#22c55e",
  "organic": "#22c55e",
  "indicação": "#8b5cf6",
  "email": "#3b82f6",
  "whatsapp": "#25d366",
  "outros": "#6b7280",
}

function getColor(source: string): string {
  const lower = source.toLowerCase()
  for (const [key, color] of Object.entries(UTM_COLORS)) {
    if (lower.includes(key)) return color
  }
  return "#6b7280"
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Count contacts grouped by canal_origem
    const allContacts = await prisma.contact.findMany({
      where: { userId },
      select: { canalOrigem: true, utmSourceFirst: true, createdAt: true },
    })

    const totalContacts = allContacts.length
    const newThisMonth = allContacts.filter(
      (c) => c.createdAt >= startOfMonth
    ).length

    // Group by source
    const sourceMap: Record<string, number> = {}
    for (const c of allContacts) {
      const src = c.canalOrigem || c.utmSourceFirst || "Outros"
      sourceMap[src] = (sourceMap[src] || 0) + 1
    }

    const sources = Object.entries(sourceMap)
      .map(([name, count]) => ({
        name,
        value: totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0,
        count,
        color: getColor(name),
      }))
      .sort((a, b) => b.count - a.count)

    // Deals by source for conversion
    const wonDeals = await prisma.deal.findMany({
      where: { userId, status: "WON" },
      select: { origem: true, valorEstimado: true },
    })

    const totalRevenue = wonDeals.reduce((s, d) => s + (d.valorEstimado || 0), 0)
    const conversionRate =
      totalContacts > 0 ? ((wonDeals.length / totalContacts) * 100).toFixed(1) : "0"

    // Funnel data
    const openDeals = await prisma.deal.count({ where: { userId, status: "OPEN" } })
    const lostDeals = await prisma.deal.count({ where: { userId, status: "LOST" } })

    const funnel = [
      { stage: "Visitantes", value: totalContacts, color: "#f97316" },
      { stage: "Leads", value: totalContacts, color: "#f59e0b" },
      { stage: "Oportunidades", value: openDeals + wonDeals.length + lostDeals, color: "#8b5cf6" },
      { stage: "Propostas", value: openDeals + wonDeals.length, color: "#3b82f6" },
      { stage: "Clientes", value: wonDeals.length, color: "#22c55e" },
    ]

    return NextResponse.json({
      totalLeads: totalContacts,
      newThisMonth,
      conversionRate,
      totalRevenue,
      sources,
      funnel,
    })
  } catch (error) {
    console.error("GET /api/utm-analytics error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
