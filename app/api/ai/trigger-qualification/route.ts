import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { dealId } = body

    if (!dealId) {
      return NextResponse.json({ error: "dealId is required" }, { status: 400 })
    }

    // Verify deal belongs to user
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, userId: session.user.id },
      include: { contact: true, stage: true },
    })

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    // Get AI config
    const aiConfig = await prisma.aiAgentConfig.findUnique({
      where: { userId: session.user.id },
    })

    // Create qualification session
    const sessionId = `qual_${Date.now()}_${dealId}`
    await prisma.aiQualificationSession.create({
      data: {
        sessionId,
        dealId,
        status: "active",
        scores: { budget: 0, authority: 0, need: 0, timeline: 0 },
        mensagens: [],
      },
    })

    // If n8n webhook configured, trigger it
    if (aiConfig?.n8nWebhookUrl) {
      await fetch(aiConfig.n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START_QUALIFICATION",
          sessionId,
          dealId,
          dealData: {
            titulo: deal.titulo,
            contato: deal.contact
              ? `${deal.contact.nome} ${deal.contact.sobrenome || ""}`.trim()
              : null,
            telefone: deal.telefone || deal.contact?.telefone,
            valorEstimado: deal.valorEstimado,
          },
          aiConfig: aiConfig
            ? {
                modelo: aiConfig.modelo,
                temperatura: aiConfig.temperatura,
                promptSistema: aiConfig.promptSistema,
                tomComunicacao: aiConfig.tomComunicacao,
              }
            : null,
        }),
      }).catch(() => {}) // Don't fail if n8n is unavailable
    }

    // Update deal qualification status
    await prisma.deal.update({
      where: { id: dealId },
      data: { qualificationStatus: "in_progress" },
    })

    return NextResponse.json({
      ok: true,
      sessionId,
      message: "Qualificação iniciada com sucesso",
    })
  } catch (error) {
    console.error("AI qualification error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
