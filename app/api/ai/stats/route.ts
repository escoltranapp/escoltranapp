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

    const [totalQualifications, aiConfig, dealsWithScores] = await Promise.all([
      prisma.aiQualificationSession.count({
        where: { deal: { userId } },
      }),
      prisma.aiAgentConfig.findUnique({
        where: { userId },
      }),
      prisma.deal.findMany({
        where: { userId, aiScore: { not: null } },
        select: { id: true, titulo: true, aiScore: true, contact: { select: { nome: true, sobrenome: true } } },
        orderBy: { aiScore: "desc" },
        take: 10,
      }),
    ])

    const scores = dealsWithScores.map((d) => ({
      id: d.id,
      nome: d.contact
        ? `${d.contact.nome}${d.contact.sobrenome ? " " + d.contact.sobrenome : ""}`
        : d.titulo,
      score: Math.round((d.aiScore || 0) * 100),
      temperatura: (d.aiScore || 0) >= 0.75 ? "Quente" : (d.aiScore || 0) >= 0.5 ? "Morno" : "Frio",
    }))

    const avgScore =
      scores.length > 0
        ? scores.reduce((s, d) => s + d.score, 0) / scores.length
        : 0

    const highScoreLeads = scores.filter((d) => d.score >= 75).length

    return NextResponse.json({
      totalQualifications,
      avgScore: parseFloat(avgScore.toFixed(1)),
      highScoreLeads,
      actionsTriggered: totalQualifications, // proxy
      scores,
      aiConfigured: !!aiConfig,
    })
  } catch (error) {
    console.error("GET /api/ai/stats error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
