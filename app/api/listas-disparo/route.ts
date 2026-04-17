import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const listas = await prisma.listaDisparo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { leadsListaDisparo: true } },
        leadsListaDisparo: {
          select: { statusEnvio: true },
        },
      },
    })

    const result = listas.map((l) => {
      const enviados = l.leadsListaDisparo.filter((x) => x.statusEnvio === "ENVIADO").length
      const falhos = l.leadsListaDisparo.filter((x) => x.statusEnvio === "FALHOU").length
      const pendentes = l.leadsListaDisparo.filter((x) => x.statusEnvio === "PENDENTE").length
      const totalLeads = l._count.leadsListaDisparo
      return {
        id: l.id,
        nome: l.nome,
        descricao: l.descricao,
        status: l.status,
        totalLeads,
        enviados,
        falhos,
        pendentes,
        createdAt: l.createdAt,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/listas-disparo error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { nome, descricao, telefones, leadIds, configEnvio } = body

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    // Create the list
    const lista = await prisma.listaDisparo.create({
      data: {
        nome,
        descricao,
        status: "RASCUNHO",
        userId: session.user.id,
        configEnvio: configEnvio ?? undefined,
      },
    })

    // If phone numbers are provided, create Lead entries and attach them
    if (telefones && Array.isArray(telefones) && telefones.length > 0) {
      const validPhones = (telefones as string[]).filter((t: string) => t.trim().length >= 8)

      if (validPhones.length > 0) {
        // Create leads for each phone number
        const leads = await prisma.$transaction(
          validPhones.map((tel: string) =>
            prisma.lead.create({
              data: {
                nome: tel,
                telefone: tel,
                userId: session.user.id,
              },
            })
          )
        )

        // Attach leads to the list
        await prisma.leadsListaDisparo.createMany({
          data: leads.map((lead) => ({
            listaId: lista.id,
            leadId: lead.id,
            statusEnvio: "PENDENTE",
          })),
        })
      }
    }

    // If CRM lead IDs are provided, attach them
    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      await prisma.leadsListaDisparo.createMany({
        data: (leadIds as string[]).map((leadId: string) => ({
          listaId: lista.id,
          leadId,
          statusEnvio: "PENDENTE",
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ ...lista, totalLeads: (telefones?.length || 0) + (leadIds?.length || 0) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/listas-disparo error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
