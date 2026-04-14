import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "agora mesmo"
  if (diffMin < 60) return `${diffMin} min atrás`
  if (diffHour < 24) return `${diffHour}h atrás`
  if (diffDay === 1) return "ontem"
  return `${diffDay} dias atrás`
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch recent events from multiple sources
    const [recentContacts, recentDeals, recentActivities, recentDealHistory] =
      await Promise.all([
        prisma.contact.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { nome: true, sobrenome: true, canalOrigem: true, createdAt: true },
        }),
        prisma.deal.findMany({
          where: { userId, status: { in: ["WON", "LOST"] } },
          orderBy: { fechadoEm: "desc" },
          take: 5,
          select: { titulo: true, status: true, valorEstimado: true, fechadoEm: true },
        }),
        prisma.activity.findMany({
          where: { ownerUserId: userId, status: "DONE" },
          orderBy: { doneAt: "desc" },
          take: 5,
          select: { titulo: true, tipo: true, doneAt: true, contact: { select: { nome: true, sobrenome: true } } },
        }),
        prisma.dealStageHistory.findMany({
          where: { deal: { userId } },
          orderBy: { movedAt: "desc" },
          take: 5,
          select: { movedAt: true, stage: { select: { name: true } }, deal: { select: { titulo: true } } },
        }),
      ])

    // Combine into a unified activity feed
    type FeedItem = { action: string; detail: string; time: string; color: string; ts: Date }
    const feed: FeedItem[] = []

    for (const c of recentContacts) {
      const name = `${c.nome}${c.sobrenome ? " " + c.sobrenome : ""}`
      feed.push({
        action: "Novo contato cadastrado",
        detail: `${name}${c.canalOrigem ? ` — ${c.canalOrigem}` : ""}`,
        time: timeAgo(c.createdAt),
        color: "bg-green-500",
        ts: c.createdAt,
      })
    }

    for (const d of recentDeals) {
      if (!d.fechadoEm) continue
      const isWon = d.status === "WON"
      feed.push({
        action: isWon ? "Deal ganho!" : "Deal perdido",
        detail: `${d.titulo}${d.valorEstimado ? ` — R$ ${d.valorEstimado.toLocaleString("pt-BR")}` : ""}`,
        time: timeAgo(d.fechadoEm),
        color: isWon ? "bg-green-500" : "bg-red-500",
        ts: d.fechadoEm,
      })
    }

    for (const a of recentActivities) {
      if (!a.doneAt) continue
      const contactName = a.contact ? `${a.contact.nome}${a.contact.sobrenome ? " " + a.contact.sobrenome : ""}` : ""
      feed.push({
        action: "Atividade concluída",
        detail: `${a.titulo}${contactName ? ` — ${contactName}` : ""}`,
        time: timeAgo(a.doneAt),
        color: "bg-blue-500",
        ts: a.doneAt,
      })
    }

    for (const h of recentDealHistory) {
      feed.push({
        action: `Deal movido para ${h.stage.name}`,
        detail: h.deal.titulo,
        time: timeAgo(h.movedAt),
        color: "bg-primary",
        ts: h.movedAt,
      })
    }

    // Sort by date desc and take top 8
    feed.sort((a, b) => b.ts.getTime() - a.ts.getTime())
    const result = feed.slice(0, 8).map(({ action, detail, time, color }) => ({
      action,
      detail,
      time,
      color,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/dashboard/activity error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
