import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Called by N8n after processing each lead or finishing the entire list.
// No session auth — secured by knowledge of this internal URL.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, lista_id } = body

    if (!lista_id || !event) {
      return NextResponse.json({ error: "lista_id and event are required" }, { status: 400 })
    }

    if (event === "lista_finalizada") {
      const { finalizado_em } = body
      await prisma.listaDisparo.update({
        where: { id: lista_id },
        data: {
          status: "CONCLUIDA",
          updatedAt: finalizado_em ? new Date(finalizado_em) : new Date(),
        },
      })
    }

    if (event === "lead_enviado") {
      const { lead_id } = body
      if (lead_id) {
        // Try both leadId and leadCnpjId fields
        await prisma.leadsListaDisparo.updateMany({
          where: {
            listaId: lista_id,
            OR: [{ leadId: lead_id }, { leadCnpjId: lead_id }],
          },
          data: { statusEnvio: "ENVIADO", enviadoEm: new Date() },
        })
      }
    }

    if (event === "lead_falhou") {
      const { lead_id } = body
      if (lead_id) {
        await prisma.leadsListaDisparo.updateMany({
          where: {
            listaId: lista_id,
            OR: [{ leadId: lead_id }, { leadCnpjId: lead_id }],
          },
          data: {
            statusEnvio: "FALHOU",
            tentativas: { increment: 1 },
          },
        })
      }
    }

    if (event === "lista_cancelada") {
      await prisma.listaDisparo.update({
        where: { id: lista_id },
        data: { status: "CANCELADA" },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("POST /api/disparos/callback error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
