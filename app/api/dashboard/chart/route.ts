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

    // Build last 7 months array
    const months: { mes: string; label: string; start: Date; end: Date }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const label = d.toLocaleString("pt-BR", { month: "short" })
      months.push({
        mes: label.charAt(0).toUpperCase() + label.slice(1).replace(".", ""),
        label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        start: d,
        end,
      })
    }

    // Query contacts and deals per month in parallel
    const chartData = await Promise.all(
      months.map(async ({ mes, start, end }) => {
        const [contatos, deals, valor] = await Promise.all([
          prisma.contact.count({
            where: { userId, createdAt: { gte: start, lt: end } },
          }),
          prisma.deal.count({
            where: { userId, status: "WON", fechadoEm: { gte: start, lt: end } },
          }),
          prisma.deal.aggregate({
            where: { userId, status: "WON", fechadoEm: { gte: start, lt: end } },
            _sum: { valorEstimado: true },
          }),
        ])
        return {
          mes,
          contatos,
          deals,
          valor: valor._sum.valorEstimado || 0,
        }
      })
    )

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("GET /api/dashboard/chart error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
