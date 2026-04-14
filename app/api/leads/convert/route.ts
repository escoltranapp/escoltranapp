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
    const { leadId, leadCnpjId } = body

    if (!leadId && !leadCnpjId) {
      return NextResponse.json({ error: "Informe leadId ou leadCnpjId" }, { status: 400 })
    }

    let contactData: {
      nome: string
      telefone?: string | null
      empresa?: string | null
      canalOrigem?: string
      userId: string
      status: string
    }

    if (leadCnpjId) {
      const lead = await prisma.leadCnpj.findFirst({
        where: { id: leadCnpjId, userId: session.user.id },
      })
      if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })

      contactData = {
        nome: lead.nome,
        telefone: lead.telefone,
        empresa: lead.nome,
        canalOrigem: "CNPJ",
        userId: session.user.id,
        status: "lead",
      }
    } else {
      const lead = await prisma.lead.findFirst({
        where: { id: leadId, userId: session.user.id },
      })
      if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })

      contactData = {
        nome: lead.nome,
        telefone: lead.telefone,
        empresa: lead.nome,
        canalOrigem: "Google Maps",
        userId: session.user.id,
        status: "lead",
      }

      // Mark lead as CONTATADO
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "CONTATADO" },
      })
    }

    const contact = await prisma.contact.create({ data: contactData })
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("POST /api/leads/convert error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
