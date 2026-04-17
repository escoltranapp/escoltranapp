import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const lista = await prisma.listaDisparo.findFirst({
      where: { id, userId: session.user.id },
      include: {
        leadsListaDisparo: {
          include: {
            lead: { select: { id: true, nome: true, telefone: true, cidade: true, uf: true, nicho: true } },
            leadCnpj: { select: { id: true, nome: true, telefone: true, cidade: true, uf: true } },
          },
        },
      },
    })

    if (!lista) {
      return NextResponse.json({ error: "Lista não encontrada" }, { status: 404 })
    }

    if (lista.status === "EM_PROCESSAMENTO") {
      return NextResponse.json({ error: "Lista já em processamento" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { n8nWebhookUrl: true },
    })

    if (!user?.n8nWebhookUrl) {
      return NextResponse.json(
        { error: "URL do webhook N8n não configurada. Configure em Configurações > Integrações." },
        { status: 400 }
      )
    }

    const leads = lista.leadsListaDisparo
      .map((lld) => {
        if (lld.lead) {
          return {
            id: lld.lead.id,
            nome: lld.lead.nome,
            telefone: lld.lead.telefone || "",
            cidade: lld.lead.cidade || "",
            estado: lld.lead.uf || "",
            nicho: lld.lead.nicho || "",
          }
        }
        if (lld.leadCnpj) {
          return {
            id: lld.leadCnpj.id,
            nome: lld.leadCnpj.nome,
            telefone: lld.leadCnpj.telefone || "",
            cidade: lld.leadCnpj.cidade || "",
            estado: lld.leadCnpj.uf || "",
            nicho: "",
          }
        }
        return null
      })
      .filter((l): l is NonNullable<typeof l> => l !== null && l.telefone.length >= 8)

    if (leads.length === 0) {
      return NextResponse.json({ error: "Lista sem leads com telefone válido" }, { status: 400 })
    }

    const config = (lista.configEnvio as Record<string, unknown>) ?? {}

    const payload = {
      lista_id: id,
      mensagem: (config.mensagem as string) || "",
      intervalo_segundos: (config.intervalo_segundos as number) || 15,
      horario_comercial: (config.horario_comercial as boolean) || false,
      hora_inicio: (config.hora_inicio as string) || "08:00",
      hora_fim: (config.hora_fim as string) || "18:00",
      dias_semana: (config.dias_semana as string[]) || ["seg", "ter", "qua", "qui", "sex"],
      leads,
    }

    // Mark as processing before firing webhook
    await prisma.listaDisparo.update({
      where: { id },
      data: { status: "EM_PROCESSAMENTO" },
    })

    // Fire-and-forget: N8n will call back via /api/disparos/callback
    fetch(user.n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((e) => console.error("[disparar] N8n webhook error:", e))

    return NextResponse.json({ ok: true, totalLeads: leads.length })
  } catch (error) {
    console.error("POST /api/listas-disparo/[id]/disparar error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
