import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Log incoming webhook
    await prisma.webhookLog.create({
      data: {
        tipo: "INGEST",
        payload: body,
        status: "received",
      },
    }).catch(() => {}) // ignore DB errors

    const { tipo, dados } = body

    switch (tipo) {
      case "NOVO_CONTATO":
        if (dados?.email || dados?.telefone) {
          const userId = dados.userId || body.userId
          if (!userId) break

          await prisma.contact.create({
            data: {
              nome: dados.nome || "Lead",
              email: dados.email,
              telefone: dados.telefone,
              userId,
              utmSourceFirst: dados.utmSource,
              utmMediumFirst: dados.utmMedium,
              utmCampaignFirst: dados.utmCampaign,
              landingPageFirst: dados.landingPage,
            },
          }).catch(() => {})
        }
        break

      case "NOVO_LEAD":
        if (dados?.userId) {
          await prisma.lead.create({
            data: {
              nome: dados.nome || "Lead",
              telefone: dados.telefone,
              cidade: dados.cidade,
              uf: dados.uf,
              nicho: dados.nicho,
              userId: dados.userId,
            },
          }).catch(() => {})
        }
        break

      default:
        // Unknown type, just log
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook ingest error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
