import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "OPEN"
    const pipelineId = searchParams.get("pipelineId")

    const where = {
      userId: session.user.id,
      ...(status !== "all" && { status: status as "OPEN" | "WON" | "LOST" }),
      ...(pipelineId && { pipelineId }),
    }

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        contact: { select: { nome: true, sobrenome: true, email: true } },
        stage: { select: { id: true, name: true, color: true, order: true } },
      },
    })

    return NextResponse.json(deals)
  } catch (error) {
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
    const {
      titulo,
      valorEstimado,
      produtoInteresse,
      origem,
      prioridade = "MEDIA",
      contactId,
      stageId,
      pipelineId,
      telefone,
      dataPrevista,
      descricao,
    } = body

    if (!titulo) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }

    const deal = await prisma.deal.create({
      data: {
        titulo,
        valorEstimado: valorEstimado ? parseFloat(valorEstimado.toString().replace(/[^\d.,]/g, "").replace(",", ".")) : null,
        produtoInteresse,
        origem,
        prioridade,
        contactId: contactId || null,
        stageId,
        pipelineId,
        telefone,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : null,
        descricao,
        userId: session.user.id,
      },
      include: {
        contact: { select: { nome: true, sobrenome: true, email: true } },
        stage: true,
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
